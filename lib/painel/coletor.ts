/**
 * Coletor first-party (lado do navegador) que alimenta o /dashboard. Porte de lib/tracker.ts da Sólida.
 *
 * Anônimo por desenho: o id de sessão é um UUID aleatório em sessionStorage (morre ao fechar
 * a aba; renova após 30 min parado). Roda sempre, sem depender do banner, porque não usa cookie
 * nem dado pessoal. O id de visitante (novo × recorrente, localStorage 13 meses) só existe para
 * quem ACEITOU cookies de análise; recusar apaga na hora.
 *
 * Envia para /api/collect:
 * - page_view  { sw, sh, ref_host? }             a cada rota (load + SPA)
 * - page_leave { duration_ms, max_scroll_pct }    ao sair da página/aba
 * - click      { tag, text, href, track, section } em todo link/botão
 * - eventos nomeados espelhados do dataLayer (lib/tracking.ts → coletarEvento)
 */
import { CONSENT_COOKIE, parseConsent, readCookieValue } from "@/lib/attribution-core";

const ENDPOINT = "/api/collect";
const SESSION_KEY = "nicoli-s";
const VISITOR_KEY = "nicoli-v";
const VISITOR_TTL_MS = 13 * 30 * 24 * 60 * 60 * 1000;
/** Mesmo valor de CONSENT_CHANGE_EVENT em lib/tracking.ts (não importar: evita ciclo) */
const CONSENT_EVENT = "nicoli:consent-change";
const SESSION_TTL_MS = 30 * 60 * 1000;
const FLUSH_EVERY_MS = 5000;
const FLUSH_AT = 10;
const MAX_BATCH_BYTES = 60 * 1024;
const MAX_PARAM = 200;
const EXCLUIDOS = ["/dashboard", "/api"];
const BOT_RE = /bot|crawl|spider|headless|lighthouse|pagespeed|gtmetrix/i;

/** Eventos do dataLayer que também vão para o painel (sem PII: o dataLayer já não tem). */
const EVENTO_ESPELHADO = /^(click_[a-z_]+|generate_lead|form_start|blog_read|consent_update)$/;
/** Parâmetros úteis ao painel; UTMs/gclid já vão na sessão, então ficam de fora. */
const PARAMS_ESPELHADOS = new Set([
  "link_location",
  "link_label",
  "link_url",
  "lead_area",
  "form_id",
  "article_slug",
  "read_trigger",
  "consent_analytics",
  "consent_marketing",
]);

type Valor = string | number | boolean;
type Params = Record<string, Valor | undefined>;
interface EventoFila { n: string; p: string; t?: string; d?: Params }
interface InicioSessao {
  path: string;
  ref: string;
  utm: Record<string, string>;
  gclid: boolean;
  sw: number;
  sh: number;
  lang: string;
  vid?: string;
}
interface Sessao { id: string; last: number; init: InicioSessao | null }

let iniciado = false;
let ativo = false;
let sessao: Sessao | null = null;
let fila: EventoFila[] = [];
let timer: number | null = null;

let paginaAtual: string | null = null;
let visivelDesde: number | null = null;
let acumuladoMs = 0;
let scrollMax = 0;
let paginaEncerrada = false;
let scrollAgendado = false;

/* ---------------- Consentimento ---------------- */

function analiseAceita(): boolean {
  try {
    return parseConsent(readCookieValue(document.cookie, CONSENT_COOKIE))?.analytics === true;
  } catch {
    return false;
  }
}

function idVisitante(): string | null {
  try {
    if (!analiseAceita()) {
      localStorage.removeItem(VISITOR_KEY);
      return null;
    }
    const raw = localStorage.getItem(VISITOR_KEY);
    if (raw) {
      const v = JSON.parse(raw) as { id?: string; at?: number };
      if (v?.id && typeof v.at === "number" && Date.now() - v.at < VISITOR_TTL_MS) return v.id;
    }
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, JSON.stringify({ id, at: Date.now() }));
    return id;
  } catch {
    return null;
  }
}

function aoMudarConsentimento(): void {
  if (analiseAceita()) return;
  try {
    localStorage.removeItem(VISITOR_KEY);
  } catch {
    // sem storage
  }
  if (sessao?.init?.vid) {
    sessao = { ...sessao, init: { ...sessao.init, vid: undefined } };
    gravarSessao(sessao);
  }
}

/* ---------------- Sessão ---------------- */

const excluido = (path: string) => EXCLUIDOS.some((p) => path === p || path.startsWith(p + "/"));

function podeRodar(): boolean {
  if (typeof window === "undefined") return false;
  if (navigator.webdriver || BOT_RE.test(navigator.userAgent)) return false;
  return !excluido(window.location.pathname);
}

function lerSessao(): Sessao | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch {
    return null;
  }
}

function gravarSessao(s: Sessao): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    // sem storage: a sessão vive só em memória
  }
}

function novaSessao(): Sessao {
  const q = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const k of ["source", "medium", "campaign", "term", "content"]) {
    const v = q.get("utm_" + k);
    if (v) utm[k] = v.slice(0, 150);
  }
  const vid = idVisitante();
  return {
    id: crypto.randomUUID(),
    last: Date.now(),
    init: {
      path: window.location.pathname,
      ref: document.referrer || "",
      utm,
      gclid: q.has("gclid") || q.has("gbraid") || q.has("wbraid"),
      sw: window.screen?.width ?? 0,
      sh: window.screen?.height ?? 0,
      lang: navigator.language || "",
      ...(vid ? { vid } : {}),
    },
  };
}

function garantirSessao(): Sessao {
  const agora = Date.now();
  if (sessao && agora - sessao.last < SESSION_TTL_MS) {
    sessao = { ...sessao, last: agora };
    return sessao;
  }
  const salva = lerSessao();
  sessao = salva && agora - salva.last < SESSION_TTL_MS ? { ...salva, last: agora } : novaSessao();
  gravarSessao(sessao);
  return sessao;
}

/* ---------------- Envio ---------------- */

function enviar(payload: string): void {
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([payload], { type: "text/plain" }))) return;
    fetch(ENDPOINT, { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(
      () => undefined,
    );
  } catch {
    // rede indisponível: descarta (medição nunca quebra o site)
  }
}

function descarregar(): void {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (!fila.length && !sessao?.init) return;
  const s = garantirSessao();
  let eventos = fila;
  fila = [];
  const montar = () => JSON.stringify({ v: 1, sid: s.id, ...(s.init ? { s: s.init } : {}), e: eventos });
  let payload = montar();
  while (payload.length > MAX_BATCH_BYTES && eventos.length > 1) {
    eventos = eventos.slice(0, Math.ceil(eventos.length / 2));
    payload = montar();
  }
  enviar(payload);
  if (s.init) {
    sessao = { ...s, init: null };
    gravarSessao(sessao);
  }
}

function enfileirar(ev: EventoFila): void {
  if (!ativo) return;
  garantirSessao();
  fila = [...fila, ev];
  if (fila.length >= FLUSH_AT) descarregar();
  else if (timer === null) timer = window.setTimeout(descarregar, FLUSH_EVERY_MS);
}

/** Filtra os parâmetros de um evento do dataLayer para o painel. Exportado para teste. */
export function paramsParaPainel(params: Record<string, unknown>): Params {
  const d: Params = {};
  for (const [k, v] of Object.entries(params)) {
    if (!PARAMS_ESPELHADOS.has(k) || v === undefined || v === null) continue;
    if (typeof v === "string") d[k] = v.slice(0, MAX_PARAM);
    else if (typeof v === "number" || typeof v === "boolean") d[k] = v;
  }
  return d;
}

export const deveEspelhar = (nome: string): boolean => EVENTO_ESPELHADO.test(nome);

/** Contatos saem na hora: muitas vezes o visitante vai para o WhatsApp antes dos 5 s da fila. */
const CONTATO_IMEDIATO = new Set(["click_whatsapp", "click_phone", "generate_lead"]);

/** Evento nomeado vindo do dataLayer (lib/tracking.ts). */
export function coletarEvento(nome: string, params: Record<string, unknown>): void {
  if (!ativo || !deveEspelhar(nome)) return;
  enfileirar({ n: nome, p: window.location.pathname, d: paramsParaPainel(params) });
  if (CONTATO_IMEDIATO.has(nome)) descarregar();
}

/* ---------------- Tempo visível + scroll ---------------- */

function aoFicarVisivel(): void {
  if (visivelDesde === null) visivelDesde = performance.now();
}
function aoFicarOculto(): void {
  if (visivelDesde !== null) {
    acumuladoMs += performance.now() - visivelDesde;
    visivelDesde = null;
  }
}
function medirScroll(): void {
  scrollAgendado = false;
  const doc = document.documentElement;
  const total = Math.max(doc.scrollHeight, document.body?.scrollHeight ?? 0);
  if (total <= 0) return;
  const pct = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / total) * 100));
  if (pct > scrollMax) scrollMax = pct;
}
function aoRolar(): void {
  if (scrollAgendado) return;
  scrollAgendado = true;
  requestAnimationFrame(medirScroll);
}

function encerrarPagina(): void {
  if (!ativo || paginaAtual === null || paginaEncerrada) return;
  aoFicarOculto();
  medirScroll();
  paginaEncerrada = true;
  enfileirar({ n: "page_leave", p: paginaAtual, d: { duration_ms: Math.round(acumuladoMs), max_scroll_pct: scrollMax } });
}

/** Abre uma página (load inicial ou navegação SPA). */
export function registrarPagina(path: string, titulo: string): void {
  if (!ativo) return;
  if (excluido(path)) {
    encerrarPagina();
    paginaAtual = null;
    return;
  }
  if (paginaAtual !== null && !paginaEncerrada) encerrarPagina();
  paginaAtual = path;
  acumuladoMs = 0;
  scrollMax = 0;
  paginaEncerrada = false;
  visivelDesde = document.visibilityState === "visible" ? performance.now() : null;
  requestAnimationFrame(medirScroll);

  const s = garantirSessao();
  const d: Params = { sw: window.innerWidth, sh: window.innerHeight };
  if (s.init === null && document.referrer) {
    const ref = hostDe(document.referrer);
    if (ref && ref !== window.location.hostname) d.ref_host = ref;
  }
  enfileirar({ n: "page_view", p: path, t: titulo.slice(0, 200), d });
}

function hostDe(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/* ---------------- Cliques ---------------- */

const SELETOR_CLIQUE = "a,button,[role=button],[data-track],input[type=submit],summary";

function descreverHref(href: string): string {
  if (/^tel:/i.test(href)) return "tel";
  if (/^mailto:/i.test(href)) return "mailto";
  try {
    const u = new URL(href, window.location.origin);
    if (u.hostname === window.location.hostname) return (u.pathname + u.hash).slice(0, 200);
    if (/wa\.me|whatsapp\.com/i.test(u.hostname)) return "wa.me";
    return u.hostname;
  } catch {
    return href.slice(0, 120);
  }
}

function aoClicar(e: MouseEvent): void {
  const el = (e.target as Element | null)?.closest?.(SELETOR_CLIQUE) as HTMLElement | null;
  // O seletor não inclui campos de formulário: texto digitado (dado pessoal) nunca é lido
  if (!el) return;

  const d: Params = { tag: el.tagName.toLowerCase() };
  const track = el.getAttribute("data-track") || el.getAttribute("aria-label");
  if (track) d.track = track.slice(0, 120);
  const texto = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  if (texto) d.text = texto.slice(0, 80);
  const href = el.getAttribute("href");
  if (href) d.href = descreverHref(href);
  const secao = el.closest("[data-section],section[id]") as HTMLElement | null;
  const idSecao = secao?.getAttribute("data-section") || secao?.id;
  if (idSecao) d.section = idSecao.slice(0, 60);

  enfileirar({ n: "click", p: window.location.pathname, d });
}

/* ---------------- Ciclo de vida ---------------- */

function aoMudarVisibilidade(): void {
  if (document.visibilityState === "hidden") {
    encerrarPagina();
    descarregar();
  } else if (paginaAtual !== null) {
    // voltou para a aba: reabre a MESMA página sem novo page_view
    paginaEncerrada = false;
    acumuladoMs = 0;
    aoFicarVisivel();
  }
}

function aoSairDaPagina(): void {
  encerrarPagina();
  descarregar();
}

/** Inicializa uma única vez (componente <Coletor /> no SiteChrome). */
export function iniciarColetor(): void {
  if (iniciado) return;
  iniciado = true;
  ativo = podeRodar();
  if (!ativo) return;
  garantirSessao();
  document.addEventListener("click", aoClicar, { capture: true, passive: true });
  document.addEventListener("visibilitychange", aoMudarVisibilidade);
  window.addEventListener("pagehide", aoSairDaPagina);
  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener(CONSENT_EVENT, aoMudarConsentimento);
}

/**
 * Validação do lote enviado pelo coletor (lib/painel/coletor.ts) para /api/collect.
 * Puro (sem Next/Supabase): testado em tests/painel-coleta.test.mjs. Porte de app/api/collect da Sólida.
 * Nada aqui guarda IP, user-agent cru ou cookie.
 */
import { classificarCanal, hostSemWww } from "./canal";

export const MAX_CORPO = 32 * 1024;
const MAX_EVENTOS = 50;
const MAX_CHAVES = 20;
const NOME_RE = /^[a-z_]{2,40}$/;
const CHAVE_RE = /^[a-z_][a-z0-9_]{0,39}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const BOT_RE =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|java\//i;

export type ValorParam = string | number | boolean;

export interface LinhaEvento {
  session_id: string;
  name: string;
  path: string;
  title: string | null;
  params: Record<string, ValorParam>;
}

export interface LinhaSessao {
  id: string;
  landing_path: string;
  referrer_host: string | null;
  channel: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  has_gclid: boolean;
  device: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
  country: string | null;
  region: string | null;
  city: string | null;
  screen_w: number | null;
  screen_h: number | null;
  lang: string | null;
  visitor_id: string | null;
}

/** Sinais do servidor (headers da Vercel + userAgent do Next), já reduzidos a famílias. */
export interface ContextoServidor {
  siteHost: string;
  device: "mobile" | "tablet" | "desktop";
  browserName?: string;
  osName?: string;
  country?: string | null;
  region?: string | null;
  city?: string | null;
}

export type ResultadoLote =
  | { ok: true; sid: string; sessao: LinhaSessao | null; eventos: LinhaEvento[] }
  | { ok: false; status: 400 | 413 };

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

function inteiro(v: unknown, max: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n), max) : null;
}

export function limparParams(d: unknown): Record<string, ValorParam> {
  const out: Record<string, ValorParam> = {};
  if (!d || typeof d !== "object" || Array.isArray(d)) return out;
  let chaves = 0;
  for (const [k, v] of Object.entries(d as Record<string, unknown>)) {
    if (chaves >= MAX_CHAVES) break;
    if (!CHAVE_RE.test(k)) continue;
    if (typeof v === "string") out[k] = v.slice(0, 200);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
    else continue;
    chaves += 1;
  }
  return out;
}

const NAVEGADORES: [RegExp, string][] = [
  [/edge/i, "edge"],
  [/samsung/i, "samsung"],
  [/opera|opr/i, "opera"],
  [/chrome|chromium|crios/i, "chrome"],
  [/safari/i, "safari"],
  [/firefox|fxios/i, "firefox"],
  [/instagram|facebook|fban|fbav/i, "in-app"],
];
const SISTEMAS: [RegExp, string][] = [
  [/android/i, "android"],
  [/ios|iphone|ipad/i, "ios"],
  [/windows/i, "windows"],
  [/mac/i, "macos"],
  [/linux|ubuntu|chrome os|chromium os/i, "linux"],
];

export function familia(nome: string | undefined, mapa: [RegExp, string][]): string {
  if (!nome) return "outro";
  return mapa.find(([re]) => re.test(nome))?.[1] ?? "outro";
}

function decodificar(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

/** Valida o texto do corpo e monta as linhas para o banco. */
export function interpretarLote(texto: string, ctx: ContextoServidor): ResultadoLote {
  if (texto.length > MAX_CORPO) return { ok: false, status: 413 };
  let corpo: {
    sid?: unknown;
    s?: Record<string, unknown>;
    e?: { n?: unknown; p?: unknown; t?: unknown; d?: unknown }[];
  };
  try {
    corpo = JSON.parse(texto);
  } catch {
    return { ok: false, status: 400 };
  }
  const sid = typeof corpo?.sid === "string" && UUID_RE.test(corpo.sid) ? corpo.sid.toLowerCase() : null;
  if (!sid || !Array.isArray(corpo.e)) return { ok: false, status: 400 };

  const eventos = corpo.e.slice(0, MAX_EVENTOS).flatMap((ev): LinhaEvento[] => {
    const name = str(ev?.n, 40);
    const path = str(ev?.p, 300);
    if (!name || !NOME_RE.test(name) || !path || !path.startsWith("/")) return [];
    return [{ session_id: sid, name, path, title: str(ev?.t, 200), params: limparParams(ev?.d) }];
  });

  let sessao: LinhaSessao | null = null;
  const s = corpo.s;
  if (s && typeof s === "object" && !Array.isArray(s)) {
    const utm = (s.utm && typeof s.utm === "object" ? s.utm : {}) as Record<string, unknown>;
    const referrerHost = hostSemWww(str(s.ref, 500));
    const utmSource = str(utm.source, 100);
    const utmMedium = str(utm.medium, 100);
    const utmTerm = str(utm.term, 150);
    const gclid = s.gclid === true;
    sessao = {
      id: sid,
      landing_path: str(s.path, 300) ?? "/",
      referrer_host: referrerHost,
      channel: classificarCanal({ gclid, utmSource, utmMedium, utmTerm, referrerHost, siteHost: ctx.siteHost }),
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: str(utm.campaign, 150),
      utm_term: utmTerm,
      utm_content: str(utm.content, 150),
      has_gclid: gclid,
      device: ctx.device,
      browser: familia(ctx.browserName, NAVEGADORES),
      os: familia(ctx.osName, SISTEMAS),
      country: str(ctx.country, 2),
      region: str(ctx.region, 10),
      city: ctx.city ? str(decodificar(ctx.city), 80) : null,
      screen_w: inteiro(s.sw, 10000),
      screen_h: inteiro(s.sh, 10000),
      lang: str(s.lang, 10),
      visitor_id: typeof s.vid === "string" && UUID_RE.test(s.vid) ? s.vid.toLowerCase() : null,
    };
  }
  return { ok: true, sid, sessao, eventos };
}

/**
 * Trackeamento (lado do navegador) — padrão MP Assessoria.
 *
 * - Tudo vai para `window.dataLayer`; GA4, Google Ads e Meta Pixel são
 *   configurados no GTM (gtm/gen-container.mjs → gtm/gtm-container-nicoli.json).
 * - Seguro em SSR: nenhuma função toca `window` fora do navegador.
 * - Nunca envie PII (nome, telefone, e-mail) em texto puro para o dataLayer.
 *   Para Enhanced Conversions use `pushHashedUserData()` (SHA-256).
 */

import {
  ATTR_COOKIE,
  ATTR_STORAGE_KEY,
  ATTR_TTL_DIAS,
  CONSENT_COOKIE,
  CONSENT_TTL_DIAS,
  attributionToEventParams,
  buildTouch,
  consentToMode,
  hostDe,
  isExpired,
  mergeAttribution,
  parseConsent,
  parseStoredAttribution,
  readCookieValue,
  serializeAttribution,
  serializeConsent,
  stripClickIds,
  toAttribution,
} from "./attribution-core";
import type { Attribution, ConsentState, StoredAttribution } from "./attribution-core";
import { coletarEvento } from "./painel/coletor";

export type { Attribution, ConsentState, Touch } from "./attribution-core";

export type TrackParams = Record<string, string | number | boolean | undefined>;

type DataLayerEntry = Record<string, unknown> | IArguments;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
    gtag?: (...args: unknown[]) => void;
    __nicoliConsentInit?: number;
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

/** Evento disparado no window quando o visitante decide no banner. */
export const CONSENT_CHANGE_EVENT = "nicoli:consent-change";
/** Dispare para reabrir o painel de preferências (ex.: link no rodapé). */
export const CONSENT_OPEN_EVENT = "nicoli:consent-open";

const MAX_PARAM = 100;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function siteHost(): string | undefined {
  if (!isBrowser()) return undefined;
  return window.location.hostname || hostDe(process.env.NEXT_PUBLIC_SITE_URL);
}

/* ------------------------------------------------------------------ */
/* dataLayer + Consent Mode                                            */
/* ------------------------------------------------------------------ */

function getDataLayer(): DataLayerEntry[] {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/** gtag() mínimo (empilha `arguments`, formato exigido pelo GTM/Consent Mode). */
function gtag(...args: unknown[]): void {
  if (!isBrowser()) return;
  if (!window.gtag) {
    const dl = getDataLayer();
    window.gtag = function gtagShim() {
      // eslint-disable-next-line prefer-rest-params
      dl.push(arguments);
    };
  }
  window.gtag(...args);
}

/**
 * Espelho TS de `consentBootstrapSnippet()` (lib/attribution-core.ts).
 * Garante o `consent default` como PRIMEIRO comando do dataLayer, mesmo que um
 * evento seja disparado antes do script inline rodar.
 */
export function ensureConsentDefaults(): void {
  if (!isBrowser() || window.__nicoliConsentInit) return;
  window.__nicoliConsentInit = 1;
  const base = {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  };
  gtag("consent", "default", base);
  gtag("consent", "default", { ...base, region: ["BR"] });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", true);
  const salvo = readConsent();
  if (salvo) {
    gtag("consent", "update", consentToMode(salvo));
    gtag("set", "ads_data_redaction", !salvo.marketing);
  }
}

/** Push cru no dataLayer (com consent default garantido antes). */
export function pushDataLayer(entry: Record<string, unknown>): void {
  if (!isBrowser()) return;
  try {
    ensureConsentDefaults();
    getDataLayer().push(entry);
  } catch {
    // dataLayer indisponível — medição nunca pode quebrar o site
  }
  try {
    // Espelha os eventos de contato no painel /dashboard (coleta própria, anônima)
    if (typeof entry.event === "string") coletarEvento(entry.event, entry);
  } catch {
    // idem
  }
}

function sanitizeParams(params?: TrackParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!params) return out;
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string") {
      const s = v.replace(/\s+/g, " ").trim();
      if (s) out[k] = s.slice(0, MAX_PARAM);
    } else if (typeof v === "number") {
      if (Number.isFinite(v)) out[k] = v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

function buildEventPayload(event: string, params?: TrackParams): Record<string, unknown> {
  return {
    ...attributionToEventParams(getAttribution()),
    page_path: window.location.pathname,
    page_title: document.title,
    page_location: window.location.origin + window.location.pathname,
    ...sanitizeParams(params),
    event,
  };
}

/**
 * Dispara um evento no dataLayer com page_path, page_title e atribuição.
 * Seguro em SSR (no-op) e nunca lança erro.
 */
export function trackEvent(event: string, params?: TrackParams): void {
  if (!isBrowser() || !event) return;
  try {
    pushDataLayer(buildEventPayload(event, params));
  } catch {
    // nunca quebrar a UI por causa de medição
  }
}

/**
 * Igual a `trackEvent`, mas resolve quando o GTM terminou as tags do evento
 * (`eventCallback`) ou após `timeoutMs` — o que vier primeiro.
 * Use antes de navegar para fora do site.
 */
export function trackEventAndWait(event: string, params?: TrackParams, timeoutMs = 800): Promise<void> {
  if (!isBrowser() || !event) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let feito = false;
    const concluir = () => {
      if (feito) return;
      feito = true;
      resolve();
    };
    const timer = window.setTimeout(concluir, timeoutMs);
    try {
      pushDataLayer({
        ...buildEventPayload(event, params),
        eventCallback: (containerId?: string) => {
          // O GTM chama o callback uma vez por container; ignore chamadas sem container real
          if (containerId && !String(containerId).startsWith("GTM-")) return;
          window.clearTimeout(timer);
          concluir();
        },
        eventTimeout: timeoutMs,
      });
    } catch {
      window.clearTimeout(timer);
      concluir();
    }
  });
}

/* ------------------------------------------------------------------ */
/* Consentimento                                                       */
/* ------------------------------------------------------------------ */

function writeCookie(name: string, value: string, dias: number): void {
  const seguro = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${dias * 86400}; Path=/; SameSite=Lax${seguro}`;
}

/** Escolha salva no cookie `nicoli_consent` (null = ainda não decidiu). */
export function readConsent(): ConsentState | null {
  if (!isBrowser()) return null;
  try {
    return parseConsent(readCookieValue(document.cookie, CONSENT_COOKIE));
  } catch {
    return null;
  }
}

export function hasMarketingConsent(): boolean {
  return readConsent()?.marketing === true;
}

/** Salva a decisão, atualiza o Consent Mode e avisa o GTM (evento `consent_update`). */
export function saveConsent(escolha: { analytics: boolean; marketing: boolean }, origem = "banner"): ConsentState {
  const estado: ConsentState = { analytics: escolha.analytics, marketing: escolha.marketing, ts: Date.now() };
  if (!isBrowser()) return estado;
  try {
    ensureConsentDefaults();
    writeCookie(CONSENT_COOKIE, serializeConsent(estado), CONSENT_TTL_DIAS);
    gtag("consent", "update", consentToMode(estado));
    gtag("set", "ads_data_redaction", !estado.marketing);
    pushDataLayer({
      event: "consent_update",
      consent_analytics: estado.analytics ? "granted" : "denied",
      consent_marketing: estado.marketing ? "granted" : "denied",
      consent_origin: origem.slice(0, 40),
    });
    if (!estado.marketing) purgeAdIdentifiers();
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: estado }));
  } catch {
    // sem cookie/storage — segue com o estado em memória
  }
  return estado;
}

/** Reabre o painel de preferências de cookies (use num link do rodapé). */
export function openConsentPreferences(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

/* ------------------------------------------------------------------ */
/* Atribuição (localStorage 90 dias + cookie first-party)              */
/* ------------------------------------------------------------------ */

let memoria: StoredAttribution | null = null;
/** O document.referrer só vale para a 1ª captura do carregamento (em SPA ele não muda). */
let referrerConsumido = false;

function readStored(): StoredAttribution | null {
  let stored: StoredAttribution | null = null;
  try {
    stored = parseStoredAttribution(window.localStorage.getItem(ATTR_STORAGE_KEY));
  } catch {
    stored = null;
  }
  if (!stored) {
    try {
      stored = parseStoredAttribution(readCookieValue(document.cookie, ATTR_COOKIE));
    } catch {
      stored = null;
    }
  }
  if (stored && isExpired(stored, Date.now())) return null;
  return stored;
}

function persist(stored: StoredAttribution): void {
  memoria = stored;
  const raw = serializeAttribution(stored);
  try {
    window.localStorage.setItem(ATTR_STORAGE_KEY, raw);
  } catch {
    // modo privado / storage bloqueado
  }
  try {
    writeCookie(ATTR_COOKIE, raw, ATTR_TTL_DIAS);
  } catch {
    // cookies bloqueados
  }
}

/**
 * Lê UTMs/click IDs da URL atual e atualiza first/last touch.
 * Chamado pelo <UTMCapture /> na entrada e a cada mudança de rota.
 */
export function captureAttribution(): Attribution {
  if (!isBrowser()) return {};
  try {
    const now = Date.now();
    const atual = buildTouch({
      search: window.location.search,
      pathname: window.location.pathname,
      referrer: referrerConsumido ? undefined : document.referrer,
      siteHost: siteHost(),
      now,
    });
    referrerConsumido = true;
    const base = memoria ?? readStored();
    let merged = mergeAttribution(base, atual, window.location.pathname, now);
    if (readConsent()?.marketing === false) merged = stripClickIds(merged);
    if (merged !== base || !memoria) persist(merged);
    return toAttribution(merged);
  } catch {
    return {};
  }
}

/** Atribuição atual (first/last touch + UTMs + click IDs). `{}` no servidor. */
export function getAttribution(): Attribution {
  if (!isBrowser()) return {};
  try {
    if (memoria && !isExpired(memoria, Date.now())) return toAttribution(memoria);
    const stored = readStored();
    if (stored) {
      memoria = stored;
      return toAttribution(stored);
    }
    return captureAttribution();
  } catch {
    return {};
  }
}

/** Remove gclid/gbraid/wbraid/fbclid do que está salvo (visitante recusou marketing). */
export function purgeAdIdentifiers(): void {
  if (!isBrowser()) return;
  try {
    const stored = memoria ?? readStored();
    if (stored) persist(stripClickIds(stored));
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/* Enhanced Conversions (SHA-256, só com consentimento ad_user_data)   */
/* ------------------------------------------------------------------ */

export async function sha256Hex(texto: string): Promise<string | null> {
  try {
    if (!isBrowser() || !window.crypto?.subtle) return null;
    const bytes = new TextEncoder().encode(texto);
    const hash = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

/**
 * Empilha `user_data` com e-mail/telefone JÁ normalizados e em SHA-256.
 * Só roda se o visitante concedeu marketing (ad_user_data). Retorna true se enviou.
 */
export async function pushHashedUserData(dados: { emailNormalizado?: string; telefoneE164?: string }): Promise<boolean> {
  if (!isBrowser() || !hasMarketingConsent()) return false;
  const [email, phone] = await Promise.all([
    dados.emailNormalizado ? sha256Hex(dados.emailNormalizado) : Promise.resolve(null),
    dados.telefoneE164 ? sha256Hex(dados.telefoneE164) : Promise.resolve(null),
  ]);
  if (!email && !phone) return false;
  const userData: Record<string, string> = {};
  if (email) userData.sha256_email_address = email;
  if (phone) userData.sha256_phone_number = phone;
  pushDataLayer({ user_data: userData });
  return true;
}

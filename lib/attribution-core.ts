/**
 * Núcleo PURO de atribuição, consentimento e normalização (sem window/document).
 * Tudo aqui é determinístico e testável em Node (tests/tracking.test.mjs).
 * O lado do navegador (storage, cookies, dataLayer) fica em lib/tracking.ts.
 */

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

export const ATTR_STORAGE_KEY = "nicoli_attr";
export const ATTR_COOKIE = "_nicoli_attr";
export const CONSENT_COOKIE = "nicoli_consent";

const DIA_MS = 24 * 60 * 60 * 1000;
export const ATTR_TTL_DIAS = 90;
export const ATTR_TTL_MS = ATTR_TTL_DIAS * DIA_MS;
export const CONSENT_TTL_DIAS = 180;

/** Limite de caracteres por valor guardado (evita cookie > 4 KB e lixo em relatório). */
const MAX_VALOR = 150;

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export const CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid", "fbclid"] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type ClickIdKey = (typeof CLICK_ID_KEYS)[number];

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

/** Um "toque" de marketing: como o visitante chegou ao site naquela vez. */
export interface Touch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  /** Caminho de entrada (sem query string). */
  landing_page: string;
  /** Host do referrer externo (nunca a URL inteira — pode conter dados pessoais). */
  referrer?: string;
  /** Epoch em ms. */
  ts: number;
}

/** Formato persistido (localStorage + cookie `_nicoli_attr`). */
export interface StoredAttribution {
  v: 1;
  first_touch: Touch;
  last_touch: Touch;
  /** Epoch em ms da última atualização (base do TTL de 90 dias). */
  updated_at: number;
}

/** Visão "achatada" consumida pelo site (valores do último toque não-direto). */
export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  landing_page?: string;
  referrer?: string;
  first_touch?: Touch;
  last_touch?: Touch;
}

export type Channel =
  | "google_ads"
  | "meta_ads"
  | "paid_other"
  | "google_organic"
  | "other_search"
  | "social"
  | "email"
  | "referral"
  | "direct";

export interface ConsentState {
  /** analytics_storage */
  analytics: boolean;
  /** ad_storage + ad_user_data + ad_personalization */
  marketing: boolean;
  /** Epoch em ms da decisão. */
  ts: number;
}

export type ConsentValue = "granted" | "denied";

export interface ConsentModeUpdate {
  analytics_storage: ConsentValue;
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
}

/* ------------------------------------------------------------------ */
/* Sanitização                                                         */
/* ------------------------------------------------------------------ */

/** Remove caracteres de controle, apara e limita o tamanho. Vazio → undefined. */
export function limparValor(valor: unknown, max = MAX_VALOR): string | undefined {
  if (typeof valor !== "string") return undefined;
  const limpo = valor.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!limpo) return undefined;
  return limpo.slice(0, max);
}

/** Só o host (sem www) de uma URL; null se inválida/vazia. */
export function hostDe(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host || undefined;
  } catch {
    return undefined;
  }
}

function mesmoSite(host: string, siteHost: string): boolean {
  const h = host.replace(/^www\./, "");
  const s = siteHost.replace(/^www\./, "");
  return h === s || h.endsWith("." + s) || s.endsWith("." + h);
}

/* ------------------------------------------------------------------ */
/* Parser de toques                                                    */
/* ------------------------------------------------------------------ */

/** Lê UTMs e click IDs de uma query string ("?a=b" ou "a=b"). */
export function parseCampaignParams(search: string): Partial<Record<UtmKey | ClickIdKey, string>> {
  const out: Partial<Record<UtmKey | ClickIdKey, string>> = {};
  let q: URLSearchParams;
  try {
    q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  } catch {
    return out;
  }
  for (const k of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    const v = limparValor(q.get(k));
    if (v) out[k] = k === "utm_source" || k === "utm_medium" ? v.toLowerCase() : v;
  }
  return out;
}

export interface TouchInput {
  /** window.location.search */
  search: string;
  /** window.location.pathname */
  pathname: string;
  /** document.referrer (pode ser vazio) */
  referrer?: string;
  /** Host do próprio site (referrer interno é ignorado). */
  siteHost?: string;
  now: number;
}

/**
 * Monta o toque atual. Retorna `null` quando a visita é "direta"
 * (sem UTM, sem click ID e sem referrer externo) — toques diretos não
 * sobrescrevem a última origem conhecida (modelo "último clique não-direto").
 */
export function buildTouch(input: TouchInput): Touch | null {
  const params = parseCampaignParams(input.search);
  let refHost = hostDe(input.referrer);
  if (refHost && input.siteHost && mesmoSite(refHost, input.siteHost)) refHost = undefined;

  const temCampanha = Object.keys(params).length > 0;
  if (!temCampanha && !refHost) return null;

  return {
    ...params,
    landing_page: limparValor(input.pathname, 200) ?? "/",
    ...(refHost ? { referrer: refHost } : {}),
    ts: input.now,
  };
}

/** Toque "direto" usado quando ainda não existe nada salvo. */
export function directTouch(pathname: string, now: number): Touch {
  return { landing_page: limparValor(pathname, 200) ?? "/", ts: now };
}

export function isExpired(stored: StoredAttribution, now: number, ttlMs = ATTR_TTL_MS): boolean {
  return now - stored.updated_at > ttlMs;
}

/**
 * Combina o que está salvo com o toque atual.
 * - first_touch: o primeiro toque dentro da janela de 90 dias (nunca muda).
 * - last_touch: o último toque NÃO-direto.
 * - Expirado (90 dias sem novo toque) → recomeça.
 */
export function mergeAttribution(
  stored: StoredAttribution | null,
  current: Touch | null,
  fallbackPath: string,
  now: number,
): StoredAttribution {
  const valido = stored && !isExpired(stored, now) ? stored : null;
  if (!valido) {
    const t = current ?? directTouch(fallbackPath, now);
    return { v: 1, first_touch: t, last_touch: t, updated_at: now };
  }
  if (!current) return valido;
  return { v: 1, first_touch: valido.first_touch, last_touch: current, updated_at: now };
}

/** Remove click IDs (usado quando o visitante recusa marketing). */
export function stripClickIds(stored: StoredAttribution): StoredAttribution {
  const semIds = (t: Touch): Touch => {
    const copia: Touch = { ...t };
    for (const k of CLICK_ID_KEYS) delete copia[k];
    return copia;
  };
  return { ...stored, first_touch: semIds(stored.first_touch), last_touch: semIds(stored.last_touch) };
}

/* ------------------------------------------------------------------ */
/* Serialização (com validação — nunca confiar no que vem do storage)  */
/* ------------------------------------------------------------------ */

function sanitizeTouch(raw: unknown): Touch | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const ts = typeof r.ts === "number" && Number.isFinite(r.ts) ? r.ts : null;
  const landing = limparValor(r.landing_page, 200);
  if (ts === null || !landing) return null;
  const t: Touch = { landing_page: landing, ts };
  for (const k of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    const v = limparValor(r[k]);
    if (v) t[k] = v;
  }
  const ref = limparValor(r.referrer, 120);
  if (ref) t.referrer = ref;
  return t;
}

export function serializeAttribution(stored: StoredAttribution): string {
  return JSON.stringify(stored);
}

export function parseStoredAttribution(raw: string | null | undefined): StoredAttribution | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    if (!obj || obj.v !== 1 || typeof obj.updated_at !== "number") return null;
    const first = sanitizeTouch(obj.first_touch);
    const last = sanitizeTouch(obj.last_touch);
    if (!first || !last) return null;
    return { v: 1, first_touch: first, last_touch: last, updated_at: obj.updated_at };
  } catch {
    return null;
  }
}

/** Achata para a visão do site: campos do último toque, com o primeiro como apoio. */
export function toAttribution(stored: StoredAttribution | null): Attribution {
  if (!stored) return {};
  const last = stored.last_touch;
  const out: Attribution = {
    first_touch: stored.first_touch,
    last_touch: last,
    landing_page: last.landing_page,
  };
  for (const k of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    if (last[k]) out[k] = last[k];
  }
  if (last.referrer) out.referrer = last.referrer;
  return out;
}

/* ------------------------------------------------------------------ */
/* Canal                                                               */
/* ------------------------------------------------------------------ */

const SEARCH_HOSTS = /(^|\.)(bing|yahoo|duckduckgo|ecosia|yandex|baidu|ask|brave)\./i;
const SOCIAL_HOSTS =
  /(^|\.)(facebook|fb|instagram|linkedin|lnkd|twitter|x|t|youtube|youtu|tiktok|whatsapp|wa|pinterest|threads)\.(com|me|be|co|in)$/i;
const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paidsearch", "paid_search", "sem", "display", "cpm"]);
const PAID_SOCIAL_MEDIUMS = new Set(["paid_social", "paidsocial", "social_paid", "cpc_social"]);

/** Classifica a origem de um toque (usado no dataLayer como `traffic_channel`). */
export function classifyChannel(touch: Touch | undefined | null): Channel {
  if (!touch) return "direct";
  const source = (touch.utm_source ?? "").toLowerCase();
  const medium = (touch.utm_medium ?? "").toLowerCase();
  const ref = (touch.referrer ?? "").toLowerCase();

  if (touch.gclid || touch.gbraid || touch.wbraid) return "google_ads";
  if (source.includes("google") && PAID_MEDIUMS.has(medium)) return "google_ads";
  if (touch.fbclid && (PAID_MEDIUMS.has(medium) || PAID_SOCIAL_MEDIUMS.has(medium))) return "meta_ads";
  if (/(facebook|instagram|meta|fb|ig)/.test(source) && (PAID_MEDIUMS.has(medium) || PAID_SOCIAL_MEDIUMS.has(medium))) {
    return "meta_ads";
  }
  if (PAID_MEDIUMS.has(medium) || PAID_SOCIAL_MEDIUMS.has(medium)) return "paid_other";
  if (medium === "email" || medium === "e-mail" || medium === "newsletter") return "email";
  if (medium === "social" || medium === "organic_social" || touch.fbclid) return "social";
  if (/(^|\.)google\./i.test(ref)) return "google_organic";
  if (SEARCH_HOSTS.test(ref)) return "other_search";
  if (SOCIAL_HOSTS.test(ref)) return "social";
  if (ref || source) return "referral";
  return "direct";
}

/** true se o toque veio de anúncio (qualquer rede). */
export function isPaidTouch(touch: Touch | undefined | null): boolean {
  const c = classifyChannel(touch);
  return c === "google_ads" || c === "meta_ads" || c === "paid_other";
}

/**
 * Parâmetros de atribuição para o dataLayer (achatados, só strings).
 * Inclui click IDs — eles vão SOMENTE para o dataLayer, nunca para o cliente.
 */
export function attributionToEventParams(attr: Attribution): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    const v = attr[k];
    if (v) out[k] = v;
  }
  if (attr.landing_page) out.landing_page = attr.landing_page;
  if (attr.referrer) out.referrer_host = attr.referrer;
  out.traffic_channel = classifyChannel(attr.last_touch);
  const ft = attr.first_touch;
  if (ft) {
    out.first_touch_channel = classifyChannel(ft);
    if (ft.utm_source) out.first_touch_source = ft.utm_source;
    if (ft.utm_medium) out.first_touch_medium = ft.utm_medium;
    if (ft.utm_campaign) out.first_touch_campaign = ft.utm_campaign;
    out.first_touch_landing = ft.landing_page;
  }
  return out;
}

/** Rótulo de campanha exibido na linha "Ref.:" da mensagem de WhatsApp. */
export function campaignLabel(attr: Attribution): string {
  if (attr.utm_campaign) return attr.utm_campaign;
  const canal = classifyChannel(attr.last_touch);
  if (canal === "google_ads") return "Google Ads";
  if (canal === "meta_ads") return "Meta Ads";
  if (canal === "paid_other") return attr.utm_source ?? "anúncio";
  return "orgânico";
}

/* ------------------------------------------------------------------ */
/* Consentimento (formato do cookie `nicoli_consent`)                  */
/* ------------------------------------------------------------------ */

/** Cookie compacto: {"v":1,"a":1,"m":0,"t":1700000000000} */
export function serializeConsent(c: ConsentState): string {
  return JSON.stringify({ v: 1, a: c.analytics ? 1 : 0, m: c.marketing ? 1 : 0, t: c.ts });
}

export function parseConsent(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    if (!obj || obj.v !== 1) return null;
    return {
      analytics: obj.a === 1 || obj.a === true,
      marketing: obj.m === 1 || obj.m === true,
      ts: typeof obj.t === "number" ? obj.t : 0,
    };
  } catch {
    return null;
  }
}

export function consentToMode(c: Pick<ConsentState, "analytics" | "marketing">): ConsentModeUpdate {
  const a: ConsentValue = c.analytics ? "granted" : "denied";
  const m: ConsentValue = c.marketing ? "granted" : "denied";
  return { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m };
}

/**
 * Snippet inline do Consent Mode v2 (roda ANTES do GTM).
 * Idempotente (flag `__nicoliConsentInit`): pode rodar no `beforeInteractive`
 * e de novo no loader do GTM sem duplicar. Também restaura a escolha salva no
 * cookie `nicoli_consent` para visitantes recorrentes.
 * O espelho em TypeScript é `ensureConsentDefaults()` em lib/tracking.ts
 * (os testes garantem que os dois produzem o mesmo dataLayer).
 */
export function consentBootstrapSnippet(): string {
  return [
    "(function(w,d){",
    "if(w.__nicoliConsentInit)return;w.__nicoliConsentInit=1;",
    "w.dataLayer=w.dataLayer||[];",
    "var g=w.gtag||function(){w.dataLayer.push(arguments);};w.gtag=g;",
    "var D='denied',G='granted';",
    "var b={ad_storage:D,ad_user_data:D,ad_personalization:D,analytics_storage:D,functionality_storage:G,security_storage:G,wait_for_update:500};",
    "g('consent','default',b);",
    "var r={};for(var k in b)r[k]=b[k];r.region=['BR'];g('consent','default',r);",
    "g('set','ads_data_redaction',true);g('set','url_passthrough',true);",
    "try{var m=d.cookie.match(/(?:^|; )" + CONSENT_COOKIE + "=([^;]*)/);",
    "if(m){var c=JSON.parse(decodeURIComponent(m[1]));",
    "if(c&&c.v===1){var A=c.a?G:D,M=c.m?G:D;",
    "g('consent','update',{analytics_storage:A,ad_storage:M,ad_user_data:M,ad_personalization:M});",
    "g('set','ads_data_redaction',!c.m);}}}catch(e){}",
    "})(window,document);",
  ].join("");
}

/** Lê um cookie de uma string `document.cookie`. */
export function readCookieValue(cookieString: string, name: string): string | null {
  const parts = cookieString ? cookieString.split(/;\s*/) : [];
  for (const p of parts) {
    const i = p.indexOf("=");
    if (i < 0) continue;
    if (p.slice(0, i) === name) {
      try {
        return decodeURIComponent(p.slice(i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Normalização para Enhanced Conversions (antes do SHA-256)           */
/* ------------------------------------------------------------------ */

/** Regra do Google: minúsculas, sem espaços; gmail/googlemail sem pontos no usuário. */
export function normalizeEmailForHash(email: string): string {
  const e = email.trim().toLowerCase().replace(/\s+/g, "");
  const at = e.lastIndexOf("@");
  if (at < 1) return e;
  const user = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return `${user.replace(/\./g, "")}@${domain}`;
  }
  return e;
}

/** E.164 brasileiro: "+55DDDNNNNNNNN". Retorna null se não for telefone BR válido. */
export function normalizePhoneE164BR(telefone: string): string | null {
  let d = telefone.replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  return `+55${d}`;
}

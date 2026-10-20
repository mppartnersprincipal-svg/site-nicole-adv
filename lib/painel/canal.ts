/**
 * Origem da sessão do painel (pago × orgânico × direto…). Função pura, usada no
 * servidor (/api/collect) com os sinais que o navegador manda. Porte de lib/attribution.ts da Sólida.
 */

export const CANAIS = ["google_ads", "google_organic", "other_search", "social", "referral", "direct"] as const;
export type Canal = (typeof CANAIS)[number];

export interface EntradaCanal {
  /** Havia gclid/gbraid/wbraid na página de entrada */
  gclid: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  /** utm_term cru — "{keyword}" é ValueTrack não substituído (teste, não clique real) */
  utmTerm?: string | null;
  referrerHost?: string | null;
  siteHost?: string | null;
}

const BUSCADORES = /(^|\.)(bing|yahoo|duckduckgo|ecosia|yandex|baidu|ask)\./i;
const REDES =
  /(^|\.)(facebook|instagram|linkedin|twitter|x|t|youtube|youtu|tiktok|whatsapp|wa|pinterest|threads)\.(com|me|be|co)$/i;
const MIDIA_PAGA = new Set(["cpc", "ppc", "paid", "paidsearch", "paid_search", "sem"]);

export function classificarCanal(e: EntradaCanal): Canal {
  const source = (e.utmSource ?? "").toLowerCase();
  const medium = (e.utmMedium ?? "").toLowerCase();
  const ref = (e.referrerHost ?? "").toLowerCase();
  const site = (e.siteHost ?? "").toLowerCase();

  if (e.gclid) return "google_ads";
  // Link aberto de dentro do painel do Ads, ou ValueTrack cru: teste, não clique real
  if (ref === "ads.google.com" || /\{\w+\}/.test(e.utmTerm ?? "")) return "direct";
  if (source.includes("google") && MIDIA_PAGA.has(medium)) return "google_ads";
  if (medium === "social" || medium === "paidsocial") return "social";
  if (ref && site && (ref === site || ref.endsWith("." + site) || site.endsWith("." + ref))) return "direct";
  if (/(^|\.)google\./i.test(ref)) return "google_organic";
  if (BUSCADORES.test(ref)) return "other_search";
  if (REDES.test(ref)) return "social";
  if (ref || source) return "referral";
  return "direct";
}

/** Só o host (sem www, query ou caminho) — nunca guardamos a URL inteira. */
export function hostSemWww(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

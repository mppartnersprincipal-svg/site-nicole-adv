/** Helpers de DOM usados pelo <TrackingEvents /> (só rodam no navegador). */

const NOME_EVENTO_RE = /^[a-z][a-z0-9_]{1,39}$/;
const MAX_LABEL = 80;

export type TipoLink = "whatsapp" | "phone" | "email" | "interno" | "externo" | "outro";

/** Normaliza nomes vindos de data-track ("Click CTA" → "click_cta"); null se inválido. */
export function nomeEventoValido(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const nome = valor.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return NOME_EVENTO_RE.test(nome) ? nome : null;
}

export function classificarHref(href: string, hostAtual: string): TipoLink {
  const h = href.trim();
  if (/^tel:/i.test(h)) return "phone";
  if (/^mailto:/i.test(h)) return "email";
  try {
    const u = new URL(h, window.location.href);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "wa.me" || host === "api.whatsapp.com" || host === "web.whatsapp.com" || host === "whatsapp.com") {
      return "whatsapp";
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") return "outro";
    return host === hostAtual.replace(/^www\./, "").toLowerCase() ? "interno" : "externo";
  } catch {
    return "outro";
  }
}

/** URL "segura" para o dataLayer: caminho interno ou só o host externo (sem query). */
export function descreverUrl(href: string, tipo: TipoLink): string | undefined {
  if (tipo === "whatsapp") return "wa.me";
  if (tipo === "phone" || tipo === "email" || tipo === "outro") return undefined;
  try {
    const u = new URL(href, window.location.href);
    return tipo === "interno" ? (u.pathname + u.hash).slice(0, 100) : u.hostname;
  } catch {
    return undefined;
  }
}

export function textoDoElemento(el: Element | null): string | undefined {
  if (!el) return undefined;
  const html = el as HTMLElement;
  const rotulo =
    html.getAttribute("data-track-label") ||
    html.getAttribute("aria-label") ||
    (html.innerText || html.textContent || "").replace(/\s+/g, " ").trim();
  return rotulo ? rotulo.slice(0, MAX_LABEL) : undefined;
}

/** Onde o clique aconteceu: data-track-location > floating > data-section > footer/header/menu. */
export function resolverLocal(el: Element): string {
  const marcado = el.closest("[data-track-location]");
  const valor = marcado?.getAttribute("data-track-location");
  if (valor) return valor.slice(0, 40);
  if (el.closest("[data-floating]")) return "floating";
  const secao = el.closest("[data-section]")?.getAttribute("data-section");
  if (secao) return secao.slice(0, 40);
  if (el.closest("footer, [role=contentinfo]")) return "footer";
  if (el.closest("header, [role=banner]")) return "header";
  if (el.closest("nav")) return "menu";
  if (el.closest("main")) return "conteudo";
  return "outro";
}

/** Porcentagem rolada da página (0–100). */
export function porcentagemRolada(): number {
  const doc = document.documentElement;
  const total = Math.max(doc.scrollHeight, document.body?.scrollHeight ?? 0);
  if (total <= 0) return 0;
  return Math.min(100, ((window.scrollY + window.innerHeight) / total) * 100);
}

/** Quanto do artigo [data-article] já passou pela tela (0–1). */
export function progressoArtigo(artigo: Element): number {
  const r = artigo.getBoundingClientRect();
  if (r.height <= 0) return 0;
  return Math.max(0, Math.min(1, (window.innerHeight - r.top) / r.height));
}

export const SLUG_BLOG_RE = /^\/blog\/([^/]+)\/?$/;

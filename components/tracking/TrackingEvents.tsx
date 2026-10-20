"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/tracking";
import {
  SLUG_BLOG_RE,
  classificarHref,
  descreverUrl,
  nomeEventoValido,
  porcentagemRolada,
  progressoArtigo,
  resolverLocal,
  textoDoElemento,
} from "./dom-helpers";
import type { TipoLink } from "./dom-helpers";

const LIMIARES_SCROLL = [25, 50, 75, 100] as const;
const SECAO_LIMIAR = 0.4;
const BLOG_LIMIAR = 0.75;
const BLOG_TEMPO_MS = 45_000;
const ATRASO_PAGE_VIEW_MS = 120; // espera o <title> da nova rota

const EVENTO_POR_TIPO: Partial<Record<TipoLink, string>> = {
  whatsapp: "click_whatsapp",
  phone: "click_phone",
  email: "click_email",
};

/* Estado por página (módulo, para sobreviver ao StrictMode) */
let ultimoPath: string | null = null;
let ultimaUrl = "";
const formsIniciados = new Set<string>();

/* ------------------------------------------------------------------ */
/* Cliques e foco (delegados no document, montados uma vez)            */
/* ------------------------------------------------------------------ */

function onClick(e: MouseEvent): void {
  const alvo = e.target as Element | null;
  if (!alvo || typeof alvo.closest !== "function") return;

  const link = alvo.closest("a[href]") as HTMLAnchorElement | null;
  const marcado = alvo.closest("[data-track]") as HTMLElement | null;
  const base = link ?? marcado ?? alvo;
  const local = resolverLocal(base);
  const rotulo = textoDoElemento(marcado ?? link);

  let automatico: string | undefined;
  let tipo: TipoLink | undefined;
  let url: string | undefined;
  if (link) {
    const href = link.getAttribute("href") ?? "";
    tipo = classificarHref(href, window.location.hostname);
    url = descreverUrl(href, tipo);
    automatico = EVENTO_POR_TIPO[tipo];
    if (automatico) trackEvent(automatico, { link_location: local, link_label: rotulo, link_url: url });
  }

  if (marcado) {
    const nome = nomeEventoValido(marcado.getAttribute("data-track"));
    if (nome && nome !== automatico) {
      trackEvent(nome, {
        link_location: local,
        link_label: rotulo,
        link_url: url,
        lead_area: marcado.getAttribute("data-track-area") ?? undefined,
      });
    }
  }

  const nav = alvo.closest("[data-track-nav]");
  if (nav && link && !automatico) {
    trackEvent("navigation_click", {
      nav_location: nav.getAttribute("data-track-nav") || "menu",
      link_label: textoDoElemento(link),
      link_url: url,
    });
  }
}

function onFocusIn(e: FocusEvent): void {
  const alvo = e.target as HTMLElement | null;
  if (!alvo || !/^(INPUT|SELECT|TEXTAREA)$/.test(alvo.tagName)) return;
  const form = alvo.closest("form[data-form-id]");
  const formId = form?.getAttribute("data-form-id");
  if (!form || !formId || formsIniciados.has(formId)) return;
  formsIniciados.add(formId);
  trackEvent("form_start", {
    form_id: formId,
    lead_area: form.getAttribute("data-form-area") ?? undefined,
  });
}

/* ------------------------------------------------------------------ */
/* Por página: scroll, seções, blog                                     */
/* ------------------------------------------------------------------ */

function observarScroll(): () => void {
  const disparados = new Set<number>();
  let agendado = false;
  const medir = () => {
    agendado = false;
    const pct = porcentagemRolada();
    for (const l of LIMIARES_SCROLL) {
      const atingiu = l === 100 ? pct >= 99 : pct >= l;
      if (atingiu && !disparados.has(l)) {
        disparados.add(l);
        trackEvent(`scroll_${l}`, { percent_scrolled: l });
      }
    }
  };
  const onScroll = () => {
    if (agendado || disparados.size === LIMIARES_SCROLL.length) return;
    agendado = true;
    requestAnimationFrame(medir);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

function observarSecoes(): () => void {
  if (typeof IntersectionObserver === "undefined") return () => {};
  const vistas = new Set<string>();
  const observados = new WeakSet<Element>();
  const io = new IntersectionObserver(
    (entradas) => {
      for (const en of entradas) {
        if (!en.isIntersecting) continue;
        const altura = en.rootBounds?.height ?? window.innerHeight;
        // seções mais altas que a tela nunca chegam a 40% de ratio → conta 40% da viewport coberta
        const visivel = en.intersectionRatio >= SECAO_LIMIAR || en.intersectionRect.height >= altura * SECAO_LIMIAR;
        const id = en.target.getAttribute("data-section");
        if (!visivel || !id || vistas.has(id)) continue;
        vistas.add(id);
        io.unobserve(en.target);
        trackEvent("section_view", { section_id: id.slice(0, 40) });
      }
    },
    { threshold: [0, 0.1, 0.25, SECAO_LIMIAR] },
  );
  const varrer = () => {
    document.querySelectorAll("[data-section]").forEach((el) => {
      if (observados.has(el)) return;
      observados.add(el);
      io.observe(el);
    });
  };
  varrer();
  // conteúdo em streaming/Suspense pode chegar depois: revarre com debounce
  let pendente = 0;
  const mo = new MutationObserver(() => {
    if (pendente) return;
    pendente = window.setTimeout(() => {
      pendente = 0;
      varrer();
    }, 250);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  return () => {
    io.disconnect();
    mo.disconnect();
    if (pendente) window.clearTimeout(pendente);
  };
}

function observarLeituraBlog(pathname: string): () => void {
  const slug = SLUG_BLOG_RE.exec(pathname)?.[1];
  if (!slug) return () => {};
  let lido = false;
  let agendado = false;
  const disparar = (gatilho: "scroll_75" | "time_45s") => {
    if (lido) return;
    lido = true;
    trackEvent("blog_read", { article_slug: decodeURIComponent(slug).slice(0, 80), read_trigger: gatilho });
    limpar();
  };
  const medir = () => {
    agendado = false;
    const artigo = document.querySelector("[data-article]");
    if (artigo && progressoArtigo(artigo) >= BLOG_LIMIAR) disparar("scroll_75");
  };
  const onScroll = () => {
    if (agendado || lido) return;
    agendado = true;
    requestAnimationFrame(medir);
  };
  const timer = window.setTimeout(() => disparar("time_45s"), BLOG_TEMPO_MS);
  window.addEventListener("scroll", onScroll, { passive: true });
  function limpar() {
    window.clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
  }
  return limpar;
}

function registrarPageView(pathname: string): () => void {
  const urlAtual = window.location.href;
  if (ultimoPath === null) {
    // 1ª página: o page_view sai pela Google tag do GTM (com gclid na URL)
    ultimoPath = pathname;
    ultimaUrl = urlAtual;
    return () => {};
  }
  if (ultimoPath === pathname) return () => {};
  const anterior = ultimaUrl;
  ultimoPath = pathname;
  ultimaUrl = urlAtual;
  const t = window.setTimeout(() => {
    trackEvent("virtual_page_view", {
      page_location: window.location.href.split("#")[0],
      page_referrer: anterior,
    });
  }, ATRASO_PAGE_VIEW_MS);
  return () => window.clearTimeout(t);
}

/**
 * Listener delegado de eventos (cliques, scroll, seções, blog, formulários,
 * page_view virtual). Não renderiza nada. Coloque dentro de <Suspense>.
 */
export function TrackingEvents() {
  const pathname = usePathname();

  useEffect(() => {
    document.addEventListener("click", onClick, { capture: true, passive: true });
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  useEffect(() => {
    formsIniciados.clear();
    const limpezas = [registrarPageView(pathname), observarScroll(), observarSecoes(), observarLeituraBlog(pathname)];
    return () => limpezas.forEach((fn) => fn());
  }, [pathname]);

  return null;
}

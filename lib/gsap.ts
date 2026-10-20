"use client";

import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextType } from "gsap/SplitText";

/**
 * GSAP sob demanda: um único import dinâmico compartilhado por todas as animações,
 * fora do bundle inicial (não pesa no LCP). Plugins registrados uma vez.
 */
export interface Gsap {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  SplitText: typeof SplitTextType;
}

let promessa: Promise<Gsap> | null = null;

const OCIOSO_MS = 2500;

/**
 * Só baixa o GSAP depois da primeira interação (scroll, toque, tecla, mouse) ou quando o
 * navegador fica ocioso após o load — o que vier antes. Assim a thread principal fica livre
 * para pintar o hero (LCP) e as animações estão prontas antes de o usuário chegar nelas.
 */
function quandoOportuno(): Promise<void> {
  return new Promise((resolve) => {
    const eventos = ["scroll", "pointerdown", "pointermove", "keydown", "touchstart", "wheel"] as const;
    let feito = false;
    const pronto = () => {
      if (feito) return;
      feito = true;
      eventos.forEach((e) => window.removeEventListener(e, pronto));
      resolve();
    };
    eventos.forEach((e) => window.addEventListener(e, pronto, { once: true, passive: true }));
    const aposLoad = () => {
      const ocioso = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, OCIOSO_MS));
      window.setTimeout(() => ocioso(pronto, { timeout: OCIOSO_MS }), OCIOSO_MS);
    };
    if (document.readyState === "complete") aposLoad();
    else window.addEventListener("load", aposLoad, { once: true });
  });
}

export function carregarGsap(): Promise<Gsap> {
  if (!promessa) {
    promessa = quandoOportuno()
      .then(() => Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]))
      .then(
      ([g, st, sp]) => {
        const gsap = g.gsap;
        gsap.registerPlugin(st.ScrollTrigger, sp.SplitText);
        gsap.defaults({ ease: "expo.out" });
        return { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText };
      },
    );
  }
  return promessa;
}

export function prefereMenosMovimento(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** true se o elemento já está visível no carregamento — nesse caso não escondemos nada (evita "pisca"). */
export function jaVisivel(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.92 && r.bottom > 0;
}

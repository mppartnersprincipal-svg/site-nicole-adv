"use client";

import { useEffect } from "react";

/**
 * Lenis carregado sob demanda, após o idle do navegador, para não pesar no LCP/INP.
 * Desligado em touch (scroll nativo é melhor no mobile) e com prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduz || touch) return;

    let destruir: (() => void) | undefined;
    let rafId = 0;
    let cancelado = false;

    const iniciar = async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelado) return;
      const lenis = new Lenis({ duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 4), anchors: true });
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      destruir = () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    };

    const temIdle = typeof window.requestIdleCallback === "function";
    const idle = temIdle ? window.requestIdleCallback(() => void iniciar()) : window.setTimeout(() => void iniciar(), 1200);
    return () => {
      cancelado = true;
      if (temIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      destruir?.();
    };
  }, []);

  return null;
}

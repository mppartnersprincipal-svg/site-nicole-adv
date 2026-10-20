"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { carregarGsap, prefereMenosMovimento } from "@/lib/gsap";

interface SequenciaFixadaProps {
  children: ReactNode;
  className?: string;
}

/**
 * Seção fixada (pin) no desktop: as etapas [data-etapa] acendem uma a uma enquanto a
 * barra [data-progresso] se preenche, guiadas pelo scroll. No mobile vira entrada simples.
 */
export function SequenciaFixada({ children, className }: SequenciaFixadaProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = ref.current;
    if (!raiz || prefereMenosMovimento()) return;
    let desfazer: (() => void) | undefined;
    let cancelado = false;

    carregarGsap().then(({ gsap }) => {
      if (cancelado) return;
      const mm = gsap.matchMedia();
      const etapas = raiz.querySelectorAll<HTMLElement>("[data-etapa]");
      const progresso = raiz.querySelector<HTMLElement>("[data-progresso]");

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: raiz, start: "top top", end: `+=${etapas.length * 55}%`, pin: true, scrub: 0.8, anticipatePin: 1 },
        });
        if (progresso) tl.fromTo(progresso, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: etapas.length }, 0);
        etapas.forEach((etapa, i) => {
          tl.fromTo(
            etapa,
            { opacity: 0.18, y: 60 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
            i * 0.9,
          );
          const numero = etapa.querySelector("[data-etapa-numero]");
          if (numero) tl.fromTo(numero, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, i * 0.9);
        });
      });

      mm.add("(max-width: 1023px)", () => {
        etapas.forEach((etapa) =>
          gsap.from(etapa, { opacity: 0, x: -30, duration: 1, ease: "power3.out", scrollTrigger: { trigger: etapa, start: "top 88%", once: true } }),
        );
        if (progresso) gsap.set(progresso, { scaleX: 1 });
      });

      desfazer = () => mm.revert();
    });

    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

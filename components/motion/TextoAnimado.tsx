"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { carregarGsap, jaVisivel, prefereMenosMovimento, type Gsap } from "@/lib/gsap";

/** Efeitos de headline — cada seção usa um diferente para dar ritmo ao scroll. */
export type EfeitoTitulo =
  | "mascara" // linhas sobem de dentro de uma máscara
  | "letras" // letras giram em 3D a partir da base
  | "desfoque" // palavras saem do desfoque
  | "inclinado" // linhas sobem inclinadas e se endireitam
  | "lateral" // linhas deslizam da esquerda por trás da máscara
  | "escala" // palavras crescem com leve elástico
  | "palavras" // palavras sobem uma a uma
  | "cortina" // varredura de clip-path da esquerda para a direita
  | "dispersao"; // letras se reúnem vindas de posições aleatórias

/** Efeitos para subheadlines e textos de apoio. */
export type EfeitoTexto = "linhas" | "desfoque" | "lateral" | "subir";

type Efeito = EfeitoTitulo | EfeitoTexto;

interface TextoAnimadoProps {
  as?: ElementType;
  efeito: Efeito;
  children: ReactNode;
  className?: string;
  id?: string;
  atraso?: number;
}

type SplitVars = { type: string; mask?: "lines" | "words" | "chars" };

/** Config de split + tween de cada efeito. */
function receita(efeito: Efeito, g: Gsap["gsap"]): { split: SplitVars | null; alvo: "lines" | "words" | "chars" | "el"; vars: gsap.TweenVars } {
  switch (efeito) {
    case "mascara":
      return { split: { type: "lines", mask: "lines" }, alvo: "lines", vars: { yPercent: 110, duration: 1.15, stagger: 0.12 } };
    case "letras":
      return {
        split: { type: "words,chars" },
        alvo: "chars",
        vars: { opacity: 0, rotateX: -95, yPercent: 40, transformOrigin: "50% 100%", duration: 0.9, stagger: 0.018, ease: "back.out(1.7)" },
      };
    case "desfoque":
      return { split: { type: "words" }, alvo: "words", vars: { opacity: 0, filter: "blur(14px)", y: 14, duration: 1.1, stagger: 0.06, ease: "power3.out" } };
    case "inclinado":
      return { split: { type: "lines", mask: "lines" }, alvo: "lines", vars: { yPercent: 125, skewY: 8, transformOrigin: "0% 100%", duration: 1.2, stagger: 0.1 } };
    case "lateral":
      return { split: { type: "lines", mask: "lines" }, alvo: "lines", vars: { xPercent: -104, duration: 1.2, stagger: 0.12, ease: "expo.inOut" } };
    case "escala":
      return { split: { type: "words" }, alvo: "words", vars: { opacity: 0, scale: 0.55, y: 18, duration: 0.9, stagger: 0.05, ease: "back.out(1.8)" } };
    case "palavras":
      return { split: { type: "words", mask: "words" }, alvo: "words", vars: { yPercent: 105, duration: 0.95, stagger: 0.045, ease: "power4.out" } };
    case "cortina":
      return { split: null, alvo: "el", vars: { clipPath: "inset(0% 100% 0% 0%)", duration: 1.5, ease: "expo.inOut" } };
    case "dispersao":
      return {
        split: { type: "words,chars" },
        alvo: "chars",
        vars: {
          opacity: 0,
          x: () => g.utils.random(-60, 60),
          y: () => g.utils.random(-40, 40),
          rotate: () => g.utils.random(-25, 25),
          duration: 1.1,
          stagger: { each: 0.012, from: "random" },
          ease: "power3.out",
        },
      };
    case "linhas":
      return { split: { type: "lines" }, alvo: "lines", vars: { opacity: 0, y: 22, duration: 1, stagger: 0.1, ease: "power3.out" } };
    default: // "subir"
      return { split: null, alvo: "el", vars: { opacity: 0, y: 26, duration: 1, ease: "power3.out" } };
  }
}

/**
 * Anima um texto ao entrar na viewport (GSAP SplitText + ScrollTrigger).
 * Não esconde nada no SSR: textos já visíveis no carregamento não animam.
 */
export function TextoAnimado({ as: Tag = "div", efeito, children, className, id, atraso = 0 }: TextoAnimadoProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefereMenosMovimento() || jaVisivel(el)) return;
    let desfazer: (() => void) | undefined;
    let cancelado = false;

    carregarGsap().then(({ gsap, SplitText }) => {
      // O GSAP chega após a 1ª interação: se o texto já entrou na tela nesse meio-tempo, não anima (evita "pisca")
      if (cancelado || jaVisivel(el)) return;
      // Efeito "lateral" de texto de apoio é diferente do de título
      const ehTextoLateral = efeito === "lateral" && Tag === "p";
      const r = ehTextoLateral
        ? { split: { type: "lines" } as SplitVars, alvo: "lines" as const, vars: { opacity: 0, x: -28, duration: 1, stagger: 0.08, ease: "power3.out" } }
        : efeito === "desfoque" && Tag === "p"
          ? { split: { type: "lines" } as SplitVars, alvo: "lines" as const, vars: { opacity: 0, filter: "blur(8px)", duration: 1.1, stagger: 0.08, ease: "power2.out" } }
          : receita(efeito, gsap);
      const gatilho = { trigger: el, start: "top 86%", once: true };

      if (efeito === "letras") el.style.perspective = "600px";

      if (!r.split) {
        const tween = gsap.from(el, { ...r.vars, delay: atraso, scrollTrigger: gatilho });
        desfazer = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(el, { clearProps: "all" });
        };
        return;
      }

      const split = SplitText.create(el, {
        ...r.split,
        // aria-label só é válido em headings; em <p>/<div> as palavras divididas seguem legíveis sem ele
        aria: typeof Tag === "string" && /^h[1-6]$/.test(Tag) ? "auto" : "none",
        autoSplit: true,
        onSplit(self) {
          const alvos = r.alvo === "lines" ? self.lines : r.alvo === "words" ? self.words : self.chars;
          return gsap.from(alvos, { ...r.vars, delay: atraso, scrollTrigger: gatilho });
        },
      });
      desfazer = () => split.revert();
    });

    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, [efeito, atraso, Tag]);

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}

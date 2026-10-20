"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { carregarGsap, prefereMenosMovimento, type Gsap } from "@/lib/gsap";

/**
 * Escopo de animações GSAP guiadas por atributos nos filhos (o HTML continua server-side):
 *
 *  data-parallax="0.2"        desloca yPercent conforme o scroll (negativo = sobe mais rápido)
 *  data-parallax-escala="1.15" zoom-out suave da imagem enquanto a seção passa
 *  data-revelar               imagem revelada por clip-path de baixo para cima (em lote)
 *  data-scrub-texto           palavras acendem de 15% a 100% de opacidade com o scroll
 *  data-girar="30"            rotação contínua leve com o scroll
 */

interface CenaGsapProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}

function montar({ gsap, ScrollTrigger, SplitText }: Gsap, raiz: HTMLElement): () => void {
  const ctx = gsap.context(() => {
    raiz.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
      const vel = Number(el.dataset.parallax) || 0.15;
      gsap.fromTo(
        el,
        { yPercent: -vel * 50 },
        {
          yPercent: vel * 50,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });

    raiz.querySelectorAll<HTMLElement>("[data-parallax-escala]").forEach((el) => {
      const escala = Number(el.dataset.parallaxEscala) || 1.15;
      gsap.fromTo(
        el,
        { scale: escala },
        { scale: 1, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });

    raiz.querySelectorAll<HTMLElement>("[data-girar]").forEach((el) => {
      gsap.to(el, {
        rotate: Number(el.dataset.girar) || 20,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    const imagens = raiz.querySelectorAll<HTMLElement>("[data-revelar]");
    if (imagens.length) {
      gsap.set(imagens, { clipPath: "inset(100% 0% 0% 0%)" });
      ScrollTrigger.batch(Array.from(imagens), {
        start: "top 90%",
        once: true,
        onEnter: (lote) =>
          gsap.to(lote, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, stagger: 0.12, ease: "expo.inOut", overwrite: true }),
      });
    }

    // O texto só é "apagado" quando chega à borda da tela — antes disso fica com contraste total
    // (legível sem JS, para leitores e para auditorias de contraste).
    raiz.querySelectorAll<HTMLElement>("[data-scrub-texto]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        once: true,
        onEnter: () => {
          SplitText.create(el, {
            type: "words",
            aria: "none",
            autoSplit: true,
            onSplit: (self) =>
              gsap.fromTo(
                self.words,
                { opacity: 0.2 },
                {
                  opacity: 1,
                  stagger: 0.08,
                  ease: "none",
                  scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 45%", scrub: 0.6 },
                },
              ),
          });
        },
      });
    });
  }, raiz);
  return () => ctx.revert();
}

export function CenaGsap({ children, className, as: Tag = "div" }: CenaGsapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = ref.current;
    if (!raiz || prefereMenosMovimento()) return;
    let desfazer: (() => void) | undefined;
    let cancelado = false;
    carregarGsap().then((g) => {
      if (!cancelado) desfazer = montar(g, raiz);
    });
    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

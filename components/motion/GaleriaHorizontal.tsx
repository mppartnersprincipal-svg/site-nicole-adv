"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { FotoSite } from "@/lib/foto";
import { carregarGsap, prefereMenosMovimento } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface GaleriaHorizontalProps {
  fotos: FotoSite[];
  titulo: string;
  eyebrow: string;
}

/** Larguras alternadas dão ritmo editorial ao trilho (larga, estreita, média...). */
const FORMATOS = ["aspect-[4/3] w-[78vw] md:w-[38vw]", "aspect-[3/4] w-[58vw] md:w-[22vw]", "aspect-[16/10] w-[82vw] md:w-[44vw]", "aspect-square w-[66vw] md:w-[28vw]"];

/**
 * Desktop: a seção fica fixada e o trilho de fotos corre na horizontal com o scroll vertical,
 * cada foto com parallax interno. Mobile: swipe nativo com scroll-snap + zoom suave por foto.
 */
export function GaleriaHorizontal({ fotos, titulo, eyebrow }: GaleriaHorizontalProps) {
  const secao = useRef<HTMLElement>(null);
  const trilho = useRef<HTMLUListElement>(null);
  const contador = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const s = secao.current;
    const t = trilho.current;
    if (!s || !t || prefereMenosMovimento()) return;
    let desfazer: (() => void) | undefined;
    let cancelado = false;

    carregarGsap().then(({ gsap }) => {
      if (cancelado) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const distancia = () => t.scrollWidth - window.innerWidth + 64;
        const tween = gsap.to(t, {
          x: () => -distancia(),
          ease: "none",
          scrollTrigger: {
            trigger: s,
            start: "top top",
            end: () => `+=${distancia()}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (contador.current) contador.current.textContent = String(Math.max(1, Math.ceil(self.progress * fotos.length))).padStart(2, "0");
            },
          },
        });
        t.querySelectorAll<HTMLElement>("[data-foto-interna]").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -12 },
            { xPercent: 12, ease: "none", scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
          );
        });
      });
      mm.add("(max-width: 767px)", () => {
        t.querySelectorAll<HTMLElement>("[data-foto-interna]").forEach((img) =>
          gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: img, start: "top 90%", once: true } }),
        );
      });
      desfazer = () => mm.revert();
    });

    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, [fotos.length]);

  return (
    <section ref={secao} aria-labelledby="galeria-titulo" data-section="home-galeria" className="relative overflow-hidden bg-bordo-950 py-16 text-marfim md:flex md:h-[100svh] md:flex-col md:justify-center md:py-0">
      <div className="container-site mb-10 flex items-end justify-between gap-6 md:mb-12">
        <div>
          <p className="eyebrow mb-4 text-champanhe-400">{eyebrow}</p>
          <h2 id="galeria-titulo" className="text-h2 text-marfim">
            {titulo}
          </h2>
        </div>
        <p className="hidden font-display text-[1.25rem] text-champanhe-400 md:block" aria-hidden="true">
          <span ref={contador}>01</span> <span className="text-marfim/40">/ {String(fotos.length).padStart(2, "0")}</span>
        </p>
      </div>
      <ul
        ref={trilho}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:snap-none md:gap-6 md:overflow-visible md:px-8 md:will-change-transform [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((f, i) => (
          <li key={f.src} className={cn("relative shrink-0 snap-start overflow-hidden bg-bordo-900", FORMATOS[i % FORMATOS.length])}>
            <div data-foto-interna className="absolute -inset-x-[14%] inset-y-0">
              <Image
                src={f.src}
                alt={f.alt}
                fill
                sizes="(min-width: 768px) 44vw, 82vw"
                placeholder={f.blurDataURL ? "blur" : "empty"}
                blurDataURL={f.blurDataURL}
                className="object-cover"
              />
            </div>
            <span className="absolute bottom-3 left-4 font-display text-[0.95rem] text-marfim/80 drop-shadow">{String(i + 1).padStart(2, "0")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

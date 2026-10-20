"use client";

import { useEffect, useRef, useState } from "react";
import { IconeWhatsApp } from "@/components/icons/Icones";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

interface BarraCtaMobileProps {
  mensagem: string;
  /** id do formulário-alvo na página. */
  ancoraFormulario: string;
}

/**
 * Barra fixa no mobile (padrão de landing page de Ads): aparece depois que o hero sai da tela
 * e some quando o formulário está visível, para não competir com ele.
 */
export function BarraCtaMobile({ mensagem, ancoraFormulario }: BarraCtaMobileProps) {
  const [visivel, setVisivel] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    const form = document.getElementById(ancoraFormulario);
    let heroFora = false;
    let formVisivel = false;
    const atualizar = () => setVisivel(heroFora && !formVisivel);
    const obs = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.target === hero) heroFora = !e.isIntersecting;
        if (e.target === form) formVisivel = e.isIntersecting;
      }
      atualizar();
    });
    if (hero) obs.observe(hero);
    if (form) obs.observe(form);
    return () => obs.disconnect();
  }, [ancoraFormulario]);

  useEffect(() => {
    const raiz = document.documentElement;
    const altura = visivel && ref.current ? ref.current.offsetHeight : 0;
    raiz.style.setProperty("--cta-bar-h", `${altura}px`);
    return () => {
      raiz.style.removeProperty("--cta-bar-h");
    };
  }, [visivel]);

  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-[var(--consent-h,0px)] z-40 grid grid-cols-2 gap-2 border-t border-pedra bg-marfim/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-[transform,opacity] duration-500 ease-elegante md:hidden",
        visivel ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
      aria-hidden={!visivel}
      inert={!visivel}
    >
      <a
        href={`#${ancoraFormulario}`}
        className="flex min-h-12 items-center justify-center rounded-full border border-bordo-700/30 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-bordo-700"
        data-track="click_cta"
        data-track-label="Barra mobile: formulário"
        data-track-location="barra-mobile"
      >
        Analisar meu caso
      </a>
      <a
        href={`https://wa.me/${SITE.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp text-[0.75rem] font-medium uppercase tracking-[0.14em] text-white"
        data-track-location="barra-mobile"
      >
        <IconeWhatsApp className="size-4" />
        WhatsApp
      </a>
    </div>
  );
}

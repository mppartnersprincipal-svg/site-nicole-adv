"use client";

import { useEffect, useState } from "react";
import { IconeWhatsApp } from "@/components/icons/Icones";
import { MENSAGEM_WHATSAPP_PADRAO, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const APARECE_APOS_PX = 420;

interface WhatsAppFloatProps {
  mensagem?: string;
}

/** Botão flutuante: aparece após o primeiro scroll para não competir com o CTA do hero. */
export function WhatsAppFloat({ mensagem = MENSAGEM_WHATSAPP_PADRAO }: WhatsAppFloatProps) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > APARECE_APOS_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={`https://wa.me/${SITE.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      data-track-location="floating"
      aria-hidden={!visivel}
      tabIndex={visivel ? undefined : -1}
      className={cn(
        "group fixed right-4 z-40 flex items-center gap-3 rounded-full bg-whatsapp text-white shadow-[0_18px_40px_-14px_rgba(31,122,77,0.7)] transition-[opacity,transform] duration-500 ease-elegante md:right-6",
        "bottom-[calc(1rem+var(--consent-h,0px)+var(--cta-bar-h,0px))] md:bottom-[calc(1.5rem+var(--consent-h,0px))]",
        visivel ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <span className="flex size-14 items-center justify-center">
        <IconeWhatsApp className="size-7" />
      </span>
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap pr-0 text-[0.8125rem] font-medium uppercase tracking-[0.14em] transition-[max-width,padding] duration-500 ease-elegante group-hover:max-w-56 group-hover:pr-5 md:inline">
        Fale com a Nicoli
      </span>
    </a>
  );
}

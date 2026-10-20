"use client";

import { useRef } from "react";
import { IconeEstrela, IconeSeta } from "@/components/icons/Icones";
import type { Avaliacao } from "@/lib/types";

interface AvaliacoesProps {
  avaliacoes: Avaliacao[];
  googleUrl: string;
}

/** Carrossel nativo com scroll-snap; botões só complementam o swipe/scroll. */
export function Avaliacoes({ avaliacoes, googleUrl }: AvaliacoesProps) {
  const trilho = useRef<HTMLUListElement>(null);

  const mover = (direcao: 1 | -1) => {
    const el = trilho.current;
    if (!el) return;
    const item = el.firstElementChild as HTMLElement | null;
    const passo = (item?.offsetWidth ?? 320) + 20;
    el.scrollBy({ left: passo * direcao, behavior: "smooth" });
  };

  return (
    <div>
      <ul ref={trilho} className="trilho-snap pb-2" aria-label="Avaliações de clientes no Google">
        {avaliacoes.map((a, i) => (
          <li key={`${a.autor}-${i}`} className="flex flex-col border border-pedra bg-marfim p-8">
            <div className="flex gap-1 text-champanhe-500" aria-label={`Nota ${a.nota} de 5`} role="img">
              {Array.from({ length: a.nota }).map((_, s) => (
                <IconeEstrela key={s} className="size-4" />
              ))}
            </div>
            <blockquote className="mt-6 flex-1 font-display text-[1.3rem] leading-[1.5] text-grafite">“{a.texto}”</blockquote>
            <p className="mt-8 border-t border-pedra pt-5 text-[0.875rem]">
              <span className="block text-grafite">{a.autor}</span>
              <span className="text-cinza">Google · {a.quando}</span>
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex items-center justify-between gap-6">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.85rem] text-bordo-700 underline underline-offset-4"
          data-track="click_reviews"
        >
          Ver todas as avaliações no Google
        </a>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label="Avaliação anterior"
            className="flex size-12 items-center justify-center border border-bordo-700/30 text-bordo-700 transition-colors hover:bg-bordo-700 hover:text-marfim"
          >
            <IconeSeta className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label="Próxima avaliação"
            className="flex size-12 items-center justify-center border border-bordo-700/30 text-bordo-700 transition-colors hover:bg-bordo-700 hover:text-marfim"
          >
            <IconeSeta className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

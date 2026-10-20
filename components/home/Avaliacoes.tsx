"use client";

import { useRef } from "react";
import { IconeEstrela, IconeSeta } from "@/components/icons/Icones";
import type { Avaliacao } from "@/lib/types";

interface AvaliacoesProps {
  avaliacoes: Avaliacao[];
  googleUrl: string;
  resumo: { nota: number; total: number };
}

const NOTA_MAXIMA = 5;

function Estrelas({ nota, className }: { nota: number; className: string }) {
  return (
    <span className="flex gap-1 text-champanhe-500" aria-label={`Nota ${nota.toLocaleString("pt-BR")} de 5`} role="img">
      {Array.from({ length: NOTA_MAXIMA }).map((_, s) => (
        <IconeEstrela key={s} className={`${className} ${s < Math.round(nota) ? "" : "opacity-25"}`} />
      ))}
    </span>
  );
}

/** Carrossel nativo com scroll-snap; botões só complementam o swipe/scroll. */
export function Avaliacoes({ avaliacoes, googleUrl, resumo }: AvaliacoesProps) {
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
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-track="click_reviews"
        className="group/resumo mb-10 inline-flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-pedra py-5"
      >
        <span className="font-display text-[3.2rem] leading-none text-bordo-700">
          {resumo.nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
        </span>
        <span>
          <Estrelas nota={resumo.nota} className="size-5" />
          <span className="mt-2 block text-[0.85rem] text-cinza transition-colors group-hover/resumo:text-bordo-700">
            {resumo.total.toLocaleString("pt-BR")} avaliações no Google
          </span>
        </span>
      </a>
      <ul ref={trilho} className="trilho-snap pb-2" aria-label="Avaliações de clientes no Google">
        {avaliacoes.map((a) => (
          <li key={a.autor} className="flex flex-col border border-pedra bg-marfim p-8">
            <Estrelas nota={a.nota} className="size-4" />
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

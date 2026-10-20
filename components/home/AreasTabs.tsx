"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AreaIcon } from "@/components/icons/AreaIcon";
import { IconeSeta } from "@/components/icons/Icones";
import { cn } from "@/lib/utils";

export interface AreaResumo {
  slug: string;
  nome: string;
  icone: string;
  descricao: string;
}

interface Grupo {
  id: string;
  titulo: string;
  texto: string;
  areas: AreaResumo[];
}

const SPAN_LG: Record<number, string> = { 1: "lg:col-span-1", 2: "lg:col-span-2" };
const SPAN_SM: Record<number, string> = { 0: "sm:col-span-2", 1: "sm:col-span-1" };

interface AreasTabsProps {
  grupos: [Grupo, Grupo];
}

/**
 * Abas acessíveis (padrão WAI-ARIA: setas, Home/End). Os dois painéis ficam no HTML
 * (o inativo com `hidden`), então todos os links continuam rastreáveis pelos buscadores.
 */
export function AreasTabs({ grupos }: AreasTabsProps) {
  const uid = useId();
  const [ativa, setAtiva] = useState(0);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const mapa: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let prox: number | null = null;
    if (e.key in mapa) prox = (ativa + mapa[e.key] + grupos.length) % grupos.length;
    if (e.key === "Home") prox = 0;
    if (e.key === "End") prox = grupos.length - 1;
    if (prox === null) return;
    e.preventDefault();
    setAtiva(prox);
    tabsRef.current[prox]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Públicos atendidos" className="grid grid-cols-2 border-b border-pedra">
        {grupos.map((g, i) => (
          <button
            key={g.id}
            ref={(el) => {
              tabsRef.current[i] = el;
            }}
            id={`${uid}-tab-${g.id}`}
            role="tab"
            type="button"
            aria-selected={ativa === i}
            aria-controls={`${uid}-painel-${g.id}`}
            tabIndex={ativa === i ? 0 : -1}
            onClick={() => setAtiva(i)}
            onKeyDown={onKey}
            className={cn(
              "relative pb-5 text-left font-display text-[1.35rem] leading-tight transition-colors duration-300 sm:text-[1.9rem]",
              ativa === i ? "text-bordo-700" : "text-cinza hover:text-grafite",
            )}
          >
            {g.titulo}
            <span
              aria-hidden="true"
              className={cn(
                "absolute -bottom-px left-0 h-0.5 w-full origin-left bg-bordo-700 transition-transform duration-500 ease-elegante",
                ativa === i ? "scale-x-100" : "scale-x-0",
              )}
            />
          </button>
        ))}
      </div>

      {grupos.map((g, i) => (
        <div
          key={g.id}
          id={`${uid}-painel-${g.id}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${g.id}`}
          hidden={ativa !== i}
          className="pt-8"
        >
          <p className="max-w-2xl text-cinza">{g.texto}</p>
          <ul className="mt-10 grid gap-px border border-pedra bg-pedra sm:grid-cols-2 lg:grid-cols-3">
            {g.areas.map((a, idx) => (
              <li key={a.slug} className="painel-item bg-marfim" style={{ animationDelay: `${idx * 60}ms` }}>
                <Link
                  href={`/areas-de-atuacao/${a.slug}`}
                  className="group/card relative flex h-full flex-col gap-5 overflow-hidden p-7 transition-colors duration-500 hover:bg-bordo-700 md:p-8"
                  data-track="click_area"
                  data-track-label={a.slug}
                  data-track-location="home-areas"
                >
                  <div className="flex items-start justify-between">
                    <AreaIcon nome={a.icone} className="size-10 text-bordo-700 transition-colors duration-500 group-hover/card:text-champanhe-400" />
                    <IconeSeta className="size-4 -translate-x-2 text-marfim opacity-0 transition-[opacity,transform] duration-500 ease-elegante group-hover/card:translate-x-0 group-hover/card:opacity-100" />
                  </div>
                  <h3 className="text-[1.55rem] leading-tight text-bordo-700 transition-colors duration-500 group-hover/card:text-marfim">
                    {a.nome}
                  </h3>
                  <p className="line-clamp-3 text-[0.92rem] text-cinza transition-colors duration-500 group-hover/card:text-marfim/75">
                    {a.descricao}
                  </p>
                </Link>
              </li>
            ))}
            {g.areas.length % 3 !== 0 && (
              <li className={cn("painel-item grao bg-bordo-700", SPAN_LG[3 - (g.areas.length % 3)], SPAN_SM[g.areas.length % 2])}>
                <Link
                  href="/contato#formulario"
                  className="group/cta flex h-full flex-col justify-between gap-8 p-7 text-marfim md:p-8"
                  data-track="click_cta"
                  data-track-label="Não sabe qual área"
                  data-track-location="home-areas"
                >
                  <p className="font-display text-[1.75rem] leading-tight">Não sabe qual área cuida do seu caso?</p>
                  <span className="inline-flex items-center gap-3 text-[0.78rem] font-medium uppercase tracking-[0.16em] text-champanhe-400">
                    Fale com o nosso time
                    <IconeSeta className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}

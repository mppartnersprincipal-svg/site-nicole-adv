import Link from "next/link";
import { AreaIcon } from "@/components/icons/AreaIcon";
import { IconeSeta } from "@/components/icons/Icones";
import { Reveal } from "@/components/ui/Reveal";
import { rotaArea } from "@/lib/nav";
import type { AreaAtuacao } from "@/lib/types";

interface ListaAreasProps {
  areas: AreaAtuacao[];
  /** Número inicial da contagem (para continuar entre grupos). */
  inicio?: number;
  nivelTitulo?: "h2" | "h3";
}

/**
 * Lista editorial de áreas: linhas numeradas com cortina bordô que sobe no hover.
 * Lê bem no mobile (alvo de toque amplo) e evita a "grade de cards" genérica.
 */
export function ListaAreas({ areas, inicio = 1, nivelTitulo = "h3" }: ListaAreasProps) {
  const Titulo = nivelTitulo;
  return (
    <ul className="border-t border-pedra">
      {areas.map((a, i) => (
        <Reveal as="li" key={a.slug} delay={i * 50} className="border-b border-pedra">
          <Link
            href={rotaArea(a.slug)}
            className="group/area relative grid grid-cols-[auto_1fr_auto] items-center gap-5 overflow-hidden py-7 sm:gap-8 md:grid-cols-[4rem_auto_1fr_auto] md:py-8"
            data-track="click_area"
            data-track-label={a.slug}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-0 origin-bottom scale-y-0 bg-bordo-700 transition-transform duration-500 ease-elegante group-hover/area:scale-y-100"
            />
            <span className="relative hidden font-display text-[1rem] text-champanhe-700 transition-colors duration-500 group-hover/area:text-champanhe-400 md:block md:pl-4">
              {String(inicio + i).padStart(2, "0")}
            </span>
            <AreaIcon
              nome={a.icone}
              className="relative size-9 text-bordo-700 transition-colors duration-500 group-hover/area:text-champanhe-400 md:size-10"
            />
            <span className="relative">
              <Titulo className="text-[1.5rem] leading-tight text-bordo-700 transition-colors duration-500 group-hover/area:text-marfim md:text-[2rem]">
                {a.nome}
              </Titulo>
              <span className="mt-1.5 line-clamp-2 block max-w-2xl text-[0.92rem] text-cinza transition-colors duration-500 group-hover/area:text-marfim/75">
                {a.hero.subtitulo}
              </span>
            </span>
            <span className="relative flex size-11 items-center justify-center border border-bordo-700/25 text-bordo-700 transition-[color,border-color,transform] duration-500 ease-elegante group-hover/area:translate-x-0 group-hover/area:border-marfim/40 group-hover/area:text-marfim md:mr-4">
              <IconeSeta className="size-4" />
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

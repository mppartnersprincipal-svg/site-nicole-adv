import Image from "next/image";
import { CenaGsap } from "@/components/motion/CenaGsap";
import type { FotoSite } from "@/lib/foto";

interface FotoLateralProps {
  foto: FotoSite;
}

/**
 * Foto do hero em páginas com formulário (áreas, contato). Um único <img>, reposicionado por CSS:
 *  - mobile: faixa emoldurada no fluxo (entre os CTAs e o formulário);
 *  - desktop: painel à direita, atrás do formulário, com véu areia para manter a leitura.
 * Requer: <section className="relative">, container "relative lg:static" e formulário com z-10.
 */
export function FotoLateral({ foto }: FotoLateralProps) {
  return (
    <CenaGsap className="relative order-2 lg:absolute lg:bottom-0 lg:right-0 lg:top-[var(--header-h)] lg:order-none lg:w-[46%]">
      <span aria-hidden="true" className="absolute -left-2.5 -top-2.5 z-10 size-10 border-l-[3px] border-t-[3px] border-bordo-700 lg:hidden" />
      <span aria-hidden="true" className="absolute -bottom-2.5 -right-2.5 z-10 size-10 border-b-[3px] border-r-[3px] border-bordo-700 lg:hidden" />
      <div className="relative aspect-[16/10] overflow-hidden bg-bordo-700 lg:aspect-auto lg:h-full">
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          placeholder={foto.blurDataURL ? "blur" : "empty"}
          blurDataURL={foto.blurDataURL}
          className="object-cover"
          data-parallax-escala="1.1"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden lg:block lg:bg-[linear-gradient(90deg,var(--cor-areia)_0%,rgba(242,236,227,0.6)_22%,rgba(242,236,227,0.08)_60%),linear-gradient(to_top,rgba(242,236,227,0.85)_0%,rgba(242,236,227,0)_35%)]"
        />
      </div>
    </CenaGsap>
  );
}

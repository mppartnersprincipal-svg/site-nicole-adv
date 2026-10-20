import Image from "next/image";
import { CenaGsap } from "@/components/motion/CenaGsap";
import type { FotoSite } from "@/lib/foto";
import { cn } from "@/lib/utils";

interface FotoHeroProps {
  foto: FotoSite;
  /** Proporção do quadro: retrato (padrão) ou paisagem. */
  formato?: "retrato" | "paisagem";
  sizes?: string;
  className?: string;
  legenda?: string;
}

const FORMATO = {
  retrato: "aspect-[16/10] lg:aspect-[4/5]",
  paisagem: "aspect-[16/10]",
} as const;

/**
 * Foto do hero das páginas internas: moldura aberta da marca, carregamento prioritário
 * (pode ser o LCP) e leve zoom-out com o scroll via GSAP.
 */
export function FotoHero({ foto, formato = "retrato", sizes = "(min-width: 1024px) 38vw, 100vw", className, legenda }: FotoHeroProps) {
  return (
    <CenaGsap className={cn("moldura p-2.5 [--moldura-cor:var(--cor-bordo-700)] sm:p-3", className)}>
      <div className={cn("relative overflow-hidden bg-bordo-700", FORMATO[formato])}>
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          priority
          sizes={sizes}
          placeholder={foto.blurDataURL ? "blur" : "empty"}
          blurDataURL={foto.blurDataURL}
          className="object-cover"
          data-parallax-escala="1.12"
        />
      </div>
      {legenda && <p className="mt-3 font-display text-[1.05rem] italic text-cinza">{legenda}</p>}
    </CenaGsap>
  );
}

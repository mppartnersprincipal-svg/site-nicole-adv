import Image from "next/image";
import Link from "next/link";
import { IconeSetaDiagonal } from "@/components/icons/Icones";
import { EQUIPE_FOTOS } from "@/lib/images";
import type { MembroEquipe } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MembroCardProps {
  membro: MembroEquipe;
  tamanho?: "grande" | "medio";
  className?: string;
}

/** Retrato 4:5 com fundo bordô padronizado; revela a bio curta no hover (desktop). */
export function MembroCard({ membro, tamanho = "medio", className }: MembroCardProps) {
  const foto = EQUIPE_FOTOS[membro.slug];
  return (
    <Link
      href={`/quem-somos/${membro.slug}`}
      className={cn("group/membro block focus-visible:outline-offset-4", className)}
      data-track="click_membro"
      data-track-label={membro.nome}
    >
      <div data-revelar className="relative aspect-[4/5] overflow-hidden bg-bordo-700">
        {foto && (
          <Image
            src={foto.src}
            alt={`${membro.nome}, ${membro.cargo} da Nicoli Sociedade de Advogados`}
            fill
            sizes={tamanho === "grande" ? "(min-width: 1024px) 40vw, 90vw" : "(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"}
            placeholder={foto.blurDataURL ? "blur" : "empty"}
            blurDataURL={foto.blurDataURL}
            className="object-cover transition-transform duration-[1.2s] ease-elegante group-hover/membro:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bordo-950/80 via-bordo-950/0 to-transparent opacity-0 transition-opacity duration-500 group-hover/membro:opacity-100" />
        <p className="absolute inset-x-5 bottom-5 translate-y-3 text-[0.9rem] leading-snug text-marfim opacity-0 transition-[opacity,transform] duration-500 ease-elegante group-hover/membro:translate-y-0 group-hover/membro:opacity-100">
          {membro.nucleo ?? membro.areas.slice(0, 2).join(" · ")}
        </p>
        <span className="absolute right-4 top-4 flex size-10 items-center justify-center bg-marfim/90 text-bordo-700 opacity-0 transition-opacity duration-500 group-hover/membro:opacity-100">
          <IconeSetaDiagonal className="size-4" />
        </span>
      </div>
      <div className="mt-5">
        <p className={cn("font-display leading-tight text-bordo-700", tamanho === "grande" ? "text-[1.6rem] sm:text-[1.9rem]" : "text-[1.2rem] sm:text-[1.45rem]")}>
          {membro.nome}
        </p>
        <p className="mt-1 text-[0.8rem] text-cinza sm:text-[0.875rem]">
          {membro.cargo}
          {membro.oab && <span className="text-cinza"> · {membro.oab}</span>}
        </p>
      </div>
    </Link>
  );
}

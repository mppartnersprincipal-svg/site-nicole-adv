import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FotoHero } from "@/components/shared/FotoHero";
import type { FotoSite } from "@/lib/foto";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow: string;
  titulo: ReactNode;
  texto?: ReactNode;
  breadcrumbs: Array<{ nome: string; path: string }>;
  /** Foto do escritório exibida ao lado do título (abaixo dele no mobile). */
  foto?: FotoSite;
  children?: ReactNode;
}

/** Hero das páginas internas: título editorial + foto emoldurada do escritório. */
export function PageHero({ eyebrow, titulo, texto, breadcrumbs, foto, children }: PageHeroProps) {
  return (
    <section
      data-hero
      className="relative overflow-hidden bg-areia pb-16 pt-[calc(var(--header-h)+2.5rem)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]"
    >
      <div className="linhas-paralelas linha-hero absolute inset-x-0 bottom-0 text-bordo-700" aria-hidden="true" />
      <div className="container-site relative">
        <Breadcrumbs itens={breadcrumbs} />
        <div className={cn("mt-10 grid gap-12", foto && "lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-20")}>
          <div className="entrada-hero max-w-4xl">
            <p className="eyebrow mb-6 text-champanhe-700">{eyebrow}</p>
            <h1 className="text-h1 text-bordo-700">{titulo}</h1>
            {texto && <p className="mt-7 max-w-2xl text-lead text-cinza">{texto}</p>}
            {children}
          </div>
          {foto && <FotoHero foto={foto} />}
        </div>
      </div>
    </section>
  );
}

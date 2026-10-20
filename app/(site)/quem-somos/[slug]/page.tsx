import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaIcon } from "@/components/icons/AreaIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CtaFinal } from "@/components/shared/CtaFinal";
import { AREAS } from "@/lib/content/areas";
import { EQUIPE, getMembro } from "@/lib/content/equipe";
import { EQUIPE_FOTOS } from "@/lib/images";
import { rotaArea } from "@/lib/nav";
import { grafo, schemaPessoa } from "@/lib/schema";
import { metaPagina } from "@/lib/seo";

export function generateStaticParams() {
  return EQUIPE.filter((m) => m.grupo !== "conselho").map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/quem-somos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMembro(slug);
  if (!m) return {};
  return metaPagina({
    title: `${m.nome}${m.oab ? ` (${m.oab})` : ""}`,
    description: `${m.nome}, ${m.cargo.toLowerCase()} da Nicoli Sociedade de Advogados em Goiânia. ${m.nucleo ?? ""}`.trim().replace(/^([\s\S]{0,155})\s[\s\S]*$/, "$1"),
    path: `/quem-somos/${m.slug}`,
    imagem: m.foto,
  });
}

export default async function MembroPage({ params }: PageProps<"/quem-somos/[slug]">) {
  const { slug } = await params;
  const m = getMembro(slug);
  if (!m || m.grupo === "conselho") notFound();
  const foto = EQUIPE_FOTOS[m.slug];
  const areas = AREAS.filter((a) => a.responsaveis.includes(m.slug));

  return (
    <>
      <section data-hero className="bg-areia pb-20 pt-[calc(var(--header-h)+2.5rem)] md:pt-[calc(var(--header-h)+4rem)]">
        <div className="container-site">
          <Breadcrumbs
            itens={[
              { nome: "Quem somos", path: "/quem-somos" },
              { nome: m.nome, path: `/quem-somos/${m.slug}` },
            ]}
          />
          <div className="mt-10 grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="moldura max-w-md p-3 sm:p-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-bordo-700">
                {foto && (
                  <Image src={foto.src} alt={`${m.nome}, ${m.cargo}`} fill priority sizes="(min-width: 1024px) 34vw, 90vw" className="object-cover" placeholder={foto.blurDataURL ? "blur" : "empty"} blurDataURL={foto.blurDataURL} />
                )}
              </div>
            </div>
            <div className="entrada-hero">
              <p className="eyebrow text-champanhe-700">{m.cargo}</p>
              <h1 className="mt-5 text-h1 text-bordo-700">{m.nome}</h1>
              {m.oab && <p className="mt-3 text-[0.95rem] tracking-wide text-cinza">{m.oab}</p>}
              {m.nucleo && <p className="mt-8 font-display text-[1.5rem] leading-snug text-grafite">{m.nucleo}</p>}
              <p className="mt-6 max-w-2xl text-lead text-cinza">{m.bio}</p>
              {areas.length > 0 && (
                <>
                  <p className="eyebrow mb-4 mt-12 text-champanhe-700">Áreas em que atua</p>
                  <ul className="flex flex-wrap gap-3">
                    {areas.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={rotaArea(a.slug)}
                          className="inline-flex items-center gap-2 border border-bordo-700/25 px-4 py-2.5 text-[0.9rem] text-bordo-700 transition-colors hover:bg-bordo-700 hover:text-marfim"
                        >
                          <AreaIcon nome={a.icone} className="size-4" />
                          {a.nomeCurto}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <CtaFinal
        titulo={`Fale com o núcleo de ${m.nome.split(" ")[0]}`}
        texto="Conte brevemente o seu caso e agende uma conversa com a equipe responsável."
        local="membro-cta"
      />
      <JsonLd data={grafo(schemaPessoa(m))} />
    </>
  );
}

import Image from "next/image";
import { JsonLd } from "@/components/seo/JsonLd";
import { CenaGsap } from "@/components/motion/CenaGsap";
import { CredenciaisFaixa } from "@/components/shared/CredenciaisFaixa";
import { CtaFinal } from "@/components/shared/CtaFinal";
import { MembroCard } from "@/components/shared/MembroCard";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONSELHO, COORDENADORES, SOCIOS } from "@/lib/content/equipe";
import { CONSELHO_ADMINISTRATIVO, NOSSO_ESCRITORIO, OS_SOCIOS } from "@/lib/content/sobre";
import { FOTO_ESTRUTURA, FOTO_HISTORIA, FOTO_PAGINA } from "@/lib/fotos-site";
import { EQUIPE_FOTOS } from "@/lib/images";
import { grafo, schemaPessoa } from "@/lib/schema";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  title: NOSSO_ESCRITORIO.seo.title,
  description: NOSSO_ESCRITORIO.seo.description,
  path: "/quem-somos",
  tituloAbsoluto: true,
});

export default function QuemSomosPage() {
  const e = NOSSO_ESCRITORIO;
  const juliana = CONSELHO[0];
  const fotoJuliana = juliana ? EQUIPE_FOTOS[juliana.slug] : undefined;

  return (
    <CenaGsap>
      <PageHero
        eyebrow={e.eyebrow}
        titulo={e.titulo}
        texto={e.subtitulo}
        breadcrumbs={[{ nome: "Quem somos", path: "/quem-somos" }]}
        foto={FOTO_PAGINA.quemSomos}
      >
        <nav aria-label="Seções" className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-[0.8125rem] uppercase tracking-[0.14em]">
          <a href="#escritorio" className="nav-link">Nosso escritório</a>
          <a href="#socios" className="nav-link">Os sócios</a>
          <a href="#conselho" className="nav-link">Conselho administrativo</a>
        </nav>
      </PageHero>

      {/* NOSSO ESCRITÓRIO */}
      <section id="escritorio" className="secao scroll-mt-20" data-section="sobre-historia" aria-labelledby="historia-titulo">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <SectionHeading eyebrow={e.historia.eyebrow} titulo={e.historia.titulo} id="historia-titulo"  efeito="mascara" />
            <div className="mt-8 space-y-5 text-lead text-cinza">
              {e.historia.paragrafos.map((p, i) => (
                <Reveal key={p.slice(0, 30)} delay={i * 80}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal className="moldura p-3 sm:p-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-areia">
              <Image src={FOTO_HISTORIA.src} alt={FOTO_HISTORIA.alt} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" data-parallax-escala="1.18" placeholder={FOTO_HISTORIA.blurDataURL ? "blur" : "empty"} blurDataURL={FOTO_HISTORIA.blurDataURL} />
            </div>
          </Reveal>
        </div>
        <div className="container-site mt-20">
          <CredenciaisFaixa />
        </div>
      </section>

      {/* MÉTODO */}
      <section className="secao grao bg-bordo-700 text-marfim" data-section="sobre-metodo" aria-labelledby="metodo-sobre-titulo">
        <div className="container-site grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading eyebrow={e.metodo.eyebrow} titulo={e.metodo.titulo} texto={e.metodo.paragrafos[0]} id="metodo-sobre-titulo" tom="escuro"  efeito="inclinado" />
          <ol className="space-y-px bg-marfim/15">
            {e.metodo.itens?.map((m, i) => (
              <Reveal as="li" key={m.titulo} delay={i * 120} className="flex gap-6 bg-bordo-700 py-7">
                <span className="font-display text-[3rem] leading-none text-champanhe-500/80">{i + 1}</span>
                <div>
                  <h3 className="text-[1.6rem]">{m.titulo}</h3>
                  {m.descricao && <p className="mt-2 text-marfim/75">{m.descricao}</p>}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ATUAÇÃO NACIONAL + ESTRUTURA */}
      <section className="secao" data-section="sobre-estrutura" aria-label="Atuação e estrutura">
        <div className="container-site grid gap-16 lg:grid-cols-2 lg:gap-24">
          {[e.atuacaoNacional, e.estrutura].map((bloco, idx) => (
            <div key={bloco.titulo}>
              <SectionHeading eyebrow={bloco.eyebrow} titulo={bloco.titulo} nivel="h2"  efeito="lateral" />
              <div className="mt-6 space-y-4 text-cinza">
                {bloco.paragrafos.map((p) => (
                  <Reveal key={p.slice(0, 30)}>
                    <p>{p}</p>
                  </Reveal>
                ))}
              </div>
              {bloco.itens && (
                <ul className="mt-8 divide-y divide-pedra border-y border-pedra">
                  {bloco.itens.map((it) => (
                    <li key={it.titulo} className="py-5">
                      <h3 className="text-[1.3rem] text-bordo-700">{it.titulo}</h3>
                      {it.descricao && <p className="mt-1 text-[0.95rem] text-cinza">{it.descricao}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {idx === 0 && (
                <Reveal className="relative mt-10 aspect-[16/10] overflow-hidden bg-areia">
                  <Image src={FOTO_ESTRUTURA.src} alt={FOTO_ESTRUTURA.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" placeholder={FOTO_ESTRUTURA.blurDataURL ? "blur" : "empty"} blurDataURL={FOTO_ESTRUTURA.blurDataURL} />
                </Reveal>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* OS SÓCIOS */}
      <section id="socios" className="secao scroll-mt-20 bg-areia" data-section="sobre-socios" aria-labelledby="socios-titulo">
        <div className="container-site">
          <SectionHeading eyebrow={OS_SOCIOS.eyebrow} titulo={OS_SOCIOS.titulo} texto={OS_SOCIOS.subtitulo} id="socios-titulo"  efeito="palavras" />
          <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {SOCIOS.map((m, i) => (
              <Reveal as="li" key={m.slug} delay={i * 90}>
                <MembroCard membro={m} tamanho="grande" />
              </Reveal>
            ))}
          </ul>
          <p className="eyebrow mb-8 mt-20 text-champanhe-700">Coordenação dos núcleos</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 lg:grid-cols-3">
            {COORDENADORES.map((m, i) => (
              <Reveal as="li" key={m.slug} delay={i * 80}>
                <MembroCard membro={m} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* CONSELHO ADMINISTRATIVO */}
      {juliana && (
        <section id="conselho" className="secao scroll-mt-20" data-section="sobre-conselho" aria-labelledby="conselho-titulo">
          <div className="container-site grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <Reveal className="moldura max-w-md p-3 [--moldura-cor:var(--cor-champanhe-500)] sm:p-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-bordo-700">
                {fotoJuliana && (
                  <Image src={fotoJuliana.src} alt={`${juliana.nome}, ${juliana.cargo}`} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" placeholder={fotoJuliana.blurDataURL ? "blur" : "empty"} blurDataURL={fotoJuliana.blurDataURL} />
                )}
              </div>
            </Reveal>
            <div>
              <SectionHeading eyebrow={CONSELHO_ADMINISTRATIVO.eyebrow} titulo={CONSELHO_ADMINISTRATIVO.titulo} texto={CONSELHO_ADMINISTRATIVO.subtitulo || undefined} id="conselho-titulo"  efeito="cortina" />
              <div className="mt-6 space-y-4 text-cinza">
                {CONSELHO_ADMINISTRATIVO.intro.map((p) => (
                  <p key={p.slice(0, 30)}>{p}</p>
                ))}
              </div>
              <Reveal className="mt-10 border-l-2 border-bordo-700 pl-6">
                <p className="font-display text-[1.9rem] text-bordo-700">{juliana.nome}</p>
                <p className="text-[0.9rem] uppercase tracking-[0.14em] text-champanhe-700">{juliana.cargo}</p>
                <p className="mt-4 text-cinza">{juliana.bio}</p>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      <CtaFinal titulo={e.ctaFinal.titulo} texto={e.ctaFinal.texto} local="sobre-cta" />
      <JsonLd data={grafo(...[...SOCIOS, ...COORDENADORES].map(schemaPessoa))} />
    </CenaGsap>
  );
}

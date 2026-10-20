import Image from "next/image";
import Link from "next/link";
import { LogoSimbolo } from "@/components/brand/LogoSimbolo";
import { AreasTabs } from "@/components/home/AreasTabs";
import { CenaGsap } from "@/components/motion/CenaGsap";
import { GaleriaHorizontal } from "@/components/motion/GaleriaHorizontal";
import { SequenciaFixada } from "@/components/motion/SequenciaFixada";
import { TextoAnimado } from "@/components/motion/TextoAnimado";
import { Avaliacoes } from "@/components/home/Avaliacoes";
import { HeroHome } from "@/components/home/HeroHome";
import { IconeSetaDiagonal } from "@/components/icons/Icones";
import { JsonLd } from "@/components/seo/JsonLd";
import { CredenciaisFaixa } from "@/components/shared/CredenciaisFaixa";
import { CtaFinal } from "@/components/shared/CtaFinal";
import { FaqLista } from "@/components/shared/FaqLista";
import { MembroCard } from "@/components/shared/MembroCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPosts } from "@/lib/blog";
import { AREAS_EMPRESAS, AREAS_PESSOAS } from "@/lib/content/areas";
import { AVALIACOES } from "@/lib/content/avaliacoes";
import { COORDENADORES, SOCIOS } from "@/lib/content/equipe";
import {
  HOME_AREAS,
  HOME_CREDENCIAIS,
  HOME_CTA_FINAL,
  HOME_DEPOIMENTOS,
  HOME_DIFERENCIAIS,
  HOME_EQUIPE,
  HOME_FAQ,
  HOME_HERO,
  HOME_MANIFESTO,
  HOME_METODO,
  HOME_SEO,
} from "@/lib/content/home";
import { FOTO_DETALHE, FOTO_HERO_DESTAQUE, FOTO_HERO_FUNDO, FOTO_MANIFESTO, GALERIA } from "@/lib/fotos-site";
import { AREAS_NAV } from "@/lib/nav";
import { grafo, schemaFaq } from "@/lib/schema";
import { metaPagina } from "@/lib/seo";
import { MENSAGEM_WHATSAPP_PADRAO, SITE } from "@/lib/site";
import type { AreaAtuacao } from "@/lib/types";
import { formatarData } from "@/lib/utils";

export const metadata = metaPagina({
  title: HOME_SEO.title,
  description: HOME_SEO.description,
  path: "/",
  tituloAbsoluto: true,
});

const WHATSAPP = `https://wa.me/${SITE.whatsapp.numero}?text=${encodeURIComponent(MENSAGEM_WHATSAPP_PADRAO)}`;

const resumoArea = (a: AreaAtuacao) => ({ slug: a.slug, nome: a.nome, icone: a.icone, descricao: a.hero.subtitulo });

export default async function HomePage() {
  const posts = (await getPosts()).slice(0, 3);
  const equipe = [...SOCIOS, ...COORDENADORES].slice(0, 8);
  // Nunca exibir avaliações fictícias: só entram as reais copiadas do Google Business Profile
  const avaliacoesReais = AVALIACOES.filter((a) => !a.placeholder);

  return (
    <>
      <HeroHome hero={HOME_HERO} fundo={FOTO_HERO_FUNDO} destaque={FOTO_HERO_DESTAQUE} whatsappUrl={WHATSAPP} />

      <div className="container-site">
        <CredenciaisFaixa itens={HOME_CREDENCIAIS} className="border-t-0" />
      </div>

      {/* MANIFESTO — "Técnica de quem advoga. Visão de quem empreende." */}
      <section className="secao" data-section="home-manifesto" aria-labelledby="manifesto-titulo">
        <CenaGsap className="container-site grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <Reveal className="relative order-2 lg:order-1">
            <div className="moldura p-3 [--moldura-cor:var(--cor-champanhe-500)] sm:p-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-bordo-700">
                <Image
                  src={FOTO_MANIFESTO.src}
                  alt={FOTO_MANIFESTO.alt}
                  fill
                  sizes="(min-width: 1024px) 38vw, 90vw"
                  placeholder={FOTO_MANIFESTO.blurDataURL ? "blur" : "empty"}
                  blurDataURL={FOTO_MANIFESTO.blurDataURL}
                  className="object-cover"
                  data-parallax-escala="1.15"
                />
              </div>
            </div>
            <p className="mt-5 text-[0.85rem] text-cinza">
              <span className="text-grafite">Luís Gustavo Nicoli</span> · Sócio-fundador e CEO
            </p>
          </Reveal>
          <div className="order-1 lg:order-2">
            <TextoAnimado as="p" efeito="cortina" className="eyebrow mb-6 text-champanhe-700">
              {HOME_MANIFESTO.eyebrow}
            </TextoAnimado>
            <TextoAnimado
              as="h2"
              id="manifesto-titulo"
              efeito="mascara"
              className="text-[clamp(2.25rem,1.5rem+3.2vw,4.25rem)] leading-[1.05] text-bordo-700"
            >
              Técnica de quem advoga.
              <br />
              <em className="font-display italic text-champanhe-700">Visão de quem empreende.</em>
            </TextoAnimado>
            {/* Palavras acendem conforme o scroll (leitura guiada) */}
            <div className="mt-10 space-y-6 text-lead text-cinza">
              {HOME_MANIFESTO.paragrafos.map((p, i) => (
                <p
                  key={p.slice(0, 30)}
                  data-scrub-texto
                  className={i === HOME_MANIFESTO.paragrafos.length - 1 ? "font-display text-[1.5rem] leading-snug text-grafite" : ""}
                >
                  {p}
                </p>
              ))}
            </div>
            <Reveal className="mt-10">
              <Button href="/quem-somos" variante="texto">
                Conheça o escritório
              </Button>
            </Reveal>
          </div>
        </CenaGsap>
      </section>

      {/* ÁREAS — abas por público */}
      <section className="secao bg-areia" data-section="home-areas" aria-labelledby="areas-titulo">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading eyebrow={HOME_AREAS.eyebrow} titulo={HOME_AREAS.titulo} texto={HOME_AREAS.intro} id="areas-titulo" efeito="letras" />
            <Reveal>
              <Button href="/areas-de-atuacao" variante="contorno">
                Todas as áreas
              </Button>
            </Reveal>
          </div>
          <Reveal className="mt-14">
            <AreasTabs
              grupos={[
                { id: "empresas", titulo: HOME_AREAS.empresas.titulo, texto: HOME_AREAS.empresas.texto, areas: AREAS_EMPRESAS.map(resumoArea) },
                { id: "pessoas", titulo: HOME_AREAS.pessoas.titulo, texto: HOME_AREAS.pessoas.texto, areas: AREAS_PESSOAS.map(resumoArea) },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* DIFERENCIAIS — composição bento com foto */}
      <section className="secao" data-section="home-diferenciais" aria-labelledby="diferenciais-titulo">
        <CenaGsap className="container-site">
          <SectionHeading eyebrow={HOME_DIFERENCIAIS.eyebrow} titulo={HOME_DIFERENCIAIS.titulo} texto={HOME_DIFERENCIAIS.intro} id="diferenciais-titulo" efeito="desfoque" />
          <div className="mt-14 grid gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
            <Reveal className="relative min-h-[320px] overflow-hidden bg-bordo-700 lg:col-span-6 lg:row-span-2">
              <Image
                src={FOTO_DETALHE.src}
                alt={FOTO_DETALHE.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                placeholder={FOTO_DETALHE.blurDataURL ? "blur" : "empty"}
                blurDataURL={FOTO_DETALHE.blurDataURL}
                className="object-cover opacity-90"
                data-parallax-escala="1.2"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bordo-950/85 via-bordo-950/20 to-transparent" />
              <div className="absolute inset-x-7 bottom-7 text-marfim">
                <span className="font-display text-[0.95rem] text-champanhe-400">01</span>
                <h3 className="mt-2 text-[1.9rem] leading-tight">{HOME_DIFERENCIAIS.itens[0].titulo}</h3>
                <p className="mt-3 max-w-md text-marfim/80">{HOME_DIFERENCIAIS.itens[0].descricao}</p>
              </div>
            </Reveal>
            {HOME_DIFERENCIAIS.itens.slice(1).map((d, i) => (
              <Reveal
                key={d.titulo}
                delay={i * 90}
                className={
                  i === 0
                    ? "grao flex flex-col justify-between gap-10 bg-bordo-800 p-8 text-marfim md:p-10 lg:col-span-6"
                    : "flex flex-col justify-between gap-10 border border-pedra bg-areia p-8 md:p-9 lg:col-span-3"
                }
              >
                <span className={i === 0 ? "font-display text-champanhe-400" : "font-display text-champanhe-700"}>
                  {String(i + 2).padStart(2, "0")}
                </span>
                <div>
                  <h3 className={i === 0 ? "text-[1.9rem] leading-tight" : "text-[1.65rem] leading-tight text-bordo-700"}>{d.titulo}</h3>
                  <p className={i === 0 ? "mt-3 max-w-lg text-marfim/75" : "mt-3 max-w-lg text-cinza"}>{d.descricao}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </CenaGsap>
      </section>

      {/* MÉTODO DE DUPLA REVISÃO */}
      <section className="grao relative overflow-hidden bg-bordo-700 text-marfim" data-section="home-metodo" aria-labelledby="metodo-home-titulo">
        <SequenciaFixada className="secao relative lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center">
          <LogoSimbolo variante="compacto" aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 h-[80%] w-auto -translate-y-1/2 text-marfim opacity-[0.05]" />
          <div className="container-site relative">
            <SectionHeading eyebrow={HOME_METODO.eyebrow} titulo={HOME_METODO.titulo} texto={HOME_METODO.intro} id="metodo-home-titulo" tom="escuro" efeito="inclinado" />
            <div className="mt-14 h-px w-full bg-marfim/15" aria-hidden="true">
              <div data-progresso className="h-full origin-left bg-champanhe-500" />
            </div>
            <ol className="grid gap-px bg-marfim/15 md:grid-cols-3">
              {HOME_METODO.itens.map((etapa, i) => (
                <li key={etapa.titulo} className="group/etapa relative bg-bordo-700 p-8 md:p-10">
                  <div data-etapa>
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-champanhe-500 transition-transform duration-700 ease-elegante group-hover/etapa:scale-x-100"
                />
                <span data-etapa-numero className="inline-block font-display text-[4rem] leading-none text-champanhe-500/80">{i + 1}</span>
                <h3 className="mt-6 text-[1.75rem] leading-tight">{etapa.titulo.replace(/^\d+\.\s*/, "")}</h3>
                {etapa.descricao && <p className="mt-4 text-marfim/75">{etapa.descricao}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </SequenciaFixada>
      </section>

      {/* EQUIPE */}
      <section className="secao" data-section="home-equipe" aria-labelledby="equipe-home-titulo">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading eyebrow={HOME_EQUIPE.eyebrow} titulo={HOME_EQUIPE.titulo} texto={HOME_EQUIPE.intro} id="equipe-home-titulo" efeito="lateral" />
            <Reveal>
              <Button href="/quem-somos#socios" variante="contorno">
                {HOME_EQUIPE.cta?.rotulo ?? "Conhecer a equipe"}
              </Button>
            </Reveal>
          </div>
          <CenaGsap>
            <ul className="trilho-snap mt-14 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14 lg:overflow-visible">
              {equipe.map((m) => (
                <li key={m.slug}>
                  <MembroCard membro={m} />
                </li>
              ))}
            </ul>
          </CenaGsap>
        </div>
      </section>

      {/* ESTRUTURA — galeria horizontal guiada pelo scroll (GSAP) */}
      {GALERIA.length > 0 && <GaleriaHorizontal fotos={GALERIA} eyebrow="Nosso escritório" titulo="Um ambiente pensado para receber bem" />}

      {/* AVALIAÇÕES */}
      <section className="secao bg-areia" data-section="home-avaliacoes" aria-labelledby="avaliacoes-titulo">
        <div className="container-site">
          <SectionHeading eyebrow={HOME_DEPOIMENTOS.eyebrow} titulo={HOME_DEPOIMENTOS.titulo} texto={HOME_DEPOIMENTOS.intro} id="avaliacoes-titulo" efeito="escala" />
          <Reveal className="mt-14">
            {avaliacoesReais.length > 0 ? (
              <Avaliacoes avaliacoes={avaliacoesReais} googleUrl={SITE.googleReviewsUrl} />
            ) : (
              <Button href={SITE.googleReviewsUrl} variante="contorno" trackEvent="click_reviews">
                Ver avaliações no Google
              </Button>
            )}
          </Reveal>
        </div>
      </section>

      {/* BLOG */}
      {posts.length > 0 && (
        <section className="secao" data-section="home-blog" aria-labelledby="blog-home-titulo">
          <div className="container-site">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <SectionHeading eyebrow="Blog & Mídias" titulo="Conteúdo jurídico para quem decide" id="blog-home-titulo" efeito="cortina" />
              <Reveal>
                <Button href="/blog" variante="contorno">
                  Ver todos os artigos
                </Button>
              </Reveal>
            </div>
            <ul className="mt-14 grid gap-10 md:grid-cols-3">
              {posts.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={i * 90}>
                  <Link href={`/blog/${p.slug}`} className="group/post block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-areia">
                      {p.cover && (
                        <Image src={p.cover} alt={p.coverAlt ?? p.title} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-elegante group-hover/post:scale-[1.04]" />
                      )}
                    </div>
                    <p className="eyebrow mt-6 text-champanhe-700">{AREAS_NAV.find((a) => a.slug === p.area)?.nome ?? p.category ?? "Artigo"}</p>
                    <h3 className="mt-3 flex items-start justify-between gap-4 text-[1.45rem] leading-snug text-grafite transition-colors group-hover/post:text-bordo-700">
                      {p.title}
                      <IconeSetaDiagonal className="mt-2 size-4 shrink-0 text-bordo-700" />
                    </h3>
                    <p className="mt-3 text-[0.82rem] text-cinza">{formatarData(p.date)}</p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="secao border-t border-pedra" data-section="home-faq" aria-labelledby="faq-home-titulo">
        <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading eyebrow={HOME_FAQ.eyebrow} titulo={HOME_FAQ.titulo} id="faq-home-titulo" efeito="dispersao" />
          <FaqLista faqs={HOME_FAQ.itens} />
        </div>
      </section>

      <CtaFinal titulo={HOME_CTA_FINAL.titulo} texto={HOME_CTA_FINAL.texto} local="home-cta-final" />
      <JsonLd data={grafo(schemaFaq(HOME_FAQ.itens))} />
    </>
  );
}

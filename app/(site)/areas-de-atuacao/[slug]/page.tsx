import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BarraCtaMobile } from "@/components/area/BarraCtaMobile";
import { AreaIcon } from "@/components/icons/AreaIcon";
import { IconeCheck, IconeSetaDiagonal } from "@/components/icons/Icones";
import { LeadForm } from "@/components/lead/LeadForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { CenaGsap } from "@/components/motion/CenaGsap";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CredenciaisFaixa } from "@/components/shared/CredenciaisFaixa";
import { FotoLateral } from "@/components/shared/FotoLateral";
import { fotoDaArea } from "@/lib/fotos-site";
import { CtaFinal } from "@/components/shared/CtaFinal";
import { FaqLista } from "@/components/shared/FaqLista";
import { MembroCard } from "@/components/shared/MembroCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AREAS, getArea } from "@/lib/content/areas";
import { getMembro } from "@/lib/content/equipe";
import { getPostsPorArea } from "@/lib/blog";
import { rotaArea } from "@/lib/nav";
import { grafo, schemaFaq, schemaServicoArea } from "@/lib/schema";
import { metaPagina } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { MembroEquipe } from "@/lib/types";
import { formatarData } from "@/lib/utils";

export function generateStaticParams() {
  return AREAS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/areas-de-atuacao/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) return {};
  return metaPagina({
    title: area.seo.title,
    tituloAbsoluto: true,
    description: area.seo.description,
    keywords: area.seo.keywords,
    path: rotaArea(area.slug),
  });
}

const FORM_ANCORA = "formulario";

export default async function AreaPage({ params }: PageProps<"/areas-de-atuacao/[slug]">) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const responsaveis = area.responsaveis.map(getMembro).filter((m): m is MembroEquipe => Boolean(m));
  const relacionadas = area.relacionadas.map(getArea).filter((a) => a !== undefined);
  const posts = (await getPostsPorArea(area.slug)).slice(0, 3);
  const grupo = area.publico === "empresas" ? "Empresas e patrimônios" : "Pessoas e famílias";
  const wa = `https://wa.me/${SITE.whatsapp.numero}?text=${encodeURIComponent(area.mensagemWhatsapp)}`;

  return (
    <>
      {/* HERO — message match com o anúncio + formulário acima da dobra */}
      <section
        data-hero
        data-section="area-hero"
        className="relative overflow-hidden bg-areia pb-16 pt-[calc(var(--header-h)+2rem)] lg:pb-24 lg:pt-[calc(var(--header-h)+3.5rem)]"
      >
        <CenaGsap className="pointer-events-none absolute -left-24 bottom-0" >
          <div data-parallax="0.5">
            <AreaIcon nome={area.icone} aria-hidden="true" className="size-[28rem] text-bordo-700 opacity-[0.045] lg:size-[36rem]" data-girar="10" />
          </div>
        </CenaGsap>
        <div className="container-site relative lg:static">
          <Breadcrumbs
            itens={[
              { nome: "Áreas de atuação", path: "/areas-de-atuacao" },
              { nome: area.nomeCurto, path: rotaArea(area.slug) },
            ]}
          />
          <div className="mt-8 grid items-start gap-12 lg:mt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="entrada-hero order-1 relative z-10">
              <p className="eyebrow mb-6 text-champanhe-700">{area.hero.eyebrow}</p>
              <h1 className="text-h1 text-bordo-700">{area.hero.titulo}</h1>
              <p className="mt-7 max-w-xl text-lead text-cinza">{area.hero.subtitulo}</p>
              <ul className="mt-8 space-y-3">
                {area.diferenciais.map((d) => (
                  <li key={d.titulo} className="flex gap-3 text-[0.98rem] text-grafite">
                    <IconeCheck className="mt-1 size-4 shrink-0 text-bordo-700" />
                    <span>
                      <strong className="font-medium">{d.titulo}.</strong> <span className="text-cinza">{d.descricao}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row lg:hidden">
                <Button href={`#${FORM_ANCORA}`} trackEvent="click_cta" trackLocation="area-hero">
                  {area.hero.cta}
                </Button>
                <Button href={wa} variante="whatsapp" trackLocation="area-hero">
                  WhatsApp
                </Button>
              </div>
            </div>

            <FotoLateral foto={fotoDaArea(area.slug)} />

            <div
              id={FORM_ANCORA}
              className="relative z-10 order-3 scroll-mt-28 border border-pedra bg-marfim p-6 shadow-[0_40px_80px_-40px_rgba(43,1,2,0.35)] sm:p-9"
            >
              <LeadForm
                formId={`area-${area.slug}`}
                area={area.nome}
                publico={area.publico}
                titulo={area.hero.cta}
                subtitulo="Atendimento de segunda a sexta, das 8h às 18h, presencial em Goiânia ou remoto para todo o Brasil."
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-site">
        <CredenciaisFaixa className="border-t-0" />
      </div>

      {/* RESUMO (bloco citável GEO) + situações */}
      <section className="secao" data-section="area-situacoes" aria-labelledby="situacoes-titulo">
        <div className="container-site grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:self-start">
            <SectionHeading eyebrow={grupo} titulo={`Como atuamos em ${area.nomeCurto}`} id="situacoes-titulo"  efeito="mascara" />
            <Reveal>
              <p className="mt-8 border-l-2 border-bordo-700 pl-6 font-display text-[1.35rem] leading-[1.5] text-grafite">
                {area.resumo}
              </p>
            </Reveal>
          </div>
          <div>
            <p className="eyebrow mb-8 text-champanhe-700">Quando procurar a Nicoli</p>
            <ol className="grid gap-px border border-pedra bg-pedra sm:grid-cols-2">
              {area.situacoes.map((s, i) => (
                <Reveal as="li" key={s.titulo} delay={i * 70} className="group/sit bg-marfim p-7 transition-colors duration-500 hover:bg-white">
                  <span className="font-display text-[0.95rem] text-champanhe-700">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-[1.35rem] leading-snug text-bordo-700">{s.titulo}</h3>
                  {s.descricao && <p className="mt-3 text-[0.95rem] text-cinza">{s.descricao}</p>}
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="secao grao bg-bordo-800 text-marfim" data-section="area-servicos" aria-labelledby="servicos-titulo">
        <div className="container-site">
          <SectionHeading
            eyebrow="O que fazemos"
            titulo={`Serviços em ${area.nomeCurto}`}
            id="servicos-titulo"
            tom="escuro"
           efeito="letras" />
          <ul className="mt-14 grid gap-x-16 md:grid-cols-2">
            {area.servicos.map((s, i) => (
              <Reveal as="li" key={s.titulo} delay={(i % 2) * 90} className="group/serv border-t border-marfim/15 py-8">
                <div className="flex gap-6">
                  <span className="pt-1 font-display text-[1.05rem] text-champanhe-400">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-[1.5rem] leading-snug text-marfim transition-colors duration-300 group-hover/serv:text-champanhe-400">
                      {s.titulo}
                    </h3>
                    {s.descricao && <p className="mt-3 text-marfim/70">{s.descricao}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* MÉTODO — linha que se preenche com o scroll (CSS scroll-driven, zero JS) */}
      <section className="secao" data-section="area-metodo" aria-labelledby="metodo-titulo">
        <div className="container-site grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:self-start">
            <SectionHeading
              eyebrow="Método Nicoli"
              titulo="Como o escritório atua"
              texto="Toda peça passa pelo advogado relator, por um revisor colega e pela liberação final do sócio."
              id="metodo-titulo"
             efeito="inclinado" />
          </div>
          <ol className="metodo relative">
            <span className="metodo-trilho" aria-hidden="true" />
            {area.metodo.map((etapa, i) => (
              <Reveal as="li" key={etapa.titulo} className="relative pb-12 pl-16 last:pb-0">
                <span className="absolute left-0 top-0 flex size-11 items-center justify-center border border-bordo-700 bg-marfim font-display text-[1.1rem] text-bordo-700">
                  {i + 1}
                </span>
                <h3 className="pt-1.5 text-[1.5rem] leading-snug text-bordo-700">{etapa.titulo}</h3>
                {etapa.descricao && <p className="mt-3 max-w-xl text-cinza">{etapa.descricao}</p>}
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* RESPONSÁVEIS */}
      {responsaveis.length > 0 && (
        <section className="secao bg-areia" data-section="area-equipe" aria-labelledby="equipe-titulo">
          <div className="container-site">
            <SectionHeading
              eyebrow="Quem conduz o seu caso"
              titulo="Núcleo com líderes identificados"
              id="equipe-titulo"
             efeito="lateral" />
            <CenaGsap className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 lg:grid-cols-4">
              {responsaveis.map((m) => (
                <MembroCard key={m.slug} membro={m} />
              ))}
            </CenaGsap>
          </div>
        </section>
      )}

      {/* FAQ */}
      {area.faq.length > 0 && (
      <section className="secao" data-section="area-faq" aria-labelledby="faq-titulo">
        <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Dúvidas frequentes" titulo={`Perguntas sobre ${area.nomeCurto}`} id="faq-titulo"  efeito="dispersao" />
            <Reveal className="mt-8">
              <Button href={wa} variante="contorno" trackLocation="area-faq">
                Tirar uma dúvida específica
              </Button>
            </Reveal>
          </div>
          <FaqLista faqs={area.faq} />
        </div>
      </section>
      )}

      {/* CONTEÚDO RELACIONADO + ÁREAS RELACIONADAS (links internos) */}
      {(posts.length > 0 || relacionadas.length > 0) && (
        <section className="pb-[var(--secao-py)]" data-section="area-relacionadas" aria-label="Conteúdo relacionado">
          <div className="container-site grid gap-14 lg:grid-cols-2">
            {posts.length > 0 && (
              <div>
                <p className="eyebrow mb-6 text-champanhe-700">Artigos sobre o tema</p>
                <ul className="divide-y divide-pedra border-y border-pedra">
                  {posts.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className="group/post flex items-start justify-between gap-6 py-5">
                        <span>
                          <span className="block text-[0.78rem] text-cinza">{formatarData(p.date)}</span>
                          <span className="mt-1 block font-display text-[1.3rem] leading-snug text-grafite transition-colors group-hover/post:text-bordo-700">
                            {p.title}
                          </span>
                        </span>
                        <IconeSetaDiagonal className="mt-6 size-4 shrink-0 text-bordo-700 transition-transform duration-300 group-hover/post:-translate-y-0.5 group-hover/post:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {relacionadas.length > 0 && (
              <div>
                <p className="eyebrow mb-6 text-champanhe-700">Áreas relacionadas</p>
                <ul className="grid gap-px border border-pedra bg-pedra">
                  {relacionadas.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={rotaArea(r.slug)}
                        className="group/rel flex items-center gap-5 bg-marfim p-6 transition-colors duration-300 hover:bg-white"
                      >
                        <AreaIcon nome={r.icone} className="size-8 shrink-0 text-bordo-700" />
                        <span className="flex-1">
                          <span className="block font-display text-[1.35rem] text-bordo-700">{r.nome}</span>
                          <span className="mt-1 block text-[0.9rem] text-cinza">{r.hero.subtitulo.split(". ")[0]}.</span>
                        </span>
                        <IconeSetaDiagonal className="size-4 shrink-0 text-bordo-700 transition-transform duration-300 group-hover/rel:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <CtaFinal
        titulo={area.ctaFinal.titulo}
        texto={area.ctaFinal.texto}
        mensagemWhatsapp={area.mensagemWhatsapp}
        local="area-cta-final"
      />
      <BarraCtaMobile mensagem={area.mensagemWhatsapp} ancoraFormulario={FORM_ANCORA} />
      <JsonLd data={grafo(schemaServicoArea(area), ...(area.faq.length > 0 ? [schemaFaq(area.faq)] : []))} />
    </>
  );
}

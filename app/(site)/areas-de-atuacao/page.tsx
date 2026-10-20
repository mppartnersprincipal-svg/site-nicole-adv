import { JsonLd } from "@/components/seo/JsonLd";
import { CtaFinal } from "@/components/shared/CtaFinal";
import { ListaAreas } from "@/components/shared/ListaAreas";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AREAS, AREAS_EMPRESAS, AREAS_PESSOAS } from "@/lib/content/areas";
import { metaPagina } from "@/lib/seo";
import { FOTO_PAGINA } from "@/lib/fotos-site";
import { SITE } from "@/lib/site";

export const metadata = metaPagina({
  title: "Áreas de atuação: advocacia full service em Goiânia",
  description:
    "Empresarial, Trabalhista, Cível, Agronegócio, Tributário, Holdings, Contencioso, Família e Sucessões, Saúde e Previdenciário. Núcleos especializados em Goiânia, com atuação em todo o Brasil.",
  path: "/areas-de-atuacao",
});

export default function AreasPage() {
  const lista = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Áreas de atuação da Nicoli Sociedade de Advogados",
    itemListElement: AREAS.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.nome,
      url: new URL(`/areas-de-atuacao/${a.slug}`, SITE.url).toString(),
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="Áreas de atuação"
        titulo="Advocacia full service, organizada por quem você é"
        texto="Núcleos especializados, com líderes identificados por área, para proteger empresas, patrimônios e famílias, em Goiânia e em todo o Brasil."
        breadcrumbs={[{ nome: "Áreas de atuação", path: "/areas-de-atuacao" }]}
        foto={FOTO_PAGINA.areas}
      />

      <section className="secao" data-section="areas-empresas" aria-labelledby="grupo-empresas">
        <div className="container-site">
          <SectionHeading
            id="grupo-empresas"
            eyebrow="Para empresas e patrimônios"
            titulo="Empresários, investidores e titulares de patrimônio"
            texto="Agro, construção civil, mercado imobiliário, transporte e comércio, com a visão de quem também empreende."
           efeito="escala" />
          <div className="mt-12">
            <ListaAreas areas={AREAS_EMPRESAS} />
          </div>
        </div>
      </section>

      <section className="secao bg-areia" data-section="areas-pessoas" aria-labelledby="grupo-pessoas">
        <div className="container-site">
          <SectionHeading
            id="grupo-pessoas"
            eyebrow="Para pessoas e famílias"
            titulo="Direitos de quem trabalha, cuida da família e da saúde"
            texto="Trabalhadores, famílias, pacientes e beneficiários de planos de saúde, segurados do INSS e seus familiares."
           efeito="desfoque" />
          <div className="mt-12">
            <ListaAreas areas={AREAS_PESSOAS} inicio={AREAS_EMPRESAS.length + 1} />
          </div>
        </div>
      </section>

      <CtaFinal
        titulo="Não sabe qual área cuida do seu caso?"
        texto="Conte a sua situação e agende uma reunião."
        local="areas-cta"
      />
      <JsonLd data={lista} />
    </>
  );
}

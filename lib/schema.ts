import { SITE } from "@/lib/site";
import type { AreaAtuacao, Faq, MembroEquipe } from "@/lib/types";

/** Geradores de JSON-LD (Schema.org). Um @id estável por entidade liga tudo num grafo. */

type JsonLd = Record<string, unknown>;

const ORG_ID = `${SITE.url}/#organizacao`;
const SITE_ID = `${SITE.url}/#website`;
const url = (path: string) => new URL(path, SITE.url).toString();

export function schemaOrganizacao(): JsonLd {
  return {
    "@type": ["LegalService", "LocalBusiness"],
    "@id": ORG_ID,
    name: SITE.nome,
    alternateName: ["Nicoli Advogados", "Nicoli Advogados e Associados"],
    description: SITE.descricao,
    slogan: SITE.slogan,
    url: SITE.url,
    logo: url("/brand/logo-og.png"),
    image: url("/opengraph-image"),
    telephone: SITE.telefone.e164,
    email: SITE.email,
    taxID: SITE.cnpj,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.endereco.rua,
      addressLocality: SITE.endereco.cidade,
      addressRegion: SITE.endereco.uf,
      postalCode: SITE.endereco.cep,
      addressCountry: SITE.endereco.pais,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.endereco.geo.lat, longitude: SITE.endereco.geo.lng },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Goiânia" },
      { "@type": "State", name: "Goiás" },
      { "@type": "Country", name: "Brasil" },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: `+${SITE.whatsapp.numero}`,
        contactType: "customer service",
        availableLanguage: "Portuguese",
        areaServed: "BR",
      },
    ],
    founder: { "@id": `${SITE.url}/quem-somos/luis-gustavo-nicoli#pessoa` },
    sameAs: Object.values(SITE.redes),
    knowsAbout: [
      "Direito Empresarial",
      "Direito do Trabalho",
      "Direito Civil",
      "Direito do Agronegócio",
      "Direito Tributário",
      "Holding familiar e planejamento sucessório",
      "Direito de Família e Sucessões",
      "Direito da Saúde",
      "Direito Previdenciário",
    ],
  };
}

export function schemaWebsite(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE.url,
    name: SITE.nome,
    inLanguage: "pt-BR",
    publisher: { "@id": ORG_ID },
  };
}

export function schemaBreadcrumb(itens: Array<{ nome: string; path: string }>): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ nome: "Início", path: "/" }, ...itens].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: url(item.path),
    })),
  };
}

export function schemaFaq(faqs: Faq[]): JsonLd {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.pergunta,
      acceptedAnswer: { "@type": "Answer", text: f.resposta },
    })),
  };
}

export function schemaServicoArea(area: AreaAtuacao): JsonLd {
  const path = `/areas-de-atuacao/${area.slug}`;
  return {
    "@type": "Service",
    "@id": `${url(path)}#servico`,
    name: area.nome,
    serviceType: area.nome,
    description: area.resumo,
    url: url(path),
    provider: { "@id": ORG_ID },
    areaServed: [
      { "@type": "City", name: "Goiânia" },
      { "@type": "Country", name: "Brasil" },
    ],
    audience: {
      "@type": "Audience",
      audienceType: area.publico === "empresas" ? "Empresas, empresários e investidores" : "Pessoas e famílias",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Serviços de ${area.nome}`,
      itemListElement: area.servicos.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.titulo, description: s.descricao },
      })),
    },
  };
}

export function schemaPessoa(m: MembroEquipe): JsonLd {
  return {
    "@type": "Person",
    "@id": `${SITE.url}/quem-somos/${m.slug}#pessoa`,
    name: m.nome,
    jobTitle: m.cargo,
    description: m.bio,
    image: url(m.foto),
    url: url(`/quem-somos/${m.slug}`),
    worksFor: { "@id": ORG_ID },
    ...(m.oab ? { identifier: { "@type": "PropertyValue", propertyID: "OAB", value: m.oab } } : {}),
    knowsAbout: m.areas,
  };
}

export function schemaArtigo(p: {
  titulo: string;
  descricao: string;
  slug: string;
  data: string;
  atualizado?: string;
  autor: string;
  capa?: string;
}): JsonLd {
  return {
    "@type": "BlogPosting",
    headline: p.titulo,
    description: p.descricao,
    datePublished: p.data,
    dateModified: p.atualizado ?? p.data,
    inLanguage: "pt-BR",
    mainEntityOfPage: url(`/blog/${p.slug}`),
    image: p.capa ? url(p.capa) : url("/opengraph-image"),
    author: /nicoli/i.test(p.autor) && /lu[ií]s/i.test(p.autor)
      ? { "@id": `${SITE.url}/quem-somos/luis-gustavo-nicoli#pessoa` }
      : { "@type": "Person", name: p.autor },
    "@id": `${url(`/blog/${p.slug}`)}#artigo`,
    publisher: { "@id": ORG_ID },
  };
}

/** Envolve entidades num único @graph. */
export function grafo(...entidades: JsonLd[]): JsonLd {
  return { "@context": "https://schema.org", "@graph": entidades };
}

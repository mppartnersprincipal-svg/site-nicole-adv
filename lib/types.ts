/** Contrato de conteúdo do site. Toda copy vive em lib/content/ e segue estes tipos. */

export type Publico = "empresas" | "pessoas";

export interface Faq {
  pergunta: string;
  /** Resposta em texto simples (2–5 frases). Escrita para ser citável por buscadores e IAs (GEO). */
  resposta: string;
}

export interface EtapaMetodo {
  titulo: string;
  descricao?: string;
}

export interface Servico {
  titulo: string;
  descricao?: string;
}

export interface Situacao {
  /** Frase curta em 1ª pessoa ou situação concreta. Ex.: "Recebi uma reclamação trabalhista". */
  titulo: string;
  descricao?: string;
}

export interface AreaSeo {
  /** <title> com até ~60 caracteres. */
  title: string;
  /** meta description com 140–160 caracteres. */
  description: string;
  /** Palavras-chave foco (orgânico + Google Ads), da mais para a menos importante. */
  keywords: string[];
}

export interface AreaAtuacao {
  slug: string;
  nome: string;
  /** Nome curto para menu e cards. */
  nomeCurto: string;
  publico: Publico;
  /** Nome do ícone em components/icons/AreaIcon.tsx. */
  icone: string;
  seo: AreaSeo;
  hero: {
    eyebrow: string;
    /** H1 da página (um só por página). */
    titulo: string;
    subtitulo: string;
    cta: string;
  };
  /** Parágrafo de 40–70 palavras que responde "o que é / o que faz um advogado de X" (bloco citável p/ GEO). */
  resumo: string;
  situacoes: Situacao[];
  servicos: Servico[];
  metodo: EtapaMetodo[];
  /** Por que a Nicoli nessa área (3 itens curtos). */
  diferenciais: Servico[];
  faq: Faq[];
  /** Slugs da equipe (lib/content/equipe.ts) responsáveis pela área. */
  responsaveis: string[];
  /** Slugs de outras áreas relacionadas, para links internos. */
  relacionadas: string[];
  /** Mensagem pré-preenchida do WhatsApp. */
  mensagemWhatsapp: string;
  /** Título e texto do bloco final de captação. */
  ctaFinal: { titulo: string; texto: string };
}

export interface MembroEquipe {
  slug: string;
  nome: string;
  oab?: string;
  cargo: string;
  /** Núcleo/área coordenada. */
  nucleo?: string;
  areas: string[];
  bio: string;
  foto: string;
  grupo: "socios" | "coordenadores" | "conselho";
}

export interface Avaliacao {
  autor: string;
  texto: string;
  nota: 1 | 2 | 3 | 4 | 5;
  /** Ex.: "há 2 meses". */
  quando: string;
  /** true enquanto for placeholder aguardando avaliação real do Google. */
  placeholder?: boolean;
}

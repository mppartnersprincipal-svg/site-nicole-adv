/** Copy da Home. Somente fatos do briefing preenchido; não acrescentar informações. */

import type { Faq } from "@/lib/types";

export interface Cta {
  rotulo: string;
  /** "whatsapp" abre o WhatsApp com a mensagem padrão; "contato" leva ao formulário. */
  destino: "whatsapp" | "contato" | "areas" | "socios";
}

export interface HomeHero {
  eyebrow: string;
  titulo: string;
  /** Segunda linha do h1, em itálico champanhe. */
  slogan: string;
  subtitulo: string;
  ctaPrimario: Cta;
  ctaSecundario: Cta;
}

export interface Credencial {
  valor: string;
  rotulo: string;
}

export interface BlocoTexto {
  eyebrow: string;
  titulo: string;
  paragrafos: string[];
}

export interface ItemDestaque {
  titulo: string;
  descricao?: string;
}

export interface SecaoLista {
  eyebrow: string;
  titulo: string;
  intro: string;
  itens: ItemDestaque[];
}

export interface SecaoIntro {
  eyebrow: string;
  titulo: string;
  intro: string;
  cta?: Cta;
}

export interface SecaoAreas {
  eyebrow: string;
  titulo: string;
  intro: string;
  empresas: { titulo: string; texto: string };
  pessoas: { titulo: string; texto: string };
}

export interface SecaoFaq {
  eyebrow: string;
  titulo: string;
  itens: Faq[];
}

export interface CtaFinalHome {
  titulo: string;
  texto: string;
  ctaPrimario: Cta;
  ctaSecundario: Cta;
}

export const HOME_SEO = {
  title: "Escritório de Advocacia em Goiânia | Nicoli Advogados",
  description:
    "Escritório de advocacia full service em Goiânia, com atuação em todo o Brasil: empresarial, trabalhista, agronegócio, tributário, holdings, família e saúde.",
} as const;

export const HOME_HERO: HomeHero = {
  eyebrow: "Escritório de advocacia em Goiânia/GO",
  titulo: "Nicoli Sociedade de Advogados",
  slogan: "Advocacia estratégica para empresas, patrimônios e famílias.",
  subtitulo:
    "Escritório full service sediado em Goiânia, com atuação em todo o Brasil.",
  ctaPrimario: { rotulo: "Agendar uma reunião", destino: "contato" },
  ctaSecundario: { rotulo: "Conversar pelo WhatsApp", destino: "whatsapp" },
};

export const HOME_CREDENCIAIS: Credencial[] = [
  { valor: "23+", rotulo: "anos de advocacia trabalhista do sócio-fundador" },
  { valor: "Mestre", rotulo: "em Direito do Trabalho" },
  { valor: "11", rotulo: "áreas de atuação" },
  { valor: "Brasil", rotulo: "atuação em todo o Brasil" },
];

export const HOME_MANIFESTO: BlocoTexto = {
  eyebrow: "Nosso posicionamento",
  titulo: "Tradição e modernidade a serviço dos nossos clientes.",
  paragrafos: [
    "O sócio-fundador da Nicoli tem mais de 23 anos de advocacia trabalhista e é empresário no agronegócio, na construção civil, no mercado imobiliário e em locação. Conhece por dentro as decisões, os riscos e a gestão de pessoas de quem emprega e investe.",
    "Profundidade técnica e experiência empresarial para proteger empresas, patrimônios e famílias.",
  ],
};

export const HOME_DIFERENCIAIS: SecaoLista = {
  eyebrow: "Diferenciais",
  titulo: "Por que escolher a Nicoli",
  intro: "",
  itens: [
    {
      titulo: "Liderança que também empreende",
      descricao:
        "O sócio-fundador é empresário no agronegócio, na construção civil, no mercado imobiliário e em locação, e conhece por dentro as decisões, os riscos e a gestão de pessoas de quem emprega e investe.",
    },
    {
      titulo: "Autoridade técnica",
      descricao:
        "Sócio-fundador mestre em Direito do Trabalho, com mais de 23 anos de advocacia trabalhista.",
    },
    {
      titulo: "Método de dupla revisão",
      descricao:
        "Toda peça passa pelo advogado relator, por um revisor colega e pela liberação final do sócio.",
    },
    {
      titulo: "Núcleos especializados",
      descricao:
        "Núcleos especializados, com líderes identificados por área, e atuação em todo o Brasil.",
    },
  ],
};

export const HOME_METODO: SecaoLista = {
  eyebrow: "Método de dupla revisão",
  titulo: "Toda peça passa por três etapas",
  intro:
    "Toda peça passa pelo advogado relator, por um revisor colega e pela liberação final do sócio.",
  itens: [
    { titulo: "1. Advogado relator" },
    { titulo: "2. Revisor colega" },
    { titulo: "3. Liberação final do sócio" },
  ],
};

export const HOME_AREAS: SecaoAreas = {
  eyebrow: "Áreas de atuação",
  titulo: "Atuação organizada para dois públicos",
  intro: "Escolha o caminho que corresponde à sua necessidade.",
  empresas: {
    titulo: "Empresas e patrimônios",
    texto:
      "Para empresários, investidores e titulares de patrimônio do agro, da construção civil, do mercado imobiliário, do transporte e do comércio.",
  },
  pessoas: {
    titulo: "Pessoas e famílias",
    texto:
      "Para trabalhadores, famílias, pacientes e beneficiários de planos de saúde, segurados do INSS e seus familiares.",
  },
};

export const HOME_EQUIPE: SecaoIntro = {
  eyebrow: "Equipe",
  titulo: "Quem conduz o seu caso",
  intro:
    "Núcleos especializados, com líderes identificados por área.",
  cta: { rotulo: "Conhecer os sócios", destino: "socios" },
};

export const HOME_DEPOIMENTOS: SecaoIntro = {
  eyebrow: "Avaliações",
  titulo: "O que dizem os nossos clientes",
  intro:
    "Avaliações publicadas por clientes no perfil do escritório no Google.",
};

export const HOME_FAQ: SecaoFaq = {
  eyebrow: "Dúvidas frequentes",
  titulo: "Perguntas sobre o atendimento",
  itens: [
    {
      pergunta: "Vocês atendem fora de Goiânia?",
      resposta:
        "Sim. A sede fica em Goiânia, no Setor Sul, e o escritório atua em todo o Brasil.",
    },
    {
      pergunta: "O atendimento pode ser remoto?",
      resposta: "Sim. O atendimento pode ser presencial, na sede em Goiânia, ou remoto.",
    },
    {
      pergunta: "Qual é o horário de atendimento?",
      resposta: "De segunda a sexta, das 8h às 18h.",
    },
    {
      pergunta: "Quais áreas vocês atendem?",
      resposta:
        "Para empresas e patrimônios, atuamos em direito empresarial, trabalhista empresarial, cível, agronegócio, tributário, planejamento societário e holdings e contencioso estratégico. Para pessoas e famílias, em direito trabalhista, família e sucessões, saúde e previdenciário.",
    },
  ],
};

export const HOME_CTA_FINAL: CtaFinalHome = {
  titulo: "Vamos conversar sobre o seu caso",
  texto:
    "Conte brevemente a sua situação e agende uma reunião.",
  ctaPrimario: { rotulo: "Agendar uma reunião", destino: "contato" },
  ctaSecundario: { rotulo: "Conversar pelo WhatsApp", destino: "whatsapp" },
};

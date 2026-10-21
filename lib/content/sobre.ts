/** Copy das páginas institucionais: Nosso Escritório, Os Sócios e Conselho Administrativo. */

export interface PaginaSeo {
  title: string;
  description: string;
}

export interface ItemTexto {
  titulo: string;
  descricao?: string;
}

export interface SecaoInstitucional {
  eyebrow: string;
  titulo: string;
  paragrafos: string[];
  itens?: ItemTexto[];
}

export interface PaginaIntro {
  seo: PaginaSeo;
  eyebrow: string;
  titulo: string;
  subtitulo: string;
}

export interface PaginaEscritorio extends PaginaIntro {
  historia: SecaoInstitucional;
  metodo: SecaoInstitucional;
  atuacaoNacional: SecaoInstitucional;
  estrutura: SecaoInstitucional;
  ctaFinal: { titulo: string; texto: string };
}

export interface PaginaConselho extends PaginaIntro {
  intro: string[];
  /** Slug do membro em lib/content/equipe.ts. */
  membros: string[];
}

export const NOSSO_ESCRITORIO: PaginaEscritorio = {
  seo: {
    title: "Nosso Escritório | Nicoli Sociedade de Advogados",
    description:
      "Conheça a Nicoli Sociedade de Advogados: escritório full service em Goiânia, com atuação em todo o Brasil, método de dupla revisão e núcleos especializados.",
  },
  eyebrow: "Quem somos",
  titulo: "Um escritório full service em Goiânia, com atuação em todo o Brasil",
  subtitulo:
    "Profundidade técnica e experiência empresarial para proteger empresas, patrimônios e famílias.",
  historia: {
    eyebrow: "Posicionamento",
    titulo: "Técnica de quem advoga. Visão de quem empreende.",
    paragrafos: [
      "A Nicoli Sociedade de Advogados tem como sócio-fundador Luís Gustavo Nicoli, com mais de 23 anos de advocacia trabalhista e mestre em Direito do Trabalho.",
      "O sócio-fundador é empresário no agronegócio, na construção civil, no mercado imobiliário e em locação, e conhece por dentro as decisões, os riscos e a gestão de pessoas de quem emprega e investe.",
      "O escritório reúne núcleos especializados, com líderes identificados por área, e adota o método de dupla revisão.",
    ],
  },
  metodo: {
    eyebrow: "O método",
    titulo: "Dupla revisão em todas as peças",
    paragrafos: [
      "Toda peça passa pelo advogado relator, por um revisor colega e pela liberação final do sócio.",
    ],
    itens: [
      { titulo: "Advogado relator" },
      { titulo: "Revisor colega" },
      { titulo: "Liberação final do sócio" },
    ],
  },
  atuacaoNacional: {
    eyebrow: "Atuação nacional",
    titulo: "Sede em Goiânia, clientes em todo o Brasil",
    paragrafos: [
      "Escritório full service sediado em Goiânia, com atuação em todo o Brasil e atendimento presencial e remoto.",
    ],
  },
  estrutura: {
    eyebrow: "Estrutura",
    titulo: "Atendimento presencial e remoto",
    paragrafos: [
      "A sede fica na Rua 89, nº 240, Setor Sul, Goiânia/GO. O horário de atendimento é de segunda a sexta, das 8h às 18h.",
    ],
    itens: [
      {
        titulo: "Núcleos especializados",
        descricao:
          "Trabalhista Empregador, Trabalhista Empregado, Cível, Previdenciário e Relacionamento com o Cliente.",
      },
      {
        titulo: "Relacionamento com o cliente",
        descricao:
          "Coordenado por Laíza Cabral, principal responsável pelo atendimento, garantindo que cada cliente seja acompanhado com proximidade, clareza e agilidade.",
      },
    ],
  },
  ctaFinal: {
    titulo: "Conheça o escritório pessoalmente ou de forma remota",
    texto: "Agende uma reunião.",
  },
};

export const OS_SOCIOS: PaginaIntro = {
  seo: {
    title: "Os Sócios | Nicoli Sociedade de Advogados",
    description:
      "Conheça os sócios e coordenadores da Nicoli Sociedade de Advogados, em Goiânia: liderança técnica, núcleos especializados e atuação em todo o Brasil.",
  },
  eyebrow: "Quem somos",
  titulo: "Sócios e coordenadores",
  subtitulo:
    "Núcleos especializados, com líderes identificados por área.",
};

export const CONSELHO_ADMINISTRATIVO: PaginaConselho = {
  seo: {
    title: "Conselho Administrativo | Nicoli Advogados",
    description:
      "Conheça o Conselho Administrativo da Nicoli Sociedade de Advogados, em Goiânia.",
  },
  eyebrow: "Gestão",
  titulo: "Conselho Administrativo",
  subtitulo: "",
  intro: [],
  membros: ["juliana-nicoli"],
};

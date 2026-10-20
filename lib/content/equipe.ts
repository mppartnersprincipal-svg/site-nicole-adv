import type { MembroEquipe } from "@/lib/types";

const foto = (slug: string): string => `/images/equipe/${slug}.webp`;

// Bios e áreas transcritas do briefing preenchido pelo escritório (seção 5). Não acrescentar fatos.
export const EQUIPE: MembroEquipe[] = [
  {
    slug: "luis-gustavo-nicoli",
    nome: "Luís Gustavo Nicoli",
    oab: "OAB/GO 22.300",
    cargo: "Sócio-fundador e CEO",
    nucleo: "Trabalhista Empresarial, com atuação na gestão estratégica de todas as áreas do escritório",
    areas: ["trabalhista-empresarial"],
    bio: "Sócio-fundador e CEO da Nicoli Sociedade de Advogados, com mais de 23 anos de advocacia trabalhista. Mestre em Direito do Trabalho pelo Centro Universitário do Distrito Federal, especialista em Direito e Processo do Trabalho pela Faculdade Anhanguera e Conselheiro Consultivo certificado pela Board Academy. Empresário no agronegócio, na construção civil e no mercado imobiliário, une a técnica jurídica à visão de quem empreende.",
    foto: foto("luis-gustavo-nicoli"),
    grupo: "socios",
  },
  {
    slug: "lucas-resende-telles",
    nome: "Lucas Resende Telles",
    oab: "OAB/GO 53.833",
    cargo: "Sócio",
    nucleo: "Coordenador do Núcleo Trabalhista Empregador",
    areas: ["trabalhista-empresarial"],
    bio: "Advogado e sócio da Nicoli Sociedade de Advogados, com 8 anos de experiência na advocacia trabalhista. Graduado em Direito pela PUC-GO, pós-graduado em Direito e Processo do Trabalho pelo Proordem. Coordena o Núcleo Trabalhista Empregador do escritório, com atuação estratégica na prevenção de riscos, consultoria jurídica e defesa de empresas em demandas trabalhistas.",
    foto: foto("lucas-resende-telles"),
    grupo: "socios",
  },
  {
    slug: "bruna-ferreira",
    nome: "Bruna Ferreira",
    oab: "OAB/GO 64.625",
    cargo: "Sócia de serviço",
    nucleo: "Coordenadora do Núcleo Trabalhista Empregado",
    areas: ["advogado-trabalhista"],
    bio: "Bruna Ferreira Gomes é sócia de serviço da Nicoli Sociedade de Advogados, coordenadora do Núcleo Trabalhista Empregado e pós-graduada em Direito e Processo do Trabalho pelo IGD. É advogada trabalhista dedicada à defesa dos direitos dos trabalhadores e alia técnica jurídica, coordenação estratégica e compromisso com resultados concretos para cada cliente que representa.",
    foto: foto("bruna-ferreira"),
    grupo: "socios",
  },
  {
    slug: "henrique-segatto",
    nome: "Henrique Segatto",
    oab: "OAB/GO 70.104",
    cargo: "Advogado associado",
    nucleo: "Coordenador do Núcleo Cível",
    areas: [
      "direito-civil",
      "familia-e-sucessoes",
      "direito-tributario",
      "holding-e-planejamento-societario",
    ],
    // O briefing traz "mais de 3 experiência" (sem a unidade): número omitido até o escritório confirmar.
    bio: "Advogado associado da Nicoli Sociedade de Advogados, graduado pela Universidade Federal de Goiás (UFG), especialista em Direito Civil e Processo Civil pela ESD e Coordenador da Área Cível da Nicoli Sociedade de Advogados, com experiência na condução de demandas de alta complexidade, elaboração de estratégias processuais e atuação consultiva e contenciosa nas áreas cível, tributária, contratual e do agronegócio.",
    foto: foto("henrique-segatto"),
    grupo: "coordenadores",
  },
  {
    slug: "raul-roudasse",
    nome: "Raul Roudasse",
    oab: "OAB/GO 60.132",
    cargo: "Advogado associado",
    nucleo: "Coordenador do Núcleo Previdenciário",
    areas: ["direito-previdenciario"],
    bio: "Advogado associado da Nicoli Sociedade de Advogados e Coordenador do Núcleo Previdenciário. Pós-graduando em Direito Previdenciário pelo Instituto Goiano de Direito (IGD), possui mais de 8 anos de experiência na área jurídica, com atuação em demandas administrativas e judiciais. Aliando conhecimento técnico à gestão estratégica, dedica-se à defesa dos direitos dos segurados.",
    foto: foto("raul-roudasse"),
    grupo: "coordenadores",
  },
  {
    slug: "laiza-cabral",
    nome: "Laiza Cabral",
    oab: "OAB/GO 70.581",
    cargo: "Advogada",
    nucleo: "Coordenadora do Núcleo de Relacionamento com o Cliente",
    areas: [],
    bio: "Advogada da Nicoli Sociedade de Advogados e pós-graduada em Direito Civil e Processo Civil pela Unità Faculdade/Proordem, Coordenadora do Núcleo de Relacionamento com o Cliente. Laíza é a principal responsável pelo atendimento, garantindo que cada cliente seja acompanhado com proximidade, clareza e agilidade.",
    foto: foto("laiza-cabral"),
    grupo: "coordenadores",
  },
  {
    slug: "juliana-nicoli",
    nome: "Juliana Nicoli",
    cargo: "Diretora Administrativo-Financeira",
    nucleo: "Conselho Administrativo",
    areas: [],
    bio: "Diretora Administrativo-Financeira e integrante do Conselho Administrativo do escritório. Graduada em Administração de Empresas pela UEG (2003) e pós-graduada em Marketing pela Universidade Salgado de Oliveira (2005).",
    foto: foto("juliana-nicoli"),
    grupo: "conselho",
  },
];

export const SOCIOS: MembroEquipe[] = EQUIPE.filter((m) => m.grupo === "socios");
export const COORDENADORES: MembroEquipe[] = EQUIPE.filter((m) => m.grupo === "coordenadores");
export const CONSELHO: MembroEquipe[] = EQUIPE.filter((m) => m.grupo === "conselho");

export function getMembro(slug: string): MembroEquipe | undefined {
  return EQUIPE.find((m) => m.slug === slug);
}

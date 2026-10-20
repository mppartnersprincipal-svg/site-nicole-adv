import type { AreaAtuacao } from "@/lib/types";

export const area: AreaAtuacao = {
  slug: "direito-civil",
  nome: "Direito Civil",
  nomeCurto: "Cível",
  publico: "empresas",
  icone: "civil",
  seo: {
    title: "Advogado Cível em Goiânia | Nicoli Advogados",
    description:
      "Advogado cível em Goiânia: contratos, cobranças, indenizações, direito do consumidor e problemas com imóveis e construtoras. Atendimento presencial e online.",
    keywords: [
      "advogado cível goiânia",
      "advogado direito civil goiânia",
      "advogado atraso de obra goiânia",
      "advogado imobiliário goiânia",
      "advogado indenização dano moral goiânia",
      "advogado cobrança goiânia",
      "advogado direito do consumidor goiânia",
      "vícios construtivos advogado",
    ],
  },
  hero: {
    eyebrow: "Direito Civil · Pessoas e empresas",
    titulo: "Advogado cível em Goiânia para contratos, indenizações e imóveis",
    subtitulo:
      "Quando um contrato é descumprido, um terceiro causa prejuízo ou a compra de um imóvel dá errado, você precisa de análise técnica e de uma estratégia clara.",
    cta: "Analisar meu caso",
  },
  resumo:
    "Na Nicoli Sociedade de Advogados, o advogado cível atua para pessoas físicas e empresas em contratos, cobranças, indenizações por danos materiais e morais, responsabilidade civil, relações de consumo e questões imobiliárias, como compra e venda, atraso de obra e vícios construtivos. A atuação inclui a tentativa de solução extrajudicial, quando indicada. Sede em Goiânia e atuação em todo o Brasil.",
  situacoes: [
    { titulo: "Quando um contrato é descumprido" },
    { titulo: "Quando há prejuízo causado por terceiro" },
    { titulo: "Em problemas na compra de imóvel" },
  ],
  servicos: [
    { titulo: "Contratos" },
    { titulo: "Cobranças" },
    { titulo: "Indenizações por danos materiais e morais" },
    { titulo: "Responsabilidade civil" },
    { titulo: "Relações de consumo" },
    {
      titulo: "Questões imobiliárias",
      descricao: "Compra e venda, atraso de obra e vícios construtivos.",
    },
  ],
  metodo: [
    { titulo: "Análise dos documentos e dos fatos" },
    { titulo: "Avaliação de viabilidade e riscos" },
    { titulo: "Tentativa de solução extrajudicial, quando indicada" },
    { titulo: "Ação judicial com dupla revisão técnica" },
    { titulo: "Acompanhamento com retorno periódico ao cliente" },
  ],
  diferenciais: [
    {
      titulo: "Núcleo Cível",
      descricao: "Coordenado por Henrique Segatto.",
    },
    {
      titulo: "Método de dupla revisão",
      descricao: "Toda peça passa pelo advogado relator, por um revisor colega e pela liberação final do sócio.",
    },
    {
      titulo: "Liderança que também empreende",
      descricao: "O sócio-fundador é empresário na construção civil e no mercado imobiliário.",
    },
  ],
  faq: [],
  responsaveis: ["henrique-segatto"],
  relacionadas: ["direito-empresarial", "contencioso-estrategico", "familia-e-sucessoes"],
  mensagemWhatsapp:
    "Olá! Vim pelo site e gostaria de falar com um especialista em Direito Civil.",
  ctaFinal: {
    titulo: "Entenda seus direitos antes de decidir",
    texto: "Envie um resumo da situação e agende uma reunião com o Núcleo Cível.",
  },
};

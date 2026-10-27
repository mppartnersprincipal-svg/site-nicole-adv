import type { AreaAtuacao } from "@/lib/types";

export const area: AreaAtuacao = {
  slug: "advogado-trabalhista",
  nome: "Direito Trabalhista",
  nomeCurto: "Trabalhista",
  publico: "pessoas",
  icone: "trabalhador",
  seo: {
    title: "Advogado Trabalhista em Goiânia | Nicoli Advogados",
    description:
      "Advogado trabalhista em Goiânia para trabalhadores: verbas rescisórias, horas extras, vínculo, acidente e assédio. Atendimento online. Fale pelo WhatsApp.",
    keywords: [
      "advogado trabalhista goiânia",
      "advogado trabalhista em goiânia",
      "advogado trabalhista para trabalhador",
      "advogado verbas rescisórias",
      "advogado horas extras goiânia",
      "advogado acidente de trabalho goiânia",
      "advogado assédio moral no trabalho",
      "reconhecimento de vínculo empregatício",
    ],
  },
  hero: {
    eyebrow: "Trabalhista · Direitos do trabalhador",
    titulo: "Advogado trabalhista para defender seus direitos",
    subtitulo:
      "Foi demitido, tem verbas não pagas ou sofreu acidente, doença ou assédio no trabalho? Analisamos seus documentos e explicamos com clareza o que pode ser feito.",
    cta: "Analisar meu caso",
  },
  resumo:
    "Na Nicoli Sociedade de Advogados, o Núcleo Trabalhista Empregado atende trabalhadores em verbas rescisórias, horas extras, reconhecimento de vínculo, acidente e doença do trabalho, assédio moral e demais direitos nas relações de trabalho. O atendimento inicial é, de preferência, virtual, com análise dos documentos e cálculo preliminar. Sede em Goiânia e atuação em todo o Brasil.",
  situacoes: [
    { titulo: "Após a demissão" },
    { titulo: "Quando há direitos não pagos" },
    { titulo: "Em casos de acidente, doença ou assédio no trabalho" },
  ],
  servicos: [
    { titulo: "Verbas rescisórias" },
    { titulo: "Horas extras" },
    { titulo: "Reconhecimento de vínculo" },
    { titulo: "Acidente e doença do trabalho" },
    { titulo: "Assédio moral" },
    { titulo: "Demais direitos nas relações de trabalho" },
  ],
  metodo: [
    { titulo: "Atendimento inicial, de preferência virtual" },
    { titulo: "Análise dos documentos e cálculo preliminar" },
    { titulo: "Orientação sobre viabilidade e riscos" },
    { titulo: "Ação judicial com dupla revisão técnica" },
    { titulo: "Acompanhamento e comunicação a cada etapa do processo" },
  ],
  diferenciais: [
    {
      titulo: "Núcleo Trabalhista Empregado",
      descricao: "Coordenado por Bruna Ferreira.",
    },
    {
      titulo: "Mais de 23 anos de advocacia trabalhista",
      descricao: "Do sócio-fundador, mestre em Direito do Trabalho.",
    },
    {
      titulo: "Atendimento virtual",
      descricao: "O atendimento inicial é, de preferência, virtual.",
    },
  ],
  faq: [],
  responsaveis: ["bruna-ferreira"],
  relacionadas: ["direito-previdenciario", "direito-da-saude", "direito-civil"],
  mensagemWhatsapp:
    "Olá! Vim pelo site e gostaria de falar com um advogado trabalhista sobre os meus direitos.",
  ctaFinal: {
    titulo: "Entenda quais são os seus direitos",
    texto: "Envie uma mensagem com um resumo do que aconteceu ao Núcleo Trabalhista Empregado.",
  },
};

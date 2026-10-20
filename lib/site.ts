/** Dados institucionais (NAP). Fonte única para header, footer, schema e contato. */

export const SITE = {
  nome: "Nicoli Sociedade de Advogados",
  nomeCurto: "Nicoli Advogados",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nicoliadvogados.adv.br",
  slogan: "Técnica de quem advoga. Visão de quem empreende.",
  assinatura: "Tradição e modernidade a serviço dos nossos clientes.",
  descricao:
    "Escritório full service em Goiânia, com atuação em todo o Brasil, que une profundidade técnica e experiência empresarial para proteger empresas, patrimônios e famílias.",
  cnpj: "28.415.182/0001-80",
  endereco: {
    rua: "Rua 89, nº 240",
    bairro: "Setor Sul",
    cidade: "Goiânia",
    uf: "GO",
    cep: "74093-140",
    pais: "BR",
    geo: { lat: -16.6919, lng: -49.2559 },
  },
  horario: "Segunda a sexta, das 8h às 18h",
  telefone: { exibicao: "(62) 3412-2828", e164: "+556234122828" },
  whatsapp: { exibicao: "(62) 99570-0037", numero: "5562995700037" },
  email: "luis.gustavo@nicoliadvogados.adv.br",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Nicoli+Sociedade+de+Advogados+Rua+89+240+Setor+Sul+Goi%C3%A2nia+GO+74093-140",
  /** Embed sem chave de API; a busca pelo nome faz o pin abrir o perfil do escritório no Google. */
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Nicoli+Sociedade+de+Advogados,+Rua+89,+240,+Setor+Sul,+Goi%C3%A2nia+-+GO,+74093-140&hl=pt-BR&z=16&output=embed",
  googleReviewsUrl:
    process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL ??
    "https://www.google.com/search?q=Nicoli+Sociedade+de+Advogados+Goi%C3%A2nia",
  redes: {
    instagram: "https://instagram.com/nicoliadv",
    linkedin: "https://linkedin.com/company/nicoli-advogados",
    facebook: "https://facebook.com/nicoliadv",
    tiktok: "https://tiktok.com/@nicoliadv",
    youtube: "https://youtube.com/@nicoliadv",
  },
  dpo: { nome: "Luis Gustavo Nicoli", email: "luis.gustavo@nicoliadvogados.adv.br" },
} as const;

export const MENSAGEM_WHATSAPP_PADRAO =
  "Olá! Vim pelo site da Nicoli Advogados e gostaria de agendar uma conversa.";

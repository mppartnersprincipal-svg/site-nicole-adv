// Avaliações reais do Google Business Profile, transcritas na íntegra em 20/10/2026 (ordem "Mais relevantes").
// Ficaram de fora, por conformidade com o Provimento 205/2021 da OAB, as que trazem superlativo
// ("melhor escritório do país") ou mencionam resultado de processo ("sentença homologada", "comprometido com resultados").

import type { Avaliacao } from "@/lib/types";

/** Nota média e total exibidos no perfil do Google na data da coleta. */
export const RESUMO_GOOGLE = { nota: 5, total: 455 } as const;

export const AVALIACOES: Avaliacao[] = [
  {
    autor: "Selma Motta",
    texto:
      "Me senti a vontade; entendi todos os questionamentos por mim apresentados,fui correspondida e pretendo ter essa acessória jurídica por muitos anos! Obrigada.",
    nota: 5,
    quando: "há 2 meses",
  },
  {
    autor: "Filipe Viero",
    texto:
      "Parabéns ao Dr. Luís Gustavo e ao Dr. Henrique, pela recepção e pela reunião, onde iniciamos a jornada na segurança jurídica da minha empresa. Equipe multidisciplinar e estrutura física de excelência.",
    nota: 5,
    quando: "há 7 meses",
  },
  {
    autor: "Gislene Szk",
    texto:
      "Confiamos cegamente no escritório do Dr.Luiz Gustavo , sempre que precisamos de orientações ou processos judiciais sempre procuramos o escritório antes de tomar qualquer decisão!!! O Doutor e todo escritório estão de parabéns, são de profissionais atenciosos, educados, empatia em primeiro lugar e acima de tudo competentes no que fazem !!! Muito obrigada por tudo !!!!!!!",
    nota: 5,
    quando: "há 9 meses",
  },
  {
    autor: "ananda afonso",
    texto: "Muito atenciosos, gostei muito da abordagem muita acolhedor, a agradeço toda equipe!",
    nota: 5,
    quando: "há 5 meses",
  },
  {
    autor: "André Tavares",
    texto:
      "Uma experiência única! É muito satisfatório ser atendido pelo Dr Luiz Gustavo da maneira que fui hoje em seu escritório me deixa muito grato! Um atendimento de excelência do agendamento até o fina! Obrigado Gustavo.",
    nota: 5,
    quando: "há 11 meses",
  },
  {
    autor: "Leonardo Cheruti",
    texto:
      "Ótima, transmite 100% de confiança no trabalho exercido no local, creio que iremos ser felizes no nosso trajeto.",
    nota: 5,
    quando: "há 6 meses",
  },
  {
    autor: "Rafael Guimarães",
    texto:
      "Minha experiência está sendo excelente. Os profissionais são super competentes. Indico para todos a Nicoli Sociedade de Advogados.",
    nota: 5,
    quando: "há 5 meses",
  },
];

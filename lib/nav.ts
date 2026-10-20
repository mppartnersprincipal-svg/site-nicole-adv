import type { Publico } from "@/lib/types";

/** Índice leve de navegação (evita levar a copy completa das áreas para o bundle do cliente). */

export interface ItemArea {
  slug: string;
  nome: string;
  icone: string;
  publico: Publico;
}

export const AREAS_NAV: ItemArea[] = [
  { slug: "direito-empresarial", nome: "Empresarial", icone: "empresa", publico: "empresas" },
  { slug: "trabalhista-empresarial", nome: "Trabalhista Empresarial", icone: "trabalho-empresa", publico: "empresas" },
  { slug: "direito-civil", nome: "Cível", icone: "civil", publico: "empresas" },
  { slug: "agronegocio", nome: "Agronegócio", icone: "agro", publico: "empresas" },
  { slug: "direito-tributario", nome: "Tributário", icone: "tributario", publico: "empresas" },
  { slug: "holding-e-planejamento-societario", nome: "Holdings e Planejamento Societário", icone: "holding", publico: "empresas" },
  { slug: "contencioso-estrategico", nome: "Contencioso Estratégico", icone: "contencioso", publico: "empresas" },
  { slug: "advogado-trabalhista", nome: "Trabalhista", icone: "trabalhador", publico: "pessoas" },
  { slug: "familia-e-sucessoes", nome: "Família e Sucessões", icone: "familia", publico: "pessoas" },
  { slug: "direito-da-saude", nome: "Saúde", icone: "saude", publico: "pessoas" },
  { slug: "direito-previdenciario", nome: "Previdenciário", icone: "previdencia", publico: "pessoas" },
];

export const rotaArea = (slug: string): string => `/areas-de-atuacao/${slug}`;

export const MENU_PRINCIPAL = [
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/areas-de-atuacao", label: "Áreas de atuação", temSubmenu: true },
  { href: "/quem-somos#socios", label: "Equipe" },
  { href: "/blog", label: "Blog & Mídias" },
  { href: "/contato", label: "Contato" },
] as const;

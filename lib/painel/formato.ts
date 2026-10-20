/**
 * Formatação e rótulos do painel em pt-BR. Puro (sem DOM): testado em tests/painel-formato.test.mjs.
 */
import { AREAS_NAV } from "@/lib/nav";

const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const compacto = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const porcento = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

export function numero(v: number): string {
  if (Math.abs(v) >= 10_000) return compacto.format(v);
  return Number.isInteger(v) ? inteiro.format(v) : decimal.format(v);
}

export function moeda(v: number | null, codigo = "BRL"): string {
  if (v === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: codigo }).format(v);
}

export function percentual(v: number | null): string {
  return v === null ? "—" : porcento.format(v);
}

export function duracao(segundos: number): string {
  const s = Math.round(segundos);
  const min = Math.floor(s / 60);
  return min > 0 ? `${min}min ${String(s % 60).padStart(2, "0")}s` : `${s}s`;
}

/** "2026-10-19" → "19/10" */
export function diaCurto(ymd: string): string {
  return `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`;
}

export type Direcao = "subir" | "descer" | "neutro";
export interface Variacao {
  texto: string;
  tom: "bom" | "ruim" | "neutro";
}

/**
 * Variação contra o período anterior. `bom` diz para qual lado é boa notícia
 * (custo por conversão: "descer"; investimento: "neutro").
 */
export function variacao(atual: number | null, anterior: number | null, bom: Direcao = "subir"): Variacao | null {
  if (atual === null || anterior === null) return null;
  if (anterior === 0) return atual === 0 ? null : { texto: "novo no período", tom: "neutro" };
  const delta = (atual - anterior) / Math.abs(anterior);
  if (Math.abs(delta) < 0.005) return { texto: "estável", tom: "neutro" };
  const sinal = delta > 0 ? "+" : "−";
  const texto = `${sinal}${porcento.format(Math.abs(delta))}`;
  if (bom === "neutro") return { texto, tom: "neutro" };
  const melhorou = (delta > 0) === (bom === "subir");
  return { texto, tom: melhorou ? "bom" : "ruim" };
}

const NOMES_AREA = new Map(AREAS_NAV.map((a) => [`/areas-de-atuacao/${a.slug}`, a.nome]));

/** Caminho → nome legível (áreas de atuação viram o nome da área). */
export function nomePagina(path: string): string {
  const limpo = path.split("?")[0].replace(/\/+$/, "") || "/";
  if (limpo === "/") return "Página inicial";
  const area = NOMES_AREA.get(limpo);
  if (area) return `Área · ${area}`;
  if (limpo === "/areas-de-atuacao") return "Áreas de atuação";
  if (limpo.startsWith("/blog/")) return `Blog · ${limpo.slice(6).replace(/-/g, " ")}`;
  if (limpo === "/blog") return "Blog";
  if (limpo === "/contato") return "Contato";
  if (limpo.startsWith("/quem-somos")) return limpo === "/quem-somos" ? "Quem somos" : `Equipe · ${limpo.slice(12).replace(/-/g, " ")}`;
  return limpo;
}

const CANAIS: Record<string, string> = {
  "Paid Search": "Pesquisa paga (Google Ads)",
  "Organic Search": "Busca orgânica",
  Direct: "Direto",
  "Organic Social": "Redes sociais",
  "Paid Social": "Redes sociais pagas",
  Referral: "Outros sites",
  "Organic Maps": "Google Maps",
  "Cross-network": "Google Ads (várias redes)",
  Display: "Display",
  "Paid Video": "Vídeo pago",
  "Organic Video": "Vídeo orgânico",
  Email: "E-mail",
  Unassigned: "Não atribuído",
};

export const nomeCanal = (canal: string): string => CANAIS[canal] ?? canal;

const DISPOSITIVOS: Record<string, string> = { mobile: "Celular", desktop: "Computador", tablet: "Tablet" };
export const nomeDispositivo = (d: string): string => DISPOSITIVOS[d] ?? d;

export const EVENTOS: Record<string, string> = {
  generate_lead: "Formulário enviado (lead)",
  click_whatsapp: "Clique no WhatsApp",
  click_phone: "Clique no telefone",
  form_start: "Começou a preencher o formulário",
  form_submit: "Envio do formulário",
  click_email: "Clique no e-mail",
  click_cta: "Clique em botão de chamada",
  blog_read: "Leitura de artigo do blog",
};

const STATUS_CAMPANHA: Record<string, string> = { ENABLED: "Ativa", PAUSED: "Pausada", REMOVED: "Removida" };
export const nomeStatus = (s: string): string => STATUS_CAMPANHA[s] ?? "—";

/**
 * Tipos das linhas das funções `nicoli_*` (supabase/migrations/0001_nicoli_analytics.sql),
 * rótulos humanos e formatação pt-BR do painel. Sem dependência de servidor: o client importa daqui.
 * Porte de lib/analytics-types.ts da Sólida.
 */
import { AREAS_NAV } from "@/lib/nav";
import type { Canal } from "./canal";

export type { Canal };

export interface KpisRow {
  sessions: number;
  page_views: number;
  avg_session_ms: number;
  avg_page_ms: number;
  wa_clicks: number;
  phone_clicks: number;
  leads: number;
  contact_sessions: number;
  conv_rate: number;
}
export interface DailyRow { day: string; sessions: number; page_views: number; contacts: number }
export interface HeatmapRow { dow: number; hour: number; sessions: number }
export interface ChannelRow { channel: Canal; sessions: number; contacts: number }
export interface DeviceRow { device: string; sessions: number }
export interface PageRow { path: string; title: string | null; views: number; avg_ms: number; avg_scroll: number; contacts: number }
export interface GeoRow { country: string | null; region: string | null; city: string | null; sessions: number; contacts: number }
export interface CampaignRow {
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  sessions: number;
  contacts: number;
  conv_rate: number | null;
}
export type TipoContato = "click_whatsapp" | "click_phone" | "generate_lead";
export interface ContactRow { kind: TipoContato; area: string | null; location: string | null; channel: Canal; clicks: number; sessions: number }
export interface ClickRow { label: string | null; tag: string | null; href: string | null; clicks: number; sessions: number }
export interface BlogRow { path: string; title: string | null; views: number; reads: number; avg_ms: number; avg_scroll: number }
export interface FunnelRow { step: string; sessions: number }
export interface VisitorRow { kind: "new" | "returning" | "unknown"; sessions: number; contacts: number }
export interface ConsentRow { choice: "accepted" | "essential" | "none"; sessions: number }
export type Params = Record<string, string | number | boolean>;
export interface TrailEvent { ts: string; name: string; path: string; title: string | null; params: Params }
export interface JourneyRow {
  id: string;
  started_at: string;
  last_seen_at: string;
  channel: Canal;
  utm_campaign: string | null;
  utm_term: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  region: string | null;
  city: string | null;
  landing_path: string;
  referrer_host: string | null;
  converted: boolean;
  is_returning: boolean;
  trail: TrailEvent[];
}
export interface RecentRow {
  ts: string;
  session_id: string;
  name: string;
  path: string;
  params: Params;
  channel: Canal;
  device: string | null;
  city: string | null;
  region: string | null;
}

/* ---------- Rótulos ---------- */

export const CHANNEL_LABELS: Record<Canal, string> = {
  google_ads: "Google Ads",
  google_organic: "Google orgânico",
  other_search: "Outros buscadores",
  social: "Redes sociais",
  referral: "Outros sites",
  direct: "Direto",
};
export const CHANNEL_ORDER: Canal[] = ["google_ads", "google_organic", "other_search", "social", "referral", "direct"];

export const DEVICE_LABELS: Record<string, string> = {
  mobile: "Celular",
  tablet: "Tablet",
  desktop: "Computador",
  desconhecido: "Desconhecido",
};

export const VISITOR_LABELS: Record<string, string> = {
  new: "Primeira visita",
  returning: "Já visitou antes",
  unknown: "Sem identificação (não aceitou cookies)",
};
export const CONSENT_LABELS: Record<string, string> = {
  accepted: "Aceitou cookies de análise",
  essential: "Recusou",
  none: "Não respondeu",
};

export const CONTACT_LABELS: Record<TipoContato, string> = {
  click_whatsapp: "WhatsApp",
  click_phone: "Telefone",
  generate_lead: "Formulário",
};

export const FUNNEL_LABELS: Record<string, string> = {
  page_view: "Visitou o site",
  contact: "Entrou em contato (WhatsApp, telefone ou formulário)",
  form_start: "Começou a preencher o formulário",
  generate_lead: "Enviou o formulário",
};

/** link_location (data-track-location / data-section / form_id) → onde o clique aconteceu */
export const LOCATION_LABELS: Record<string, string> = {
  floating: "Botão flutuante",
  header: "Cabeçalho",
  "menu-mobile": "Menu (celular)",
  "barra-mobile": "Barra fixa (celular)",
  footer: "Rodapé",
  menu: "Menu",
  conteudo: "Meio do conteúdo",
  contato: "Página Contato",
  "home-hero": "Topo da Home",
  "home-areas": "Áreas na Home",
  "area-hero": "Topo da página de área",
  "area-faq": "Perguntas da página de área",
  "lead-form-confirmacao": "Confirmação do formulário",
  formulario: "Formulário",
};

export const EVENT_LABELS: Record<string, string> = {
  page_view: "Abriu página",
  page_leave: "Saiu da página",
  click: "Clique",
  click_whatsapp: "Clicou no WhatsApp",
  click_phone: "Clicou no telefone",
  click_email: "Clicou no e-mail",
  click_cta: "Clicou em botão de chamada",
  generate_lead: "Enviou o formulário",
  form_start: "Começou o formulário",
  blog_read: "Leu artigo do blog",
  consent_update: "Respondeu o banner de cookies",
};

export const PAGE_LABELS: Record<string, string> = {
  "/": "Página inicial",
  "/areas-de-atuacao": "Áreas de atuação",
  "/quem-somos": "Quem somos",
  "/contato": "Contato",
  "/blog": "Blog",
  "/politica-de-privacidade": "Política de privacidade",
  "/lgpd-dados-pessoais": "LGPD",
};

const NOME_AREA = new Map(AREAS_NAV.map((a) => [a.slug, a.nome]));
const SUFIXO_TITULO = / \| Nicoli( Advogados| Sociedade de Advogados)?$/;

export function labelChannel(c: string | null | undefined): string {
  return (c && CHANNEL_LABELS[c as Canal]) || c || "—";
}
export function labelDevice(d: string | null | undefined): string {
  return (d && DEVICE_LABELS[d]) || d || "Desconhecido";
}
export function labelArea(slug: string | null | undefined): string {
  if (!slug) return "Fora das áreas";
  return NOME_AREA.get(slug) ?? slug;
}
export function labelLocation(l: string | null | undefined): string {
  if (!l) return "—";
  if (LOCATION_LABELS[l]) return LOCATION_LABELS[l];
  if (l.startsWith("form-")) return "Formulário";
  return l.replace(/-/g, " ");
}
export function labelEvent(n: string): string {
  return EVENT_LABELS[n] ?? n;
}
export function labelPage(path: string, title?: string | null): string {
  const limpo = path.replace(/\/+$/, "") || "/";
  if (PAGE_LABELS[limpo]) return PAGE_LABELS[limpo];
  const area = limpo.startsWith("/areas-de-atuacao/") ? NOME_AREA.get(limpo.split("/")[2]) : undefined;
  if (area) return `Área · ${area}`;
  return title ? title.replace(SUFIXO_TITULO, "") : limpo;
}

/* ---------- Formatação pt-BR ---------- */

const nf = new Intl.NumberFormat("pt-BR");
export function fmtInt(n: number | null | undefined): string {
  return nf.format(Math.round(Number(n ?? 0)));
}
export function fmtPct(n: number | null | undefined, digits = 1): string {
  return `${Number(n ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: digits })}%`;
}
/** 4200 → "4 s"; 75000 → "1 min 15 s" */
export function fmtDuration(ms: number | null | undefined): string {
  const s = Math.round(Number(ms ?? 0) / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return r ? `${m} min ${r} s` : `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
const TZ = "America/Sao_Paulo";
export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
export function fmtDay(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "short" });
}

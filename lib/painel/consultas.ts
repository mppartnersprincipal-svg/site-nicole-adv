import "server-only";
import type { Intervalo } from "./filtro";
import { supabaseServidor } from "./supabase";
import type {
  BlogRow,
  CampaignRow,
  ChannelRow,
  ClickRow,
  ConsentRow,
  ContactRow,
  DailyRow,
  DeviceRow,
  FunnelRow,
  GeoRow,
  HeatmapRow,
  JourneyRow,
  KpisRow,
  PageRow,
  RecentRow,
  VisitorRow,
} from "./rotulos";

/**
 * Leitura do painel: funções SQL `nicoli_*` via RPC com o service role (só servidor).
 * Porte de lib/analytics-queries.ts da Sólida. Erro ou banco não configurado → lista vazia.
 */

type Args = Record<string, string | number | boolean | null>;

export const bancoConfigurado = (): boolean => supabaseServidor() !== null;

async function rpc<T>(fn: string, args: Args): Promise<T[]> {
  const supabase = supabaseServidor();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    console.error(`[painel] ${fn}:`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

const periodo = (r: Intervalo): Args => ({ p_from: r.from.toISOString(), p_to: r.to.toISOString() });
const base = (r: Intervalo): Args => ({ ...periodo(r), p_channel: r.channel });

const KPIS_ZERADOS: KpisRow = {
  sessions: 0,
  page_views: 0,
  avg_session_ms: 0,
  avg_page_ms: 0,
  wa_clicks: 0,
  phone_clicks: 0,
  leads: 0,
  contact_sessions: 0,
  conv_rate: 0,
};

export async function getKpis(r: Intervalo): Promise<KpisRow> {
  const rows = await rpc<KpisRow>("nicoli_kpis", base(r));
  return rows[0] ?? KPIS_ZERADOS;
}
export const getDaily = (r: Intervalo) => rpc<DailyRow>("nicoli_daily", base(r));
export const getHeatmap = (r: Intervalo) => rpc<HeatmapRow>("nicoli_heatmap", base(r));
export const getByChannel = (r: Intervalo) => rpc<ChannelRow>("nicoli_by_channel", periodo(r));
export const getByDevice = (r: Intervalo) => rpc<DeviceRow>("nicoli_by_device", base(r));
export const getTopPages = (r: Intervalo, limit = 20) => rpc<PageRow>("nicoli_top_pages", { ...base(r), p_limit: limit });
export const getGeo = (r: Intervalo, limit = 30) => rpc<GeoRow>("nicoli_geo", { ...base(r), p_limit: limit });
export const getCampaigns = (r: Intervalo) => rpc<CampaignRow>("nicoli_campaigns", periodo(r));
export const getContacts = (r: Intervalo) => rpc<ContactRow>("nicoli_contacts", base(r));
export const getClicks = (r: Intervalo, limit = 30) => rpc<ClickRow>("nicoli_clicks", { ...base(r), p_limit: limit });
export const getBlog = (r: Intervalo, limit = 20) => rpc<BlogRow>("nicoli_blog", { ...base(r), p_limit: limit });
export const getFunnel = (r: Intervalo) => rpc<FunnelRow>("nicoli_funnel", base(r));
export const getJourneys = (r: Intervalo, onlyConverted = true, limit = 50) =>
  rpc<JourneyRow>("nicoli_journeys", { ...base(r), p_only_converted: onlyConverted, p_limit: limit });
export const getRecent = (limit = 40) => rpc<RecentRow>("nicoli_recent", { p_limit: limit });
export const getVisitors = (r: Intervalo) => rpc<VisitorRow>("nicoli_visitors", base(r));
export const getConsent = (r: Intervalo) => rpc<ConsentRow>("nicoli_consent", periodo(r));

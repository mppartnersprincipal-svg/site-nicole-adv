/**
 * Tipos compartilhados do painel (/dashboard). Sem dependência de Node: o client importa daqui.
 * Toda resposta de integração tem `status`: "ready" (dados), "not_configured" (faltam variáveis)
 * ou "error" (mensagem segura, nunca o payload do provedor).
 */

export interface RelatorioIndisponivel {
  status: "not_configured" | "error";
  message: string;
}

/* ------------------------------------------------------------------ */
/* GA4                                                                 */
/* ------------------------------------------------------------------ */

export interface Ga4Totais {
  sessions: number;
  users: number;
  newUsers: number;
  engagementRate: number;
  averageSessionDuration: number;
  keyEvents: number;
  keyEventRate: number | null;
}

export interface Ga4Linha {
  key: string;
  sessions: number;
  users: number;
  keyEvents: number;
}

export interface Ga4Evento {
  name: string;
  count: number;
  previous: number;
}

/** Contatos (generate_lead, click_whatsapp, click_phone) agrupados pela página onde aconteceram. */
export interface Ga4ContatosPagina {
  path: string;
  generate_lead: number;
  click_whatsapp: number;
  click_phone: number;
  total: number;
}

export interface Ga4Relatorio {
  status: "ready";
  propertyId: string;
  from: string;
  to: string;
  timeZone: string | null;
  thresholded: boolean;
  totals: Ga4Totais;
  previous: Ga4Totais;
  daily: { date: string; sessions: number; keyEvents: number }[];
  channels: Ga4Linha[];
  landingPages: Ga4Linha[];
  devices: Ga4Linha[];
  events: Ga4Evento[];
  contactPages: Ga4ContatosPagina[];
  fetchedAt: string;
}

export type Ga4Resposta = Ga4Relatorio | RelatorioIndisponivel;

/* ------------------------------------------------------------------ */
/* Google Ads                                                          */
/* ------------------------------------------------------------------ */

export interface AdsMetricas {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number | null;
  averageCpc: number | null;
  costPerConversion: number | null;
}

export interface AdsCampanha extends AdsMetricas {
  id: string;
  name: string;
  status: string;
}

export interface AdsConversao {
  name: string;
  conversions: number;
}

export interface AdsRelatorio {
  status: "ready";
  customer: { id: string; name: string; currencyCode: string; timeZone: string };
  from: string;
  to: string;
  totals: AdsMetricas;
  previous: AdsMetricas;
  daily: { date: string; cost: number; clicks: number; conversions: number }[];
  campaigns: AdsCampanha[];
  conversionActions: AdsConversao[];
  fetchedAt: string;
}

export type AdsResposta = AdsRelatorio | RelatorioIndisponivel;

/**
 * Paleta dos gráficos do painel (cores da Nicoli). O Recharts recebe cor por prop, então usamos os
 * hex dos tokens de app/globals.css. Porte de chartTheme.ts da Sólida.
 */
export const CHART = {
  ink: "#1e1a18",
  brand: "#530103",
  brandSoft: "#c9a19e",
  champanhe: "#c4a27a",
  whatsapp: "#1f7a4d",
  muted: "#5c534e",
  line: "#e3dacd",
  surfaceAlt: "#f2ece3",
  blue: "#3f6e8c",
  violet: "#7a5a8c",
  teal: "#3f8578",
} as const;

/** Sequência categórica fixa (donuts/barras com várias séries). */
export const CATEGORICAL = [
  CHART.brand,
  CHART.ink,
  CHART.champanhe,
  CHART.whatsapp,
  CHART.blue,
  CHART.violet,
  CHART.teal,
  CHART.muted,
];

/** Cor fixa por canal: a origem tem sempre a mesma cor em todo o painel. */
export const CHANNEL_COLORS: Record<string, string> = {
  google_ads: CHART.brand,
  google_organic: CHART.ink,
  other_search: CHART.blue,
  social: CHART.violet,
  referral: CHART.champanhe,
  direct: CHART.muted,
};

export const DEVICE_COLORS: Record<string, string> = {
  mobile: CHART.brand,
  desktop: CHART.ink,
  tablet: CHART.champanhe,
  desconhecido: CHART.muted,
};

export const CONTACT_COLORS: Record<string, string> = {
  click_whatsapp: CHART.whatsapp,
  generate_lead: CHART.brand,
  click_phone: CHART.champanhe,
};

export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 4,
    border: `1px solid ${CHART.line}`,
    boxShadow: "0 8px 24px rgba(30,26,24,0.08)",
    fontSize: 13,
    fontFamily: "var(--font-jost), system-ui, sans-serif",
  },
  labelStyle: { color: CHART.ink, fontWeight: 600 },
  itemStyle: { color: "#3d3532" },
};

/**
 * Período e origem do painel, vindos da URL (?periodo=hoje|7d|30d|90d|custom&de=&ate=&origem=).
 * Puro (testado em tests/painel-filtro.test.mjs). Porte de getRange/previousRange da Sólida.
 */
import { CANAIS, type Canal } from "./canal";

export type Periodo = "hoje" | "7d" | "30d" | "90d" | "custom";

export interface Intervalo {
  period: Periodo;
  from: Date;
  to: Date;
  /** null = todas as origens */
  channel: Canal | null;
  label: string;
  de?: string;
  ate?: string;
}

export type SearchParams = Record<string, string | string[] | undefined>;

const TZ = "America/Sao_Paulo";
const DIA_MS = 24 * 3600 * 1000;
const DIAS_MAX = 400;

/** Meia-noite de Brasília (UTC-3 fixo desde 2019) do dia de `d`, deslocado em `offsetDias`. */
function meiaNoiteBr(d: Date, offsetDias = 0): Date {
  const [y, m, dia] = d.toLocaleDateString("en-CA", { timeZone: TZ }).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dia + offsetDias, 3, 0, 0));
}

function lerYmd(s: string | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const data = new Date(Date.UTC(y, m - 1, d, 3, 0, 0));
  return Number.isNaN(data.getTime()) || data.getUTCDate() !== d ? null : data;
}

const fmtBr = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" });

export function umValor(sp: SearchParams, k: string): string | undefined {
  const v = sp[k];
  return Array.isArray(v) ? v[0] : v;
}

export function lerIntervalo(sp: SearchParams, agora: Date = new Date()): Intervalo {
  const periodo = umValor(sp, "periodo");
  const origem = umValor(sp, "origem");
  const channel = CANAIS.includes(origem as Canal) ? (origem as Canal) : null;
  const amanha = meiaNoiteBr(agora, 1);

  if (periodo === "custom") {
    const from = lerYmd(umValor(sp, "de"));
    const ateDia = lerYmd(umValor(sp, "ate"));
    if (from && ateDia && from <= ateDia && (ateDia.getTime() - from.getTime()) / DIA_MS < DIAS_MAX) {
      const to = new Date(Math.min(ateDia.getTime() + DIA_MS, amanha.getTime()));
      return {
        period: "custom",
        from,
        to,
        channel,
        label: `${fmtBr(from)} a ${fmtBr(ateDia)}`,
        de: umValor(sp, "de"),
        ate: umValor(sp, "ate"),
      };
    }
  }
  if (periodo === "hoje") return { period: "hoje", from: meiaNoiteBr(agora), to: amanha, channel, label: "Hoje" };
  const dias = periodo === "7d" ? 7 : periodo === "90d" ? 90 : 30;
  const period: Periodo = periodo === "7d" ? "7d" : periodo === "90d" ? "90d" : "30d";
  return { period, from: meiaNoiteBr(agora, -(dias - 1)), to: amanha, channel, label: `Últimos ${dias} dias` };
}

/** Mesmo tamanho de janela, imediatamente antes (deltas dos KPIs). */
export function intervaloAnterior(r: Intervalo): Intervalo {
  const len = r.to.getTime() - r.from.getTime();
  return { ...r, from: new Date(r.from.getTime() - len), to: r.from, label: "período anterior" };
}

/** Query string atual com alterações (links que preservam os filtros). */
export function comParams(sp: SearchParams, mudancas: Record<string, string | null>): string {
  const p = new URLSearchParams();
  for (const k of Object.keys(sp)) {
    const v = umValor(sp, k);
    if (v) p.set(k, v);
  }
  for (const [k, v] of Object.entries(mudancas)) {
    if (v === null) p.delete(k);
    else p.set(k, v);
  }
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

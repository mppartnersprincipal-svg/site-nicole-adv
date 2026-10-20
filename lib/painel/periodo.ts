/**
 * Período do painel (?de=YYYY-MM-DD&ate=YYYY-MM-DD) no fuso de Goiânia.
 * Início inclusivo e término exclusivo (meia-noite local), mais o período anterior de mesmo tamanho.
 * Portado do template lp-tracking-dashboard (api/_lib/period.js).
 */

export const TZ_OFFSET_MS = -3 * 60 * 60 * 1000; // America/Sao_Paulo (sem horário de verão)
const YMD = /^\d{4}-\d{2}-\d{2}$/;
const DIA_MS = 86_400_000;
export const DIAS_PADRAO = 30;
export const DIAS_MAX = 400;

export interface Periodo {
  de: string;
  ate: string;
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
  days: number;
}

function ymdValido(v: string | null | undefined): v is string {
  if (!v || !YMD.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
}

export function dataLocal(d: Date): string {
  return new Date(d.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10);
}

export function inicioLocal(ymd: string): Date {
  return new Date(new Date(`${ymd}T00:00:00Z`).getTime() - TZ_OFFSET_MS);
}

export function somarDias(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function periodo(q: { de?: string | null; ate?: string | null } = {}, agora: Date = new Date()): Periodo {
  const hoje = dataLocal(agora);
  const ate = ymdValido(q.ate) && q.ate <= hoje ? q.ate : hoje;
  let de = ymdValido(q.de) && q.de <= ate ? q.de : somarDias(ate, -(DIAS_PADRAO - 1));
  if (de < somarDias(ate, -(DIAS_MAX - 1))) de = somarDias(ate, -(DIAS_MAX - 1));
  const from = inicioLocal(de);
  const to = inicioLocal(somarDias(ate, 1));
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / DIA_MS));
  return { de, ate, from, to, prevFrom: new Date(from.getTime() - days * DIA_MS), prevTo: from, days };
}

/** Data (YYYY-MM-DD) no fuso do painel; usada nas consultas ao GA4 e ao Google Ads. */
export function dataNoPainel(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** O painel usa término exclusivo; GA4 e GAQL incluem os dois dias. */
export function intervaloInclusivo(from: Date, to: Date): { inicio: string; fim: string } {
  return { inicio: dataNoPainel(from), fim: dataNoPainel(new Date(to.getTime() - 1)) };
}

export function intervaloValido(from: unknown, to: unknown): boolean {
  return (
    from instanceof Date &&
    to instanceof Date &&
    Number.isFinite(from.getTime()) &&
    Number.isFinite(to.getTime()) &&
    from < to
  );
}

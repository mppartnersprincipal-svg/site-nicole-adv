"use client";

import { useState } from "react";
import type { AdsCampanha } from "@/lib/painel/tipos";

interface CampanhaSelecionadaProps {
  campanhas: AdsCampanha[];
  currencyCode: string;
}

const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const porcento = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 2 });

const GRUPOS = [
  { status: "ENABLED", label: "Ativas", pill: "bg-whatsapp/10 text-whatsapp", singular: "Ativa" },
  { status: "PAUSED", label: "Pausadas", pill: "bg-surface-alt text-ink-muted", singular: "Pausada" },
  { status: "REMOVED", label: "Removidas", pill: "bg-brand-tint text-brand-hover", singular: "Removida" },
] as const;

const OUTRAS = { status: "", label: "Outras", pill: "bg-surface-alt text-ink-muted", singular: "Não informado" };

const grupoDe = (status: string) => GRUPOS.find((g) => g.status === status) ?? OUTRAS;

/** Ativas primeiro, depois pausadas e removidas; dentro de cada grupo, maior investimento primeiro. */
function ordenar(campanhas: AdsCampanha[]): AdsCampanha[] {
  const ordem = (s: string) => {
    const i = GRUPOS.findIndex((g) => g.status === s);
    return i === -1 ? GRUPOS.length : i;
  };
  return [...campanhas].sort((a, b) => ordem(a.status) - ordem(b.status) || (b.cost ?? 0) - (a.cost ?? 0));
}

/** Seletor de campanha do Google Ads: mostra as métricas de uma campanha por vez. */
export function CampanhaSelecionada({ campanhas, currencyCode }: CampanhaSelecionadaProps) {
  const ordenadas = ordenar(campanhas);
  const [id, setId] = useState(ordenadas[0]?.id ?? "");
  const atual = ordenadas.find((c) => c.id === id) ?? ordenadas[0];
  if (!atual) return null;

  const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: currencyCode });
  const fmtMoeda = (v: number | null) => (v === null ? "—" : moeda.format(v));
  const fmtPorcento = (v: number | null) => (v === null ? "—" : porcento.format(v));
  const grupo = grupoDe(atual.status);

  const metricas = [
    { label: "Investimento", value: fmtMoeda(atual.cost) },
    { label: "Impressões", value: inteiro.format(atual.impressions) },
    { label: "Cliques", value: inteiro.format(atual.clicks) },
    { label: "CTR", value: fmtPorcento(atual.ctr) },
    { label: "CPC médio", value: fmtMoeda(atual.averageCpc) },
    { label: "Conversões", value: decimal.format(atual.conversions) },
    { label: "Custo / conv.", value: fmtMoeda(atual.costPerConversion) },
  ];

  const gruposUsados = [...GRUPOS, OUTRAS]
    .map((g) => ({ ...g, itens: ordenadas.filter((c) => grupoDe(c.status) === g) }))
    .filter((g) => g.itens.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="painel-campanha" className="text-sm font-semibold text-ink">
          Campanha
        </label>
        <select
          id="painel-campanha"
          value={atual.id}
          onChange={(e) => setId(e.target.value)}
          className="min-h-9 w-full cursor-pointer rounded-full border border-line bg-white px-3 pr-8 text-sm text-ink-body sm:w-auto sm:min-w-80"
        >
          {gruposUsados.map((g) => (
            <optgroup key={g.label} label={`${g.label} (${g.itens.length})`}>
              {g.itens.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className={`inline-flex w-fit whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${grupo.pill}`}>
          {grupo.singular}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
        {metricas.map(({ label, value }) => (
          <div key={label} className="flex min-w-0 flex-col gap-1 rounded-xl border border-line bg-surface-alt/60 p-3">
            <dt className="text-xs font-semibold text-ink-muted">{label}</dt>
            <dd className="break-words font-sans text-lg font-bold tabular-nums text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

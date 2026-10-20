"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fmtInt } from "@/lib/painel/rotulos";
import { EmptyState } from "../EmptyState";
import { CATEGORICAL, TOOLTIP_STYLE } from "./chartTheme";
import { useMenosMovimento } from "./useMenosMovimento";

export interface DonutDatum {
  name: string;
  value: number;
  color?: string;
  hint?: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  totalLabel?: string;
  emptyTitle?: string;
}

/** Rosca com total no centro e legenda com percentuais (+ tabela para leitor de tela). Porte da Sólida. */
export function DonutChart({ data, totalLabel = "total", emptyTitle }: DonutChartProps) {
  const menosMovimento = useMenosMovimento();
  const rows = data
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((d, i) => ({ ...d, color: d.color ?? CATEGORICAL[i % CATEGORICAL.length] }));
  const total = rows.reduce((s, d) => s + d.value, 0);

  if (total === 0) return <EmptyState compact title={emptyTitle ?? "Sem dados no período"} hint="" />;

  return (
    <div className="@container">
      <div className="flex flex-col items-center gap-5 @lg:flex-row">
        <div className="relative h-48 w-48 shrink-0 @lg:h-52 @lg:w-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={96}
                paddingAngle={rows.length > 1 ? 2 : 0}
                stroke="none"
                isAnimationActive={!menosMovimento}
                animationDuration={800}
              >
                {rows.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(value, name) => [
                  `${fmtInt(Number(value))} (${Math.round((Number(value) / total) * 100)}%)`,
                  String(name),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-sans text-2xl font-bold text-ink tabular-nums">{fmtInt(total)}</span>
            <span className="text-xs text-ink-muted">{totalLabel}</span>
          </div>
        </div>

        <ul className="w-full space-y-2 text-sm">
          {rows.map((d) => (
            <li key={d.name} className="flex items-center gap-3">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="min-w-0 flex-1 truncate text-ink-body" title={d.hint ?? d.name}>
                {d.name}
              </span>
              <span className="tabular-nums text-ink-muted">{fmtInt(d.value)}</span>
              <span className="w-10 text-right font-semibold tabular-nums text-ink">{Math.round((d.value / total) * 100)}%</span>
            </li>
          ))}
        </ul>

        <table className="sr-only">
          <caption>Distribuição</caption>
          <tbody>
            {rows.map((d) => (
              <tr key={d.name}>
                <th scope="row">{d.name}</th>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

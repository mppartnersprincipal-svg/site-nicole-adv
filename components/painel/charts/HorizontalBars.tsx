"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtInt } from "@/lib/painel/rotulos";
import { EmptyState } from "../EmptyState";
import { CHART, TOOLTIP_STYLE } from "./chartTheme";
import { useMenosMovimento } from "./useMenosMovimento";

export interface BarDatum {
  name: string;
  value: number;
  color?: string;
}

interface HorizontalBarsProps {
  data: BarDatum[];
  color?: string;
  valueLabel?: string;
  maxItems?: number;
}

const ROTULO_MAX = 26;

/** Barras horizontais ordenadas (ranking). Porte da Sólida. */
export function HorizontalBars({ data, color = CHART.brand, valueLabel = "Total", maxItems = 10 }: HorizontalBarsProps) {
  const menosMovimento = useMenosMovimento();
  const rows = data.filter((d) => d.value > 0).slice(0, maxItems);
  if (!rows.length) return <EmptyState compact hint="" />;
  const height = Math.max(160, rows.length * 34 + 16);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barCategoryGap={8}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={170}
            tick={{ fontSize: 12, fill: "#3d3532" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => (v.length > ROTULO_MAX ? v.slice(0, ROTULO_MAX - 1) + "…" : v)}
          />
          <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: CHART.surfaceAlt }} formatter={(value) => [fmtInt(Number(value)), valueLabel]} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={!menosMovimento} animationDuration={800}>
            {rows.map((d) => (
              <Cell key={d.name} fill={d.color ?? color} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: unknown) => fmtInt(Number(v))}
              style={{ fontSize: 12, fill: CHART.muted, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

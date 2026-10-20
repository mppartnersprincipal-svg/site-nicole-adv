"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtDay, fmtInt, type DailyRow } from "@/lib/painel/rotulos";
import { CHART, TOOLTIP_STYLE } from "./chartTheme";
import { useMenosMovimento } from "./useMenosMovimento";

const MUITOS_DIAS = 45;

/** Visitas por dia (área) + contatos (linha verde, eixo da direita). Porte da Sólida. */
export function DailyAreaChart({ data }: { data: DailyRow[] }) {
  const menosMovimento = useMenosMovimento();
  const rows = data.map((d) => ({ ...d, sessions: Number(d.sessions), contacts: Number(d.contacts), label: fmtDay(d.day) }));
  const muitos = rows.length > MUITOS_DIAS;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="painel-sessoes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.18} />
              <stop offset="100%" stopColor={CHART.brand} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.line} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: CHART.muted }}
            tickLine={false}
            axisLine={false}
            interval={muitos ? Math.ceil(rows.length / 10) : "preserveStartEnd"}
            minTickGap={16}
          />
          <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11, fill: CHART.muted }} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: CHART.whatsapp }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip {...TOOLTIP_STYLE} formatter={(value, name) => [fmtInt(Number(value)), String(name)]} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="sessions"
            name="Visitas"
            stroke={CHART.brand}
            strokeWidth={2}
            fill="url(#painel-sessoes)"
            isAnimationActive={!menosMovimento}
            animationDuration={900}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="contacts"
            name="Contatos (WhatsApp, telefone, formulário)"
            stroke={CHART.whatsapp}
            strokeWidth={2.5}
            dot={rows.length <= 31 ? { r: 3, strokeWidth: 0, fill: CHART.whatsapp } : false}
            isAnimationActive={!menosMovimento}
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

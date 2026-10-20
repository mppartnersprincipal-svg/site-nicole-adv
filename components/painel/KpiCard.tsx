"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { fmtDuration, fmtInt, fmtPct } from "@/lib/painel/rotulos";
import { cn } from "@/lib/utils";

export type KpiFormat = "int" | "pct" | "duration";
export type KpiAccent = "ink" | "brand" | "whatsapp";

interface KpiCardProps {
  label: string;
  value: number;
  previous?: number | null;
  format?: KpiFormat;
  icon: LucideIcon;
  accent?: KpiAccent;
  hint?: string;
}

const DURACAO_MS = 1200;

function formatar(v: number, f: KpiFormat): string {
  if (f === "pct") return fmtPct(v);
  if (f === "duration") return fmtDuration(v);
  return fmtInt(v);
}

const prefereMenosMovimento = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Card de KPI com contagem animada e variação contra o período anterior (porte da Sólida). */
export function KpiCard({ label, value, previous, format: fmt = "int", icon: Icon, accent = "ink", hint }: KpiCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [animado, setAnimado] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefereMenosMovimento() || value === 0) return;
    let quadro = 0;
    const obs = new IntersectionObserver(([entrada]) => {
      if (!entrada.isIntersecting) return;
      obs.disconnect();
      const inicio = performance.now();
      const passo = (agora: number) => {
        const t = Math.min(1, (agora - inicio) / DURACAO_MS);
        const v = value * (1 - (1 - t) ** 3);
        setAnimado(t < 1 ? (fmt === "pct" ? Math.round(v * 10) / 10 : Math.round(v)) : null);
        if (t < 1) quadro = requestAnimationFrame(passo);
      };
      quadro = requestAnimationFrame(passo);
    });
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, [value, fmt]);

  let delta: number | null = null;
  if (previous != null && previous > 0) delta = ((value - previous) / previous) * 100;
  else if (previous === 0 && value > 0) delta = 100;

  const corIcone = {
    ink: "bg-ink/5 text-ink",
    brand: "bg-brand-tint text-brand-action",
    whatsapp: "bg-whatsapp/10 text-whatsapp",
  }[accent];

  return (
    <div
      ref={ref}
      className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(30,26,24,0.06)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-muted">{label}</p>
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full", corIcone)}>
          <Icon aria-hidden className="size-4" />
        </span>
      </div>
      <p className="font-sans text-3xl font-bold tracking-tight text-ink">{formatar(animado ?? value, fmt)}</p>
      <div className="flex min-h-5 flex-wrap items-center gap-2 text-xs">
        {delta !== null ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
              delta >= 0 ? "bg-whatsapp/10 text-whatsapp" : "bg-brand-tint text-brand-hover",
            )}
          >
            {delta >= 0 ? <TrendingUp aria-hidden className="size-3" /> : <TrendingDown aria-hidden className="size-3" />}
            {delta >= 0 ? "+" : ""}
            {delta.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
          </span>
        ) : null}
        <span className="text-ink-muted">{hint ?? (delta !== null ? "vs. período anterior" : "")}</span>
      </div>
    </div>
  );
}

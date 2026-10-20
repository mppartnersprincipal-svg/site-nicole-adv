import { fmtInt } from "@/lib/painel/rotulos";
import { EmptyState } from "../EmptyState";
import { CHART } from "./chartTheme";

const CORES = [CHART.ink, CHART.champanhe, CHART.brandSoft, CHART.brand];

/** Funil em barras decrescentes, com % do topo e taxa entre etapas. Porte da Sólida. */
export function FunnelBars({ steps }: { steps: { label: string; value: number }[] }) {
  const topo = steps[0]?.value ?? 0;
  if (!topo) return <EmptyState compact hint="" />;

  return (
    <ol className="space-y-4">
      {steps.map((s, i) => {
        const pct = Math.round((s.value / topo) * 100);
        const anterior = i > 0 ? steps[i - 1].value : null;
        const taxaEtapa = anterior ? Math.round((s.value / anterior) * 100) : null;
        return (
          <li key={s.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">{s.label}</span>
              <span className="shrink-0 tabular-nums text-ink-muted">
                <span className="font-bold text-ink">{fmtInt(s.value)}</span> · {pct}%
                {taxaEtapa !== null ? <span className="ml-1 text-xs">({taxaEtapa}% da etapa anterior)</span> : null}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-alt">
              <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 1)}%`, background: CORES[i % CORES.length] }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

import { getHeatmap } from "@/lib/painel/consultas";
import type { Intervalo } from "@/lib/painel/filtro";
import { fmtInt } from "@/lib/painel/rotulos";
import { ChartCard } from "../ChartCard";
import { EmptyState } from "../EmptyState";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HORAS = Array.from({ length: 24 }, (_, h) => h);
const pad = (n: number) => String(n).padStart(2, "0");

/** Mapa de calor dia da semana × hora (grid CSS). Porte da Sólida. */
export async function HeatmapSection({ range }: { range: Intervalo }) {
  const rows = await getHeatmap(range);
  const grade = new Map(rows.map((r) => [`${r.dow}-${r.hour}`, Number(r.sessions)]));
  const max = Math.max(0, ...rows.map((r) => Number(r.sessions)));
  const porHora = HORAS.map((h) => rows.filter((r) => Number(r.hour) === h).reduce((s, r) => s + Number(r.sessions), 0));
  const porDia = DIAS.map((_, d) => rows.filter((r) => Number(r.dow) === d).reduce((s, r) => s + Number(r.sessions), 0));
  const melhorHora = porHora.indexOf(Math.max(...porHora));
  const melhorDia = porDia.indexOf(Math.max(...porDia));

  return (
    <ChartCard
      id="horarios"
      title="Horários de visita"
      description={
        max
          ? `Pico: ${DIAS[melhorDia]} · ${pad(melhorHora)}h–${pad(melhorHora + 1)}h (horário de Brasília)`
          : "Dia da semana × hora (horário de Brasília)"
      }
      className="h-full"
    >
      {!max ? (
        <EmptyState compact hint="" />
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[560px] grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-0.5 text-[10px] text-ink-muted">
            <div />
            {HORAS.map((h) => (
              <div key={h} className="pb-1 text-center tabular-nums">
                {h % 3 === 0 ? `${h}h` : ""}
              </div>
            ))}
            {DIAS.map((d, di) => (
              <div key={d} className="contents">
                <div className="pr-1 text-right leading-5 font-semibold text-ink-body">{d}</div>
                {HORAS.map((h) => {
                  const v = grade.get(`${di}-${h}`) ?? 0;
                  const pct = Math.round((v / max) * 100);
                  return (
                    <div
                      key={h}
                      title={`${d} ${h}h–${h + 1}h: ${fmtInt(v)} ${v === 1 ? "visita" : "visitas"}`}
                      className="h-5 rounded-sm"
                      style={{
                        background: v
                          ? `color-mix(in oklab, var(--color-brand-action) ${Math.max(12, pct)}%, var(--color-surface-alt))`
                          : "var(--color-surface-alt)",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-muted">Quanto mais forte o bordô, mais visitas naquele horário.</p>
        </div>
      )}
    </ChartCard>
  );
}

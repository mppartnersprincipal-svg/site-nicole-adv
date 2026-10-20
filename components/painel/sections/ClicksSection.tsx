import { getClicks } from "@/lib/painel/consultas";
import type { Intervalo } from "@/lib/painel/filtro";
import { fmtInt } from "@/lib/painel/rotulos";
import { ChartCard } from "../ChartCard";
import { DataTable, InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";

/** Ranking de TODOS os cliques (links, botões, menus) pelo nome do elemento. Porte da Sólida. */
export async function ClicksSection({ range }: { range: Intervalo }) {
  const rows = await getClicks(range, 25);
  const max = Math.max(0, ...rows.map((r) => Number(r.clicks)));

  return (
    <ChartCard
      id="cliques"
      title="Tudo que foi clicado"
      description="Qualquer link ou botão do site, pelo nome, do mais ao menos clicado"
      className="h-full"
    >
      {!rows.length ? (
        <EmptyState compact hint="" />
      ) : (
        <DataTable
          dense
          minWidth={360}
          rows={rows}
          rowKey={(r, i) => `${r.label}-${i}`}
          columns={[
            {
              key: "label",
              header: "Elemento",
              render: (r) => (
                <div className="min-w-48">
                  <p className="font-semibold text-ink">{r.label ?? "—"}</p>
                  {r.href ? <p className="truncate text-xs text-ink-muted">{r.href}</p> : null}
                </div>
              ),
            },
            {
              key: "clicks",
              header: "Cliques",
              align: "right",
              render: (r) => (
                <div className="min-w-20">
                  <span className="font-semibold">{fmtInt(r.clicks)}</span>
                  <InlineBar value={Number(r.clicks)} max={max} />
                </div>
              ),
            },
            { key: "sessions", header: "Visitas", align: "right", render: (r) => fmtInt(r.sessions) },
          ]}
        />
      )}
    </ChartCard>
  );
}

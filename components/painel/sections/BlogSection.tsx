import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getBlog } from "@/lib/painel/consultas";
import type { Intervalo } from "@/lib/painel/filtro";
import { fmtDuration, fmtInt, fmtPct, labelPage } from "@/lib/painel/rotulos";
import { ChartCard } from "../ChartCard";
import { DataTable, InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";

/** Artigos mais vistos, leituras completas, tempo e até onde o leitor chega. Porte da Sólida. */
export async function BlogSection({ range }: { range: Intervalo }) {
  const rows = await getBlog(range, 15);
  const max = Math.max(0, ...rows.map((r) => Number(r.views)));

  return (
    <ChartCard
      id="blog"
      title="Blog: artigos mais lidos"
      description="Visualizações, leituras completas (75% do texto ou 45 s), tempo médio e rolagem"
      className="h-full"
    >
      {!rows.length ? (
        <EmptyState compact title="Nenhum artigo visto no período" hint="" />
      ) : (
        <DataTable
          dense
          rows={rows}
          rowKey={(r) => r.path}
          columns={[
            {
              key: "post",
              header: "Artigo",
              render: (r) => (
                <div className="min-w-48">
                  <Link
                    href={r.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-ink hover:text-brand-action"
                  >
                    <span className="line-clamp-2">{labelPage(r.path, r.title)}</span>
                    <ExternalLink aria-hidden className="size-3 shrink-0" />
                  </Link>
                </div>
              ),
            },
            {
              key: "views",
              header: "Visitas",
              align: "right",
              render: (r) => (
                <div className="min-w-20">
                  <span className="font-semibold">{fmtInt(r.views)}</span>
                  <InlineBar value={Number(r.views)} max={max} />
                </div>
              ),
            },
            { key: "reads", header: "Leituras", align: "right", render: (r) => fmtInt(r.reads) },
            { key: "time", header: "Tempo", align: "right", render: (r) => fmtDuration(r.avg_ms) },
            { key: "scroll", header: "Rolagem", align: "right", render: (r) => fmtPct(r.avg_scroll, 0) },
          ]}
        />
      )}
    </ChartCard>
  );
}

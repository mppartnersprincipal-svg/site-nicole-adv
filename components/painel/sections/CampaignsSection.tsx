import { getCampaigns } from "@/lib/painel/consultas";
import type { Intervalo } from "@/lib/painel/filtro";
import { fmtInt, fmtPct } from "@/lib/painel/rotulos";
import { ChartCard } from "../ChartCard";
import { DataTable, InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";

/** Visitas atribuídas às campanhas do Google Ads pelo próprio site (UTM/gclid). Porte da Sólida. */
export async function CampaignsSection({ range }: { range: Intervalo }) {
  const rows = await getCampaigns(range);
  const max = Math.max(0, ...rows.map((r) => Number(r.sessions)));
  const total = rows.reduce((s, r) => s + Number(r.sessions), 0);

  return (
    <ChartCard
      id="campanhas"
      title="Campanhas de anúncios no site"
      description={total ? `${fmtInt(total)} visitas vindas de anúncios no período` : "Visitas identificadas pelos links das campanhas"}
      className="h-full"
    >
      {!rows.length ? (
        <EmptyState
          compact
          title="Nenhuma visita de anúncio no período"
          hint="As campanhas aparecem aqui quando os links dos anúncios trazem gclid ou UTM."
        />
      ) : (
        <DataTable
          dense
          rows={rows}
          rowKey={(r, i) => `${r.utm_campaign}-${r.utm_term}-${r.utm_content}-${i}`}
          columns={[
            {
              key: "campaign",
              header: "Campanha · anúncio",
              render: (r) => (
                <div className="min-w-44">
                  <p className="font-semibold text-ink">{r.utm_campaign ?? "Campanha não identificada"}</p>
                  {r.utm_content ? <p className="text-xs text-ink-muted">{r.utm_content}</p> : null}
                </div>
              ),
            },
            { key: "term", header: "Termo", render: (r) => <span className="text-ink-body">{r.utm_term ?? "—"}</span> },
            {
              key: "sessions",
              header: "Visitas",
              align: "right",
              render: (r) => (
                <div className="min-w-20">
                  <span className="font-semibold">{fmtInt(r.sessions)}</span>
                  <InlineBar value={Number(r.sessions)} max={max} color="bg-brand-action" />
                </div>
              ),
            },
            { key: "contacts", header: "Contatos", align: "right", render: (r) => fmtInt(r.contacts) },
            { key: "conv", header: "Visitas → contato", align: "right", render: (r) => fmtPct(r.conv_rate ?? 0) },
          ]}
        />
      )}
    </ChartCard>
  );
}

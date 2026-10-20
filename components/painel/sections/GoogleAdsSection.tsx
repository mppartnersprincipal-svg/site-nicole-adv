import { Banknote, CircleDollarSign, Eye, MousePointerClick, Percent, Target, Wallet } from "lucide-react";
import { intervaloAnterior, type Intervalo } from "@/lib/painel/filtro";
import { buscarRelatorioAds } from "@/lib/painel/google-ads";
import type { AdsMetricas } from "@/lib/painel/tipos";
import { cn } from "@/lib/utils";
import { CampanhaSelecionada } from "../CampanhaSelecionada";
import { ChartCard } from "../ChartCard";
import { InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";

const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const porcento = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 2 });

const dataBr = (ymd: string) => ymd.split("-").reverse().join("/");

/** Variação % contra o período anterior; `bomSubir` define a cor (custo por conversão: cair é bom). */
function Variacao({ atual, anterior, bomSubir = true }: { atual: number | null; anterior: number | null; bomSubir?: boolean }) {
  if (atual === null || anterior === null || anterior === 0) return null;
  const delta = ((atual - anterior) / anterior) * 100;
  const melhorou = delta >= 0 === bomSubir;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        melhorou ? "bg-whatsapp/10 text-whatsapp" : "bg-brand-tint text-brand-hover",
      )}
    >
      {delta >= 0 ? "+" : ""}
      {delta.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
    </span>
  );
}

/** Conta Google Ads da Nicoli (via MCC): KPIs, conversões por ação e campanhas. Porte da Sólida. */
export async function GoogleAdsSection({ range }: { range: Intervalo }) {
  const anterior = intervaloAnterior(range);
  const r = await buscarRelatorioAds({ from: range.from, to: range.to, prevFrom: anterior.from, prevTo: anterior.to });

  if (r.status !== "ready") {
    return (
      <ChartCard id="google-ads" title="Google Ads" description="Investimento e resultados das campanhas de anúncios">
        <EmptyState
          compact
          title={r.status === "not_configured" ? "Conexão com o Google Ads pendente" : "Não foi possível carregar o Google Ads"}
          hint={r.message}
        />
      </ChartCard>
    );
  }

  const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: r.customer.currencyCode });
  const fmtMoeda = (v: number | null) => (v === null ? "—" : moeda.format(v));
  const fmtPorcento = (v: number | null) => (v === null ? "—" : porcento.format(v));
  const t = r.totals;
  const p = r.previous;
  const cards: { label: string; value: string; icon: typeof Wallet; hint: string; key: keyof AdsMetricas; bomSubir?: boolean }[] = [
    { label: "Investimento", value: fmtMoeda(t.cost), icon: Wallet, hint: "Valor gasto em anúncios", key: "cost" },
    { label: "Impressões", value: inteiro.format(t.impressions), icon: Eye, hint: "Exibições dos anúncios", key: "impressions" },
    { label: "Cliques", value: inteiro.format(t.clicks), icon: MousePointerClick, hint: "Cliques nos anúncios", key: "clicks" },
    { label: "CTR", value: fmtPorcento(t.ctr), icon: Percent, hint: "Cliques ÷ impressões", key: "ctr" },
    { label: "CPC médio", value: fmtMoeda(t.averageCpc), icon: CircleDollarSign, hint: "Custo médio por clique", key: "averageCpc", bomSubir: false },
    { label: "Conversões", value: decimal.format(t.conversions), icon: Target, hint: "Conversões registradas no Google Ads", key: "conversions" },
    {
      label: "Custo por conversão",
      value: fmtMoeda(t.costPerConversion),
      icon: Banknote,
      hint: "Investimento ÷ conversões",
      key: "costPerConversion",
      bomSubir: false,
    },
  ];
  const maxConv = Math.max(0, ...r.conversionActions.map((a) => a.conversions));
  return (
    <ChartCard id="google-ads" title="Google Ads" description={`Resultados da conta ${r.customer.name} · ${r.customer.currencyCode}`}>
      <div className="space-y-5">
        <div className="space-y-1 text-sm text-ink-muted">
          <p>
            {dataBr(r.from)} a {dataBr(r.to)} · Fuso da conta: {r.customer.timeZone}.
          </p>
          <p>O período selecionado vale para os anúncios. O filtro de origem vale só para as visitas do site.</p>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icone, hint, key, bomSubir }) => (
            <div key={label} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-white p-5">
              <dt className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink-muted">{label}</span>
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-action">
                  <Icone aria-hidden className="size-4" />
                </span>
              </dt>
              <dd className="break-words font-sans text-3xl font-bold tracking-tight text-ink tabular-nums">{value}</dd>
              <dd className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                <Variacao atual={t[key]} anterior={p[key]} bomSubir={bomSubir} />
                {hint}
              </dd>
            </div>
          ))}
        </dl>

        {r.conversionActions.length ? (
          <div>
            <h3 className="mb-3 font-sans text-sm font-bold text-ink">Conversões por ação</h3>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {r.conversionActions.map((a) => (
                <li key={a.name} className="rounded-xl border border-line bg-surface-alt/60 p-3 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-ink-body" title={a.name}>
                      {a.name}
                    </span>
                    <span className="font-bold tabular-nums text-ink">{decimal.format(a.conversions)}</span>
                  </div>
                  <InlineBar value={a.conversions} max={maxConv} color="bg-brand-action" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h3 className="mb-3 font-sans text-sm font-bold text-ink">Resultados por campanha</h3>
          {r.campaigns.length ? (
            <CampanhaSelecionada campanhas={r.campaigns} currencyCode={r.customer.currencyCode} />
          ) : (
            <EmptyState compact title="Nenhuma campanha com resultados no período" hint="Tente ampliar o período." />
          )}
        </div>

        <p className="text-xs text-ink-muted">
          As conversões seguem a atribuição do Google Ads e podem ser atualizadas depois da interação com o anúncio. “—” indica
          uma taxa que não pode ser calculada no período.
        </p>
      </div>
    </ChartCard>
  );
}

import { Activity, Clock, Star, Users } from "lucide-react";
import { intervaloAnterior, type Intervalo } from "@/lib/painel/filtro";
import { EVENTOS, duracao, nomeCanal, nomeDispositivo, numero, percentual } from "@/lib/painel/formato";
import { buscarRelatorioGa4 } from "@/lib/painel/ga4";
import type { Ga4Totais } from "@/lib/painel/tipos";
import { cn } from "@/lib/utils";
import { ChartCard } from "../ChartCard";
import { InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";
import { DonutChart } from "../charts/DonutChart";
import { CHANNEL_COLORS, DEVICE_COLORS } from "../charts/chartTheme";

/** Canal padrão do GA4 → cor do mesmo canal no resto do painel */
const COR_CANAL_GA4: Record<string, string> = {
  "Paid Search": CHANNEL_COLORS.google_ads,
  "Organic Search": CHANNEL_COLORS.google_organic,
  "Organic Social": CHANNEL_COLORS.social,
  "Paid Social": CHANNEL_COLORS.social,
  Referral: CHANNEL_COLORS.referral,
  Direct: CHANNEL_COLORS.direct,
};

function Delta({ atual, anterior }: { atual: number; anterior: number }) {
  if (!anterior) return null;
  const d = ((atual - anterior) / anterior) * 100;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        d >= 0 ? "bg-whatsapp/10 text-whatsapp" : "bg-brand-tint text-brand-hover",
      )}
    >
      {d >= 0 ? "+" : ""}
      {d.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
    </span>
  );
}

/**
 * Números do Google Analytics 4 (só de quem aceitou cookies de análise), lidos pela Data API.
 * Complementa a coleta própria do painel, que mede todas as visitas.
 */
export async function Ga4Section({ range }: { range: Intervalo }) {
  const anterior = intervaloAnterior(range);
  const r = await buscarRelatorioGa4({ from: range.from, to: range.to, prevFrom: anterior.from, prevTo: anterior.to });

  if (r.status !== "ready") {
    return (
      <ChartCard id="ga4" title="Google Analytics 4" description="Sessões, eventos-chave e origens medidos pelo GA4">
        <EmptyState
          compact
          title={r.status === "not_configured" ? "Conexão com o GA4 pendente" : "Não foi possível carregar o GA4"}
          hint={r.message}
        />
      </ChartCard>
    );
  }

  const cards: { label: string; key: keyof Ga4Totais; icon: typeof Users; fmt: (v: number) => string }[] = [
    { label: "Sessões", key: "sessions", icon: Activity, fmt: numero },
    { label: "Usuários", key: "users", icon: Users, fmt: numero },
    { label: "Engajamento", key: "engagementRate", icon: Clock, fmt: (v) => percentual(v) },
    { label: "Eventos-chave", key: "keyEvents", icon: Star, fmt: numero },
  ];
  const eventos = r.events.filter((e) => e.count > 0 || e.previous > 0);
  const maxEvento = Math.max(0, ...eventos.map((e) => e.count));

  return (
    <ChartCard
      id="ga4"
      title="Google Analytics 4"
      description={`Só visitas que aceitaram cookies de análise · tempo médio ${duracao(r.totals.averageSessionDuration)} · ${percentual(r.totals.keyEventRate)} das sessões com evento-chave`}
    >
      <div className="space-y-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, key, icon: Icone, fmt }) => (
            <div key={key} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-white p-5">
              <dt className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink-muted">{label}</span>
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink">
                  <Icone aria-hidden className="size-4" />
                </span>
              </dt>
              <dd className="font-sans text-3xl font-bold tracking-tight text-ink tabular-nums">{fmt(Number(r.totals[key] ?? 0))}</dd>
              <dd className="flex items-center gap-2 text-xs text-ink-muted">
                <Delta atual={Number(r.totals[key] ?? 0)} anterior={Number(r.previous[key] ?? 0)} />
                vs. período anterior
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-w-0">
            <h3 className="mb-3 font-sans text-sm font-bold text-ink">Origem das sessões (GA4)</h3>
            <DonutChart
              totalLabel="sessões"
              data={r.channels.map((c) => ({
                name: nomeCanal(c.key),
                value: c.sessions,
                color: COR_CANAL_GA4[c.key],
                hint: `${numero(c.keyEvents)} eventos-chave`,
              }))}
            />
          </div>
          <div className="min-w-0">
            <h3 className="mb-3 font-sans text-sm font-bold text-ink">Dispositivo (GA4)</h3>
            <DonutChart
              totalLabel="sessões"
              data={r.devices.map((d) => ({ name: nomeDispositivo(d.key), value: d.sessions, color: DEVICE_COLORS[d.key] }))}
            />
          </div>
          <div className="min-w-0">
            <h3 className="mb-3 font-sans text-sm font-bold text-ink">Eventos do site no GA4</h3>
            {eventos.length ? (
              <ul className="space-y-2.5">
                {eventos.map((e) => (
                  <li key={e.name} className="text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-ink-body">{EVENTOS[e.name] ?? e.name}</span>
                      <span className="font-semibold tabular-nums text-ink">{numero(e.count)}</span>
                    </div>
                    <InlineBar value={e.count} max={maxEvento} color="bg-brand-action" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState compact title="Nenhum evento do site no GA4" hint="Os eventos chegam depois que o GTM novo for publicado." />
            )}
          </div>
        </div>
        {r.thresholded ? (
          <p className="text-xs text-ink-muted">O GA4 aplicou limite de privacidade a parte destes números (poucos usuários no recorte).</p>
        ) : null}
      </div>
    </ChartCard>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { ChartCard } from "@/components/painel/ChartCard";
import { DashboardFilters } from "@/components/painel/DashboardFilters";
import { DataTable, InlineBar } from "@/components/painel/DataTable";
import { EmptyState } from "@/components/painel/EmptyState";
import { KpiGrid } from "@/components/painel/KpiGrid";
import { LoginPainel } from "@/components/painel/LoginPainel";
import { PainelShell } from "@/components/painel/PainelShell";
import { SectionNav } from "@/components/painel/SectionNav";
import { CardSkeleton, KpiSkeleton } from "@/components/painel/Skeleton";
import { DailyAreaChart } from "@/components/painel/charts/DailyAreaChart";
import { DonutChart } from "@/components/painel/charts/DonutChart";
import { HorizontalBars } from "@/components/painel/charts/HorizontalBars";
import { CHANNEL_COLORS, DEVICE_COLORS } from "@/components/painel/charts/chartTheme";
import { AudienceSection } from "@/components/painel/sections/AudienceSection";
import { BlogSection } from "@/components/painel/sections/BlogSection";
import { CampaignsSection } from "@/components/painel/sections/CampaignsSection";
import { ClicksSection } from "@/components/painel/sections/ClicksSection";
import { ContactsSection } from "@/components/painel/sections/ContactsSection";
import { Ga4Section } from "@/components/painel/sections/Ga4Section";
import { GeoSection } from "@/components/painel/sections/GeoSection";
import { GoogleAdsSection } from "@/components/painel/sections/GoogleAdsSection";
import { HeatmapSection } from "@/components/painel/sections/HeatmapSection";
import { JourneysSection } from "@/components/painel/sections/JourneysSection";
import { LiveSection } from "@/components/painel/sections/LiveSection";
import {
  bancoConfigurado,
  getByChannel,
  getByDevice,
  getContacts,
  getDaily,
  getKpis,
  getTopPages,
} from "@/lib/painel/consultas";
import { intervaloAnterior, lerIntervalo, type SearchParams } from "@/lib/painel/filtro";
import {
  fmtDuration,
  fmtInt,
  fmtPct,
  labelArea,
  labelChannel,
  labelDevice,
  labelLocation,
  labelPage,
} from "@/lib/painel/rotulos";
import { sessaoValida } from "@/lib/painel/sessao";

export const metadata: Metadata = {
  title: "Painel de resultados",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Painel interno (porte do /dashboard da Sólida): coleta própria + Google Ads + GA4.
 * Fora de app/(site): sem header, rodapé, GTM nem banner (visitas da equipe fora das métricas).
 */
export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <Suspense fallback={<CarregandoPainel />}>
      <Painel searchParams={searchParams} />
    </Suspense>
  );
}

function CarregandoPainel() {
  return (
    <PainelShell isLogado={false}>
      <div role="status" aria-label="Carregando o painel" className="space-y-6">
        <KpiSkeleton />
        <CardSkeleton height={300} />
      </div>
    </PainelShell>
  );
}

function somarPor<T>(rows: T[], chave: (r: T) => string, valor: (r: T) => number) {
  const mapa = new Map<string, number>();
  for (const r of rows) mapa.set(chave(r), (mapa.get(chave(r)) ?? 0) + valor(r));
  return [...mapa.entries()].map(([name, value]) => ({ name, value }));
}

async function Painel({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!(await sessaoValida())) {
    return (
      <PainelShell isLogado={false}>
        <LoginPainel />
      </PainelShell>
    );
  }

  const sp = await searchParams;
  const range = lerIntervalo(sp);
  const anterior = intervaloAnterior(range);
  const [kpis, kpisAntes, diario, porCanal, porDispositivo, paginas, contatos] = await Promise.all([
    getKpis(range),
    getKpis(anterior),
    getDaily(range),
    getByChannel(range),
    getByDevice(range),
    getTopPages(range, 12),
    getContacts(range),
  ]);
  const temDados = kpis.sessions > 0;
  const maxViews = Math.max(0, ...paginas.map((p) => Number(p.views)));
  const contatosPorArea = somarPor(contatos, (c) => labelArea(c.area), (c) => Number(c.clicks));
  const whatsPorLocal = somarPor(
    contatos.filter((c) => c.kind === "click_whatsapp"),
    (c) => labelLocation(c.location),
    (c) => Number(c.clicks),
  );

  return (
    <PainelShell isLogado>
      <div className="space-y-6">
        <div id="kpis" className="flex scroll-mt-28 flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-sans text-2xl font-bold text-ink sm:text-3xl">Painel</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Comportamento dos visitantes · {range.label}
              {range.channel ? ` · ${labelChannel(range.channel)}` : ""}
            </p>
          </div>
        </div>

        <SectionNav />
        <DashboardFilters period={range.period} channel={range.channel} de={range.de} ate={range.ate} />

        {!bancoConfigurado() ? (
          <EmptyState
            title="Coleta própria aguardando conexão"
            hint="Cadastre SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel e faça o redeploy. Google Ads e GA4 abaixo já funcionam."
          />
        ) : null}

        <KpiGrid kpis={kpis} previous={kpisAntes} />

        {bancoConfigurado() && !temDados ? (
          <EmptyState
            title="Nenhuma visita registrada no período"
            hint="Os dados aparecem assim que alguém acessar o site. Tente outro período ou remova o filtro de origem."
          />
        ) : null}

        <Suspense
          key={`ads-${range.from.toISOString()}-${range.to.toISOString()}`}
          fallback={
            <div role="status" aria-label="Carregando métricas do Google Ads">
              <CardSkeleton height={400} />
            </div>
          }
        >
          <GoogleAdsSection range={range} />
        </Suspense>

        <Suspense key={`ga4-${range.from.toISOString()}-${range.to.toISOString()}`} fallback={<CardSkeleton height={320} />}>
          <Ga4Section range={range} />
        </Suspense>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard
              id="visitas"
              title="Visitas por dia"
              description="Sessões (área) e contatos: WhatsApp, telefone e formulário (linha verde, eixo da direita)"
              className="h-full"
            >
              {temDados ? <DailyAreaChart data={diario} /> : <EmptyState compact hint="" />}
            </ChartCard>
          </div>
          <ChartCard
            id="origem"
            title="De onde vêm as visitas"
            description={
              range.channel ? "Todas as origens no período (este gráfico ignora o filtro de origem)" : "Google Ads × orgânico × direto × redes"
            }
            className="h-full"
          >
            <DonutChart
              totalLabel="visitas"
              data={porCanal.map((c) => ({
                name: labelChannel(c.channel),
                value: Number(c.sessions),
                color: CHANNEL_COLORS[c.channel],
                hint: `${fmtInt(c.contacts)} contatos`,
              }))}
            />
          </ChartCard>
        </div>

        <Suspense fallback={<CardSkeleton height={220} />}>
          <AudienceSection range={range} />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ChartCard id="dispositivo" title="Dispositivo" description="Celular, computador ou tablet" className="h-full">
            <DonutChart
              totalLabel="visitas"
              data={porDispositivo.map((d) => ({ name: labelDevice(d.device), value: Number(d.sessions), color: DEVICE_COLORS[d.device] }))}
            />
          </ChartCard>
          <ChartCard id="contatos-area" title="Contatos por área" description="Formulário, WhatsApp e telefone por área de atuação" className="h-full">
            <DonutChart totalLabel="contatos" data={contatosPorArea} emptyTitle="Nenhum contato no período" />
          </ChartCard>
          <ChartCard
            id="whatsapp-local"
            title="WhatsApp por botão"
            description="Em qual lugar do site o WhatsApp foi clicado"
            className="h-full md:col-span-2 xl:col-span-1"
          >
            <DonutChart totalLabel="cliques" data={whatsPorLocal} emptyTitle="Nenhum clique no WhatsApp" />
          </ChartCard>
        </div>

        <Suspense fallback={<CardSkeleton height={320} />}>
          <ContactsSection range={range} />
        </Suspense>

        <Suspense fallback={<CardSkeleton height={400} />}>
          <JourneysSection range={range} sp={sp} />
        </Suspense>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-2">
            <ChartCard id="paginas" title="Páginas mais vistas" description="Top 10 por visualizações" className="h-full">
              <HorizontalBars
                valueLabel="Visualizações"
                data={paginas.map((p) => ({ name: labelPage(p.path, p.title), value: Number(p.views) }))}
              />
            </ChartCard>
          </div>
          <div className="min-w-0 lg:col-span-3">
            <ChartCard
              id="paginas-tempo"
              title="Tempo, leitura e contatos por página"
              description="Quanto tempo o visitante fica, até onde rola e quantos contatos cada página gerou"
              className="h-full"
            >
              {paginas.length ? (
                <DataTable
                  rows={paginas}
                  rowKey={(p) => p.path}
                  dense
                  columns={[
                    {
                      key: "page",
                      header: "Página",
                      render: (p) => (
                        <div className="min-w-40">
                          <p className="truncate font-semibold text-ink" title={p.path}>
                            {labelPage(p.path, p.title)}
                          </p>
                          <p className="truncate text-xs text-ink-muted">{p.path}</p>
                        </div>
                      ),
                    },
                    {
                      key: "views",
                      header: "Views",
                      align: "right",
                      render: (p) => (
                        <div className="min-w-24">
                          <span className="font-semibold text-ink">{fmtInt(p.views)}</span>
                          <InlineBar value={Number(p.views)} max={maxViews} />
                        </div>
                      ),
                    },
                    { key: "time", header: "Tempo médio", align: "right", render: (p) => fmtDuration(p.avg_ms) },
                    { key: "scroll", header: "Rolagem", align: "right", render: (p) => fmtPct(p.avg_scroll, 0) },
                    { key: "contacts", header: "Contatos", align: "right", render: (p) => fmtInt(p.contacts) },
                  ]}
                />
              ) : (
                <EmptyState compact hint="" />
              )}
            </ChartCard>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Suspense fallback={<CardSkeleton height={220} />}>
            <HeatmapSection range={range} />
          </Suspense>
          <Suspense fallback={<CardSkeleton height={220} />}>
            <GeoSection range={range} />
          </Suspense>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Suspense fallback={<CardSkeleton height={220} />}>
            <CampaignsSection range={range} />
          </Suspense>
          <Suspense fallback={<CardSkeleton height={220} />}>
            <BlogSection range={range} />
          </Suspense>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Suspense fallback={<CardSkeleton height={320} />}>
            <ClicksSection range={range} />
          </Suspense>
          <Suspense fallback={<CardSkeleton height={320} />}>
            <LiveSection />
          </Suspense>
        </div>
      </div>
    </PainelShell>
  );
}

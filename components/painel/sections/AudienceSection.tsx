import { getConsent, getFunnel, getVisitors } from "@/lib/painel/consultas";
import type { Intervalo } from "@/lib/painel/filtro";
import { CONSENT_LABELS, FUNNEL_LABELS, VISITOR_LABELS, fmtInt } from "@/lib/painel/rotulos";
import { ChartCard } from "../ChartCard";
import { DonutChart } from "../charts/DonutChart";
import { FunnelBars } from "../charts/FunnelBars";
import { CHART } from "../charts/chartTheme";

const CORES_VISITANTE: Record<string, string> = { new: CHART.ink, returning: CHART.brand, unknown: CHART.muted };
const CORES_CONSENTIMENTO: Record<string, string> = { accepted: CHART.whatsapp, essential: CHART.champanhe, none: CHART.muted };
const ORDEM_FUNIL = ["page_view", "form_start", "generate_lead"];

/** Novo × recorrente · Cobertura do banner LGPD · Funil do formulário. */
export async function AudienceSection({ range }: { range: Intervalo }) {
  const [visitantes, consentimento, funil] = await Promise.all([getVisitors(range), getConsent(range), getFunnel(range)]);

  const totalConsent = consentimento.reduce((s, c) => s + Number(c.sessions), 0);
  const aceitou = consentimento.find((c) => c.choice === "accepted");
  const cobertura = totalConsent ? Math.round((Number(aceitou?.sessions ?? 0) / totalConsent) * 100) : 0;
  const contato = funil.find((f) => f.step === "contact");
  const etapas = ORDEM_FUNIL.map((step) => ({
    label: FUNNEL_LABELS[step],
    value: Number(funil.find((f) => f.step === step)?.sessions ?? 0),
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ChartCard
        id="visitantes"
        title="Novo × recorrente"
        description="Quem está voltando ao site (código anônimo, só para quem aceitou cookies)"
        className="h-full"
      >
        <DonutChart
          totalLabel="visitas"
          data={visitantes.map((v) => ({
            name: VISITOR_LABELS[v.kind] ?? v.kind,
            value: Number(v.sessions),
            color: CORES_VISITANTE[v.kind],
            hint: `${fmtInt(v.contacts)} contatos`,
          }))}
        />
      </ChartCard>

      <ChartCard
        id="consentimento"
        title="Cobertura de consentimento"
        description={`${cobertura}% aceitaram cookies de análise. É o que o GA4 e o Google Ads enxergam; este painel mede todos`}
        className="h-full"
      >
        <DonutChart
          totalLabel="visitas"
          data={consentimento.map((c) => ({
            name: CONSENT_LABELS[c.choice] ?? c.choice,
            value: Number(c.sessions),
            color: CORES_CONSENTIMENTO[c.choice],
          }))}
        />
      </ChartCard>

      <ChartCard
        id="funil"
        title="Funil do formulário"
        description={`Visitas → começou → enviou. ${fmtInt(contato?.sessions ?? 0)} visitas entraram em contato por qualquer canal`}
        className="h-full md:col-span-2 xl:col-span-1"
      >
        <FunnelBars steps={etapas} />
      </ChartCard>
    </div>
  );
}

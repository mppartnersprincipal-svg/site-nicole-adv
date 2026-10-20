import { BarrasRanking } from "./BarrasRanking";
import { ColunasDiarias } from "./ColunasDiarias";
import { Kpi } from "./Kpi";
import { moeda, nomeStatus, numero, percentual, variacao } from "@/lib/painel/formato";
import type { AdsRelatorio } from "@/lib/painel/tipos";

interface SecaoAdsProps {
  relatorio: AdsRelatorio;
}

export function SecaoAds({ relatorio: r }: SecaoAdsProps) {
  const { totals: t, previous: p } = r;
  const brl = (v: number | null) => moeda(v, r.customer.currencyCode);

  return (
    <div className="space-y-10">
      <p className="text-xs text-cinza">
        Conta: <span className="text-grafite">{r.customer.name}</span> ({r.customer.id.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")})
      </p>

      <div className="grid grid-cols-2 gap-px bg-pedra lg:grid-cols-3">
        <Kpi rotulo="Investimento" valor={brl(t.cost)} variacao={variacao(t.cost, p.cost, "neutro")} />
        <Kpi rotulo="Conversões" valor={numero(t.conversions)} variacao={variacao(t.conversions, p.conversions)} />
        <Kpi
          rotulo="Custo por conversão"
          valor={brl(t.costPerConversion)}
          variacao={variacao(t.costPerConversion, p.costPerConversion, "descer")}
        />
        <Kpi rotulo="Cliques" valor={numero(t.clicks)} variacao={variacao(t.clicks, p.clicks)} ajuda={`${numero(t.impressions)} impressões`} />
        <Kpi rotulo="CTR" valor={percentual(t.ctr)} variacao={variacao(t.ctr, p.ctr)} />
        <Kpi rotulo="CPC médio" valor={brl(t.averageCpc)} variacao={variacao(t.averageCpc, p.averageCpc, "descer")} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ColunasDiarias titulo="Investimento por dia" pontos={r.daily.map((d) => ({ date: d.date, valor: d.cost }))} formatar={(v) => brl(v)} />
        <BarrasRanking
          titulo="Conversões por ação"
          itens={r.conversionActions.map((a) => ({ chave: a.name, rotulo: a.name, valor: a.conversions }))}
          formatar={numero}
          vazio="Nenhuma conversão no período."
        />
      </div>

      <div>
        <h3 className="mb-3 font-sans text-sm font-medium text-grafite">Campanhas</h3>
        {r.campaigns.length === 0 ? (
          <p className="text-sm text-cinza">Nenhuma campanha com dados no período.</p>
        ) : (
          <div className="overflow-x-auto border border-pedra bg-branco">
            <table className="w-full min-w-[720px] text-left text-sm tabular-nums">
              <thead className="border-b border-pedra bg-areia text-xs uppercase tracking-[0.1em] text-cinza">
                <tr>
                  <th className="px-4 py-3 font-medium">Campanha</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Investimento</th>
                  <th className="px-4 py-3 text-right font-medium">Cliques</th>
                  <th className="px-4 py-3 text-right font-medium">CTR</th>
                  <th className="px-4 py-3 text-right font-medium">Conversões</th>
                  <th className="px-4 py-3 text-right font-medium">Custo/conv.</th>
                </tr>
              </thead>
              <tbody>
                {r.campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-pedra/60 last:border-0">
                    <td className="px-4 py-3 text-grafite">{c.name}</td>
                    <td className="px-4 py-3 text-cinza">{nomeStatus(c.status)}</td>
                    <td className="px-4 py-3 text-right">{brl(c.cost)}</td>
                    <td className="px-4 py-3 text-right">{numero(c.clicks)}</td>
                    <td className="px-4 py-3 text-right">{percentual(c.ctr)}</td>
                    <td className="px-4 py-3 text-right">{numero(c.conversions)}</td>
                    <td className="px-4 py-3 text-right">{brl(c.costPerConversion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

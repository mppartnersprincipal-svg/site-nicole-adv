import { BarrasRanking } from "./BarrasRanking";
import { ColunasDiarias } from "./ColunasDiarias";
import { Kpi } from "./Kpi";
import {
  EVENTOS,
  duracao,
  nomeCanal,
  nomeDispositivo,
  nomePagina,
  numero,
  percentual,
  variacao,
} from "@/lib/painel/formato";
import type { Ga4Linha, Ga4Relatorio } from "@/lib/painel/tipos";

interface SecaoGa4Props {
  relatorio: Ga4Relatorio;
}

const contatosDetalhe = (l: Ga4Linha) => `${numero(l.users)} usuários · ${numero(l.keyEvents)} eventos-chave`;

export function SecaoGa4({ relatorio: r }: SecaoGa4Props) {
  const { totals: t, previous: p } = r;
  const funil = r.events.filter((e) => e.count > 0 || e.previous > 0);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-px bg-pedra lg:grid-cols-4">
        <Kpi rotulo="Sessões" valor={numero(t.sessions)} variacao={variacao(t.sessions, p.sessions)} />
        <Kpi rotulo="Usuários" valor={numero(t.users)} variacao={variacao(t.users, p.users)} ajuda={`${numero(t.newUsers)} novos`} />
        <Kpi
          rotulo="Engajamento"
          valor={percentual(t.engagementRate)}
          variacao={variacao(t.engagementRate, p.engagementRate)}
          ajuda={`Tempo médio ${duracao(t.averageSessionDuration)}`}
        />
        <Kpi
          rotulo="Eventos-chave"
          valor={numero(t.keyEvents)}
          variacao={variacao(t.keyEvents, p.keyEvents)}
          ajuda={`${percentual(t.keyEventRate)} das sessões`}
        />
      </div>

      <ColunasDiarias titulo="Sessões por dia" pontos={r.daily.map((d) => ({ date: d.date, valor: d.sessions }))} formatar={numero} />

      <div className="grid gap-10 lg:grid-cols-2">
        <BarrasRanking
          titulo="Ações no site"
          itens={funil.map((e) => ({
            chave: e.name,
            rotulo: EVENTOS[e.name] ?? e.name,
            valor: e.count,
            detalhe: `Antes: ${numero(e.previous)}`,
          }))}
          formatar={numero}
          vazio="Nenhuma ação registrada no período. Confira se o GTM está publicado."
        />
        <BarrasRanking
          titulo="Páginas que geraram contato"
          itens={r.contactPages.map((c) => ({
            chave: c.path,
            rotulo: nomePagina(c.path),
            valor: c.total,
            detalhe: `${numero(c.generate_lead)} formulário · ${numero(c.click_whatsapp)} WhatsApp · ${numero(c.click_phone)} telefone`,
          }))}
          formatar={numero}
          vazio="Nenhum contato registrado no período."
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <BarrasRanking
          titulo="Origem das sessões"
          itens={r.channels.map((c) => ({ chave: c.key, rotulo: nomeCanal(c.key), valor: c.sessions, detalhe: contatosDetalhe(c) }))}
          formatar={numero}
        />
        <BarrasRanking
          titulo="Páginas de entrada"
          itens={r.landingPages.map((c) => ({ chave: c.key, rotulo: nomePagina(c.key), valor: c.sessions, detalhe: contatosDetalhe(c) }))}
          formatar={numero}
        />
        <BarrasRanking
          titulo="Dispositivos"
          itens={r.devices.map((c) => ({ chave: c.key, rotulo: nomeDispositivo(c.key), valor: c.sessions, detalhe: contatosDetalhe(c) }))}
          formatar={numero}
        />
      </div>

      {r.thresholded && (
        <p className="text-xs text-cinza">
          O GA4 aplicou limite de privacidade a parte destes números (poucos usuários no recorte). Totais pequenos podem aparecer reduzidos.
        </p>
      )}
    </div>
  );
}

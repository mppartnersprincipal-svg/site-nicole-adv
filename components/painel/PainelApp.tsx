"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AvisoIntegracao } from "./AvisoIntegracao";
import { FiltroPeriodo, periodoDosUltimos, type PeriodoSelecionado } from "./FiltroPeriodo";
import { Kpi } from "./Kpi";
import { LoginPainel } from "./LoginPainel";
import { SecaoAds } from "./SecaoAds";
import { SecaoGa4 } from "./SecaoGa4";
import { moeda, numero, variacao } from "@/lib/painel/formato";
import type { AdsResposta, Ga4Resposta } from "@/lib/painel/tipos";

type Sessao = "verificando" | "fora" | "dentro";
const PERIODO_INICIAL = 30;
const CONTATOS = ["generate_lead", "click_whatsapp", "click_phone"];

class SessaoExpirada extends Error {}

async function buscar<T>(url: string, signal: AbortSignal): Promise<T> {
  const resposta = await fetch(url, { signal, cache: "no-store" });
  if (resposta.status === 401) throw new SessaoExpirada();
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return (await resposta.json()) as T;
}

const falhaDeRede = (fonte: string) => ({
  status: "error" as const,
  message: `Não foi possível falar com o servidor para carregar o ${fonte}. Tente atualizar.`,
});

export function PainelApp() {
  const [sessao, setSessao] = useState<Sessao>("verificando");
  // Definido no navegador (depois da checagem de sessão): "hoje" não pode congelar no prerender
  const [periodo, setPeriodo] = useState<PeriodoSelecionado | null>(null);
  const [ga4, setGa4] = useState<Ga4Resposta | null>(null);
  const [ads, setAds] = useState<AdsResposta | null>(null);
  const [isCarregando, setIsCarregando] = useState(false);
  const emAndamento = useRef<AbortController | null>(null);

  /** Busca GA4 e Ads em paralelo; uma falha não derruba a outra. Cancela a busca anterior. */
  const carregar = useCallback((p: PeriodoSelecionado) => {
    emAndamento.current?.abort();
    const controle = new AbortController();
    emAndamento.current = controle;
    const q = `?de=${p.de}&ate=${p.ate}`;
    setIsCarregando(true);
    const tratar = (fonte: string) => (erro: unknown) => {
      if (erro instanceof SessaoExpirada) setSessao("fora");
      return falhaDeRede(fonte);
    };
    Promise.all([
      buscar<Ga4Resposta>(`/api/painel/ga4${q}`, controle.signal).catch(tratar("GA4")),
      buscar<AdsResposta>(`/api/painel/google-ads${q}`, controle.signal).catch(tratar("Google Ads")),
    ]).then(([g, a]) => {
      if (controle.signal.aborted) return;
      setGa4(g);
      setAds(a);
      setIsCarregando(false);
    });
  }, []);

  useEffect(() => {
    const controle = new AbortController();
    fetch("/api/painel/login", { signal: controle.signal, cache: "no-store" })
      .then((r) => r.json() as Promise<{ autenticado?: boolean }>)
      .then((r) => {
        const inicial = periodoDosUltimos(PERIODO_INICIAL);
        setPeriodo(inicial);
        setSessao(r.autenticado ? "dentro" : "fora");
        if (r.autenticado) carregar(inicial);
      })
      .catch(() => !controle.signal.aborted && setSessao("fora"));
    return () => {
      controle.abort();
      emAndamento.current?.abort();
    };
  }, [carregar]);

  function trocarPeriodo(p: PeriodoSelecionado) {
    setPeriodo(p);
    carregar(p);
  }

  function entrar() {
    const p = periodo ?? periodoDosUltimos(PERIODO_INICIAL);
    setPeriodo(p);
    setSessao("dentro");
    carregar(p);
  }

  async function sair() {
    emAndamento.current?.abort();
    await fetch("/api/painel/login", { method: "DELETE" }).catch(() => null);
    setSessao("fora");
    setGa4(null);
    setAds(null);
  }

  if (sessao === "verificando" || !periodo) {
    return <div className="min-h-dvh bg-marfim" aria-busy="true" />;
  }
  if (sessao === "fora") return <LoginPainel onEntrar={entrar} />;

  const contatos = ga4?.status === "ready" ? ga4.events.filter((e) => CONTATOS.includes(e.name)) : [];
  const totalContatos = contatos.reduce((s, e) => s + e.count, 0);
  const contatosAntes = contatos.reduce((s, e) => s + e.previous, 0);

  return (
    <div className="min-h-dvh bg-marfim">
      <header className="border-b border-pedra bg-branco">
        <div className="container-site flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo estático pequeno */}
            <img src="/brand/logo-horizontal-bordo.png" alt="Nicoli Sociedade de Advogados" className="h-8 w-auto" />
            <span className="hidden text-xs uppercase tracking-[0.2em] text-cinza sm:inline">Painel de resultados</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button type="button" onClick={() => carregar(periodo)} className="text-bordo-700 hover:underline">
              Atualizar
            </button>
            <button type="button" onClick={sair} className="text-cinza hover:text-bordo-700">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className={`container-site space-y-16 py-10 transition-opacity ${isCarregando ? "opacity-50" : ""}`} aria-busy={isCarregando}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-h2 text-bordo-700">Resultados do site</h1>
            <p className="mt-1 text-sm text-cinza">Comparação sempre contra o período anterior de mesmo tamanho.</p>
          </div>
          <FiltroPeriodo valor={periodo} onChange={trocarPeriodo} />
        </div>

        {(ga4?.status === "ready" || ads?.status === "ready") && (
          <div className="grid gap-px bg-pedra md:grid-cols-[1.4fr_1fr_1fr]">
            <Kpi
              destaque
              rotulo="Contatos pelo site"
              valor={ga4?.status === "ready" ? numero(totalContatos) : "—"}
              variacao={ga4?.status === "ready" ? variacao(totalContatos, contatosAntes) : null}
              ajuda="Formulário + WhatsApp + telefone (GA4)"
            />
            <Kpi
              rotulo="Investimento no Google Ads"
              valor={ads?.status === "ready" ? moeda(ads.totals.cost, ads.customer.currencyCode) : "—"}
              variacao={ads?.status === "ready" ? variacao(ads.totals.cost, ads.previous.cost, "neutro") : null}
            />
            <Kpi
              rotulo="Custo por conversão (Ads)"
              valor={ads?.status === "ready" ? moeda(ads.totals.costPerConversion, ads.customer.currencyCode) : "—"}
              variacao={ads?.status === "ready" ? variacao(ads.totals.costPerConversion, ads.previous.costPerConversion, "descer") : null}
            />
          </div>
        )}

        <section aria-labelledby="titulo-ads">
          <h2 id="titulo-ads" className="mb-6 font-display text-h3 text-grafite">Google Ads</h2>
          {!ads ? <p className="text-sm text-cinza">Carregando…</p> : ads.status === "ready" ? <SecaoAds relatorio={ads} /> : <AvisoIntegracao fonte="Google Ads" relatorio={ads} />}
        </section>

        <section aria-labelledby="titulo-ga4">
          <h2 id="titulo-ga4" className="mb-6 font-display text-h3 text-grafite">Google Analytics 4</h2>
          {!ga4 ? <p className="text-sm text-cinza">Carregando…</p> : ga4.status === "ready" ? <SecaoGa4 relatorio={ga4} /> : <AvisoIntegracao fonte="GA4" relatorio={ga4} />}
        </section>

        <footer className="border-t border-pedra pt-6 text-xs text-cinza">
          Dados lidos direto do Google Analytics 4 e do Google Ads (só leitura). O GA4 pode levar até 24 h para consolidar o dia.
        </footer>
      </main>
    </div>
  );
}

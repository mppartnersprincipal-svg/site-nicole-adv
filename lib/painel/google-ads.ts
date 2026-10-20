/**
 * Relatórios do Google Ads (REST / SearchStream) para o /dashboard. Só leitura: nunca altera campanhas.
 * Acesso via MCC da M|P (login-customer-id); credenciais só no servidor.
 * Portado do template lp-tracking-dashboard (api/_lib/google-ads.js), com período anterior,
 * série diária e conversões por ação (generate_lead primária; click_whatsapp/click_phone secundárias).
 */
import { intervaloInclusivo, intervaloValido } from "./periodo";
import type { AdsMetricas, AdsResposta } from "./tipos";

class AdsErro extends Error {}

const METRICAS = "metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions";
const TIMEOUT_MS = 20_000;
const VERSAO_PADRAO = "v25";
const ID_CONTA = /^\d{10}$/;

type Env = Record<string, string | undefined>;
type Linha = {
  metrics?: { impressions?: string; clicks?: string; costMicros?: string; conversions?: number | string };
  segments?: { date?: string; conversionActionName?: string };
  campaign?: { id?: string; name?: string; status?: string };
  customer?: { id?: string; descriptiveName?: string; currencyCode?: string; timeZone?: string; manager?: boolean };
};

function numero(valor: unknown): number {
  // O protobuf omite campos com valor zero nas respostas JSON
  if (valor === undefined) return 0;
  const n = Number(valor);
  if (!Number.isFinite(n)) throw new AdsErro("O Google Ads retornou dados inválidos. Tente atualizar o painel.");
  return n;
}

export function metricas(linha: Linha | undefined): AdsMetricas {
  const m = linha?.metrics;
  const impressions = numero(m?.impressions);
  const clicks = numero(m?.clicks);
  const cost = numero(m?.costMicros) / 1_000_000;
  const conversions = numero(m?.conversions);
  return {
    impressions,
    clicks,
    cost,
    conversions,
    ctr: impressions > 0 ? clicks / impressions : null,
    averageCpc: clicks > 0 ? cost / clicks : null,
    costPerConversion: conversions > 0 ? cost / conversions : null,
  };
}

interface Credenciais {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  loginCustomerId?: string;
  versao: string;
}

function lerCredenciais(env: Env): Credenciais | "not_configured" | "invalid" {
  const c = {
    developerToken: env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim() ?? "",
    clientId: env.GOOGLE_ADS_CLIENT_ID?.trim() ?? "",
    clientSecret: env.GOOGLE_ADS_CLIENT_SECRET?.trim() ?? "",
    refreshToken: env.GOOGLE_ADS_REFRESH_TOKEN?.trim() ?? "",
    customerId: env.GOOGLE_ADS_CUSTOMER_ID?.replace(/[\s-]/g, "") ?? "",
    loginCustomerId: env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/[\s-]/g, "") || undefined,
    versao: env.GOOGLE_ADS_API_VERSION?.trim() || VERSAO_PADRAO,
  };
  if (!c.developerToken || !c.clientId || !c.clientSecret || !c.refreshToken || !c.customerId) return "not_configured";
  if (!ID_CONTA.test(c.customerId) || (c.loginCustomerId && !ID_CONTA.test(c.loginCustomerId)) || !/^v\d+$/.test(c.versao)) {
    return "invalid";
  }
  return c;
}

async function autorizar(c: Credenciais, signal: AbortSignal): Promise<string> {
  const resposta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: c.clientId,
      client_secret: c.clientSecret,
      refresh_token: c.refreshToken,
    }),
    cache: "no-store",
    signal,
  });
  if (!resposta.ok) {
    throw new AdsErro(
      resposta.status >= 500 || resposta.status === 429
        ? "O Google Ads está temporariamente indisponível. Tente atualizar o painel em alguns minutos."
        : "Não foi possível autorizar a conexão. Revise o acesso da conta ao Google Ads.",
    );
  }
  const token = (await resposta.json()) as { access_token?: string };
  if (!token?.access_token) throw new AdsErro("Não foi possível autorizar a conexão com o Google Ads.");
  return token.access_token;
}

function criarConsulta(c: Credenciais, accessToken: string, signal: AbortSignal) {
  return async function consultar(gaql: string): Promise<Linha[]> {
    const resposta = await fetch(`https://googleads.googleapis.com/${c.versao}/customers/${c.customerId}/googleAds:searchStream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "developer-token": c.developerToken,
        ...(c.loginCustomerId ? { "login-customer-id": c.loginCustomerId } : {}),
      },
      body: JSON.stringify({ query: gaql }),
      cache: "no-store",
      signal,
    });
    if (!resposta.ok) {
      // Nunca repassar o payload de erro do provedor: pode conter dados da conta
      if (resposta.status === 401 || resposta.status === 403) {
        throw new AdsErro("A conexão não tem acesso aos relatórios desta conta. Revise as permissões do Google Ads.");
      }
      if (resposta.status === 429) throw new AdsErro("O limite de consultas do Google Ads foi atingido. Tente novamente em alguns minutos.");
      throw new AdsErro("Não foi possível consultar o Google Ads. Tente atualizar o painel; se persistir, revise a conexão.");
    }
    const lotes = (await resposta.json()) as unknown;
    const invalido = (l: unknown) => {
      const lote = l as { error?: unknown; results?: unknown } | null;
      return (
        !lote ||
        typeof lote !== "object" ||
        Array.isArray(lote) ||
        Boolean(lote.error) ||
        (lote.results !== undefined && !Array.isArray(lote.results))
      );
    };
    if (!Array.isArray(lotes) || lotes.some(invalido)) {
      throw new AdsErro("O Google Ads retornou uma resposta inesperada. Tente atualizar o painel.");
    }
    // SearchStream devolve vários lotes: lê todos
    return (lotes as { results?: Linha[] }[]).flatMap((lote) => lote.results ?? []);
  };
}

const entre = (inicio: string, fim: string) => `WHERE segments.date BETWEEN '${inicio}' AND '${fim}'`;

export async function buscarRelatorioAds(
  range: { from: Date; to: Date; prevFrom: Date; prevTo: Date },
  env: Env = process.env,
): Promise<AdsResposta> {
  const c = lerCredenciais(env);
  if (c === "not_configured") {
    return {
      status: "not_configured",
      message: "Conecte a conta do Google Ads para acompanhar investimento, cliques e conversões neste painel.",
    };
  }
  if (c === "invalid") return { status: "error", message: "A configuração da conexão com o Google Ads precisa ser revisada." };

  try {
    if (!intervaloValido(range?.from, range?.to) || !intervaloValido(range?.prevFrom, range?.prevTo)) {
      throw new AdsErro("Selecione um período válido para consultar o Google Ads.");
    }
    // As datas são do filtro; o Google aplica a elas o fuso da conta
    const atual = intervaloInclusivo(range.from, range.to);
    const anterior = intervaloInclusivo(range.prevFrom, range.prevTo);
    const signal = AbortSignal.timeout(TIMEOUT_MS);
    const consultar = criarConsulta(c, await autorizar(c, signal), signal);

    const meta = await consultar(
      "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.manager FROM customer LIMIT 1",
    );
    const customer = meta[0]?.customer;
    if (customer?.manager) {
      throw new AdsErro(
        "Selecione a conta de anúncios da Nicoli Advogados. A conexão atual aponta para uma conta de administrador (MCC).",
      );
    }
    if (!customer?.id || !customer.currencyCode || !customer.timeZone) {
      throw new AdsErro("Não foi possível identificar a conta do Google Ads. Revise a conexão.");
    }

    const onde = entre(atual.inicio, atual.fim);
    const [totais, totaisAnteriores, diario, campanhas, conversoes] = await Promise.all([
      consultar(`SELECT ${METRICAS} FROM customer ${onde}`),
      consultar(`SELECT ${METRICAS} FROM customer ${entre(anterior.inicio, anterior.fim)}`),
      consultar(`SELECT segments.date, ${METRICAS} FROM customer ${onde} ORDER BY segments.date`),
      consultar(
        `SELECT campaign.id, campaign.name, campaign.status, ${METRICAS} FROM campaign ${onde} ORDER BY metrics.cost_micros DESC`,
      ),
      consultar(`SELECT segments.conversion_action_name, metrics.conversions FROM customer ${onde}`),
    ]);

    return {
      status: "ready",
      customer: {
        id: customer.id,
        name: customer.descriptiveName || "Conta Google Ads",
        currencyCode: customer.currencyCode,
        timeZone: customer.timeZone,
      },
      from: atual.inicio,
      to: atual.fim,
      totals: metricas(totais[0]),
      previous: metricas(totaisAnteriores[0]),
      daily: diario
        .filter((l) => typeof l.segments?.date === "string")
        .map((l) => {
          const m = metricas(l);
          return { date: l.segments?.date as string, cost: m.cost, clicks: m.clicks, conversions: m.conversions };
        }),
      campaigns: campanhas.map((l) => {
        if (!l.campaign?.id) throw new AdsErro("O Google Ads retornou uma campanha inválida. Tente atualizar o painel.");
        return {
          id: l.campaign.id,
          name: l.campaign.name || "Campanha sem nome",
          status: l.campaign.status || "UNKNOWN",
          ...metricas(l),
        };
      }),
      conversionActions: conversoes
        .map((l) => ({ name: l.segments?.conversionActionName || "(sem nome)", conversions: numero(l.metrics?.conversions) }))
        .filter((a) => a.conversions > 0)
        .sort((a, b) => b.conversions - a.conversions),
      fetchedAt: new Date().toISOString(),
    };
  } catch (erro) {
    return {
      status: "error",
      message:
        erro instanceof AdsErro
          ? erro.message
          : "A consulta ao Google Ads não foi concluída. Tente atualizar o painel em alguns minutos.",
    };
  }
}

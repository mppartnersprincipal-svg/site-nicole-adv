/**
 * Relatórios do GA4 (Data API v1beta, batchRunReports) para o /dashboard. Só leitura.
 * Conta de serviço com papel de Leitor na propriedade; credenciais só no servidor.
 * Portado do template lp-tracking-dashboard (api/_lib/ga4.js) e ampliado com dispositivos
 * e contatos por página (as 11 áreas de atuação são as páginas de captação do Google Ads).
 */
import { sign } from "node:crypto";
import { intervaloInclusivo, intervaloValido } from "./periodo";
import type { Ga4ContatosPagina, Ga4Linha, Ga4Resposta, Ga4Totais } from "./tipos";

class Ga4Erro extends Error {}

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const TIMEOUT_MS = 20_000;
const TOP = 10;
const LIMITE_PAGINAS = 100;

/** Eventos do dataLayer (gtm/TRACKING.md) que o painel acompanha, na ordem do funil. */
export const GA4_EVENTOS = [
  "generate_lead",
  "click_whatsapp",
  "click_phone",
  "form_start",
  "form_submit",
  "click_email",
  "click_cta",
  "blog_read",
] as const;

/** Eventos que contam como contato (conversões do Google Ads + eventos-chave do GA4). */
export const EVENTOS_CONTATO = ["generate_lead", "click_whatsapp", "click_phone"] as const;
type EventoContato = (typeof EVENTOS_CONTATO)[number];

type Env = Record<string, string | undefined>;

interface Linha {
  dims: string[];
  values: number[];
}

interface ContaServico {
  email: string;
  key: string;
}

function numero(valor: unknown): number {
  if (valor === undefined) return 0;
  const n = Number(valor);
  if (!Number.isFinite(n)) throw new Ga4Erro("O GA4 retornou dados inválidos. Tente atualizar o painel.");
  return n;
}

function lerContaServico(raw: string): ContaServico | null {
  try {
    const conta = JSON.parse(raw) as { client_email?: unknown; private_key?: unknown };
    if (
      typeof conta?.client_email === "string" &&
      typeof conta?.private_key === "string" &&
      conta.private_key.includes("PRIVATE KEY")
    ) {
      return { email: conta.client_email, key: conta.private_key };
    }
  } catch {
    // cai na mensagem de configuração
  }
  return null;
}

function assercaoAssinada({ email, key }: ContaServico, agora = Math.floor(Date.now() / 1000)): string {
  const b64 = (v: object) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const semAssinatura = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: agora,
    exp: agora + 3600,
  })}`;
  try {
    return `${semAssinatura}.${sign("sha256", Buffer.from(semAssinatura), key).toString("base64url")}`;
  } catch {
    throw new Ga4Erro("A chave da conta de serviço do GA4 é inválida. Gere uma nova chave JSON e atualize a variável.");
  }
}

function linhasDe(relatorio: unknown): Linha[] {
  const r = relatorio as { rows?: unknown } | null;
  if (!r || typeof r !== "object" || (r.rows !== undefined && !Array.isArray(r.rows))) {
    throw new Ga4Erro("O GA4 retornou uma resposta inesperada. Tente atualizar o painel.");
  }
  const rows = (r.rows ?? []) as { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[];
  return rows.map((row) => ({
    dims: (row.dimensionValues ?? []).map((d) => d?.value ?? ""),
    values: (row.metricValues ?? []).map((m) => numero(m?.value)),
  }));
}

function totaisDe(linhas: Linha[], nome: string): Ga4Totais {
  // Com dois períodos o GA4 acrescenta a dimensão dateRange (o "name" de cada período)
  const linha = linhas.find((l) => l.dims[0] === nome);
  const [sessions = 0, users = 0, newUsers = 0, engagementRate = 0, averageSessionDuration = 0, keyEvents = 0] =
    linha?.values ?? [];
  return {
    sessions,
    users,
    newUsers,
    engagementRate,
    averageSessionDuration,
    keyEvents,
    keyEventRate: sessions > 0 ? keyEvents / sessions : null,
  };
}

type Faixa = { startDate: string; endDate: string; name: string };

function topPor(dimensao: string, atual: Faixa) {
  return {
    dateRanges: [atual],
    dimensions: [{ name: dimensao }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "keyEvents" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TOP,
  };
}

/** Lote 1 (máx. 5 por lote): totais, série diária, canais, páginas de entrada, eventos. */
function loteVisao(atual: Faixa, anterior: Faixa) {
  return [
    {
      dateRanges: [atual, anterior],
      metrics: ["sessions", "totalUsers", "newUsers", "engagementRate", "averageSessionDuration", "keyEvents"].map(
        (name) => ({ name }),
      ),
    },
    {
      dateRanges: [atual],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }, { name: "keyEvents" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    },
    topPor("sessionDefaultChannelGroup", atual),
    topPor("landingPage", atual),
    {
      dateRanges: [atual, anterior],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: [...GA4_EVENTOS] } } },
    },
  ];
}

/** Lote 2: dispositivos e contatos por página (pagePath × eventName). */
function loteDetalhe(atual: Faixa) {
  return [
    topPor("deviceCategory", atual),
    {
      dateRanges: [atual],
      dimensions: [{ name: "pagePath" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: [...EVENTOS_CONTATO] } } },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: LIMITE_PAGINAS,
    },
  ];
}

/** Soma os contatos por página e devolve as que mais geraram contato. */
export function agruparContatos(linhas: Linha[]): Ga4ContatosPagina[] {
  const porPagina = new Map<string, Ga4ContatosPagina>();
  for (const { dims, values } of linhas) {
    const path = dims[0] || "(não definido)";
    const evento = dims[1] as EventoContato;
    if (!EVENTOS_CONTATO.includes(evento)) continue;
    const atual = porPagina.get(path) ?? { path, generate_lead: 0, click_whatsapp: 0, click_phone: 0, total: 0 };
    const qtd = values[0] ?? 0;
    porPagina.set(path, { ...atual, [evento]: atual[evento] + qtd, total: atual.total + qtd });
  }
  return [...porPagina.values()].sort((a, b) => b.total - a.total).slice(0, TOP);
}

const resumo = (linhas: Linha[]): Ga4Linha[] =>
  linhas.map((l) => ({
    key: l.dims[0] || "(não definido)",
    sessions: l.values[0] ?? 0,
    users: l.values[1] ?? 0,
    keyEvents: l.values[2] ?? 0,
  }));

async function autorizar(conta: ContaServico, signal: AbortSignal): Promise<string> {
  const resposta = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: assercaoAssinada(conta),
    }),
    cache: "no-store",
    signal,
  });
  if (!resposta.ok) {
    throw new Ga4Erro(
      resposta.status >= 500 || resposta.status === 429
        ? "O GA4 está temporariamente indisponível. Tente atualizar o painel em alguns minutos."
        : "Não foi possível autorizar a conta de serviço. Revise a chave JSON do GA4.",
    );
  }
  const token = (await resposta.json()) as { access_token?: string };
  if (!token?.access_token) throw new Ga4Erro("Não foi possível autorizar a conexão com o GA4.");
  return token.access_token;
}

async function consultarLote(
  propertyId: string,
  accessToken: string,
  requests: object[],
  signal: AbortSignal,
): Promise<{ rows: Linha[][]; reports: { metadata?: { timeZone?: unknown; subjectToThresholding?: unknown } }[] }> {
  const resposta = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ requests }),
    cache: "no-store",
    signal,
  });
  if (!resposta.ok) {
    // Nunca repassar o payload de erro do provedor: pode conter dados da propriedade
    if (resposta.status === 401 || resposta.status === 403) {
      throw new Ga4Erro("A conta de serviço não tem acesso a esta propriedade. Adicione o e-mail dela como Leitor no GA4.");
    }
    if (resposta.status === 404) throw new Ga4Erro("Propriedade do GA4 não encontrada. Confira o ID numérico da propriedade.");
    if (resposta.status === 429) throw new Ga4Erro("O limite de consultas do GA4 foi atingido. Tente novamente em alguns minutos.");
    throw new Ga4Erro("Não foi possível consultar o GA4. Tente atualizar o painel; se persistir, revise a conexão.");
  }
  const corpo = (await resposta.json()) as { reports?: unknown[] };
  if (!Array.isArray(corpo?.reports) || corpo.reports.length !== requests.length) {
    throw new Ga4Erro("O GA4 retornou uma resposta inesperada. Tente atualizar o painel.");
  }
  return { rows: corpo.reports.map(linhasDe), reports: corpo.reports as never };
}

/**
 * @param range término exclusivo (meia-noite de São Paulo), com o período anterior de mesmo tamanho
 */
export async function buscarRelatorioGa4(
  range: { from: Date; to: Date; prevFrom: Date; prevTo: Date },
  env: Env = process.env,
): Promise<Ga4Resposta> {
  const propertyId = env.GA4_PROPERTY_ID?.trim().replace(/^properties\//, "");
  const contaRaw = (env.GA4_SERVICE_ACCOUNT_JSON || env.GOOGLE_SERVICE_ACCOUNT_JSON)?.trim();

  if (!propertyId || !contaRaw) {
    return {
      status: "not_configured",
      message: "Conecte a propriedade do GA4 para ver sessões, contatos e origens medidos pelo Google Analytics.",
    };
  }
  if (!/^\d{6,12}$/.test(propertyId)) {
    return {
      status: "error",
      message: "Use o ID numérico da propriedade do GA4 (Administrador → Detalhes da propriedade), não o ID de medição G-.",
    };
  }
  const conta = lerContaServico(contaRaw);
  if (!conta) {
    return {
      status: "error",
      message: "A conta de serviço do GA4 precisa ser revisada: cole o arquivo JSON completo da chave na variável.",
    };
  }

  try {
    if (!intervaloValido(range?.from, range?.to) || !intervaloValido(range?.prevFrom, range?.prevTo)) {
      throw new Ga4Erro("Selecione um período válido para consultar o GA4.");
    }
    const a = intervaloInclusivo(range.from, range.to);
    const p = intervaloInclusivo(range.prevFrom, range.prevTo);
    const atual = { startDate: a.inicio, endDate: a.fim, name: "atual" };
    const anterior = { startDate: p.inicio, endDate: p.fim, name: "anterior" };
    const signal = AbortSignal.timeout(TIMEOUT_MS);

    const accessToken = await autorizar(conta, signal);
    const [visao, detalhe] = await Promise.all([
      consultarLote(propertyId, accessToken, loteVisao(atual, anterior), signal),
      consultarLote(propertyId, accessToken, loteDetalhe(atual), signal),
    ]);
    const [totais, diario, canais, entradas, eventos] = visao.rows;
    const [dispositivos, contatos] = detalhe.rows;
    const metadata = visao.reports[0]?.metadata ?? {};
    const contagem = (nome: string, periodo: string) =>
      eventos.find((l) => l.dims[0] === nome && l.dims[1] === periodo)?.values[0] ?? 0;

    return {
      status: "ready",
      propertyId,
      from: atual.startDate,
      to: atual.endDate,
      timeZone: typeof metadata.timeZone === "string" ? metadata.timeZone : null,
      thresholded: [...visao.reports, ...detalhe.reports].some((r) => r?.metadata?.subjectToThresholding === true),
      totals: totaisDe(totais, "atual"),
      previous: totaisDe(totais, "anterior"),
      daily: diario.map((l) => ({
        date: `${l.dims[0].slice(0, 4)}-${l.dims[0].slice(4, 6)}-${l.dims[0].slice(6, 8)}`,
        sessions: l.values[0] ?? 0,
        keyEvents: l.values[1] ?? 0,
      })),
      channels: resumo(canais),
      landingPages: resumo(entradas),
      devices: resumo(dispositivos),
      events: GA4_EVENTOS.map((name) => ({ name, count: contagem(name, "atual"), previous: contagem(name, "anterior") })),
      contactPages: agruparContatos(contatos),
      fetchedAt: new Date().toISOString(),
    };
  } catch (erro) {
    return {
      status: "error",
      message:
        erro instanceof Ga4Erro
          ? erro.message
          : "A consulta ao GA4 não foi concluída. Tente atualizar o painel em alguns minutos.",
    };
  }
}

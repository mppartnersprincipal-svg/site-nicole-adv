// Google Ads (SearchStream) com respostas simuladas: micros, conversões fracionárias, lotes, MCC e erros.
// Nenhuma chamada real.
import "./helpers/ts-resolve.mjs";
import assert from "node:assert/strict";
import { test } from "node:test";

const { buscarRelatorioAds } = await import("../lib/painel/google-ads.ts");

const env = {
  GOOGLE_ADS_DEVELOPER_TOKEN: "test-developer-secret",
  GOOGLE_ADS_CLIENT_ID: "test-client-id",
  GOOGLE_ADS_CLIENT_SECRET: "test-client-secret",
  GOOGLE_ADS_REFRESH_TOKEN: "test-refresh-secret",
  GOOGLE_ADS_CUSTOMER_ID: "123-456-7890",
};
const range = {
  from: new Date("2026-09-01T03:00:00.000Z"),
  to: new Date("2026-09-22T03:00:00.000Z"),
  prevFrom: new Date("2026-08-11T03:00:00.000Z"),
  prevTo: new Date("2026-09-01T03:00:00.000Z"),
};
const customer = { id: "1234567890", descriptiveName: "Nicoli Advogados", currencyCode: "BRL", timeZone: "America/Sao_Paulo" };
const accessToken = "test-access-secret";
const segredosProvedor = "Provider details test-refresh-secret test-access-secret test-client-secret";

function fase(query) {
  if (query === null) return "token";
  if (query.includes("customer.id")) return "metadata";
  if (query.includes("conversion_action_name")) return "conversions";
  if (/FROM campaign\b/.test(query)) return "campaigns";
  if (query.includes("SELECT segments.date")) return "daily";
  if (query.includes("'2026-08-11'")) return "previous";
  return "totals";
}

function mockGoogle(t, overrides = {}) {
  const requests = [];
  const responses = {
    token: { body: { access_token: accessToken } },
    metadata: { body: [{ results: [{ customer }] }] },
    totals: { body: [] },
    previous: { body: [] },
    daily: { body: [] },
    campaigns: { body: [] },
    conversions: { body: [] },
    ...overrides,
  };
  t.mock.method(globalThis, "fetch", async (url, init) => {
    const query = url.includes("oauth2") ? null : JSON.parse(init.body).query;
    const phase = fase(query);
    requests.push({ url, init, query, phase });
    const response = responses[phase];
    if (response instanceof Error) throw response;
    return Response.json(response.body, { status: response.status ?? 200 });
  });
  return requests;
}

function assertErroSeguro(report, pattern) {
  assert.equal(report.status, "error");
  assert.match(report.message, pattern);
  assert.deepEqual(Object.keys(report).sort(), ["message", "status"]);
  const serializado = JSON.stringify(report);
  for (const segredo of [env.GOOGLE_ADS_DEVELOPER_TOKEN, env.GOOGLE_ADS_CLIENT_SECRET, env.GOOGLE_ADS_REFRESH_TOKEN, accessToken, "Provider details"]) {
    assert.ok(!serializado.includes(segredo), `Resposta de erro expôs ${segredo}`);
  }
}

test("sem credenciais: estado de conexão, sem chamar o Google", async (t) => {
  const requests = mockGoogle(t);
  for (const key of Object.keys(env)) {
    const report = await buscarRelatorioAds(range, { ...env, [key]: "" });
    assert.equal(report.status, "not_configured", key);
    assert.match(report.message, /Google Ads/);
  }
  assert.equal(requests.length, 0);
});

test("renova o OAuth e envia IDs normalizados da conta e da MCC só nas requisições do servidor", async (t) => {
  const requests = mockGoogle(t);
  const report = await buscarRelatorioAds(range, { ...env, GOOGLE_ADS_LOGIN_CUSTOMER_ID: " 603-989-2603 " });
  assert.equal(report.status, "ready");
  const oauth = requests.find((r) => r.phase === "token");
  assert.deepEqual(Object.fromEntries(new URLSearchParams(oauth.init.body)), {
    grant_type: "refresh_token",
    client_id: env.GOOGLE_ADS_CLIENT_ID,
    client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN,
  });
  const consultas = requests.filter((r) => r.query);
  assert.deepEqual(consultas.map((r) => r.phase).sort(), ["campaigns", "conversions", "daily", "metadata", "previous", "totals"]);
  for (const r of consultas) {
    assert.equal(r.url, "https://googleads.googleapis.com/v25/customers/1234567890/googleAds:searchStream");
    const headers = new Headers(r.init.headers);
    assert.equal(headers.get("Authorization"), `Bearer ${accessToken}`);
    assert.equal(headers.get("developer-token"), env.GOOGLE_ADS_DEVELOPER_TOKEN);
    assert.equal(headers.get("login-customer-id"), "6039892603");
  }
  for (const r of requests) {
    assert.equal(r.init.cache, "no-store");
    assert.ok(r.init.signal instanceof AbortSignal);
  }
  assert.deepEqual(report.customer, { id: "1234567890", name: "Nicoli Advogados", currencyCode: "BRL", timeZone: "America/Sao_Paulo" });
  assert.ok(!JSON.stringify(report).includes(accessToken));
});

test("conta ligada direto (sem MCC) não envia login-customer-id", async (t) => {
  const requests = mockGoogle(t);
  assert.equal((await buscarRelatorioAds(range, env)).status, "ready");
  for (const r of requests.filter((r) => r.query)) assert.equal(new Headers(r.init.headers).has("login-customer-id"), false);
});

test("usa datas inclusivas no período atual e no anterior", async (t) => {
  const requests = mockGoogle(t);
  const report = await buscarRelatorioAds(range, env);
  assert.equal(report.from, "2026-09-01");
  assert.equal(report.to, "2026-09-21");
  for (const r of requests.filter((r) => ["totals", "daily", "campaigns", "conversions"].includes(r.phase))) {
    assert.ok(r.query.includes("segments.date BETWEEN '2026-09-01' AND '2026-09-21'"), r.phase);
  }
  assert.ok(requests.find((r) => r.phase === "previous").query.includes("BETWEEN '2026-08-11' AND '2026-08-31'"));
});

test("mantém conversões fracionárias, calcula taxas pelos totais e mapeia série, anterior e ações", async (t) => {
  mockGoogle(t, {
    totals: { body: [{ results: [{ metrics: { impressions: "1400", clicks: "80", costMicros: "200000000", conversions: "4.5" } }] }] },
    previous: { body: [{ results: [{ metrics: { impressions: "1000", clicks: "40", costMicros: "100000000", conversions: 2 } }] }] },
    daily: {
      body: [
        {
          results: [
            { segments: { date: "2026-09-01" }, metrics: { clicks: "5", costMicros: "12500000", conversions: 1 } },
            { segments: { date: "2026-09-02" }, metrics: {} },
          ],
        },
      ],
    },
    campaigns: {
      body: [
        { results: [{ campaign: { id: "1", name: "Trabalhista", status: "ENABLED" }, metrics: { impressions: "100", clicks: "50", costMicros: "150000000", conversions: "2.5" } }] },
        { results: [{ campaign: { id: "2", name: "Tributário", status: "PAUSED" }, metrics: { impressions: 900, clicks: 20, costMicros: 25000000, conversions: 1 } }] },
        {},
      ],
    },
    conversions: {
      body: [
        {
          results: [
            { segments: { conversionActionName: "Clique no WhatsApp" }, metrics: { conversions: 1 } },
            { segments: { conversionActionName: "Formulário (generate_lead)" }, metrics: { conversions: 3.5 } },
            { segments: { conversionActionName: "Ligação" }, metrics: {} },
          ],
        },
      ],
    },
  });
  const report = await buscarRelatorioAds(range, env);
  assert.equal(report.status, "ready");
  assert.deepEqual(report.totals, {
    impressions: 1400,
    clicks: 80,
    cost: 200,
    conversions: 4.5,
    ctr: 80 / 1400,
    averageCpc: 2.5,
    costPerConversion: 200 / 4.5,
  });
  assert.equal(report.previous.cost, 100);
  assert.equal(report.previous.costPerConversion, 50);
  assert.deepEqual(report.daily, [
    { date: "2026-09-01", cost: 12.5, clicks: 5, conversions: 1 },
    { date: "2026-09-02", cost: 0, clicks: 0, conversions: 0 },
  ]);
  assert.deepEqual(report.campaigns.map((c) => c.id), ["1", "2"]);
  assert.equal(report.campaigns[0].conversions, 2.5);
  assert.equal(report.campaigns[1].status, "PAUSED");
  assert.deepEqual(report.conversionActions, [
    { name: "Formulário (generate_lead)", conversions: 3.5 },
    { name: "Clique no WhatsApp", conversions: 1 },
  ]);
});

test("período vazio devolve zeros e taxas nulas", async (t) => {
  mockGoogle(t, { totals: { body: [{ results: [{}] }] }, campaigns: { body: [{ results: [{ campaign: { id: "1" } }] }] } });
  const report = await buscarRelatorioAds(range, env);
  const zerado = { impressions: 0, clicks: 0, cost: 0, conversions: 0, ctr: null, averageCpc: null, costPerConversion: null };
  assert.deepEqual(report.totals, zerado);
  assert.deepEqual(report.campaigns[0], { id: "1", name: "Campanha sem nome", status: "UNKNOWN", ...zerado });
  assert.deepEqual(report.conversionActions, []);
});

test("IDs de conta, MCC e versão inválidos falham antes da rede", async (t) => {
  const requests = mockGoogle(t);
  for (const override of [
    { GOOGLE_ADS_CUSTOMER_ID: "123456789" },
    { GOOGLE_ADS_CUSTOMER_ID: "AW-1234567890" },
    { GOOGLE_ADS_LOGIN_CUSTOMER_ID: "123" },
    { GOOGLE_ADS_API_VERSION: "v25/outro-caminho" },
  ]) {
    assertErroSeguro(await buscarRelatorioAds(range, { ...env, ...override }), /configuração/);
  }
  assert.equal(requests.length, 0);
});

test("períodos inválidos falham antes da rede", async (t) => {
  const requests = mockGoogle(t);
  for (const invalido of [
    { ...range, from: new Date("invalid") },
    { ...range, to: range.from },
    { ...range, prevFrom: range.prevTo },
  ]) {
    assertErroSeguro(await buscarRelatorioAds(invalido, env), /período válido/);
  }
  assert.equal(requests.length, 0);
});

test("recusa conta de administrador (MCC) antes das consultas de desempenho", async (t) => {
  const requests = mockGoogle(t, { metadata: { body: [{ results: [{ customer: { ...customer, manager: true } }] }] } });
  assertErroSeguro(await buscarRelatorioAds(range, env), /conta de administrador/);
  assert.deepEqual(requests.map((r) => r.phase), ["token", "metadata"]);
});

test("falhas de OAuth são seguras e param antes das consultas", async (t) => {
  for (const status of [400, 401, 429, 500]) {
    await t.test(`HTTP ${status}`, async (st) => {
      const requests = mockGoogle(st, { token: { status, body: { error_description: segredosProvedor } } });
      assertErroSeguro(await buscarRelatorioAds(range, env), status >= 429 ? /temporariamente indisponível/ : /autorizar/);
      assert.deepEqual(requests.map((r) => r.phase), ["token"]);
    });
  }
});

test("falhas de permissão, cota e de um relatório nunca devolvem métricas parciais", async (t) => {
  for (const c of [
    { phase: "metadata", status: 403, message: /permissões/ },
    { phase: "totals", status: 429, message: /limite de consultas/ },
    { phase: "conversions", status: 500, message: /consultar o Google Ads/ },
    { phase: "daily", status: 400, message: /consultar o Google Ads/ },
  ]) {
    await t.test(`${c.phase} HTTP ${c.status}`, async (st) => {
      mockGoogle(st, { [c.phase]: { status: c.status, body: { error: segredosProvedor } } });
      assertErroSeguro(await buscarRelatorioAds(range, env), c.message);
    });
  }
});

test("payloads malformados e números inválidos não viram métricas", async (t) => {
  const cenarios = [
    { token: { body: {} } },
    { metadata: { body: [] } },
    { totals: { body: { results: [] } } },
    { campaigns: { body: [{ error: segredosProvedor }] } },
    { totals: { body: [{ results: {} }] } },
    { campaigns: { body: [null] } },
    { campaigns: { body: [{ results: [{ metrics: {} }] }] } },
    { totals: { body: [{ results: [{ metrics: { impressions: "invalid" } }] }] } },
    { previous: { body: [{ results: [{ metrics: { costMicros: "Infinity" } }] }] } },
    { totals: new Error(segredosProvedor) },
  ];
  for (const [i, overrides] of cenarios.entries()) {
    await t.test(`cenário ${i}`, async (st) => {
      mockGoogle(st, overrides);
      assertErroSeguro(await buscarRelatorioAds(range, env), /Google Ads/);
    });
  }
});

test("lê todos os lotes do SearchStream, inclusive campanhas pausadas", async (t) => {
  const lote = (inicio, n, status) => ({
    results: Array.from({ length: n }, (_, i) => ({
      campaign: { id: String(inicio + i), name: `Campanha ${inicio + i}`, status },
      metrics: { impressions: "10", clicks: "1", costMicros: "1000000" },
    })),
  });
  mockGoogle(t, { campaigns: { body: [lote(1, 40, "ENABLED"), lote(41, 40, "PAUSED"), lote(81, 5, "REMOVED")] } });
  const report = await buscarRelatorioAds(range, env);
  assert.equal(report.campaigns.length, 85);
  assert.equal(report.campaigns.filter((c) => c.status === "PAUSED").length, 40);
});

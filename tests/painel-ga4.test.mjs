// GA4 Data API com respostas simuladas (JWT da conta de serviço, períodos, lotes, erros). Nenhuma chamada real.
import "./helpers/ts-resolve.mjs";
import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import { test } from "node:test";

const { buscarRelatorioGa4, GA4_EVENTOS, EVENTOS_CONTATO } = await import("../lib/painel/ga4.ts");

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const conta = {
  type: "service_account",
  client_email: "dashboard-ga4@teste.iam.gserviceaccount.com",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }),
};
const env = { GA4_PROPERTY_ID: "123456789", GA4_SERVICE_ACCOUNT_JSON: JSON.stringify(conta) };
// 01 a 21/09 (término exclusivo à meia-noite de São Paulo) e os 21 dias anteriores
const range = {
  from: new Date("2026-09-01T03:00:00.000Z"),
  to: new Date("2026-09-22T03:00:00.000Z"),
  prevFrom: new Date("2026-08-11T03:00:00.000Z"),
  prevTo: new Date("2026-09-01T03:00:00.000Z"),
};
const accessToken = "test-access-secret";

const row = (dims, values) => ({
  dimensionValues: dims.map((value) => ({ value })),
  metricValues: values.map((value) => ({ value: String(value) })),
});

const loteVisao = () => ({
  reports: [
    {
      rows: [row(["atual"], [200, 150, 120, 0.61, 95.5, 30]), row(["anterior"], [100, 80, 70, 0.5, 80, 10])],
      metadata: { timeZone: "America/Sao_Paulo" },
    },
    { rows: [row(["20260901"], [10, 2]), row(["20260902"], [12, 1])] },
    { rows: [row(["Paid Search"], [120, 90, 25]), row(["Direct"], [80, 60, 5])] },
    { rows: [row(["/areas-de-atuacao/direito-trabalhista"], [90, 70, 15])] },
    {
      rows: [
        row(["generate_lead", "atual"], [12]),
        row(["click_whatsapp", "atual"], [22]),
        row(["click_whatsapp", "anterior"], [8]),
      ],
    },
  ],
});

const loteDetalhe = () => ({
  reports: [
    { rows: [row(["mobile"], [150, 120, 25]), row(["desktop"], [50, 40, 5])] },
    {
      rows: [
        row(["/areas-de-atuacao/direito-trabalhista", "click_whatsapp"], [10]),
        row(["/areas-de-atuacao/direito-trabalhista", "generate_lead"], [6]),
        row(["/", "click_whatsapp"], [7]),
        row(["/contato", "click_phone"], [2]),
        row(["/", "evento_estranho"], [99]),
      ],
    },
  ],
});

function mockGoogle(t, overrides = {}) {
  const requests = [];
  const responses = {
    token: { body: { access_token: accessToken } },
    visao: { body: loteVisao() },
    detalhe: { body: loteDetalhe() },
    ...overrides,
  };
  t.mock.method(globalThis, "fetch", async (url, init) => {
    let phase = "token";
    if (!url.includes("oauth2")) phase = JSON.parse(init.body).requests.length === 5 ? "visao" : "detalhe";
    requests.push({ url, init, phase });
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
  for (const segredo of [accessToken, "PRIVATE KEY", "Provider details"]) {
    assert.ok(!serializado.includes(segredo), `Resposta de erro expôs ${segredo}`);
  }
}

test("sem variáveis: estado de conexão, sem chamar o Google", async (t) => {
  const requests = mockGoogle(t);
  for (const key of Object.keys(env)) {
    const report = await buscarRelatorioGa4(range, { ...env, [key]: "" });
    assert.equal(report.status, "not_configured", key);
    assert.match(report.message, /GA4/);
  }
  assert.equal(requests.length, 0);
});

test("aceita GOOGLE_SERVICE_ACCOUNT_JSON (mesma variável dos outros painéis)", async (t) => {
  mockGoogle(t);
  const report = await buscarRelatorioGa4(range, {
    GA4_PROPERTY_ID: env.GA4_PROPERTY_ID,
    GOOGLE_SERVICE_ACCOUNT_JSON: env.GA4_SERVICE_ACCOUNT_JSON,
  });
  assert.equal(report.status, "ready");
});

test("recusa ID de medição G- e JSON quebrado antes de chamar o Google", async (t) => {
  const requests = mockGoogle(t);
  assertErroSeguro(await buscarRelatorioGa4(range, { ...env, GA4_PROPERTY_ID: "G-0J96MVPZ7W" }), /ID numérico/);
  assertErroSeguro(await buscarRelatorioGa4(range, { ...env, GA4_SERVICE_ACCOUNT_JSON: "{nope" }), /JSON completo/);
  assertErroSeguro(
    await buscarRelatorioGa4(range, { ...env, GA4_SERVICE_ACCOUNT_JSON: JSON.stringify({ client_email: "x" }) }),
    /JSON completo/,
  );
  assert.equal(requests.length, 0);
});

test("assina JWT só-leitura e consulta a propriedade em dois lotes com datas inclusivas", async (t) => {
  const requests = mockGoogle(t);
  const report = await buscarRelatorioGa4(range, { ...env, GA4_PROPERTY_ID: " properties/123456789 " });
  assert.equal(report.status, "ready");

  const oauth = requests.find((r) => r.phase === "token");
  const form = Object.fromEntries(new URLSearchParams(oauth.init.body));
  assert.equal(form.grant_type, "urn:ietf:params:oauth:grant-type:jwt-bearer");
  const [header, claims, signature] = form.assertion.split(".");
  assert.ok(verify("sha256", Buffer.from(`${header}.${claims}`), publicKey, Buffer.from(signature, "base64url")));
  const payload = JSON.parse(Buffer.from(claims, "base64url").toString());
  assert.equal(payload.iss, conta.client_email);
  assert.equal(payload.scope, "https://www.googleapis.com/auth/analytics.readonly");
  assert.equal(payload.exp - payload.iat, 3600);

  const lotes = requests.filter((r) => r.phase !== "token");
  assert.equal(lotes.length, 2);
  for (const lote of lotes) {
    assert.equal(lote.url, "https://analyticsdata.googleapis.com/v1beta/properties/123456789:batchRunReports");
    assert.equal(new Headers(lote.init.headers).get("Authorization"), `Bearer ${accessToken}`);
    assert.equal(lote.init.cache, "no-store");
    assert.ok(JSON.parse(lote.init.body).requests.length <= 5, "a Data API aceita no máximo 5 relatórios por lote");
  }
  const visao = JSON.parse(lotes.find((r) => r.phase === "visao").init.body);
  assert.deepEqual(visao.requests[0].dateRanges, [
    { startDate: "2026-09-01", endDate: "2026-09-21", name: "atual" },
    { startDate: "2026-08-11", endDate: "2026-08-31", name: "anterior" },
  ]);
  assert.deepEqual(visao.requests[4].dimensionFilter.filter.inListFilter.values, [...GA4_EVENTOS]);
  const detalhe = JSON.parse(lotes.find((r) => r.phase === "detalhe").init.body);
  assert.deepEqual(detalhe.requests[1].dimensionFilter.filter.inListFilter.values, [...EVENTOS_CONTATO]);
});

test("mapeia totais, período anterior, série, canais, dispositivos, eventos e contatos por página", async (t) => {
  mockGoogle(t);
  const report = await buscarRelatorioGa4(range, env);
  assert.equal(report.from, "2026-09-01");
  assert.equal(report.to, "2026-09-21");
  assert.equal(report.timeZone, "America/Sao_Paulo");
  assert.equal(report.thresholded, false);
  assert.deepEqual(report.totals, {
    sessions: 200,
    users: 150,
    newUsers: 120,
    engagementRate: 0.61,
    averageSessionDuration: 95.5,
    keyEvents: 30,
    keyEventRate: 0.15,
  });
  assert.equal(report.previous.sessions, 100);
  assert.deepEqual(report.daily[0], { date: "2026-09-01", sessions: 10, keyEvents: 2 });
  assert.deepEqual(report.channels[0], { key: "Paid Search", sessions: 120, users: 90, keyEvents: 25 });
  assert.equal(report.landingPages[0].key, "/areas-de-atuacao/direito-trabalhista");
  assert.deepEqual(report.devices[0], { key: "mobile", sessions: 150, users: 120, keyEvents: 25 });
  assert.deepEqual(report.events.find((e) => e.name === "click_whatsapp"), { name: "click_whatsapp", count: 22, previous: 8 });
  assert.deepEqual(report.events.find((e) => e.name === "blog_read"), { name: "blog_read", count: 0, previous: 0 });
  assert.deepEqual(report.contactPages, [
    { path: "/areas-de-atuacao/direito-trabalhista", generate_lead: 6, click_whatsapp: 10, click_phone: 0, total: 16 },
    { path: "/", generate_lead: 0, click_whatsapp: 7, click_phone: 0, total: 7 },
    { path: "/contato", generate_lead: 0, click_whatsapp: 0, click_phone: 2, total: 2 },
  ]);
});

test("propriedade vazia devolve zeros e taxas nulas em vez de falhar", async (t) => {
  mockGoogle(t, { visao: { body: { reports: [{}, {}, {}, {}, {}] } }, detalhe: { body: { reports: [{}, {}] } } });
  const report = await buscarRelatorioGa4(range, env);
  assert.equal(report.status, "ready");
  assert.equal(report.totals.sessions, 0);
  assert.equal(report.totals.keyEventRate, null);
  assert.deepEqual(report.daily, []);
  assert.deepEqual(report.contactPages, []);
});

test("sinaliza dados com limite (thresholding) em qualquer lote", async (t) => {
  const body = loteDetalhe();
  body.reports[1].metadata = { subjectToThresholding: true };
  mockGoogle(t, { detalhe: { body } });
  assert.equal((await buscarRelatorioGa4(range, env)).thresholded, true);
});

test("falhas do provedor viram mensagens seguras", async (t) => {
  const casos = [
    [{ token: { status: 400, body: { error: "Provider details" } } }, /chave JSON/],
    [{ token: { status: 503, body: {} } }, /temporariamente indisponível/],
    [{ visao: { status: 403, body: { error: "Provider details" } } }, /Leitor/],
    [{ detalhe: { status: 404, body: {} } }, /não encontrada/],
    [{ visao: { status: 429, body: {} } }, /limite/],
    [{ visao: { body: { reports: [{}] } } }, /resposta inesperada/],
    [{ visao: { body: { reports: [{ rows: [row(["atual"], ["abc"])] }, {}, {}, {}, {}] } } }, /dados inválidos/],
    [{ detalhe: new TypeError("network down Provider details") }, /não foi concluída/],
  ];
  for (const [overrides, pattern] of casos) {
    await t.test(String(pattern), async (st) => {
      mockGoogle(st, overrides);
      assertErroSeguro(await buscarRelatorioGa4(range, env), pattern);
    });
  }
});

test("período inválido nunca chama o Google", async (t) => {
  const requests = mockGoogle(t);
  assertErroSeguro(await buscarRelatorioGa4({ ...range, to: range.from }, env), /período válido/);
  assert.equal(requests.length, 0);
});

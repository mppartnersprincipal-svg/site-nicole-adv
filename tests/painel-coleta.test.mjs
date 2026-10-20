// Coleta própria do painel: origem da sessão, validação do lote, filtro de período, jornadas e espelhamento.
import "./helpers/ts-resolve.mjs";
import assert from "node:assert/strict";
import { describe, test } from "node:test";

const { classificarCanal, hostSemWww } = await import("../lib/painel/canal.ts");
const { interpretarLote, limparParams, MAX_CORPO } = await import("../lib/painel/coleta.ts");
const { lerIntervalo, intervaloAnterior, comParams } = await import("../lib/painel/filtro.ts");
const { resumirTrilha, cliquesGenericos } = await import("../lib/painel/jornada.ts");
const { paramsParaPainel, deveEspelhar } = await import("../lib/painel/coletor.ts");
const { labelPage, labelArea, labelLocation, fmtDuration } = await import("../lib/painel/rotulos.ts");

const SITE = "nicoliadvogados.adv.br";
const SID = "0f8fad5b-d9cb-469f-a165-70867728950e";
const ctx = { siteHost: SITE, device: "mobile", browserName: "Mobile Safari", osName: "iOS", country: "BR", region: "GO", city: "Goi%C3%A2nia" };

describe("classificarCanal", () => {
  const base = { gclid: false, siteHost: SITE };
  test("gclid e google/cpc são Google Ads", () => {
    assert.equal(classificarCanal({ ...base, gclid: true }), "google_ads");
    assert.equal(classificarCanal({ ...base, utmSource: "Google", utmMedium: "CPC" }), "google_ads");
  });
  test("teste pelo painel do Ads ou ValueTrack cru vira direto", () => {
    assert.equal(classificarCanal({ ...base, referrerHost: "ads.google.com", utmSource: "google", utmMedium: "cpc" }), "direct");
    assert.equal(classificarCanal({ ...base, utmSource: "google", utmMedium: "cpc", utmTerm: "{keyword}" }), "direct");
  });
  test("referrers: google orgânico, buscadores, redes, outros sites e interno", () => {
    assert.equal(classificarCanal({ ...base, referrerHost: "google.com.br" }), "google_organic");
    assert.equal(classificarCanal({ ...base, referrerHost: "bing.com" }), "other_search");
    assert.equal(classificarCanal({ ...base, referrerHost: "instagram.com" }), "social");
    assert.equal(classificarCanal({ ...base, referrerHost: "jusbrasil.com.br" }), "referral");
    assert.equal(classificarCanal({ ...base, referrerHost: SITE }), "direct");
    assert.equal(classificarCanal(base), "direct");
  });
  test("hostSemWww tira www e ignora URL inválida", () => {
    assert.equal(hostSemWww("https://www.google.com.br/search?q=x"), "google.com.br");
    assert.equal(hostSemWww("não é url"), null);
  });
});

describe("interpretarLote", () => {
  const lote = (extra = {}) =>
    JSON.stringify({
      v: 1,
      sid: SID.toUpperCase(),
      s: { path: "/areas-de-atuacao/advogado-trabalhista", ref: "https://www.google.com/", utm: {}, gclid: false, sw: 390, sh: 844, lang: "pt-BR" },
      e: [{ n: "page_view", p: "/areas-de-atuacao/advogado-trabalhista", t: "Trabalhista", d: { sw: 390 } }],
      ...extra,
    });

  test("monta sessão e eventos com sinais reduzidos (sem IP nem UA cru)", () => {
    const r = interpretarLote(lote(), ctx);
    assert.equal(r.ok, true);
    assert.equal(r.sid, SID);
    assert.equal(r.sessao.channel, "google_organic");
    assert.equal(r.sessao.browser, "safari");
    assert.equal(r.sessao.os, "ios");
    assert.equal(r.sessao.city, "Goiânia");
    assert.equal(r.sessao.visitor_id, null);
    assert.deepEqual(r.eventos[0], {
      session_id: SID,
      name: "page_view",
      path: "/areas-de-atuacao/advogado-trabalhista",
      title: "Trabalhista",
      params: { sw: 390 },
    });
    assert.ok(!JSON.stringify(r).includes("Mobile Safari"));
  });

  test("aceita visitor id só em formato UUID", () => {
    const comVid = JSON.parse(lote());
    comVid.s.vid = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    assert.equal(interpretarLote(JSON.stringify(comVid), ctx).sessao.visitor_id, "6ba7b810-9dad-11d1-80b4-00c04fd430c8");
    comVid.s.vid = "qualquer-coisa";
    assert.equal(interpretarLote(JSON.stringify(comVid), ctx).sessao.visitor_id, null);
  });

  test("descarta eventos com nome ou caminho inválido e limita parâmetros", () => {
    const r = interpretarLote(
      lote({
        s: undefined,
        e: [
          { n: "Page View", p: "/" },
          { n: "click", p: "https://fora.com" },
          { n: "click_whatsapp", p: "/", d: { link_location: "floating", "Chave-Ruim": 1, obj: { a: 1 }, ok: true } },
        ],
      }),
      ctx,
    );
    assert.equal(r.sessao, null);
    assert.equal(r.eventos.length, 1);
    assert.deepEqual(r.eventos[0].params, { link_location: "floating", ok: true });
  });

  test("corpo inválido, sid inválido ou grande demais", () => {
    assert.deepEqual(interpretarLote("{", ctx), { ok: false, status: 400 });
    assert.deepEqual(interpretarLote(JSON.stringify({ sid: "x", e: [] }), ctx), { ok: false, status: 400 });
    assert.deepEqual(interpretarLote("x".repeat(MAX_CORPO + 1), ctx), { ok: false, status: 413 });
  });

  test("limparParams aceita só tipos simples e no máximo 20 chaves", () => {
    const muitos = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`k${i}`, i]));
    assert.equal(Object.keys(limparParams(muitos)).length, 20);
    assert.deepEqual(limparParams(["a"]), {});
    assert.deepEqual(limparParams({ n: Infinity, s: "x".repeat(300) }), { s: "x".repeat(200) });
  });
});

describe("filtro do painel", () => {
  const agora = new Date("2026-10-20T15:00:00Z");
  test("padrão: últimos 30 dias até o fim de hoje (Brasília)", () => {
    const r = lerIntervalo({}, agora);
    assert.equal(r.period, "30d");
    assert.equal(r.from.toISOString(), "2026-09-21T03:00:00.000Z");
    assert.equal(r.to.toISOString(), "2026-10-21T03:00:00.000Z");
    assert.equal(r.channel, null);
  });
  test("hoje, 7d e origem válida", () => {
    assert.equal(lerIntervalo({ periodo: "hoje" }, agora).from.toISOString(), "2026-10-20T03:00:00.000Z");
    assert.equal(lerIntervalo({ periodo: "7d", origem: "google_ads" }, agora).channel, "google_ads");
    assert.equal(lerIntervalo({ origem: "hack" }, agora).channel, null);
  });
  test("personalizado válido; inválido cai no padrão", () => {
    const r = lerIntervalo({ periodo: "custom", de: "2026-10-01", ate: "2026-10-05" }, agora);
    assert.equal(r.label, "01/10 a 05/10");
    assert.equal(r.to.toISOString(), "2026-10-06T03:00:00.000Z");
    assert.equal(lerIntervalo({ periodo: "custom", de: "2026-02-30", ate: "2026-03-01" }, agora).period, "30d");
    assert.equal(lerIntervalo({ periodo: "custom", de: "2026-10-05", ate: "2026-10-01" }, agora).period, "30d");
  });
  test("período anterior tem o mesmo tamanho e termina onde o atual começa", () => {
    const r = lerIntervalo({ periodo: "7d" }, agora);
    const p = intervaloAnterior(r);
    assert.equal(p.to.getTime(), r.from.getTime());
    assert.equal(r.to - r.from, p.to - p.from);
  });
  test("comParams preserva filtros e remove chaves", () => {
    assert.equal(comParams({ periodo: "7d", jornadas: "todas" }, { jornadas: null, contato: "generate_lead" }), "?periodo=7d&contato=generate_lead");
  });
});

describe("jornadas", () => {
  const trilha = [
    { ts: "2026-10-20T13:00:00Z", name: "page_view", path: "/areas-de-atuacao/advogado-trabalhista", title: "x", params: {} },
    { ts: "2026-10-20T13:00:30Z", name: "click", path: "/areas-de-atuacao/advogado-trabalhista", title: null, params: { text: "Ver serviços" } },
    { ts: "2026-10-20T13:00:40Z", name: "form_start", path: "/areas-de-atuacao/advogado-trabalhista", title: null, params: {} },
    { ts: "2026-10-20T13:00:48Z", name: "page_leave", path: "/areas-de-atuacao/advogado-trabalhista", title: null, params: { duration_ms: 48000 } },
    { ts: "2026-10-20T13:00:50Z", name: "generate_lead", path: "/areas-de-atuacao/advogado-trabalhista", title: null, params: {} },
    { ts: "2026-10-20T13:01:00Z", name: "click_whatsapp", path: "/", title: null, params: { link_location: "floating" } },
  ];
  test("resume a trilha em passos legíveis", () => {
    const passos = resumirTrilha(trilha);
    assert.deepEqual(
      passos.map((p) => [p.kind, p.label, p.detail]),
      [
        ["page", "Área · Trabalhista", "48 s"], // o page_leave volta para a página certa
        ["form", "Começou o formulário", "Trabalhista"],
        ["lead", "Enviou o formulário", "Trabalhista"],
        ["whatsapp", "WhatsApp", "Botão flutuante"],
      ],
    );
  });
  test("cliques genéricos com rótulo e página", () => {
    assert.deepEqual(cliquesGenericos(trilha), [{ ts: "2026-10-20T13:00:30Z", label: "Ver serviços", page: "Área · Trabalhista" }]);
  });
});

describe("rótulos e espelhamento", () => {
  test("labelPage, labelArea, labelLocation, fmtDuration", () => {
    assert.equal(labelPage("/"), "Página inicial");
    assert.equal(labelPage("/blog/x", "Pensão alimentícia | Nicoli Advogados"), "Pensão alimentícia");
    assert.equal(labelArea("direito-tributario"), "Tributário");
    assert.equal(labelArea(null), "Fora das áreas");
    assert.equal(labelLocation("form-area-trabalhista"), "Formulário");
    assert.equal(fmtDuration(75000), "1 min 15 s");
  });
  test("só espelha eventos de contato/leitura e só parâmetros sem atribuição", () => {
    for (const n of ["click_whatsapp", "click_phone", "click_cta", "generate_lead", "form_start", "blog_read", "consent_update"]) {
      assert.equal(deveEspelhar(n), true, n);
    }
    for (const n of ["scroll_25", "section_view", "virtual_page_view", "form_submit", "navigation_click"]) {
      assert.equal(deveEspelhar(n), false, n);
    }
    assert.deepEqual(
      paramsParaPainel({ link_location: "floating", gclid: "abc", utm_source: "google", lead_id: "x", value: 1, lead_area: "Trabalhista" }),
      { link_location: "floating", lead_area: "Trabalhista" },
    );
  });
});

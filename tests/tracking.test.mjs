import "./helpers/ts-resolve.mjs";
import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { fakeBrowser, importarFresco, normalizarDataLayer } from "./helpers/fake-browser.mjs";

const core = await import("../lib/attribution-core.ts");
const TRACKING = "../lib/tracking.ts";
const SITE_HOST = "nicoliadvogados.adv.br";
const AGORA = Date.UTC(2026, 9, 19, 12, 0, 0);
const DIA = 24 * 60 * 60 * 1000;

describe("parseCampaignParams", () => {
  test("lê UTMs e click IDs e normaliza source/medium em minúsculas", () => {
    const p = core.parseCampaignParams(
      "?utm_source=Google&utm_medium=CPC&utm_campaign=Trabalhista_GYN&utm_term=advogado%20trabalhista&gclid=abc123&x=1",
    );
    assert.deepEqual(p, {
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "Trabalhista_GYN",
      utm_term: "advogado trabalhista",
      gclid: "abc123",
    });
  });

  test("ignora valores vazios, remove caracteres de controle e limita tamanho", () => {
    const longo = "a".repeat(400);
    const p = core.parseCampaignParams(`utm_source=&utm_campaign=%0Ateste%00&utm_content=${longo}`);
    assert.equal(p.utm_source, undefined);
    assert.equal(p.utm_campaign, "teste");
    assert.equal(p.utm_content.length, 150);
  });
});

describe("buildTouch", () => {
  test("visita direta (sem UTM nem referrer externo) retorna null", () => {
    assert.equal(core.buildTouch({ search: "", pathname: "/", referrer: "", siteHost: SITE_HOST, now: AGORA }), null);
  });

  test("referrer interno é ignorado", () => {
    const t = core.buildTouch({
      search: "",
      pathname: "/contato",
      referrer: "https://www.nicoliadvogados.adv.br/areas",
      siteHost: SITE_HOST,
      now: AGORA,
    });
    assert.equal(t, null);
  });

  test("guarda só o host do referrer externo e o caminho de entrada", () => {
    const t = core.buildTouch({
      search: "",
      pathname: "/areas-de-atuacao/trabalhista",
      referrer: "https://www.google.com/search?q=advogado+trabalhista+goiania",
      siteHost: SITE_HOST,
      now: AGORA,
    });
    assert.deepEqual(t, { landing_page: "/areas-de-atuacao/trabalhista", referrer: "google.com", ts: AGORA });
  });
});

describe("mergeAttribution (first/last touch, 90 dias)", () => {
  const ads = { utm_source: "google", utm_medium: "cpc", gclid: "G1", landing_page: "/a", ts: AGORA - 10 * DIA };
  const organico = { referrer: "google.com", landing_page: "/b", ts: AGORA };

  test("sem histórico: first = last = toque atual", () => {
    const m = core.mergeAttribution(null, ads, "/a", AGORA);
    assert.deepEqual(m.first_touch, ads);
    assert.deepEqual(m.last_touch, ads);
  });

  test("sem histórico e visita direta: cria toque direto", () => {
    const m = core.mergeAttribution(null, null, "/contato", AGORA);
    assert.equal(m.first_touch.landing_page, "/contato");
    assert.equal(core.classifyChannel(m.last_touch), "direct");
  });

  test("novo toque não-direto atualiza só o last_touch", () => {
    const salvo = core.mergeAttribution(null, ads, "/a", AGORA - 10 * DIA);
    const m = core.mergeAttribution(salvo, organico, "/b", AGORA);
    assert.deepEqual(m.first_touch, ads);
    assert.deepEqual(m.last_touch, organico);
    assert.equal(m.updated_at, AGORA);
  });

  test("visita direta não sobrescreve a última origem", () => {
    const salvo = core.mergeAttribution(null, ads, "/a", AGORA - DIA);
    const m = core.mergeAttribution(salvo, null, "/c", AGORA);
    assert.equal(m, salvo);
  });

  test("após 90 dias sem novo toque, recomeça", () => {
    const salvo = core.mergeAttribution(null, ads, "/a", AGORA - 91 * DIA);
    assert.equal(core.isExpired(salvo, AGORA), true);
    const m = core.mergeAttribution(salvo, organico, "/b", AGORA);
    assert.deepEqual(m.first_touch, organico);
  });

  test("stripClickIds remove gclid/gbraid/wbraid/fbclid sem mutar o original", () => {
    const salvo = core.mergeAttribution(null, { ...ads, fbclid: "F1" }, "/a", AGORA);
    const limpo = core.stripClickIds(salvo);
    assert.equal(limpo.last_touch.gclid, undefined);
    assert.equal(limpo.first_touch.fbclid, undefined);
    assert.equal(limpo.last_touch.utm_source, "google");
    assert.equal(salvo.last_touch.gclid, "G1");
  });
});

describe("serialização", () => {
  test("roundtrip preserva os dados", () => {
    const salvo = core.mergeAttribution(null, { utm_campaign: "x", landing_page: "/", ts: AGORA }, "/", AGORA);
    assert.deepEqual(core.parseStoredAttribution(core.serializeAttribution(salvo)), salvo);
  });

  test("lixo, JSON inválido ou versão errada retornam null", () => {
    assert.equal(core.parseStoredAttribution("{nao json"), null);
    assert.equal(core.parseStoredAttribution('{"v":2}'), null);
    assert.equal(core.parseStoredAttribution(""), null);
    assert.equal(core.parseStoredAttribution('{"v":1,"updated_at":1,"first_touch":{},"last_touch":{}}'), null);
  });

  test("campos desconhecidos são descartados", () => {
    const raw = JSON.stringify({
      v: 1,
      updated_at: AGORA,
      first_touch: { landing_page: "/", ts: AGORA, __proto__x: "evil", utm_source: "google" },
      last_touch: { landing_page: "/", ts: AGORA, nome: "Fulano" },
    });
    const p = core.parseStoredAttribution(raw);
    assert.deepEqual(p.first_touch, { landing_page: "/", ts: AGORA, utm_source: "google" });
    assert.deepEqual(p.last_touch, { landing_page: "/", ts: AGORA });
  });
});

describe("classifyChannel / campaignLabel / attributionToEventParams", () => {
  const casos = [
    [{ gclid: "x", landing_page: "/", ts: 0 }, "google_ads"],
    [{ wbraid: "x", landing_page: "/", ts: 0 }, "google_ads"],
    [{ utm_source: "google", utm_medium: "cpc", landing_page: "/", ts: 0 }, "google_ads"],
    [{ utm_source: "instagram", utm_medium: "paid_social", landing_page: "/", ts: 0 }, "meta_ads"],
    [{ fbclid: "x", landing_page: "/", ts: 0 }, "social"],
    [{ referrer: "google.com", landing_page: "/", ts: 0 }, "google_organic"],
    [{ referrer: "bing.com", landing_page: "/", ts: 0 }, "other_search"],
    [{ referrer: "instagram.com", landing_page: "/", ts: 0 }, "social"],
    [{ utm_medium: "email", landing_page: "/", ts: 0 }, "email"],
    [{ referrer: "jusbrasil.com.br", landing_page: "/", ts: 0 }, "referral"],
    [{ landing_page: "/", ts: 0 }, "direct"],
  ];
  for (const [touch, esperado] of casos) {
    test(`${JSON.stringify(touch)} → ${esperado}`, () => assert.equal(core.classifyChannel(touch), esperado));
  }

  test("campaignLabel: utm_campaign > Google Ads (gclid) > orgânico", () => {
    const comCampanha = core.toAttribution(
      core.mergeAttribution(null, { utm_campaign: "trab-gyn", gclid: "g", landing_page: "/", ts: AGORA }, "/", AGORA),
    );
    assert.equal(core.campaignLabel(comCampanha), "trab-gyn");
    const soGclid = core.toAttribution(core.mergeAttribution(null, { gclid: "g", landing_page: "/", ts: AGORA }, "/", AGORA));
    assert.equal(core.campaignLabel(soGclid), "Google Ads");
    assert.equal(core.campaignLabel({}), "orgânico");
  });

  test("attributionToEventParams inclui canal, first touch e click IDs", () => {
    const salvo = core.mergeAttribution(
      core.mergeAttribution(null, { referrer: "google.com", landing_page: "/blog/x", ts: AGORA - DIA }, "/", AGORA - DIA),
      { utm_source: "google", utm_medium: "cpc", utm_campaign: "c1", gclid: "G", landing_page: "/areas/tributario", ts: AGORA },
      "/",
      AGORA,
    );
    const p = core.attributionToEventParams(core.toAttribution(salvo));
    assert.equal(p.traffic_channel, "google_ads");
    assert.equal(p.gclid, "G");
    assert.equal(p.utm_campaign, "c1");
    assert.equal(p.landing_page, "/areas/tributario");
    assert.equal(p.first_touch_channel, "google_organic");
    assert.equal(p.first_touch_landing, "/blog/x");
  });
});

describe("consentimento", () => {
  test("serialize/parse do cookie nicoli_consent", () => {
    const raw = core.serializeConsent({ analytics: true, marketing: false, ts: 5 });
    assert.equal(raw, '{"v":1,"a":1,"m":0,"t":5}');
    assert.deepEqual(core.parseConsent(raw), { analytics: true, marketing: false, ts: 5 });
    assert.equal(core.parseConsent("lixo"), null);
    assert.equal(core.parseConsent('{"v":9}'), null);
  });

  test("consentToMode mapeia marketing para os 3 sinais de anúncio", () => {
    assert.deepEqual(core.consentToMode({ analytics: false, marketing: true }), {
      analytics_storage: "denied",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  });

  test("readCookieValue decodifica e não confunde prefixos", () => {
    const c = "x_nicoli_consent=1; nicoli_consent=%7B%22v%22%3A1%7D; outro=2";
    assert.equal(core.readCookieValue(c, "nicoli_consent"), '{"v":1}');
    assert.equal(core.readCookieValue(c, "ausente"), null);
    assert.equal(core.readCookieValue("", "nicoli_consent"), null);
  });

  test("snippet inline e ensureConsentDefaults() produzem o mesmo dataLayer", async () => {
    const cookie = `nicoli_consent=${encodeURIComponent('{"v":1,"a":1,"m":0,"t":1}')}`;
    // 1) snippet inline
    const b1 = fakeBrowser({ cookie });
    new Function("window", "document", core.consentBootstrapSnippet())(b1.window, b1.document);
    const viaSnippet = normalizarDataLayer(b1.window.dataLayer);
    b1.teardown();
    // 2) espelho TS
    const b2 = fakeBrowser({ cookie });
    const t = await importarFresco(TRACKING, import.meta.url);
    t.ensureConsentDefaults();
    const viaTs = normalizarDataLayer(b2.window.dataLayer);
    b2.teardown();

    assert.deepEqual(viaTs, viaSnippet);
    assert.deepEqual(viaSnippet[0], [
      "consent",
      "default",
      {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        functionality_storage: "granted",
        security_storage: "granted",
        wait_for_update: 500,
      },
    ]);
    assert.deepEqual(viaSnippet[1][2].region, ["BR"]);
    assert.deepEqual(viaSnippet[4], [
      "consent",
      "update",
      { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" },
    ]);
  });

  test("snippet é idempotente", () => {
    const b = fakeBrowser();
    const run = new Function("window", "document", core.consentBootstrapSnippet());
    run(b.window, b.document);
    const n = b.window.dataLayer.length;
    run(b.window, b.document);
    assert.equal(b.window.dataLayer.length, n);
    b.teardown();
  });
});

describe("normalização para Enhanced Conversions", () => {
  test("e-mail: minúsculas, sem espaços; gmail sem pontos", () => {
    assert.equal(core.normalizeEmailForHash("  Joao.Silva@Gmail.com "), "joaosilva@gmail.com");
    assert.equal(core.normalizeEmailForHash("Ana.Paula@empresa.com.br"), "ana.paula@empresa.com.br");
  });
  test("telefone: E.164 BR", () => {
    assert.equal(core.normalizePhoneE164BR("(62) 99570-0037"), "+5562995700037");
    assert.equal(core.normalizePhoneE164BR("+55 62 3412-2828"), "+556234122828");
    assert.equal(core.normalizePhoneE164BR("123"), null);
  });
});

describe("lib/tracking.ts (navegador simulado)", () => {
  let browser;
  afterEach(() => browser?.teardown());

  test("é seguro em SSR (sem window)", async () => {
    const t = await importarFresco(TRACKING, import.meta.url);
    assert.doesNotThrow(() => t.trackEvent("click_cta", { a: 1 }));
    assert.deepEqual(t.getAttribution(), {});
    assert.equal(t.readConsent(), null);
  });

  test("trackEvent: consent default primeiro, depois o evento com página e atribuição", async () => {
    browser = fakeBrowser({
      url: "https://nicoliadvogados.adv.br/areas-de-atuacao/trabalhista?utm_source=google&utm_medium=cpc&utm_campaign=trab&gclid=GCLID1",
    });
    const t = await importarFresco(TRACKING, import.meta.url);
    t.trackEvent("click_cta", { link_label: "  Agendar   conversa ", vazio: undefined });
    const dl = normalizarDataLayer(browser.window.dataLayer);
    assert.equal(dl[0][0], "consent");
    assert.equal(dl[0][1], "default");
    const ev = dl.find((e) => e.event === "click_cta");
    assert.equal(ev.page_path, "/areas-de-atuacao/trabalhista");
    assert.equal(ev.page_title, "Direito Trabalhista | Nicoli Advogados");
    assert.equal(ev.link_label, "Agendar conversa");
    assert.equal(ev.utm_campaign, "trab");
    assert.equal(ev.gclid, "GCLID1");
    assert.equal(ev.traffic_channel, "google_ads");
    assert.equal("vazio" in ev, false);
  });

  test("captureAttribution persiste em localStorage e no cookie _nicoli_attr; first touch sobrevive", async () => {
    browser = fakeBrowser({ url: "https://nicoliadvogados.adv.br/?utm_source=instagram&utm_medium=social&utm_campaign=lanc" });
    const t = await importarFresco(TRACKING, import.meta.url);
    t.captureAttribution();
    assert.ok(browser.storage.get("nicoli_attr"));
    assert.match(browser.cookie, /_nicoli_attr=/);

    // navegação SPA sem parâmetros: nada muda
    browser.navegar("/contato");
    const a1 = t.captureAttribution();
    assert.equal(a1.utm_campaign, "lanc");

    // nova visita (nova instância do módulo) vinda do Google Ads
    browser.navegar("/areas-de-atuacao/tributario?gclid=NOVO");
    const t2 = await importarFresco(TRACKING, import.meta.url);
    const a2 = t2.captureAttribution();
    assert.equal(a2.gclid, "NOVO");
    assert.equal(a2.first_touch.utm_campaign, "lanc");
    assert.equal(a2.last_touch.landing_page, "/areas-de-atuacao/tributario");
  });

  test("saveConsent grava o cookie, envia consent update e, ao recusar marketing, apaga click IDs", async () => {
    browser = fakeBrowser({ url: "https://nicoliadvogados.adv.br/?gclid=X1" });
    const t = await importarFresco(TRACKING, import.meta.url);
    t.captureAttribution();
    t.saveConsent({ analytics: true, marketing: false }, "banner_recusar");
    assert.deepEqual(
      { analytics: t.readConsent().analytics, marketing: t.readConsent().marketing },
      { analytics: true, marketing: false },
    );
    const dl = normalizarDataLayer(browser.window.dataLayer);
    assert.ok(dl.some((e) => Array.isArray(e) && e[0] === "consent" && e[1] === "update" && e[2].ad_storage === "denied"));
    const ev = dl.find((e) => e.event === "consent_update");
    assert.equal(ev.consent_marketing, "denied");
    assert.equal(t.getAttribution().gclid, undefined);
  });

  test("trackEventAndWait resolve pelo eventCallback do GTM", async () => {
    browser = fakeBrowser({ gtm: true });
    const t = await importarFresco(TRACKING, import.meta.url);
    const inicio = Date.now();
    await t.trackEventAndWait("generate_lead", { form_id: "f" }, 5000);
    assert.ok(Date.now() - inicio < 1000);
  });

  test("trackEventAndWait resolve pelo timeout quando o GTM não carregou", async () => {
    browser = fakeBrowser();
    const t = await importarFresco(TRACKING, import.meta.url);
    const inicio = Date.now();
    await t.trackEventAndWait("generate_lead", {}, 50);
    assert.ok(Date.now() - inicio >= 45);
  });
});

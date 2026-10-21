import "./helpers/ts-resolve.mjs";
import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { fakeBrowser, normalizarDataLayer } from "./helpers/fake-browser.mjs";

const wa = await import("../lib/whatsapp.ts");
const { SITE } = await import("../lib/site.ts");

const LEAD_OK = {
  nome: "  Maria   Souza ",
  telefone: "(62) 99999-1234",
  email: " Maria.Souza@Empresa.com.br ",
  empresa: "Souza Ltda",
  ramo: "Varejo",
  cargo: "Sócia",
  resumo: "Recebi uma reclamação trabalhista de um ex-funcionário e preciso de orientação.",
  area: "Direito Trabalhista",
};

describe("validarLead", () => {
  test("aceita e normaliza um lead válido", () => {
    const r = wa.validarLead(LEAD_OK);
    assert.equal(r.ok, true);
    assert.equal(r.dados.nome, "Maria Souza");
    assert.equal(r.dados.telefone, "62999991234");
    assert.equal(r.dados.email, "maria.souza@empresa.com.br");
    assert.equal(r.dados.area, "Direito Trabalhista");
  });

  test("campos opcionais vazios são omitidos", () => {
    const r = wa.validarLead({ nome: "Ana", telefone: "6234122828", resumo: "Preciso revisar um contrato.", empresa: "  " });
    assert.equal(r.ok, true);
    assert.equal("empresa" in r.dados, false);
    assert.equal("email" in r.dados, false);
  });

  test("aceita telefone com +55", () => {
    const r = wa.validarLead({ ...LEAD_OK, telefone: "+55 62 99570-0037" });
    assert.equal(r.ok, true);
    assert.equal(r.dados.telefone, "62995700037");
  });

  test("nome curto, telefone inválido, e-mail inválido e resumo curto geram erros em pt-BR", () => {
    const r = wa.validarLead({ nome: "Jo", telefone: "1234", email: "nao-e-email", resumo: "curto" });
    assert.equal(r.ok, false);
    assert.match(r.erros.nome, /mínimo de 3/);
    assert.match(r.erros.telefone, /DDD/);
    assert.match(r.erros.email, /e-mail válido/);
    assert.match(r.erros.resumo, /mínimo de 10/);
  });

  test("telefone obrigatório e resumo máximo de 1000", () => {
    const r = wa.validarLead({ nome: "Carlos", telefone: "", resumo: "x".repeat(1001) });
    assert.equal(r.ok, false);
    assert.match(r.erros.telefone, /Informe um telefone/);
    assert.match(r.erros.resumo, /1000/);
  });

  test("rejeita celular sem o 9 e DDD inválido", () => {
    assert.equal(wa.validarLead({ ...LEAD_OK, telefone: "62899991234" }).ok, false);
    assert.equal(wa.validarLead({ ...LEAD_OK, telefone: "0299991234" }).ok, false);
  });

  test("entrada indefinida não lança erro", () => {
    const r = wa.validarLead({});
    assert.equal(r.ok, false);
    assert.ok(r.erros.nome && r.erros.telefone && r.erros.resumo);
  });
});

describe("buildLeadMessage", () => {
  const dados = wa.validarLead(LEAD_OK).dados;

  test("monta mensagem legível com campos e telefone formatado", () => {
    const msg = wa.buildLeadMessage(dados, {});
    assert.match(msg, /^Olá! Vim pelo site da Nicoli Sociedade de Advogados/);
    assert.match(msg, /\*Nome:\* Maria Souza/);
    assert.match(msg, /\*Telefone:\* \(62\) 99999-1234/);
    assert.match(msg, /\*E-mail:\* maria\.souza@empresa\.com\.br/);
    assert.match(msg, /\*Empresa:\* Souza Ltda/);
    assert.match(msg, /\*Resumo do caso:\*\nRecebi uma reclamação/);
  });

  test("termina com a linha Ref. (área · orgânico) sem atribuição", () => {
    const msg = wa.buildLeadMessage(dados, {});
    assert.equal(msg.split("\n").at(-1), "_Ref.: Direito Trabalhista · orgânico_");
  });

  test("usa utm_campaign e NUNCA expõe o gclid", () => {
    const attr = {
      utm_campaign: "trabalhista-gyn",
      gclid: "Cj0KCQjwSEGREDO",
      last_touch: { gclid: "Cj0KCQjwSEGREDO", utm_campaign: "trabalhista-gyn", landing_page: "/", ts: 1 },
    };
    const msg = wa.buildLeadMessage(dados, attr);
    assert.match(msg, /Ref\.: Direito Trabalhista · trabalhista-gyn_$/);
    assert.equal(msg.includes("Cj0KCQjwSEGREDO"), false);
  });

  test("com gclid e sem utm_campaign, identifica Google Ads", () => {
    const attr = { gclid: "G", last_touch: { gclid: "G", landing_page: "/", ts: 1 } };
    assert.match(wa.buildLeadMessage(dados, attr), /· Google Ads_$/);
  });

  test("sem área usa 'Geral' e omite opcionais ausentes", () => {
    const msg = wa.buildLeadMessage({ nome: "Ana", telefone: "6234122828", resumo: "Revisar contrato social." }, {});
    assert.match(msg, /\*Telefone:\* \(62\) 3412-2828/);
    assert.equal(msg.includes("*Empresa:*"), false);
    assert.match(msg, /Ref\.: Geral · orgânico_$/);
  });
});

describe("buildWhatsAppUrl", () => {
  test("usa o número do escritório e codifica o texto", () => {
    const url = wa.buildWhatsAppUrl({ mensagem: "Olá & bem-vindo? #1\nLinha 2", origem: "hero" });
    assert.equal(url.startsWith(`https://wa.me/${SITE.whatsapp.numero}?text=`), true);
    const texto = new URL(url).searchParams.get("text");
    assert.equal(texto, "Olá & bem-vindo? #1\nLinha 2");
    assert.equal(url.includes("hero"), false);
  });

  test("mensagem vazia cai na mensagem padrão", () => {
    const texto = new URL(wa.buildWhatsAppUrl({ mensagem: "   " })).searchParams.get("text");
    assert.match(texto, /Nicoli Sociedade de Advogados/);
  });
});

describe("submitLeadViaWhatsApp", () => {
  let browser;
  afterEach(() => browser?.teardown());

  test("é no-op no servidor", () => {
    assert.doesNotThrow(() => wa.submitLeadViaWhatsApp(wa.validarLead(LEAD_OK).dados, { formId: "x" }));
  });

  test("dispara form_submit + generate_lead sem PII, envia user_data em SHA-256 (com consentimento) e abre o WhatsApp", async () => {
    const consent = `nicoli_consent=${encodeURIComponent('{"v":1,"a":1,"m":1,"t":1}')}`;
    browser = fakeBrowser({
      url: "https://nicoliadvogados.adv.br/areas-de-atuacao/trabalhista?gclid=GC1&utm_campaign=trab",
      cookie: consent,
      gtm: true,
    });
    const dados = wa.validarLead(LEAD_OK).dados;
    wa.submitLeadViaWhatsApp(dados, { formId: "form-area-trabalhista", area: "Direito Trabalhista" });

    // espera a cadeia assíncrona (hash + eventCallback) concluir
    for (let i = 0; i < 50 && browser.abertos.length === 0; i++) await new Promise((r) => setTimeout(r, 10));

    const dl = normalizarDataLayer(browser.window.dataLayer);
    const submit = dl.find((e) => e.event === "form_submit");
    const lead = dl.find((e) => e.event === "generate_lead");
    const userData = dl.find((e) => e.user_data)?.user_data;

    assert.ok(submit && lead, "eventos enviados");
    assert.equal(lead.form_id, "form-area-trabalhista");
    assert.equal(lead.lead_area, "Direito Trabalhista");
    assert.equal(lead.gclid, "GC1");
    assert.equal(lead.lead_id, submit.lead_id);
    assert.ok(dl.indexOf(submit) < dl.indexOf(lead));

    assert.match(userData.sha256_email_address, /^[a-f0-9]{64}$/);
    assert.match(userData.sha256_phone_number, /^[a-f0-9]{64}$/);

    const json = JSON.stringify(dl);
    for (const pii of ["Maria", "maria.souza", "99999", "62999991234", "reclamação"]) {
      assert.equal(json.includes(pii), false, `PII vazou no dataLayer: ${pii}`);
    }

    assert.equal(browser.abertos.length, 1);
    assert.equal(browser.abertos[0].alvo, "_blank");
    const texto = new URL(browser.abertos[0].href).searchParams.get("text");
    assert.match(texto, /Ref\.: Direito Trabalhista · trab_$/);
    assert.equal(texto.includes("GC1"), false);
  });

  test("sem consentimento de marketing não envia user_data", async () => {
    browser = fakeBrowser({ gtm: true });
    wa.submitLeadViaWhatsApp(wa.validarLead(LEAD_OK).dados, { formId: "f" });
    for (let i = 0; i < 50 && browser.abertos.length === 0; i++) await new Promise((r) => setTimeout(r, 10));
    const dl = normalizarDataLayer(browser.window.dataLayer);
    assert.equal(dl.some((e) => e.user_data), false);
    assert.ok(dl.some((e) => e.event === "generate_lead"));
  });

  test("pop-up bloqueado: cai para location.href", async () => {
    browser = fakeBrowser({ gtm: true });
    browser.window.open = () => null;
    wa.submitLeadViaWhatsApp(wa.validarLead(LEAD_OK).dados, { formId: "f" });
    for (let i = 0; i < 50 && !browser.window.location.href.startsWith("https://wa.me/"); i++) {
      await new Promise((r) => setTimeout(r, 10));
    }
    assert.match(browser.window.location.href, /^https:\/\/wa\.me\/5562995700037\?text=/);
  });
});

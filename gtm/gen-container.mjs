// Gera o container GTM (exportFormatVersion 2) da Nicoli Sociedade de Advogados.
// Uso: node gtm/gen-container.mjs [saida.json]   (padrão: gtm/gtm-container-nicoli.json)
// Os IDs vêm do .env.local/.env (se existirem) ou das constantes abaixo.
// Tags com ID placeholder saem PAUSADAS — preencha a variável CONST e despause no GTM.
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "..");
for (const arq of [".env.local", ".env"]) {
  const p = path.join(RAIZ, arq);
  if (existsSync(p)) {
    try {
      process.loadEnvFile(p);
    } catch {
      // .env inválido: segue com placeholders
    }
  }
}
const env = (k) => (process.env[k] ?? "").trim();

/* ================== CONFIGURAÇÃO (edite aqui ou use env) ================== */
const CONFIG = {
  gtmPublicId: env("NEXT_PUBLIC_GTM_ID") || "GTM-XXXXXXX",
  ga4Id: env("NEXT_PUBLIC_GA4_ID") || "G-XXXXXXXXXX",
  // Aceita "AW-123456789" ou "123456789"
  googleAdsId: (env("NEXT_PUBLIC_GOOGLE_ADS_ID") || "AW-XXXXXXXXX").replace(/^AW-/i, ""),
  adsLabels: {
    generate_lead: env("GOOGLE_ADS_LABEL_GENERATE_LEAD") || "LABEL_GENERATE_LEAD",
    click_whatsapp: env("GOOGLE_ADS_LABEL_CLICK_WHATSAPP") || "LABEL_CLICK_WHATSAPP",
    click_phone: env("GOOGLE_ADS_LABEL_CLICK_PHONE") || "LABEL_CLICK_PHONE",
  },
  metaPixelId: env("NEXT_PUBLIC_META_PIXEL_ID") || "META_PIXEL_ID",
  siteHost: (() => {
    try {
      return new URL(env("NEXT_PUBLIC_SITE_URL") || "https://nicoliadvogados.adv.br").hostname;
    } catch {
      return "nicoliadvogados.adv.br";
    }
  })(),
};
/* ========================================================================== */

const isPlaceholder = (v) => /X{5,}|^LABEL_|^META_PIXEL_ID$/.test(v);
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(AQUI, "gtm-container-nicoli.json");
const ACCOUNT = "0";
const CONTAINER = "0";

let tagSeq = 0;
let trgSeq = 0;
let varSeq = 0;
const tags = [];
const triggers = [];
const variables = [];
const trgId = {};
const T = (key, value) => ({ type: "TEMPLATE", key, value: String(value) });
const B = (key, value) => ({ type: "BOOLEAN", key, value: String(value) });
const base = () => ({ accountId: ACCOUNT, containerId: CONTAINER });

const CONSENT_GOOGLE = { consentStatus: "NOT_NEEDED" }; // Google tags: checagem nativa do Consent Mode
const consentNeeded = (...tipos) => ({
  consentStatus: "NEEDED",
  consentType: { type: "LIST", list: tipos.map((t) => ({ type: "TEMPLATE", value: t })) },
});

/* ---------------- Variáveis ---------------- */
function variable(name, type, parameter) {
  variables.push({ ...base(), variableId: String(++varSeq), name, type, parameter });
}
const constant = (name, value) => variable(name, "c", [T("value", value)]);
const dlv = (key) =>
  variable(`DLV - ${key}`, "v", [B("setDefaultValue", false), T("name", key), T("dataLayerVersion", 2)]);

constant("CONST - GA4 Measurement ID", CONFIG.ga4Id);
constant("CONST - Google Ads Conversion ID", CONFIG.googleAdsId);
constant("CONST - Ads Label - generate_lead", CONFIG.adsLabels.generate_lead);
constant("CONST - Ads Label - click_whatsapp", CONFIG.adsLabels.click_whatsapp);
constant("CONST - Ads Label - click_phone", CONFIG.adsLabels.click_phone);
constant("CONST - Meta Pixel ID", CONFIG.metaPixelId);

const DLV_KEYS = [
  "page_path", "page_title", "page_location", "page_referrer",
  "link_location", "link_label", "link_url", "nav_location",
  "form_id", "lead_area", "lead_method", "lead_id", "value", "currency",
  "section_id", "percent_scrolled", "article_slug", "read_trigger",
  "consent_analytics", "consent_marketing", "consent_origin",
  "traffic_channel", "landing_page", "referrer_host",
  "first_touch_channel", "first_touch_source", "first_touch_medium", "first_touch_campaign", "first_touch_landing",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid",
  "user_data.sha256_email_address", "user_data.sha256_phone_number",
];
DLV_KEYS.forEach(dlv);

// Enhanced Conversions (dados já chegam em SHA-256 pelo site)
variable("UPD - Enhanced Conversions", "awec", [
  T("mode", "MANUAL"),
  T("email", "{{DLV - user_data.sha256_email_address}}"),
  T("phone_number", "{{DLV - user_data.sha256_phone_number}}"),
]);

/* ---------------- Gatilhos ---------------- */
function trigger(name, type, extra = {}) {
  const id = String(++trgSeq);
  trgId[name] = id;
  triggers.push({ ...base(), triggerId: id, name, type, ...extra });
  return name;
}
const eventEquals = (ev) => [{ type: "EQUALS", parameter: [T("arg0", "{{_event}}"), T("arg1", ev)] }];
const eventRegex = (re) => [{ type: "MATCH_REGEX", parameter: [T("arg0", "{{_event}}"), T("arg1", re)] }];
const ce = (ev) => trigger(`CE - ${ev}`, "CUSTOM_EVENT", { customEventFilter: eventEquals(ev) });

trigger("Initialization - All Pages", "INIT");
trigger("All Pages", "PAGEVIEW");
const EVENTOS = [
  "virtual_page_view", "click_whatsapp", "click_phone", "click_email", "navigation_click",
  "form_start", "form_submit", "generate_lead", "section_view", "blog_read", "consent_update",
];
EVENTOS.forEach(ce);
trigger("CE - scroll_25/50/75/100", "CUSTOM_EVENT", { customEventFilter: eventRegex("^scroll_(25|50|75|100)$") });
trigger("CE - click_* (data-track)", "CUSTOM_EVENT", {
  customEventFilter: eventRegex("^click_[a-z0-9_]+$"),
  filter: [
    {
      type: "MATCH_REGEX",
      parameter: [T("arg0", "{{Event}}"), T("arg1", "^click_(whatsapp|phone|email)$")],
      negate: true,
    },
  ],
});
trigger("CE - consent_update (marketing concedido)", "CUSTOM_EVENT", {
  customEventFilter: eventEquals("consent_update"),
  filter: [{ type: "EQUALS", parameter: [T("arg0", "{{DLV - consent_marketing}}"), T("arg1", "granted")] }],
});

/* ---------------- Tags ---------------- */
function tag(name, type, parameter, firing, extra = {}) {
  tags.push({
    ...base(),
    tagId: String(++tagSeq),
    name,
    type,
    parameter,
    firingTriggerId: firing.map((n) => {
      if (!trgId[n]) throw new Error(`Gatilho inexistente: ${n}`);
      return trgId[n];
    }),
    tagFiringOption: "ONCE_PER_EVENT",
    monitoringMetadata: { type: "MAP" },
    consentSettings: CONSENT_GOOGLE,
    ...extra,
  });
}
const table = (key, pairs) => ({
  type: "LIST",
  key,
  list: pairs.map(([p, v]) => ({ type: "MAP", map: [T("parameter", p), T("parameterValue", v)] })),
});
const d = (k) => [k, `{{DLV - ${k}}}`];
const COMUNS = [d("page_path"), d("traffic_channel"), d("first_touch_channel"), d("landing_page")];

function ga4Event(eventName, triggerName, pairs = [], tagName) {
  tag(tagName ?? `GA4 - ${eventName}`, "gaawe", [
    B("sendEcommerceData", false),
    T("eventName", eventName),
    table("eventSettingsTable", [...COMUNS, ...pairs]),
    T("measurementIdOverride", "{{CONST - GA4 Measurement ID}}"),
  ], [triggerName], { paused: isPlaceholder(CONFIG.ga4Id) });
}

// GA4 — Google tag (page_view inicial automático, com gclid na URL)
tag("Google Tag - GA4", "googtag", [
  T("tagId", "{{CONST - GA4 Measurement ID}}"),
  table("configSettingsTable", [["send_page_view", "true"]]),
], ["Initialization - All Pages"], { paused: isPlaceholder(CONFIG.ga4Id) });

// GA4 — eventos
const LINK = [d("link_location"), d("link_label"), d("link_url")];
const LEAD = [d("form_id"), d("lead_area"), d("lead_method"), d("lead_id"), d("utm_campaign"), d("first_touch_campaign")];
ga4Event("page_view", "CE - virtual_page_view", [d("page_location"), d("page_title"), d("page_referrer")], "GA4 - page_view (SPA)");
ga4Event("click_whatsapp", "CE - click_whatsapp", LINK);
ga4Event("click_phone", "CE - click_phone", LINK);
ga4Event("click_email", "CE - click_email", LINK);
ga4Event("{{Event}}", "CE - click_* (data-track)", [...LINK, d("lead_area")], "GA4 - click_* (data-track)");
ga4Event("navigation_click", "CE - navigation_click", [d("nav_location"), d("link_label"), d("link_url")]);
ga4Event("form_start", "CE - form_start", [d("form_id"), d("lead_area")]);
ga4Event("form_submit", "CE - form_submit", LEAD);
ga4Event("generate_lead", "CE - generate_lead", [...LEAD, d("value"), d("currency")]);
ga4Event("section_view", "CE - section_view", [d("section_id")]);
ga4Event("{{Event}}", "CE - scroll_25/50/75/100", [d("percent_scrolled")], "GA4 - scroll_25/50/75/100");
ga4Event("blog_read", "CE - blog_read", [d("article_slug"), d("read_trigger")]);
ga4Event("consent_update", "CE - consent_update", [d("consent_analytics"), d("consent_marketing"), d("consent_origin")]);

// Google Ads
const adsPausado = isPlaceholder(CONFIG.googleAdsId);
tag("Ads - Conversion Linker", "gclidw", [
  B("enableCrossDomain", false),
  B("enableUrlPassthrough", true),
  B("enableCookieOverrides", false),
], ["Initialization - All Pages"]);
tag("Ads - Remarketing", "sp", [
  B("enableConversionLinker", true),
  B("enableDynamicRemarketing", false),
  T("conversionCookiePrefix", "_gcl"),
  T("conversionId", "{{CONST - Google Ads Conversion ID}}"),
  T("customParamsFormat", "NONE"),
  T("rdp", "false"),
], ["All Pages", "CE - virtual_page_view"], { paused: adsPausado });

function adsConversion(name, labelKey, triggerName, extras = []) {
  tag(name, "awct", [
    B("enableConversionLinker", true),
    B("enableProductReporting", false),
    B("enableNewCustomerReporting", false),
    B("enableShippingData", false),
    T("conversionCookiePrefix", "_gcl"),
    T("conversionId", "{{CONST - Google Ads Conversion ID}}"),
    T("conversionLabel", `{{CONST - Ads Label - ${labelKey}}}`),
    T("rdp", "false"),
    ...extras,
  ], [triggerName], { paused: adsPausado || isPlaceholder(CONFIG.adsLabels[labelKey]) });
}
adsConversion("Ads - Conversão - generate_lead (PRIMÁRIA)", "generate_lead", "CE - generate_lead", [
  B("enableEnhancedConversion", true),
  T("cssProvidedEnhancedConversionValue", "{{UPD - Enhanced Conversions}}"),
  T("orderId", "{{DLV - lead_id}}"),
  T("conversionValue", "{{DLV - value}}"),
  T("currencyCode", "BRL"),
]);
adsConversion("Ads - Conversão - click_whatsapp (secundária)", "click_whatsapp", "CE - click_whatsapp", [
  B("enableEnhancedConversion", false),
]);
adsConversion("Ads - Conversão - click_phone (secundária)", "click_phone", "CE - click_phone", [
  B("enableEnhancedConversion", false),
]);

// Meta Pixel (Custom HTML) — só dispara com ad_storage concedido
const metaPausado = isPlaceholder(CONFIG.metaPixelId);
const META_CONSENT = consentNeeded("ad_storage", "ad_user_data");
const html = (code) => [T("html", code), B("supportDocumentWrite", false)];
const SETUP_META = [{ tagName: "Meta Pixel - Base", stopOnSetupFailure: true }];
tag("Meta Pixel - Base", "html", html(
  "<script>\n" +
    "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};" +
    "if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;" +
    "s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');\n" +
    "if(!window.__nicoliFbInit){window.__nicoliFbInit=1;fbq('init', {{CONST - Meta Pixel ID}});fbq('track','PageView');}\n" +
    "</script>",
), ["Initialization - All Pages", "CE - consent_update (marketing concedido)"], {
  consentSettings: META_CONSENT,
  tagFiringOption: "ONCE_PER_LOAD",
  paused: metaPausado,
});
tag("Meta Pixel - PageView (SPA)", "html", html("<script>window.fbq&&fbq('track','PageView');</script>"), ["CE - virtual_page_view"], {
  consentSettings: META_CONSENT,
  setupTag: SETUP_META,
  paused: metaPausado,
});
tag("Meta Pixel - Lead (generate_lead)", "html", html(
  "<script>window.fbq&&fbq('track','Lead',{content_category:{{DLV - lead_area}},content_name:{{DLV - form_id}}},{eventID:{{DLV - lead_id}}});</script>",
), ["CE - generate_lead"], { consentSettings: META_CONSENT, setupTag: SETUP_META, paused: metaPausado });
tag("Meta Pixel - Contact (click_whatsapp)", "html", html(
  "<script>window.fbq&&fbq('track','Contact',{content_category:{{DLV - link_location}}});</script>",
), ["CE - click_whatsapp"], { consentSettings: META_CONSENT, setupTag: SETUP_META, paused: metaPausado });

/* ---------------- Export ---------------- */
const BUILTINS = [
  ["PAGE_URL", "Page URL"],
  ["PAGE_HOSTNAME", "Page Hostname"],
  ["PAGE_PATH", "Page Path"],
  ["REFERRER", "Referrer"],
  ["EVENT", "Event"],
];
const out = {
  exportFormatVersion: 2,
  exportTime: new Date().toISOString().replace("T", " ").slice(0, 19),
  containerVersion: {
    path: `accounts/${ACCOUNT}/containers/${CONTAINER}/versions/0`,
    accountId: ACCOUNT,
    containerId: CONTAINER,
    containerVersionId: "0",
    name: "Nicoli Advogados — GA4 + Google Ads + Meta (Consent Mode v2)",
    description:
      "Gerado por gtm/gen-container.mjs. Preencha as variáveis CONST - * e despause as tags com placeholder. Ver gtm/TRACKING.md.",
    container: {
      ...base(),
      name: CONFIG.siteHost,
      publicId: CONFIG.gtmPublicId,
      usageContext: ["WEB"],
    },
    tag: tags,
    trigger: triggers,
    variable: variables,
    builtInVariable: BUILTINS.map(([type, name]) => ({ ...base(), type, name })),
  },
};

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
const pausadas = tags.filter((t) => t.paused).map((t) => t.name);
console.log(`tags=${tags.length} triggers=${triggers.length} variables=${variables.length} -> ${path.relative(RAIZ, OUT)}`);
if (pausadas.length) console.log(`Pausadas (ID placeholder): ${pausadas.join(" | ")}`);

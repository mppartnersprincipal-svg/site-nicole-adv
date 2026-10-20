// Migração do painel rodando num Postgres embutido (PGlite): idempotência, triggers, agregações e permissões.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const SQL = readFileSync(new URL("../supabase/migrations/0001_nicoli_analytics.sql", import.meta.url), "utf8")
  // gen_random_uuid já é nativo no Postgres 13+; a extensão não existe no PGlite
  .replace(/create extension if not exists pgcrypto;/, "");

const db = new PGlite();
const A = "11111111-1111-4111-8111-111111111111"; // Google Ads, converteu (formulário + WhatsApp)
const B = "22222222-2222-4222-8222-222222222222"; // orgânico, só leu
const C = "33333333-3333-4333-8333-333333333333"; // direto, visitante recorrente (mesmo vid de D)
const D = "44444444-4444-4444-8444-444444444444";
const VID = "55555555-5555-4555-8555-555555555555";
const DE = "2026-10-01T03:00:00Z";
const ATE = "2026-10-21T03:00:00Z";

async function q(sql, params = []) {
  return (await db.query(sql, params)).rows;
}

before(async () => {
  await db.exec("create role anon; create role authenticated; create role service_role;");
  await db.exec(SQL);
  await db.exec(SQL); // idempotente
  const sessao = (id, canal, ts, extra = "") =>
    `insert into nicoli_sessions (id, started_at, last_seen_at, landing_path, channel, device, region, city${extra ? ", visitor_id" : ""})
     values ('${id}', '${ts}', '${ts}', '/', '${canal}', 'mobile', 'GO', 'Goiânia'${extra ? `, '${extra}'` : ""});`;
  await db.exec(
    sessao(D, "direct", "2026-10-05T12:00:00Z", VID) +
      sessao(A, "google_ads", "2026-10-10T13:00:00Z") +
      sessao(B, "google_organic", "2026-10-11T22:00:00Z") +
      sessao(C, "direct", "2026-10-12T15:00:00Z", VID),
  );
  const ev = (sid, ts, name, path, params = {}) =>
    db.query("insert into nicoli_events (session_id, ts, name, path, title, params) values ($1, $2, $3, $4, $5, $6)", [
      sid,
      ts,
      name,
      path,
      name === "page_view" ? "Título | Nicoli Advogados" : null,
      JSON.stringify(params),
    ]);
  await ev(A, "2026-10-10T13:00:00Z", "page_view", "/areas-de-atuacao/advogado-trabalhista");
  await ev(A, "2026-10-10T13:00:20Z", "form_start", "/areas-de-atuacao/advogado-trabalhista");
  await ev(A, "2026-10-10T13:00:50Z", "generate_lead", "/areas-de-atuacao/advogado-trabalhista", { form_id: "form-area" });
  await ev(A, "2026-10-10T13:01:00Z", "click_whatsapp", "/areas-de-atuacao/advogado-trabalhista", { link_location: "floating" });
  await ev(A, "2026-10-10T13:01:05Z", "page_leave", "/areas-de-atuacao/advogado-trabalhista", { duration_ms: 65000, max_scroll_pct: 80 });
  await ev(A, "2026-10-10T13:01:06Z", "consent_update", "/", { consent_analytics: "granted" });
  await ev(B, "2026-10-11T22:00:00Z", "page_view", "/blog/pensao");
  await ev(B, "2026-10-11T22:00:40Z", "blog_read", "/blog/pensao", { article_slug: "pensao" });
  await ev(B, "2026-10-11T22:01:00Z", "page_leave", "/blog/pensao", { duration_ms: 60000, max_scroll_pct: 90 });
  await ev(B, "2026-10-11T22:01:01Z", "click", "/blog/pensao", { text: "Fale conosco", tag: "a" });
  await ev(C, "2026-10-12T15:00:00Z", "page_view", "/");
  await ev(C, "2026-10-12T15:00:10Z", "consent_update", "/", { consent_analytics: "denied" });
});

describe("migração do painel (PGlite)", () => {
  test("triggers: contadores, conversão e visitante recorrente", async () => {
    const [a] = await q("select page_views, events, converted from nicoli_sessions where id = $1", [A]);
    assert.deepEqual(a, { page_views: 1, events: 6, converted: true });
    const [b] = await q("select converted from nicoli_sessions where id = $1", [B]);
    assert.equal(b.converted, false);
    const [c] = await q("select is_returning from nicoli_sessions where id = $1", [C]);
    assert.equal(c.is_returning, true);
  });

  test("KPIs do período", async () => {
    const [k] = await q("select * from nicoli_kpis($1, $2)", [DE, ATE]);
    assert.equal(Number(k.sessions), 4);
    assert.equal(Number(k.page_views), 3);
    assert.equal(Number(k.wa_clicks), 1);
    assert.equal(Number(k.leads), 1);
    assert.equal(Number(k.contact_sessions), 1);
    assert.equal(Number(k.conv_rate), 25);
    const [ads] = await q("select sessions from nicoli_kpis($1, $2, 'google_ads')", [DE, ATE]);
    assert.equal(Number(ads.sessions), 1);
  });

  test("série diária inclui dias zerados e conta contatos", async () => {
    const dias = await q("select day::text, sessions, contacts from nicoli_daily($1, $2)", [DE, ATE]);
    assert.equal(dias.length, 20);
    const d10 = dias.find((d) => d.day === "2026-10-10");
    assert.deepEqual([Number(d10.sessions), Number(d10.contacts)], [1, 2]);
  });

  test("contatos por área, local e origem", async () => {
    const rows = await q("select kind, area, location, channel, clicks from nicoli_contacts($1, $2) order by kind", [DE, ATE]);
    assert.deepEqual(
      rows.map((r) => [r.kind, r.area, r.location, r.channel, Number(r.clicks)]),
      [
        ["click_whatsapp", "advogado-trabalhista", "floating", "google_ads", 1],
        ["generate_lead", "advogado-trabalhista", "form-area", "google_ads", 1],
      ],
    );
  });

  test("páginas, blog, funil, visitantes e consentimento", async () => {
    const paginas = await q("select path, views, avg_ms, contacts from nicoli_top_pages($1, $2)", [DE, ATE]);
    const area = paginas.find((p) => p.path === "/areas-de-atuacao/advogado-trabalhista");
    assert.deepEqual([Number(area.views), Number(area.avg_ms), Number(area.contacts)], [1, 65000, 2]);

    const [blog] = await q("select path, views, reads, avg_scroll from nicoli_blog($1, $2)", [DE, ATE]);
    assert.deepEqual([blog.path, Number(blog.views), Number(blog.reads), Number(blog.avg_scroll)], ["/blog/pensao", 1, 1, 90]);

    const funil = Object.fromEntries((await q("select step, sessions from nicoli_funnel($1, $2)", [DE, ATE])).map((f) => [f.step, Number(f.sessions)]));
    assert.deepEqual(funil, { page_view: 4, contact: 1, form_start: 1, generate_lead: 1 });

    const visitantes = Object.fromEntries((await q("select kind, sessions from nicoli_visitors($1, $2)", [DE, ATE])).map((v) => [v.kind, Number(v.sessions)]));
    assert.deepEqual(visitantes, { unknown: 2, new: 1, returning: 1 });

    const consent = Object.fromEntries((await q("select choice, sessions from nicoli_consent($1, $2)", [DE, ATE])).map((c) => [c.choice, Number(c.sessions)]));
    assert.deepEqual(consent, { accepted: 1, essential: 1, none: 2 });
  });

  test("origem, dispositivo, mapa de calor, geografia, campanhas, cliques, jornadas e ao vivo", async () => {
    const canais = await q("select channel, sessions, contacts from nicoli_by_channel($1, $2) order by channel", [DE, ATE]);
    assert.deepEqual(canais.map((c) => [c.channel, Number(c.sessions), Number(c.contacts)]), [
      ["direct", 2, 0],
      ["google_ads", 1, 2],
      ["google_organic", 1, 0],
    ]);
    assert.equal(Number((await q("select sessions from nicoli_by_device($1, $2)", [DE, ATE]))[0].sessions), 4);
    const calor = await q("select dow, hour, sessions from nicoli_heatmap($1, $2) where hour = 10", [DE, ATE]);
    assert.ok(calor.length >= 1, "sessão das 13h UTC aparece às 10h de Brasília");
    assert.equal(Number((await q("select sessions from nicoli_geo($1, $2)", [DE, ATE]))[0].sessions), 4);
    assert.equal(Number((await q("select conv_rate from nicoli_campaigns($1, $2)", [DE, ATE]))[0].conv_rate), 100);
    assert.equal((await q("select label from nicoli_clicks($1, $2)", [DE, ATE]))[0].label, "Fale conosco");
    const jornadas = await q("select id, jsonb_array_length(trail) as passos from nicoli_journeys($1, $2)", [DE, ATE]);
    assert.deepEqual(jornadas.map((j) => [j.id, j.passos]), [[A, 6]]);
    assert.equal((await q("select * from nicoli_journeys($1, $2, null, false)", [DE, ATE])).length, 4);
    assert.equal((await q("select name from nicoli_recent(1)"))[0].name, "consent_update");
  });

  test("anon e authenticated não leem tabelas nem executam funções", async () => {
    for (const papel of ["anon", "authenticated"]) {
      await db.exec(`set role ${papel}`);
      await assert.rejects(db.query("select * from nicoli_sessions"), /permission denied/, papel);
      await assert.rejects(db.query("select * from nicoli_kpis(now() - interval '1 day', now())"), /permission denied/, papel);
      await db.exec("reset role");
    }
  });

  test("retenção apaga sessões antigas e seus eventos", async () => {
    await db.exec(
      `insert into nicoli_sessions (id, started_at, landing_path, channel) values ('66666666-6666-4666-8666-666666666666', now() - interval '14 months', '/', 'direct');`,
    );
    const [r] = await q("select nicoli_purge(13) as n");
    assert.equal(r.n, 1);
  });
});

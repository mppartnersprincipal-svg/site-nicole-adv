// Login do painel (token HMAC) e período (?de/?ate no fuso de Goiânia).
import "./helpers/ts-resolve.mjs";
import assert from "node:assert/strict";
import { describe, test } from "node:test";

const auth = await import("../lib/painel/auth.ts");
const { periodo, DIAS_MAX } = await import("../lib/painel/periodo.ts");

const env = { DASHBOARD_PASSWORD: "senha-forte-123", DASHBOARD_SECRET: "segredo-com-mais-de-16" };
const AGORA = Date.UTC(2026, 9, 19, 15, 0, 0);

describe("auth do painel", () => {
  test("só fica configurado com senha ≥ 8 e segredo ≥ 16", () => {
    assert.equal(auth.authConfigurada(env), true);
    assert.equal(auth.authConfigurada({ ...env, DASHBOARD_PASSWORD: "curta" }), false);
    assert.equal(auth.authConfigurada({ ...env, DASHBOARD_SECRET: "curto" }), false);
    assert.equal(auth.authConfigurada({}), false);
  });

  test("confere a senha sem aceitar tipos estranhos", () => {
    assert.equal(auth.senhaCorreta("senha-forte-123", env), true);
    assert.equal(auth.senhaCorreta("senha-forte-12", env), false);
    assert.equal(auth.senhaCorreta(["senha-forte-123"], env), false);
    assert.equal(auth.senhaCorreta(undefined, env), false);
    assert.equal(auth.senhaCorreta("senha-forte-123", {}), false);
  });

  test("token emitido vale por 30 dias e depois expira", () => {
    const token = auth.emitirToken(env, AGORA);
    assert.equal(auth.tokenValido(token, env, AGORA), true);
    assert.equal(auth.tokenValido(token, env, AGORA + 29 * 86_400_000), true);
    assert.equal(auth.tokenValido(token, env, AGORA + 31 * 86_400_000), false);
  });

  test("token adulterado, de outro segredo ou malformado é recusado", () => {
    const token = auth.emitirToken(env, AGORA);
    const [exp, sig] = token.split(".");
    assert.equal(auth.tokenValido(`${Number(exp) + 1}.${sig}`, env, AGORA), false);
    assert.equal(auth.tokenValido(token, { ...env, DASHBOARD_SECRET: "outro-segredo-qualquer" }, AGORA), false);
    for (const ruim of [undefined, "", "abc", `${exp}.`, `.${sig}`, `${token}.extra`, `x${exp}.${sig}`]) {
      assert.equal(auth.tokenValido(ruim, env, AGORA), false, String(ruim));
    }
  });

  test("sem configuração nenhum token vale", () => {
    const token = auth.emitirToken(env, AGORA);
    assert.equal(auth.tokenValido(token, {}, AGORA), false);
  });
});

describe("período do painel", () => {
  const agora = new Date("2026-10-19T15:00:00Z"); // 12h em Goiânia

  test("padrão: últimos 30 dias até hoje, com período anterior do mesmo tamanho", () => {
    const p = periodo({}, agora);
    assert.equal(p.ate, "2026-10-19");
    assert.equal(p.de, "2026-09-20");
    assert.equal(p.days, 30);
    assert.equal(p.from.toISOString(), "2026-09-20T03:00:00.000Z");
    assert.equal(p.to.toISOString(), "2026-10-20T03:00:00.000Z");
    assert.equal(p.prevTo.getTime(), p.from.getTime());
    assert.equal(p.prevFrom.toISOString(), "2026-08-21T03:00:00.000Z");
  });

  test("usa de/ate válidos e um dia só", () => {
    const p = periodo({ de: "2026-10-01", ate: "2026-10-01" }, agora);
    assert.equal(p.days, 1);
    assert.equal(p.from.toISOString(), "2026-10-01T03:00:00.000Z");
  });

  test("ignora datas inválidas, invertidas ou no futuro", () => {
    assert.equal(periodo({ de: "2026-02-30", ate: "x" }, agora).de, "2026-09-20");
    assert.equal(periodo({ de: "2026-10-10", ate: "2026-10-01" }, agora).de, "2026-09-02");
    assert.equal(periodo({ ate: "2027-01-01" }, agora).ate, "2026-10-19");
  });

  test(`limita o intervalo a ${DIAS_MAX} dias`, () => {
    const p = periodo({ de: "2020-01-01", ate: "2026-10-19" }, agora);
    assert.equal(p.days, DIAS_MAX);
  });
});

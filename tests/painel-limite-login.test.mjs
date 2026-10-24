// Limite de tentativas do login do painel (lib/painel/limite-login.ts): memória + tabela nicoli_login_attempts.
import "./helpers/ts-resolve.mjs";
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

const limite = await import("../lib/painel/limite-login.ts");
const { MAX_FALHAS, JANELA_MS, hashDoIp, ipDoCliente, mensagemMuitasTentativas, registrarTentativa, verificarLimite, zerarLimiteEmMemoria } = limite;

const AGORA = Date.UTC(2026, 9, 23, 15, 0, 0);
const cabecalhos = (h) => (nome) => h[nome] ?? null;

/** Cliente Supabase falso: guarda as linhas inseridas e responde ao select encadeado. */
function bancoFalso({ falhaNoSelect = false } = {}) {
  const linhas = [];
  const consulta = () => {
    const filtros = {};
    const q = {
      select: () => q,
      eq: (col, v) => ((filtros[col] = v), q),
      gte: (_col, v) => ((filtros.desde = v), q),
      order: () => q,
      limit: async (n) => {
        if (falhaNoSelect) return { data: null, error: { message: "relation does not exist" } };
        const data = linhas
          .filter((r) => r.ip_hash === filtros.ip_hash && r.success === filtros.success && r.created_at >= filtros.desde)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, n);
        return { data, error: null };
      },
    };
    return q;
  };
  return {
    linhas,
    agora: AGORA,
    from() {
      return {
        select: (...a) => consulta().select(...a),
        insert: async (row) => {
          linhas.push({ ...row, created_at: new Date(this.agora).toISOString() });
          return { error: null };
        },
      };
    },
  };
}

beforeEach(() => zerarLimiteEmMemoria());

describe("limite de tentativas do login", () => {
  test("IP vem do 1º valor de x-forwarded-for, senão de x-real-ip", () => {
    assert.equal(ipDoCliente(cabecalhos({ "x-forwarded-for": "200.1.2.3, 10.0.0.1", "x-real-ip": "9.9.9.9" })), "200.1.2.3");
    assert.equal(ipDoCliente(cabecalhos({ "x-real-ip": " 9.9.9.9 " })), "9.9.9.9");
    assert.equal(ipDoCliente(cabecalhos({})), "desconhecido");
  });

  test("hash do IP é sha256 hex estável", () => {
    assert.match(hashDoIp("200.1.2.3"), /^[0-9a-f]{64}$/);
    assert.equal(hashDoIp("200.1.2.3"), hashDoIp("200.1.2.3"));
    assert.notEqual(hashDoIp("200.1.2.3"), hashDoIp("200.1.2.4"));
  });

  test(`sem banco: bloqueia após ${MAX_FALHAS} falhas e libera quando a mais antiga sai da janela`, async () => {
    const ip = hashDoIp("200.1.2.3");
    for (let i = 0; i < MAX_FALHAS; i++) {
      assert.equal(await verificarLimite(null, ip, AGORA + i * 1000), 0);
      await registrarTentativa(null, ip, false, AGORA + i * 1000);
    }
    assert.equal(await verificarLimite(null, ip, AGORA + MAX_FALHAS * 1000), (JANELA_MS - MAX_FALHAS * 1000) / 1000);
    assert.equal(await verificarLimite(null, hashDoIp("200.1.2.4"), AGORA), 0, "outro IP segue liberado");
    assert.equal(await verificarLimite(null, ip, AGORA + JANELA_MS), 0);
  });

  test("com banco: o limite vale entre instâncias (memória zerada) e o sucesso fica no histórico", async () => {
    const db = bancoFalso();
    const ip = hashDoIp("200.1.2.3");
    for (let i = 0; i < MAX_FALHAS; i++) await registrarTentativa(db, ip, false, AGORA);
    await registrarTentativa(db, hashDoIp("200.1.2.4"), true, AGORA);
    zerarLimiteEmMemoria(); // outra instância da função
    assert.ok((await verificarLimite(db, ip, AGORA + 1000)) > 0);
    assert.equal(db.linhas.length, MAX_FALHAS + 1);
    assert.ok(db.linhas.every((r) => /^[0-9a-f]{64}$/.test(r.ip_hash) && !("ip" in r)));
  });

  test("tabela ainda não criada: cai para a memória sem quebrar o login", async () => {
    const db = bancoFalso({ falhaNoSelect: true });
    const ip = hashDoIp("200.1.2.3");
    assert.equal(await verificarLimite(db, ip, AGORA), 0);
    for (let i = 0; i < MAX_FALHAS; i++) await registrarTentativa(db, ip, false, AGORA);
    assert.ok((await verificarLimite(db, ip, AGORA + 1000)) > 0);
  });

  test("mensagem do 429 em minutos", () => {
    assert.equal(mensagemMuitasTentativas(900), "Muitas tentativas. Tente de novo em 15 min.");
    assert.equal(mensagemMuitasTentativas(5), "Muitas tentativas. Tente de novo em 1 min.");
  });
});

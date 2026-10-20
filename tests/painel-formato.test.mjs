// Formatação e rótulos do painel (pt-BR).
import "./helpers/ts-resolve.mjs";
import assert from "node:assert/strict";
import { test } from "node:test";

const f = await import("../lib/painel/formato.ts");
const nbsp = (s) => s.replace(/ /g, " ");

test("números, moeda, percentual e duração em pt-BR", () => {
  assert.equal(f.numero(1284), "1.284");
  assert.equal(f.numero(4.5), "4,5");
  assert.equal(nbsp(f.numero(12_900)), "12,9 mil");
  assert.equal(nbsp(f.moeda(1234.5)), "R$ 1.234,50");
  assert.equal(f.moeda(null), "—");
  assert.equal(f.percentual(0.153), "15,3%");
  assert.equal(f.percentual(null), "—");
  assert.equal(f.duracao(95.5), "1min 36s");
  assert.equal(f.duracao(42), "42s");
  assert.equal(f.diaCurto("2026-10-19"), "19/10");
});

test("variação respeita o lado bom de cada métrica", () => {
  assert.deepEqual(f.variacao(150, 100), { texto: "+50%", tom: "bom" });
  assert.deepEqual(f.variacao(50, 100), { texto: "−50%", tom: "ruim" });
  assert.deepEqual(f.variacao(80, 100, "descer"), { texto: "−20%", tom: "bom" });
  assert.deepEqual(f.variacao(120, 100, "neutro"), { texto: "+20%", tom: "neutro" });
  assert.deepEqual(f.variacao(100, 100), { texto: "estável", tom: "neutro" });
  assert.deepEqual(f.variacao(5, 0), { texto: "novo no período", tom: "neutro" });
  assert.equal(f.variacao(0, 0), null);
  assert.equal(f.variacao(null, 10), null);
});

test("caminhos viram nomes legíveis", () => {
  assert.equal(f.nomePagina("/"), "Página inicial");
  assert.equal(f.nomePagina("/areas-de-atuacao/direito-tributario"), "Área · Tributário");
  assert.equal(f.nomePagina("/areas-de-atuacao/direito-tributario/?gclid=x"), "Área · Tributário");
  assert.equal(f.nomePagina("/blog/pensao-alimenticia"), "Blog · pensao alimenticia");
  assert.equal(f.nomePagina("/contato"), "Contato");
  assert.equal(f.nomePagina("/qualquer"), "/qualquer");
});

test("canais, dispositivos e status traduzidos (com fallback)", () => {
  assert.equal(f.nomeCanal("Paid Search"), "Pesquisa paga (Google Ads)");
  assert.equal(f.nomeCanal("Canal novo"), "Canal novo");
  assert.equal(f.nomeDispositivo("mobile"), "Celular");
  assert.equal(f.nomeStatus("PAUSED"), "Pausada");
  assert.equal(f.nomeStatus("UNKNOWN"), "—");
});

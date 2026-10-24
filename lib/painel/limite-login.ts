/**
 * Limite de tentativas do login do painel: no máximo 5 falhas por IP a cada 15 min → 429 + Retry-After.
 * Duas camadas, vale a mais restritiva:
 *  1) Tabela nicoli_login_attempts no Supabase (service role): compartilhada entre as instâncias da Vercel.
 *  2) Map em memória: vale só para a instância da função que atendeu (a Vercel pode subir várias e
 *     reciclá-las a qualquer hora). Segura o limite se o banco não estiver configurado ou se a migration
 *     supabase/migrations/0002_nicoli_login_attempts.sql ainda não tiver sido aplicada.
 * O IP nunca é gravado: só sha256(salt fixo do projeto + IP).
 * O cliente do Supabase entra por parâmetro (a rota passa supabaseServidor()) para o módulo ser testável.
 */
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const MAX_FALHAS = 5;
export const JANELA_MS = 15 * 60 * 1000;
const TABELA = "nicoli_login_attempts";
const SALT = "nicoli-painel-login-v1";
const MAX_IPS_EM_MEMORIA = 10_000; // teto do Map: rajada de IPs diferentes não estoura a memória

/** ipHash → instantes (ms) das falhas ainda dentro da janela. */
const falhas = new Map<string, readonly number[]>();
let avisado = false;

type LerCabecalho = (nome: string) => string | null | undefined;

/** IP do cliente: 1º valor de x-forwarded-for, senão x-real-ip. */
export function ipDoCliente(cabecalho: LerCabecalho): string {
  const encaminhado = (cabecalho("x-forwarded-for") ?? "").split(",")[0].trim();
  return encaminhado || (cabecalho("x-real-ip") ?? "").trim() || "desconhecido";
}

export function hashDoIp(ip: string): string {
  return createHash("sha256").update(`${SALT}:${ip}`).digest("hex");
}

export function mensagemMuitasTentativas(segundos: number): string {
  return `Muitas tentativas. Tente de novo em ${Math.max(1, Math.ceil(segundos / 60))} min.`;
}

/** Segundos até a falha mais antiga que ainda conta sair da janela (0 = liberado). */
function segundosParaLiberar(falhasDesc: readonly number[], agora: number): number {
  if (falhasDesc.length < MAX_FALHAS) return 0;
  const liberaEm = falhasDesc[MAX_FALHAS - 1] + JANELA_MS;
  return Math.max(1, Math.ceil((liberaEm - agora) / 1000));
}

/** Remove do Map as falhas fora da janela e os IPs que ficaram sem nenhuma. */
function limparExpiradas(agora: number): void {
  for (const [chave, instantes] of falhas) {
    const recentes = instantes.filter((t) => agora - t < JANELA_MS);
    if (recentes.length) falhas.set(chave, recentes);
    else falhas.delete(chave);
  }
}

function avisarUmaVez(erro: unknown): void {
  if (avisado) return;
  avisado = true;
  const detalhe = erro instanceof Error ? erro.message : String(erro);
  console.error("[painel/login] limite só em memória (por instância); Supabase indisponível:", detalhe);
}

async function segundosNoBanco(db: SupabaseClient, ipHash: string, agora: number): Promise<number> {
  const { data, error } = await db
    .from(TABELA)
    .select("created_at")
    .eq("ip_hash", ipHash)
    .eq("success", false)
    .gte("created_at", new Date(agora - JANELA_MS).toISOString())
    .order("created_at", { ascending: false })
    .limit(MAX_FALHAS);
  if (error) throw new Error(error.message);
  return segundosParaLiberar((data ?? []).map((r: { created_at: string }) => Date.parse(r.created_at)), agora);
}

/** Segundos que o IP ainda precisa esperar (0 = pode tentar). Nunca lança. */
export async function verificarLimite(db: SupabaseClient | null, ipHash: string, agora = Date.now()): Promise<number> {
  limparExpiradas(agora);
  const daMemoria = segundosParaLiberar([...(falhas.get(ipHash) ?? [])].sort((a, b) => b - a), agora);
  let doBanco = 0;
  if (db) {
    try {
      doBanco = await segundosNoBanco(db, ipHash, agora);
    } catch (erro) {
      avisarUmaVez(erro);
    }
  }
  return Math.max(daMemoria, doBanco);
}

/** Registra a tentativa (falha conta para o limite; sucesso fica só no histórico do banco). Nunca lança. */
export async function registrarTentativa(
  db: SupabaseClient | null,
  ipHash: string,
  sucesso: boolean,
  agora = Date.now(),
): Promise<void> {
  if (!sucesso) {
    if (!falhas.has(ipHash) && falhas.size >= MAX_IPS_EM_MEMORIA) {
      const maisAntigo = falhas.keys().next().value;
      if (maisAntigo !== undefined) falhas.delete(maisAntigo);
    }
    falhas.set(ipHash, [...(falhas.get(ipHash) ?? []), agora]);
  }
  if (!db) return;
  try {
    const { error } = await db.from(TABELA).insert({ ip_hash: ipHash, success: sucesso });
    if (error) throw new Error(error.message);
  } catch (erro) {
    avisarUmaVez(erro);
  }
}

/** Só para testes. */
export function zerarLimiteEmMemoria(): void {
  falhas.clear();
  avisado = false;
}

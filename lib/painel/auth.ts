/**
 * Login do /dashboard: senha única (DASHBOARD_PASSWORD) → token HMAC com validade,
 * guardado em cookie httpOnly (o JavaScript da página nunca vê o token).
 * As variáveis são lidas a cada chamada para valer logo após o redeploy.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_PAINEL = "nicoli_painel";
export const SESSAO_DIAS = 30;
const SESSAO_MS = SESSAO_DIAS * 24 * 60 * 60 * 1000;
const SENHA_MIN = 8;
const SEGREDO_MIN = 16;

type Env = Record<string, string | undefined>;

const senha = (env: Env) => env.DASHBOARD_PASSWORD ?? "";
const segredo = (env: Env) => env.DASHBOARD_SECRET ?? "";

export function authConfigurada(env: Env = process.env): boolean {
  return senha(env).length >= SENHA_MIN && segredo(env).length >= SEGREDO_MIN;
}

function assinar(payload: string, env: Env): string {
  return createHmac("sha256", segredo(env)).update(payload).digest("base64url");
}

function iguais(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function senhaCorreta(candidata: unknown, env: Env = process.env): boolean {
  return authConfigurada(env) && typeof candidata === "string" && iguais(candidata, senha(env));
}

export function emitirToken(env: Env = process.env, agora = Date.now()): string {
  const exp = String(agora + SESSAO_MS);
  return `${exp}.${assinar(exp, env)}`;
}

export function tokenValido(token: string | undefined, env: Env = process.env, agora = Date.now()): boolean {
  if (!authConfigurada(env) || typeof token !== "string") return false;
  const [exp, sig, ...resto] = token.split(".");
  if (!exp || !sig || resto.length > 0 || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < agora) return false;
  return iguais(assinar(exp, env), sig);
}

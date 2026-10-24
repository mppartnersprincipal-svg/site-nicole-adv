import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_PAINEL, SESSAO_DIAS, authConfigurada, emitirToken, senhaCorreta } from "@/lib/painel/auth";
import { SEM_CACHE, sessaoValida } from "@/lib/painel/sessao";
import { supabaseServidor } from "@/lib/painel/supabase";
import {
  hashDoIp,
  ipDoCliente,
  mensagemMuitasTentativas,
  registrarTentativa,
  verificarLimite,
} from "@/lib/painel/limite-login";

/** Atraso fixo em toda tentativa: freia força bruta trivial sem revelar se a senha estava perto. */
const ATRASO_MS = 400;
const TAMANHO_MAX_CORPO = 1_000;

const json = (body: object, status: number, extras: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { ...SEM_CACHE, ...extras } });

/** GET → { autenticado } (a página decide entre login e painel). */
export async function GET() {
  return json({ autenticado: await sessaoValida(), configurado: authConfigurada() }, 200);
}

/** POST { password } → cookie httpOnly de 30 dias. Máx. 5 falhas por IP a cada 15 min → 429 + Retry-After. */
export async function POST(request: Request) {
  if (!authConfigurada()) {
    return json(
      { error: "Painel não configurado: defina DASHBOARD_PASSWORD (mín. 8) e DASHBOARD_SECRET (mín. 16) na Vercel e faça o redeploy." },
      503,
    );
  }
  const db = supabaseServidor();
  const ipHash = hashDoIp(ipDoCliente((nome) => request.headers.get(nome)));
  const esperar = await verificarLimite(db, ipHash);
  if (esperar > 0) return json({ error: mensagemMuitasTentativas(esperar) }, 429, { "Retry-After": String(esperar) });

  const texto = await request.text();
  let senha: unknown = null;
  if (texto.length <= TAMANHO_MAX_CORPO) {
    try {
      senha = (JSON.parse(texto) as { password?: unknown })?.password;
    } catch {
      senha = null;
    }
  }
  await new Promise((r) => setTimeout(r, ATRASO_MS));
  if (!senhaCorreta(senha)) {
    await registrarTentativa(db, ipHash, false);
    return json({ error: "Senha incorreta." }, 401);
  }
  await registrarTentativa(db, ipHash, true);

  const jar = await cookies();
  jar.set(COOKIE_PAINEL, emitirToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSAO_DIAS * 24 * 60 * 60,
  });
  return json({ ok: true }, 200);
}

/** DELETE → sai do painel. */
export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE_PAINEL);
  return json({ ok: true }, 200);
}

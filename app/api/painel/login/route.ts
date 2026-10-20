import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_PAINEL, SESSAO_DIAS, authConfigurada, emitirToken, senhaCorreta } from "@/lib/painel/auth";
import { SEM_CACHE, sessaoValida } from "@/lib/painel/sessao";

/** Atraso fixo em toda tentativa: freia força bruta trivial sem revelar se a senha estava perto. */
const ATRASO_MS = 400;
const TAMANHO_MAX_CORPO = 1_000;

const json = (body: object, status: number) => NextResponse.json(body, { status, headers: SEM_CACHE });

/** GET → { autenticado } (a página decide entre login e painel). */
export async function GET() {
  return json({ autenticado: await sessaoValida(), configurado: authConfigurada() }, 200);
}

/** POST { password } → cookie httpOnly de 30 dias. */
export async function POST(request: Request) {
  if (!authConfigurada()) {
    return json(
      { error: "Painel não configurado: defina DASHBOARD_PASSWORD (mín. 8) e DASHBOARD_SECRET (mín. 16) na Vercel e faça o redeploy." },
      503,
    );
  }
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
  if (!senhaCorreta(senha)) return json({ error: "Senha incorreta." }, 401);

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

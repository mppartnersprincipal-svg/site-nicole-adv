import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_PAINEL, tokenValido } from "./auth";
import { periodo, type Periodo } from "./periodo";

/** Cabeçalhos das respostas do painel: nunca em cache nem indexadas. */
export const SEM_CACHE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } as const;

export async function sessaoValida(): Promise<boolean> {
  const jar = await cookies();
  return tokenValido(jar.get(COOKIE_PAINEL)?.value);
}

export function naoAutorizado(): NextResponse {
  return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401, headers: SEM_CACHE });
}

export function periodoDaRequisicao(request: Request): Periodo {
  const q = new URL(request.url).searchParams;
  return periodo({ de: q.get("de"), ate: q.get("ate") });
}

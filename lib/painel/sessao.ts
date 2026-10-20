import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { COOKIE_PAINEL, tokenValido } from "./auth";

/** Cabeçalhos das respostas do painel: nunca em cache nem indexadas. */
export const SEM_CACHE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } as const;

export async function sessaoValida(): Promise<boolean> {
  // Sempre na hora do pedido: a validade do token depende do relógio, que o partialPrefetching não pode congelar
  await connection();
  const jar = await cookies();
  return tokenValido(jar.get(COOKIE_PAINEL)?.value);
}

"use server";

import { cookies } from "next/headers";
import { COOKIE_PAINEL } from "@/lib/painel/auth";
import { getRecent } from "@/lib/painel/consultas";
import type { RecentRow } from "@/lib/painel/rotulos";
import { sessaoValida } from "@/lib/painel/sessao";

const LIMITE_RECENTES = 40;

/** Últimos eventos para o polling da seção "Ao vivo". Sem sessão válida, não devolve nada. */
export async function obterEventosRecentes(): Promise<RecentRow[]> {
  if (!(await sessaoValida())) return [];
  return getRecent(LIMITE_RECENTES);
}

/** Sai do painel (apaga o cookie de sessão). */
export async function sairDoPainel(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_PAINEL);
}

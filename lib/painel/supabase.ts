import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente service role do Supabase (só servidor). Tabelas e funções `nicoli_*` não têm
 * acesso para anon/authenticated: tudo passa por aqui. Sem as variáveis, devolve null
 * (a coleta aceita e descarta; o painel mostra "aguardando conexão").
 */
let cache: SupabaseClient | null | undefined;

export function supabaseServidor(): SupabaseClient | null {
  if (cache !== undefined) return cache;
  const url = process.env.SUPABASE_URL?.trim();
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  cache = url && chave ? createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return cache;
}

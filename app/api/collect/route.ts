import { after, userAgent, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { hostSemWww } from "@/lib/painel/canal";
import { BOT_RE, MAX_CORPO, interpretarLote } from "@/lib/painel/coleta";
import { supabaseServidor } from "@/lib/painel/supabase";

/**
 * Coleta própria e anônima do painel /dashboard (lado do navegador: lib/painel/coletor.ts).
 * Recebe lotes via sendBeacon (text/plain, sem preflight), responde 204 na hora e grava
 * no Supabase em `after()`. Sem IP gravado (só um hash em memória para limitar abuso),
 * sem user-agent cru. Sem SUPABASE_* no ambiente, aceita e descarta.
 */

const LIMITE_SESSAO = 120;
const LIMITE_REDE = 600;
const MAX_BALDES = 5000;
const baldes = new Map<string, { n: number; reset: number }>();

function permitir(chave: string, limite: number): boolean {
  const agora = Date.now();
  const b = baldes.get(chave);
  if (!b || b.reset < agora) {
    if (baldes.size > MAX_BALDES) baldes.clear();
    baldes.set(chave, { n: 1, reset: agora + 60_000 });
    return true;
  }
  baldes.set(chave, { ...b, n: b.n + 1 });
  return b.n + 1 <= limite;
}

const vazio = (status = 204) => new Response(null, { status });

export async function POST(request: NextRequest) {
  const uaBruto = request.headers.get("user-agent") ?? "";
  if (!uaBruto || BOT_RE.test(uaBruto)) return vazio();
  const ua = userAgent(request);
  if (ua.isBot) return vazio();
  if (Number(request.headers.get("content-length") ?? 0) > MAX_CORPO) return vazio(413);

  const h = request.headers;
  const tipo = ua.device.type;
  const device =
    tipo === "mobile" || tipo === "wearable" || h.get("sec-ch-ua-mobile") === "?1"
      ? "mobile"
      : tipo === "tablet"
        ? "tablet"
        : "desktop";
  const lote = interpretarLote(await request.text(), {
    siteHost: hostSemWww(process.env.NEXT_PUBLIC_SITE_URL) ?? request.nextUrl.hostname,
    device,
    browserName: ua.browser.name,
    osName: ua.os.name,
    country: h.get("x-vercel-ip-country"),
    region: h.get("x-vercel-ip-country-region"),
    city: h.get("x-vercel-ip-city"),
  });
  if (!lote.ok) return vazio(lote.status);

  const rede = createHash("sha256")
    .update(h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "local")
    .digest("hex")
    .slice(0, 16);
  if (!permitir(`s:${lote.sid}`, LIMITE_SESSAO) || !permitir(`ip:${rede}`, LIMITE_REDE)) return vazio();
  if (!lote.eventos.length && !lote.sessao) return vazio();

  const supabase = supabaseServidor();
  if (!supabase) return vazio();

  after(async () => {
    try {
      if (lote.sessao) {
        const { error } = await supabase
          .from("nicoli_sessions")
          .upsert(lote.sessao, { onConflict: "id", ignoreDuplicates: true });
        if (error) console.error("[collect] sessão", error.message);
      }
      if (!lote.eventos.length) return;
      const { error } = await supabase.from("nicoli_events").insert(lote.eventos);
      if (!error) return;
      if (error.code !== "23503") {
        console.error("[collect] eventos", error.message);
        return;
      }
      // O 1º lote (com a sessão) se perdeu: cria um esqueleto e tenta de novo
      await supabase
        .from("nicoli_sessions")
        .upsert({ id: lote.sid, landing_path: lote.eventos[0].path, channel: "direct" }, { onConflict: "id", ignoreDuplicates: true });
      const retry = await supabase.from("nicoli_events").insert(lote.eventos);
      if (retry.error) console.error("[collect] eventos (retry)", retry.error.message);
    } catch (erro) {
      console.error("[collect] inesperado", erro);
    }
  });

  return vazio();
}

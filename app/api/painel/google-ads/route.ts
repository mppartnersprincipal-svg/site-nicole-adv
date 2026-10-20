import { NextResponse } from "next/server";
import { buscarRelatorioAds } from "@/lib/painel/google-ads";
import { SEM_CACHE, naoAutorizado, periodoDaRequisicao, sessaoValida } from "@/lib/painel/sessao";

/**
 * GET /api/painel/google-ads?de=YYYY-MM-DD&ate=YYYY-MM-DD → relatório da conta (só leitura, via MCC).
 * Sempre 200 com o estado no corpo (ready | not_configured | error): se o Ads falhar, o GA4 segue de pé.
 */
export async function GET(request: Request) {
  if (!(await sessaoValida())) return naoAutorizado();
  const p = periodoDaRequisicao(request);
  const relatorio = await buscarRelatorioAds({ from: p.from, to: p.to, prevFrom: p.prevFrom, prevTo: p.prevTo });
  return NextResponse.json(relatorio, { headers: SEM_CACHE });
}

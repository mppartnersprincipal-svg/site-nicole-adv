import { NextResponse } from "next/server";
import { buscarRelatorioGa4 } from "@/lib/painel/ga4";
import { SEM_CACHE, naoAutorizado, periodoDaRequisicao, sessaoValida } from "@/lib/painel/sessao";

/**
 * GET /api/painel/ga4?de=YYYY-MM-DD&ate=YYYY-MM-DD → relatório da propriedade GA4 (só leitura).
 * Sempre 200 com o estado no corpo (ready | not_configured | error): se o GA4 falhar, o Ads segue de pé.
 */
export async function GET(request: Request) {
  if (!(await sessaoValida())) return naoAutorizado();
  const p = periodoDaRequisicao(request);
  const relatorio = await buscarRelatorioGa4({ from: p.from, to: p.to, prevFrom: p.prevFrom, prevTo: p.prevTo });
  return NextResponse.json(relatorio, { headers: SEM_CACHE });
}

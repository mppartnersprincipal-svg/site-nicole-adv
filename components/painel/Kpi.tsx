import type { Variacao } from "@/lib/painel/formato";

interface KpiProps {
  rotulo: string;
  valor: string;
  variacao?: Variacao | null;
  ajuda?: string;
  destaque?: boolean;
}

const TOM = {
  bom: "text-whatsapp",
  ruim: "text-bordo-600",
  neutro: "text-cinza",
} as const;

/** A seta mostra a direção do número; a cor (TOM) diz se a mudança é boa ou ruim. */
function seta(texto: string): string {
  if (texto.startsWith("+")) return "▲";
  if (texto.startsWith("−")) return "▼";
  return "";
}

/** Indicador: rótulo, número e variação contra o período anterior (texto + seta, nunca só cor). */
export function Kpi({ rotulo, valor, variacao, ajuda, destaque = false }: KpiProps) {
  return (
    <div className={`min-w-0 p-4 sm:p-5 ${destaque ? "bg-bordo-700 text-marfim" : "border border-pedra bg-branco"}`}>
      <p className={`text-xs uppercase tracking-[0.14em] ${destaque ? "text-champanhe-200" : "text-cinza"}`}>{rotulo}</p>
      <p
        className={`mt-2 break-words font-sans font-semibold leading-none ${destaque ? "text-5xl" : "text-xl text-grafite sm:text-3xl"}`}
      >
        {valor}
      </p>
      {variacao && (
        <p className={`mt-2 text-xs ${destaque ? "text-champanhe-200" : TOM[variacao.tom]}`}>
          {seta(variacao.texto) && <span aria-hidden>{seta(variacao.texto)} </span>}
          {variacao.texto} <span className={destaque ? "" : "text-cinza"}>vs. período anterior</span>
        </p>
      )}
      {ajuda && <p className={`mt-2 text-xs ${destaque ? "text-champanhe-200" : "text-cinza"}`}>{ajuda}</p>}
    </div>
  );
}

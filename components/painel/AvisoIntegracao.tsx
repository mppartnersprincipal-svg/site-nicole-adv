import type { RelatorioIndisponivel } from "@/lib/painel/tipos";

interface AvisoIntegracaoProps {
  fonte: string;
  relatorio: RelatorioIndisponivel;
}

/** Integração sem dados: "conectar" (falta variável) ou erro (mensagem segura do servidor). */
export function AvisoIntegracao({ fonte, relatorio }: AvisoIntegracaoProps) {
  const ehErro = relatorio.status === "error";
  return (
    <div role={ehErro ? "alert" : "status"} className={`border-l-4 p-5 ${ehErro ? "border-bordo-600 bg-bordo-100" : "border-champanhe-500 bg-areia"}`}>
      <p className="text-sm font-semibold text-grafite">{ehErro ? `${fonte}: não foi possível carregar` : `${fonte}: aguardando conexão`}</p>
      <p className="mt-1 text-sm text-cinza">{relatorio.message}</p>
    </div>
  );
}

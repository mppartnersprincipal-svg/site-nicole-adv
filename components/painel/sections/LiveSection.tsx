import { getRecent } from "@/lib/painel/consultas";
import { ChartCard } from "../ChartCard";
import { LiveFeed } from "../LiveFeed";

/** Últimos eventos do site, atualizando sozinho. */
export async function LiveSection() {
  const iniciais = await getRecent(40);
  return (
    <ChartCard id="ao-vivo" title="Ao vivo" description="Últimos eventos registrados, atualiza a cada 30 s" className="h-full">
      <LiveFeed initial={iniciais} />
    </ChartCard>
  );
}

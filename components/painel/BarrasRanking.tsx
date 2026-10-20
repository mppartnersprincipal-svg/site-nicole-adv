interface ItemRanking {
  chave: string;
  rotulo: string;
  valor: number;
  detalhe?: string;
}

interface BarrasRankingProps {
  titulo: string;
  itens: ItemRanking[];
  formatar: (v: number) => string;
  vazio?: string;
}

/** Ranking em barras horizontais: rótulo e valor em texto, a barra só mostra a proporção. */
export function BarrasRanking({ titulo, itens, formatar, vazio = "Sem dados no período." }: BarrasRankingProps) {
  const max = Math.max(0, ...itens.map((i) => i.valor));
  return (
    <figure className="m-0 min-w-0">
      <figcaption className="mb-3 text-sm font-medium text-grafite">{titulo}</figcaption>
      {itens.length === 0 || max === 0 ? (
        <p className="text-sm text-cinza">{vazio}</p>
      ) : (
        <ol className="space-y-3">
          {itens.map((item) => (
            <li key={item.chave} title={item.detalhe}>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="min-w-0 truncate text-grafite">{item.rotulo}</span>
                <span className="shrink-0 font-medium tabular-nums text-grafite">{formatar(item.valor)}</span>
              </div>
              <div className="mt-1 h-2 w-full bg-areia" aria-hidden>
                <div className="h-2 rounded-r bg-bordo-700" style={{ width: `${Math.max(1, (item.valor / max) * 100)}%` }} />
              </div>
              {item.detalhe && <p className="mt-1 text-xs text-cinza">{item.detalhe}</p>}
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}

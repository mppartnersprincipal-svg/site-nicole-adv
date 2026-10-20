"use client";

import { useEffect, useRef, useState } from "react";
import { diaCurto } from "@/lib/painel/formato";

interface Ponto {
  date: string;
  valor: number;
}

interface ColunasDiariasProps {
  titulo: string;
  pontos: Ponto[];
  formatar: (v: number) => string;
}

const ALTURA = 200;
const MARGEM = { topo: 12, base: 26, esquerda: 52, direita: 8 };
const BARRA_MAX = 24;
const RAIO = 4;

/** Topo "redondo" o suficiente para a escala: 1, 2, 2.5, 5 × 10^n. */
function tetoBonito(max: number): number {
  if (max <= 0) return 1;
  const potencia = 10 ** Math.floor(Math.log10(max));
  const passo = [1, 2, 2.5, 5, 10].find((m) => m * potencia >= max) ?? 10;
  return passo * potencia;
}

/** Coluna com cantos de 4px só na ponta (base reta, presa à linha zero). */
function caminhoColuna(x: number, y: number, w: number, h: number): string {
  const r = Math.min(RAIO, w / 2, h);
  const base = y + h;
  return `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${base}Z`;
}

/** Série diária de uma métrica (colunas + dica ao passar o mouse/foco + tabela). */
export function ColunasDiarias({ titulo, pontos, formatar }: ColunasDiariasProps) {
  const caixa = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(320);
  const [ativo, setAtivo] = useState<number | null>(null);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const obs = new ResizeObserver(([entrada]) => setLargura(Math.max(280, entrada.contentRect.width)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const teto = tetoBonito(Math.max(0, ...pontos.map((p) => p.valor)));
  const areaW = largura - MARGEM.esquerda - MARGEM.direita;
  const areaH = ALTURA - MARGEM.topo - MARGEM.base;
  const faixa = pontos.length > 0 ? areaW / pontos.length : areaW;
  const barra = Math.max(2, Math.min(BARRA_MAX, faixa - 2));
  const y = (v: number) => MARGEM.topo + areaH - (v / teto) * areaH;
  const marcas = [0, teto / 2, teto];
  const passoRotulo = Math.max(1, Math.ceil(pontos.length / Math.max(2, Math.floor(areaW / 56))));
  const pontoAtivo = ativo !== null ? pontos[ativo] : null;

  return (
    <figure className="m-0 min-w-0">
      <figcaption className="mb-3 text-sm font-medium text-grafite">{titulo}</figcaption>
      {/* overflow-hidden + min-w-0: o SVG nunca alarga a coluna do grid (o ResizeObserver mede a largura real) */}
      <div ref={caixa} className="relative w-full overflow-hidden">
        <svg width={largura} height={ALTURA} role="img" aria-label={`${titulo}, ${pontos.length} dias`} className="block">
          {marcas.map((m) => (
            <g key={m}>
              <line x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={y(m)} y2={y(m)} stroke="var(--cor-pedra)" strokeWidth={1} />
              <text x={MARGEM.esquerda - 8} y={y(m)} dy="0.32em" textAnchor="end" className="fill-cinza text-[11px] tabular-nums">
                {formatar(m)}
              </text>
            </g>
          ))}
          {pontos.map((p, i) => {
            const x0 = MARGEM.esquerda + i * faixa;
            const h = Math.max(0, y(0) - y(p.valor));
            return (
              <g
                key={p.date}
                tabIndex={0}
                role="img"
                aria-label={`${diaCurto(p.date)}: ${formatar(p.valor)}`}
                onPointerEnter={() => setAtivo(i)}
                onPointerLeave={() => setAtivo(null)}
                onFocus={() => setAtivo(i)}
                onBlur={() => setAtivo(null)}
                className="outline-none"
              >
                {/* Alvo do ponteiro = faixa inteira do dia, maior que a coluna */}
                <rect x={x0} y={MARGEM.topo} width={faixa} height={areaH} fill="transparent" />
                {h > 0 && (
                  <path
                    d={caminhoColuna(x0 + (faixa - barra) / 2, y(p.valor), barra, h)}
                    fill={ativo === i ? "var(--cor-bordo-500)" : "var(--cor-bordo-700)"}
                  />
                )}
                {i % passoRotulo === 0 && (
                  <text x={x0 + faixa / 2} y={ALTURA - 8} textAnchor="middle" className="fill-cinza text-[11px] tabular-nums">
                    {diaCurto(p.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {pontoAtivo && ativo !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-sm border border-pedra bg-branco px-3 py-2 shadow-md"
            style={{ left: Math.min(largura - 60, Math.max(60, MARGEM.esquerda + (ativo + 0.5) * faixa)) }}
          >
            <p className="text-base font-semibold text-grafite">{formatar(pontoAtivo.valor)}</p>
            <p className="text-xs text-cinza">{diaCurto(pontoAtivo.date)}</p>
          </div>
        )}
      </div>
      <details className="mt-2 text-sm text-cinza">
        <summary className="cursor-pointer select-none hover:text-bordo-700">Ver em tabela</summary>
        <table className="mt-2 w-full max-w-sm text-left tabular-nums">
          <tbody>
            {pontos.map((p) => (
              <tr key={p.date} className="border-b border-pedra/60">
                <td className="py-1">{diaCurto(p.date)}</td>
                <td className="py-1 text-right text-grafite">{formatar(p.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

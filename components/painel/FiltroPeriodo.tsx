"use client";

import { dataLocal, somarDias } from "@/lib/painel/periodo";

export interface PeriodoSelecionado {
  de: string;
  ate: string;
}

interface FiltroPeriodoProps {
  valor: PeriodoSelecionado;
  onChange: (p: PeriodoSelecionado) => void;
}

const PRESETS = [
  { dias: 7, rotulo: "7 dias" },
  { dias: 30, rotulo: "30 dias" },
  { dias: 90, rotulo: "90 dias" },
];

export function periodoDosUltimos(dias: number): PeriodoSelecionado {
  const hoje = dataLocal(new Date());
  return { de: somarDias(hoje, -(dias - 1)), ate: hoje };
}

/** Filtro único do painel: vale para GA4 e Google Ads ao mesmo tempo. */
export function FiltroPeriodo({ valor, onChange }: FiltroPeriodoProps) {
  const hoje = dataLocal(new Date());
  const presetAtivo = PRESETS.find((p) => {
    const alvo = periodoDosUltimos(p.dias);
    return alvo.de === valor.de && alvo.ate === valor.ate;
  });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div role="group" aria-label="Período" className="flex border border-pedra bg-branco">
        {PRESETS.map((p) => {
          const ativo = presetAtivo?.dias === p.dias;
          return (
            <button
              key={p.dias}
              type="button"
              aria-pressed={ativo}
              onClick={() => onChange(periodoDosUltimos(p.dias))}
              className={`px-4 py-2 text-sm transition ${ativo ? "bg-bordo-700 font-medium text-marfim" : "text-grafite hover:bg-areia"}`}
            >
              {p.rotulo}
            </button>
          );
        })}
      </div>
      <label className="text-xs text-cinza">
        De
        <input
          type="date"
          value={valor.de}
          max={valor.ate}
          onChange={(e) => e.target.value && onChange({ ...valor, de: e.target.value })}
          className="ml-2 border border-pedra bg-branco px-2 py-2 text-sm text-grafite"
        />
      </label>
      <label className="text-xs text-cinza">
        Até
        <input
          type="date"
          value={valor.ate}
          min={valor.de}
          max={hoje}
          onChange={(e) => e.target.value && onChange({ ...valor, ate: e.target.value })}
          className="ml-2 border border-pedra bg-branco px-2 py-2 text-sm text-grafite"
        />
      </label>
    </div>
  );
}

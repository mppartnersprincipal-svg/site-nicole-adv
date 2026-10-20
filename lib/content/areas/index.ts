import type { AreaAtuacao } from "@/lib/types";

import { area as direitoEmpresarial } from "./direito-empresarial";
import { area as trabalhistaEmpresarial } from "./trabalhista-empresarial";
import { area as direitoCivil } from "./direito-civil";
import { area as agronegocio } from "./agronegocio";
import { area as direitoTributario } from "./direito-tributario";
import { area as holding } from "./holding-e-planejamento-societario";
import { area as contencioso } from "./contencioso-estrategico";
import { area as advogadoTrabalhista } from "./advogado-trabalhista";
import { area as familiaSucessoes } from "./familia-e-sucessoes";
import { area as direitoSaude } from "./direito-da-saude";
import { area as direitoPrevidenciario } from "./direito-previdenciario";

/** Todas as áreas, na ordem de exibição (empresas primeiro, depois pessoas). */
export const AREAS: AreaAtuacao[] = [
  direitoEmpresarial,
  trabalhistaEmpresarial,
  direitoCivil,
  agronegocio,
  direitoTributario,
  holding,
  contencioso,
  advogadoTrabalhista,
  familiaSucessoes,
  direitoSaude,
  direitoPrevidenciario,
];

export const AREAS_EMPRESAS: AreaAtuacao[] = AREAS.filter((a) => a.publico === "empresas");
export const AREAS_PESSOAS: AreaAtuacao[] = AREAS.filter((a) => a.publico === "pessoas");

export function getArea(slug: string): AreaAtuacao | undefined {
  return AREAS.find((a) => a.slug === slug);
}

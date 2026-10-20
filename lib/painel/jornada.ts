/**
 * Resume a trilha bruta de uma sessão em passos legíveis:
 * "Área · Trabalhista (48 s)" → "Começou o formulário" → "Formulário enviado (Trabalhista)".
 * Porte de lib/journey.ts da Sólida.
 */
import { fmtDuration, labelArea, labelLocation, labelPage, type TrailEvent } from "./rotulos";

export type TipoPasso = "page" | "form" | "lead" | "whatsapp" | "phone" | "email" | "cta" | "blog";

export interface PassoJornada {
  kind: TipoPasso;
  label: string;
  detail?: string;
  ts: string;
}

const texto = (v: unknown): string => (v === undefined || v === null ? "" : String(v));

function areaDoEvento(e: TrailEvent): string {
  const slug = e.path.startsWith("/areas-de-atuacao/") ? e.path.split("/")[2] : null;
  const area = texto(e.params?.lead_area);
  // lead_area pode vir como slug ("direito-tributario") ou já legível ("Direito Tributário")
  return labelArea(slug ?? (area || null)).replace(/^Fora das áreas$/, "");
}

export function resumirTrilha(trail: TrailEvent[]): PassoJornada[] {
  const passos: PassoJornada[] = [];
  let ultimaPagina: PassoJornada | null = null;

  for (const e of trail) {
    const p = e.params ?? {};
    switch (e.name) {
      case "page_view":
        ultimaPagina = { kind: "page", label: labelPage(e.path, e.title), ts: e.ts };
        passos.push(ultimaPagina);
        break;
      case "page_leave": {
        const alvo = ultimaPagina && passos[passos.length - 1] === ultimaPagina ? ultimaPagina : acharPagina(passos, e.path);
        if (alvo && p.duration_ms != null) alvo.detail = fmtDuration(Number(p.duration_ms));
        break;
      }
      case "form_start":
        passos.push({ kind: "form", label: "Começou o formulário", detail: areaDoEvento(e) || undefined, ts: e.ts });
        break;
      case "generate_lead":
        passos.push({ kind: "lead", label: "Enviou o formulário", detail: areaDoEvento(e) || undefined, ts: e.ts });
        break;
      case "click_whatsapp":
        passos.push({ kind: "whatsapp", label: "WhatsApp", detail: labelLocation(texto(p.link_location)), ts: e.ts });
        break;
      case "click_phone":
        passos.push({ kind: "phone", label: "Ligou", detail: labelLocation(texto(p.link_location)), ts: e.ts });
        break;
      case "click_email":
        passos.push({ kind: "email", label: "E-mail", ts: e.ts });
        break;
      case "click_cta":
        passos.push({ kind: "cta", label: texto(p.link_label) || "Botão", ts: e.ts });
        break;
      case "blog_read":
        passos.push({ kind: "blog", label: "Leu o artigo", ts: e.ts });
        break;
      default:
        break;
    }
  }
  return passos;
}

function acharPagina(passos: PassoJornada[], path: string): PassoJornada | null {
  for (let i = passos.length - 1; i >= 0; i--) {
    if (passos[i].kind === "page" && !passos[i].detail && passos[i].label === labelPage(path)) return passos[i];
  }
  return null;
}

/** Só os cliques genéricos, para a visão expandida. */
export function cliquesGenericos(trail: TrailEvent[]): { ts: string; label: string; page: string }[] {
  return trail
    .filter((e) => e.name === "click")
    .map((e) => ({
      ts: e.ts,
      label: texto(e.params?.track ?? e.params?.text ?? e.params?.href) || "clique",
      page: labelPage(e.path, e.title),
    }));
}

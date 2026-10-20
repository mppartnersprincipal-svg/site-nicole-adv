"use client";

import { useEffect, useState } from "react";
import { MapPin, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { obterEventosRecentes } from "@/app/(painel)/dashboard/actions";
import { fmtTime, labelChannel, labelEvent, labelLocation, labelPage, type RecentRow } from "@/lib/painel/rotulos";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

const INTERVALO_MS = 30_000;

const SELO: Record<string, string> = {
  click_whatsapp: "bg-whatsapp text-white",
  generate_lead: "bg-brand-action text-white",
  click_phone: "bg-ink text-white",
  form_start: "bg-champanhe-200 text-ink",
  page_view: "bg-surface-alt text-ink-body",
  page_leave: "bg-surface-alt text-ink-muted",
  click: "bg-line text-ink-body",
};

function detalhe(r: RecentRow): string {
  const p = r.params ?? {};
  switch (r.name) {
    case "click_whatsapp":
    case "click_phone":
    case "click_cta":
      return [p.link_label, labelLocation(String(p.link_location ?? ""))].filter(Boolean).join(" · ");
    case "generate_lead":
    case "form_start":
      return String(p.lead_area ?? labelPage(r.path));
    case "click":
      return String(p.track ?? p.text ?? p.href ?? "");
    case "page_leave":
      return p.duration_ms != null ? `${Math.round(Number(p.duration_ms) / 1000)} s · rolou ${p.max_scroll_pct ?? 0}%` : "";
    case "consent_update":
      return p.consent_analytics === "granted" ? "aceitou" : "recusou";
    default:
      return "";
  }
}

/** Últimos eventos do site, atualizando a cada 30 s (só com a aba visível). Porte da Sólida. */
export function LiveFeed({ initial }: { initial: RecentRow[] }) {
  const [rows, setRows] = useState(initial);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
  const [isOcupado, setIsOcupado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    const tique = async () => {
      if (document.visibilityState === "hidden") return;
      setIsOcupado(true);
      try {
        const proximos = await obterEventosRecentes();
        if (!cancelado) {
          setRows(proximos);
          setAtualizadoEm(new Date());
        }
      } catch {
        // mantém a lista anterior
      } finally {
        if (!cancelado) setIsOcupado(false);
      }
    };
    const id = window.setInterval(tique, INTERVALO_MS);
    return () => {
      cancelado = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full bg-whatsapp", isOcupado && "animate-pulse")} aria-hidden />
          {atualizadoEm ? `Atualizado às ${atualizadoEm.toLocaleTimeString("pt-BR")}` : "Ao vivo"}
        </span>
        <RefreshCw aria-hidden className={cn("size-3.5", isOcupado && "animate-spin")} />
      </div>
      {!rows.length ? (
        <EmptyState compact title="Nenhum evento ainda" hint="Assim que alguém acessar o site, aparece aqui." />
      ) : (
        <ul className="max-h-[520px] space-y-1 overflow-y-auto pr-1 text-sm">
          {rows.map((r, i) => {
            const Dispositivo = r.device === "mobile" ? Smartphone : r.device === "tablet" ? Tablet : Monitor;
            const texto = detalhe(r) || labelPage(r.path);
            return (
              <li key={`${r.ts}-${i}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2 py-1.5 hover:bg-surface-alt/70">
                <span className="w-16 shrink-0 text-xs tabular-nums text-ink-muted">{fmtTime(r.ts)}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", SELO[r.name] ?? "bg-surface-alt text-ink-body")}>
                  {labelEvent(r.name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-ink-body" title={texto}>
                  {texto}
                </span>
                <span className="hidden items-center gap-2 text-xs text-ink-muted sm:inline-flex">
                  <span>{labelChannel(r.channel)}</span>
                  <Dispositivo aria-hidden className="size-3.5" />
                  {r.city ? (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin aria-hidden className="size-3" />
                      {r.city}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

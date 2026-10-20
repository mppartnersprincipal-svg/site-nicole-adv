"use client";

import { Clock, Eye, FileText, MessageCircle, Phone, Target, Timer, Users } from "lucide-react";
import type { KpisRow } from "@/lib/painel/rotulos";
import { KpiCard, type KpiAccent, type KpiFormat } from "./KpiCard";

interface KpiGridProps {
  kpis: KpisRow;
  previous?: KpisRow | null;
}

export function KpiGrid({ kpis, previous }: KpiGridProps) {
  const cards: { label: string; key: keyof KpisRow; icon: typeof Users; format: KpiFormat; accent: KpiAccent }[] = [
    { label: "Visitas (sessões)", key: "sessions", icon: Users, format: "int", accent: "ink" },
    { label: "Páginas vistas", key: "page_views", icon: Eye, format: "int", accent: "ink" },
    { label: "Tempo médio por visita", key: "avg_session_ms", icon: Clock, format: "duration", accent: "ink" },
    { label: "Tempo médio por página", key: "avg_page_ms", icon: Timer, format: "duration", accent: "ink" },
    { label: "Cliques no WhatsApp", key: "wa_clicks", icon: MessageCircle, format: "int", accent: "whatsapp" },
    { label: "Formulários enviados", key: "leads", icon: FileText, format: "int", accent: "brand" },
    { label: "Cliques no telefone", key: "phone_clicks", icon: Phone, format: "int", accent: "brand" },
    { label: "Conversão (visitas → contato)", key: "conv_rate", icon: Target, format: "pct", accent: "brand" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <KpiCard
          key={c.key}
          label={c.label}
          value={Number(kpis[c.key] ?? 0)}
          previous={previous ? Number(previous[c.key] ?? 0) : null}
          icon={c.icon}
          format={c.format}
          accent={c.accent}
        />
      ))}
    </div>
  );
}

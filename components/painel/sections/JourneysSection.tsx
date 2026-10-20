import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  MousePointerClick,
  Pencil,
  Phone,
  Smartphone,
  Tablet,
} from "lucide-react";
import { getJourneys } from "@/lib/painel/consultas";
import { comParams, umValor, type Intervalo, type SearchParams } from "@/lib/painel/filtro";
import { cliquesGenericos, resumirTrilha, type TipoPasso } from "@/lib/painel/jornada";
import { fmtDateTime, fmtDuration, fmtTime, labelChannel, type JourneyRow } from "@/lib/painel/rotulos";
import { cn } from "@/lib/utils";
import { ChartCard } from "../ChartCard";
import { EmptyState } from "../EmptyState";

const ESTILO: Record<TipoPasso, string> = {
  page: "bg-surface-alt text-ink-body",
  form: "bg-champanhe-200 text-ink",
  lead: "bg-brand-action text-white",
  whatsapp: "bg-whatsapp text-white",
  phone: "bg-ink text-white",
  email: "bg-surface-alt text-ink-body",
  cta: "bg-brand-tint text-brand-hover",
  blog: "bg-surface-alt text-ink-body",
};

const ICONE: Partial<Record<TipoPasso, typeof MessageCircle>> = {
  form: Pencil,
  lead: FileText,
  whatsapp: MessageCircle,
  phone: Phone,
  email: Mail,
  cta: MousePointerClick,
  blog: FileText,
};

const FILTROS_CONTATO = [
  { id: "generate_lead", label: "Formulário" },
  { id: "click_whatsapp", label: "WhatsApp" },
  { id: "click_phone", label: "Telefone" },
];

function IconeDispositivo({ device }: { device: string | null }) {
  const Icone = device === "mobile" ? Smartphone : device === "tablet" ? Tablet : Monitor;
  return <Icone aria-hidden className="size-3.5" />;
}

function linhaOrigem(j: JourneyRow): string {
  const partes = [labelChannel(j.channel)];
  if (j.utm_campaign) partes.push(`campanha ${j.utm_campaign}`);
  if (j.utm_term) partes.push(`termo "${j.utm_term}"`);
  if (!j.utm_campaign && j.referrer_host) partes.push(j.referrer_host);
  return partes.join(" · ");
}

/** O caminho de cada lead: origem → páginas → formulário/WhatsApp/telefone. Porte da Sólida. */
export async function JourneysSection({ range, sp }: { range: Intervalo; sp: SearchParams }) {
  const todas = umValor(sp, "jornadas") === "todas";
  const filtroContato = umValor(sp, "contato") ?? null;

  const rows = await getJourneys(range, !todas, 60);
  const filtradas = filtroContato ? rows.filter((j) => j.trail.some((e) => e.name === filtroContato)) : rows;

  const chip = (ativo: boolean) =>
    cn(
      "inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold transition-colors",
      ativo ? "bg-brand-action text-white" : "bg-surface-alt text-ink-body hover:bg-line",
    );

  return (
    <ChartCard
      id="jornadas"
      title="Jornadas: o caminho de cada lead"
      description="De onde veio, o que leu e como entrou em contato"
      action={
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Link href={comParams(sp, { jornadas: null })} className={chip(!todas)} scroll={false}>
            Só quem entrou em contato
          </Link>
          <Link href={comParams(sp, { jornadas: "todas" })} className={chip(todas)} scroll={false}>
            Todas as visitas
          </Link>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-ink-muted">Contato:</span>
        <Link href={comParams(sp, { contato: null })} className={chip(!filtroContato)} scroll={false}>
          Qualquer
        </Link>
        {FILTROS_CONTATO.map((f) => (
          <Link key={f.id} href={comParams(sp, { contato: f.id })} className={chip(filtroContato === f.id)} scroll={false}>
            {f.label}
          </Link>
        ))}
      </div>

      {!filtradas.length ? (
        <EmptyState
          compact
          title={todas ? "Nenhuma visita no período" : "Nenhum lead entrou em contato no período"}
          hint={todas ? "" : 'Veja "Todas as visitas" para acompanhar quem navegou sem entrar em contato.'}
        />
      ) : (
        <ol className="divide-y divide-line">
          {filtradas.map((j) => {
            const passos = resumirTrilha(j.trail);
            const cliques = cliquesGenericos(j.trail);
            const duracao = new Date(j.last_seen_at).getTime() - new Date(j.started_at).getTime();
            return (
              <li key={j.id} className="py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                  <span className="font-semibold text-ink">{fmtDateTime(j.started_at)}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-semibold",
                      j.channel === "google_ads" ? "bg-brand-tint text-brand-hover" : "bg-surface-alt text-ink-body",
                    )}
                  >
                    {linhaOrigem(j)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconeDispositivo device={j.device} />
                    {[j.browser, j.os].filter(Boolean).join(" · ")}
                  </span>
                  {j.city || j.region ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden className="size-3.5" />
                      {[j.city, j.region].filter(Boolean).join(" - ")}
                    </span>
                  ) : null}
                  <span>{fmtDuration(duracao)} no site</span>
                  {j.is_returning ? <span className="rounded-full bg-ink/5 px-2 py-0.5 font-semibold text-ink">já visitou antes</span> : null}
                </div>

                <ol className="mt-2 flex flex-wrap items-center gap-1.5">
                  {passos.map((p, i) => {
                    const Icone = ICONE[p.kind];
                    return (
                      <li key={`${p.ts}-${i}`} className="flex items-center gap-1.5">
                        {i > 0 ? <ChevronRight aria-hidden className="size-3.5 text-ink-muted/60" /> : null}
                        <span
                          className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", ESTILO[p.kind])}
                          title={fmtTime(p.ts)}
                        >
                          {Icone ? <Icone aria-hidden className="size-3" /> : null}
                          {p.label}
                          {p.detail ? <span className="font-normal opacity-80">({p.detail})</span> : null}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                {cliques.length ? (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-ink-muted hover:text-ink">
                      {cliques.length} {cliques.length === 1 ? "clique" : "cliques"} em botões e links
                    </summary>
                    <ul className="mt-1.5 space-y-0.5 pl-3 text-ink-body">
                      {cliques.map((c, i) => (
                        <li key={`${c.ts}-${i}`}>
                          <span className="tabular-nums text-ink-muted">{fmtTime(c.ts)}</span> · {c.label}{" "}
                          <span className="text-ink-muted">em {c.page}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </ChartCard>
  );
}

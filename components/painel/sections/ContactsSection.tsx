import { FileText, MessageCircle, Phone } from "lucide-react";
import { getContacts } from "@/lib/painel/consultas";
import type { Intervalo } from "@/lib/painel/filtro";
import {
  CHANNEL_ORDER,
  CONTACT_LABELS,
  fmtInt,
  labelArea,
  labelChannel,
  labelLocation,
  type ContactRow,
  type TipoContato,
} from "@/lib/painel/rotulos";
import { cn } from "@/lib/utils";
import { ChartCard } from "../ChartCard";
import { DataTable, InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";

interface Pivo {
  name: string;
  total: number;
  cells: Record<string, number>;
}

const ICONE: Record<TipoContato, typeof MessageCircle> = {
  click_whatsapp: MessageCircle,
  click_phone: Phone,
  generate_lead: FileText,
};
const COR: Record<TipoContato, string> = {
  click_whatsapp: "text-whatsapp",
  click_phone: "text-champanhe-700",
  generate_lead: "text-brand-action",
};
const ORDEM_TIPO: TipoContato[] = ["generate_lead", "click_whatsapp", "click_phone"];

function pivotar(rows: ContactRow[], linha: (r: ContactRow) => string, coluna: (r: ContactRow) => string) {
  const mapa = new Map<string, Pivo>();
  const cols = new Set<string>();
  for (const r of rows) {
    const nome = linha(r);
    const col = coluna(r) || "—";
    cols.add(col);
    const atual = mapa.get(nome) ?? { name: nome, total: 0, cells: {} };
    mapa.set(nome, {
      name: nome,
      total: atual.total + Number(r.clicks),
      cells: { ...atual.cells, [col]: (atual.cells[col] ?? 0) + Number(r.clicks) },
    });
  }
  return { rows: [...mapa.values()].sort((a, b) => b.total - a.total), cols: [...cols] };
}

interface PivotTableProps {
  title: string;
  header: string;
  data: ReturnType<typeof pivotar>;
  colLabel: (c: string) => string;
}

function PivotTable({ title, header, data, colLabel }: PivotTableProps) {
  if (!data.rows.length) return null;
  const max = Math.max(...data.rows.map((r) => r.total));
  return (
    <div className="min-w-0">
      <h3 className="mb-2 font-sans text-sm font-bold text-ink">{title}</h3>
      <DataTable
        dense
        rows={data.rows}
        rowKey={(r) => r.name}
        columns={[
          {
            key: "name",
            header,
            render: (r) => (
              <div className="min-w-44">
                <p className="font-semibold text-ink">{r.name}</p>
                <InlineBar value={r.total} max={max} color="bg-brand-action" />
              </div>
            ),
          },
          { key: "total", header: "Total", align: "right", render: (r) => <span className="font-bold">{fmtInt(r.total)}</span> },
          ...data.cols.map((c) => ({
            key: c,
            header: colLabel(c),
            align: "right" as const,
            render: (r: Pivo) => (r.cells[c] ? fmtInt(r.cells[c]) : <span className="text-ink-muted/50">–</span>),
          })),
        ]}
      />
    </div>
  );
}

/** Contatos (formulário, WhatsApp, telefone) × área de atuação × origem × onde o botão estava. */
export async function ContactsSection({ range }: { range: Intervalo }) {
  const rows = await getContacts(range);

  const porTipo = ORDEM_TIPO.map((kind) => {
    const doTipo = rows.filter((r) => r.kind === kind);
    return {
      kind,
      clicks: doTipo.reduce((s, r) => s + Number(r.clicks), 0),
      sessions: doTipo.reduce((s, r) => s + Number(r.sessions), 0),
    };
  });
  const maxTipo = Math.max(0, ...porTipo.map((t) => t.clicks));

  const areaPorTipo = pivotar(rows, (r) => labelArea(r.area), (r) => r.kind);
  areaPorTipo.cols.sort((a, b) => ORDEM_TIPO.indexOf(a as TipoContato) - ORDEM_TIPO.indexOf(b as TipoContato));
  const porOrigem = pivotar(rows, (r) => CONTACT_LABELS[r.kind], (r) => r.channel);
  porOrigem.cols.sort((a, b) => CHANNEL_ORDER.indexOf(a as never) - CHANNEL_ORDER.indexOf(b as never));
  // Agrupa pelo rótulo: os vários form_id (form-<área>) viram uma única coluna "Formulário"
  const porLocal = pivotar(rows, (r) => CONTACT_LABELS[r.kind], (r) => labelLocation(r.location));

  return (
    <ChartCard
      id="contatos"
      title="Contatos pelo site"
      description="Formulários, WhatsApp e telefone: de qual área vieram, de onde veio quem clicou e em qual botão"
    >
      {!rows.length ? (
        <EmptyState compact title="Nenhum contato no período" hint="" />
      ) : (
        <div className="space-y-8">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {porTipo.map((t, i) => {
              const Icone = ICONE[t.kind];
              return (
                <li key={t.kind}>
                  <div
                    className={cn(
                      "flex h-full flex-col gap-2 rounded-2xl border p-4",
                      i === 0 ? "border-brand-action/30 bg-brand-tint/40" : "border-line bg-surface-alt/60",
                    )}
                  >
                    <div className={cn("flex items-center gap-2", COR[t.kind])}>
                      <Icone aria-hidden className="size-4" />
                      <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">{CONTACT_LABELS[t.kind]}</span>
                    </div>
                    <p className="font-sans text-3xl font-bold tabular-nums text-ink">{fmtInt(t.clicks)}</p>
                    <p className="text-xs text-ink-muted">
                      {fmtInt(t.sessions)} {t.sessions === 1 ? "visita" : "visitas"}
                    </p>
                    <InlineBar value={t.clicks} max={maxTipo} color="bg-brand-action" />
                  </div>
                </li>
              );
            })}
          </ul>

          <PivotTable
            title="Contatos por área de atuação"
            header="Área"
            data={areaPorTipo}
            colLabel={(c) => CONTACT_LABELS[c as TipoContato] ?? c}
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <PivotTable title="Contato × origem da visita" header="Contato" data={porOrigem} colLabel={labelChannel} />
            <PivotTable title="Contato × onde foi clicado" header="Contato" data={porLocal} colLabel={(c) => c} />
          </div>
        </div>
      )}
    </ChartCard>
  );
}

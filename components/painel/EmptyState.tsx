import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  hint?: string;
  compact?: boolean;
}

export function EmptyState({
  title = "Sem dados no período",
  hint = "Tente ampliar o período ou remover o filtro de origem.",
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center justify-center py-8 text-center"
          : "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center"
      }
    >
      <Inbox aria-hidden className="size-8 text-ink-muted/40" />
      <p className="mt-3 font-bold text-ink">{title}</p>
      {hint ? <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">{hint}</p> : null}
    </div>
  );
}

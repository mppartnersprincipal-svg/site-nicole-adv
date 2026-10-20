import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Card padrão das seções do painel: título, descrição e conteúdo. */
export function ChartCard({ id, title, description, action, className, children }: ChartCardProps) {
  return (
    // min-w-0: como item de grid, o card encolhe e quem rola é a tabela/mapa de calor (não a página)
    <section className={cn("min-w-0 scroll-mt-28", className)}>
      <div className="flex h-full flex-col rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={id} className="font-sans text-base font-bold text-ink">
              {title}
            </h2>
            {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
          </div>
          {action}
        </div>
        <div className="min-w-0 flex-1 p-5">{children}</div>
      </div>
    </section>
  );
}

const SECOES = [
  { id: "kpis", label: "Visão geral" },
  { id: "google-ads", label: "Google Ads" },
  { id: "ga4", label: "GA4" },
  { id: "origem", label: "Origem" },
  { id: "contatos", label: "Contatos" },
  { id: "jornadas", label: "Jornadas" },
  { id: "paginas", label: "Páginas" },
  { id: "horarios", label: "Horários" },
  { id: "geo", label: "Cidades" },
  { id: "campanhas", label: "Campanhas no site" },
  { id: "blog", label: "Blog" },
  { id: "ao-vivo", label: "Ao vivo" },
];

/** Âncoras das seções (fixas abaixo do cabeçalho). */
export function SectionNav() {
  return (
    <nav
      aria-label="Seções do painel"
      className="sticky top-16 z-30 -mx-4 overflow-x-auto border-b border-line bg-surface-alt/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <ul className="flex gap-1 py-2 text-sm">
        {SECOES.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              className="inline-flex min-h-8 items-center rounded-full px-3 font-semibold text-ink-muted transition-colors hover:bg-white hover:text-ink"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

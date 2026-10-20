import { PageHero } from "@/components/shared/PageHero";
import type { FotoSite } from "@/lib/foto";
import type { SecaoLegal } from "@/lib/content/legal";

interface PaginaLegalProps {
  titulo: string;
  path: string;
  atualizadoEm: string;
  secoes: SecaoLegal[];
  foto?: FotoSite;
}

export function PaginaLegal({ titulo, path, atualizadoEm, secoes, foto }: PaginaLegalProps) {
  return (
    <>
      <PageHero eyebrow="Transparência" titulo={titulo} texto={`Última atualização: ${atualizadoEm}.`} breadcrumbs={[{ nome: titulo, path }]} foto={foto} />
      <section className="secao">
        <div className="container-site grid gap-14 lg:grid-cols-[260px_1fr]">
          <nav aria-label="Nesta página" className="hidden lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:block lg:self-start">
            <p className="eyebrow mb-4 text-champanhe-700">Nesta página</p>
            <ol className="space-y-2 text-[0.9rem] text-cinza">
              {secoes.map((s, i) => (
                <li key={s.titulo}>
                  <a href={`#secao-${i + 1}`} className="hover:text-bordo-700">
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="prosa">
            {secoes.map((s, i) => (
              <section key={s.titulo} id={`secao-${i + 1}`} className="scroll-mt-28">
                <h2>{s.titulo}</h2>
                {s.paragrafos.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
                {s.itens && (
                  <ul>
                    {s.itens.map((item) => (
                      <li key={item.slice(0, 40)}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

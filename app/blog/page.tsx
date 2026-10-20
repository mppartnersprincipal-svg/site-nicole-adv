import Image from "next/image";
import Link from "next/link";
import { IconeSetaDiagonal } from "@/components/icons/Icones";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { getPosts } from "@/lib/blog";
import { FOTO_PAGINA } from "@/lib/fotos-site";
import { AREAS_NAV } from "@/lib/nav";
import { metaPagina } from "@/lib/seo";
import { formatarData } from "@/lib/utils";

export const metadata = metaPagina({
  title: "Blog & Mídias: artigos jurídicos",
  description:
    "Artigos da Nicoli Sociedade de Advogados sobre Direito Empresarial, Trabalhista, Agronegócio, Tributário, Holdings, Família, Saúde e Previdenciário.",
  path: "/blog",
});

const nomeArea = (slug?: string) => AREAS_NAV.find((a) => a.slug === slug)?.nome;

export default async function BlogPage() {
  const posts = await getPosts();
  const [destaque, ...demais] = posts;

  return (
    <>
      <PageHero
        eyebrow="Blog & Mídias"
        titulo="Conteúdo jurídico para quem decide"
        texto="Análises objetivas sobre os temas que afetam empresas, patrimônios e famílias, assinadas por Luís Gustavo Nicoli."
        breadcrumbs={[{ nome: "Blog & Mídias", path: "/blog" }]}
        foto={FOTO_PAGINA.blog}
      />

      <section className="secao" data-section="blog-lista">
        <div className="container-site">
          {posts.length === 0 && <p className="text-cinza">Em breve, novos artigos.</p>}

          {destaque && (
            <Reveal>
              <Link href={`/blog/${destaque.slug}`} className="group/dest grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className="relative aspect-[16/10] overflow-hidden bg-areia">
                  {destaque.cover && (
                    <Image
                      src={destaque.cover}
                      alt={destaque.coverAlt ?? destaque.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] ease-elegante group-hover/dest:scale-[1.03]"
                    />
                  )}
                </div>
                <div>
                  <p className="eyebrow text-champanhe-700">{nomeArea(destaque.area) ?? destaque.category ?? "Artigo"}</p>
                  <h2 className="mt-5 text-h2 text-bordo-700 transition-colors group-hover/dest:text-bordo-600">
                    {destaque.title}
                  </h2>
                  <p className="mt-5 text-lead text-cinza">{destaque.description}</p>
                  <p className="mt-6 text-[0.85rem] text-cinza">
                    {formatarData(destaque.date)} · {destaque.minutos} min de leitura · {destaque.author}
                  </p>
                </div>
              </Link>
            </Reveal>
          )}

          {demais.length > 0 && (
            <ul className="mt-20 grid gap-x-10 gap-y-14 border-t border-pedra pt-14 sm:grid-cols-2 lg:grid-cols-3">
              {demais.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={(i % 3) * 80}>
                  <Link href={`/blog/${p.slug}`} className="group/post block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-areia">
                      {p.cover && (
                        <Image
                          src={p.cover}
                          alt={p.coverAlt ?? p.title}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                          className="object-cover transition-transform duration-[1.2s] ease-elegante group-hover/post:scale-[1.04]"
                        />
                      )}
                    </div>
                    <p className="eyebrow mt-6 text-champanhe-700">{nomeArea(p.area) ?? p.category ?? "Artigo"}</p>
                    <h2 className="mt-3 flex items-start justify-between gap-4 font-display text-[1.5rem] leading-snug text-grafite transition-colors group-hover/post:text-bordo-700">
                      {p.title}
                      <IconeSetaDiagonal className="mt-2 size-4 shrink-0 text-bordo-700" />
                    </h2>
                    <p className="mt-3 text-[0.82rem] text-cinza">
                      {formatarData(p.date)} · {p.minutos} min
                    </p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

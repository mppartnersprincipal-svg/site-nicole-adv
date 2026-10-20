import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from "react";
import { LeadForm } from "@/components/lead/LeadForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FotoHero } from "@/components/shared/FotoHero";
import { FOTO_PAGINA } from "@/lib/fotos-site";
import { getPost, getPosts } from "@/lib/blog";
import { AREAS_NAV, rotaArea } from "@/lib/nav";
import { grafo, schemaArtigo } from "@/lib/schema";
import { metaPagina } from "@/lib/seo";
import { formatarData } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return metaPagina({
    title: post.title,
    tituloAbsoluto: post.title.length > 42,
    description: post.description,
    path: `/blog/${post.slug}`,
    tipo: "article",
    publicado: post.date,
    imagem: post.cover,
  });
}

const COMPONENTES_MDX = {
  a: ({ href = "", ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
    href.startsWith("/") ? (
      <Link href={href} {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    ),
  img: ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) =>
    typeof src === "string" ? (
      // Imagens do corpo têm proporção variável; carregamento preguiçoso e sem CLS via aspect-ratio automático
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" className="w-full" />
    ) : null,
};

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const area = AREAS_NAV.find((a) => a.slug === post.area);

  return (
    <>
      <article data-article className="pb-[var(--secao-py)]">
        <header className="relative overflow-hidden bg-areia pb-14 pt-[calc(var(--header-h)+2.5rem)] md:pb-20 md:pt-[calc(var(--header-h)+4rem)]">
          <div className="linhas-paralelas linha-hero absolute inset-x-0 bottom-0 text-bordo-700" aria-hidden="true" />
          <div className="container-site">
            <Breadcrumbs
              itens={[
                { nome: "Blog & Mídias", path: "/blog" },
                { nome: post.title, path: `/blog/${post.slug}` },
              ]}
            />
            <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
              <div className="entrada-hero">
                <p className="eyebrow text-champanhe-700">{area?.nome ?? post.category ?? "Artigo"}</p>
                <h1 className="mt-6 text-h1 text-bordo-700">{post.title}</h1>
                {post.description && <p className="mt-6 max-w-2xl text-lead text-cinza">{post.description}</p>}
                <p className="mt-8 text-[0.875rem] text-cinza">
                  Por <span className="text-grafite">{post.author}</span> · <time dateTime={post.date}>{formatarData(post.date)}</time> ·{" "}
                  {post.minutos} min de leitura
                </p>
              </div>
              {/* Capa do artigo no hero; sem capa, usa uma foto do escritório */}
              <FotoHero
                foto={post.cover ? { src: post.cover, alt: post.coverAlt ?? post.title, width: 1200, height: 800 } : FOTO_PAGINA.blog}
                formato="paisagem"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
          </div>
        </header>

        <div className="container-site mt-16 grid gap-16 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="prosa min-w-0 text-[1.075rem] leading-[1.8] [&_table]:block [&_table]:overflow-x-auto">
            <MDXRemote source={post.conteudo} components={COMPONENTES_MDX} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            <p className="!mt-14 border-t border-pedra pt-6 text-[0.85rem] text-cinza">
              Este artigo tem caráter informativo e não substitui a análise individual do seu caso por um advogado.
            </p>
          </div>
          <aside className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <div className="border border-pedra bg-areia p-7">
              <LeadForm
                formId={`blog-${post.slug}`}
                area={area?.nome}
                publico={area?.publico ?? "empresas"}
                titulo="Fale com um especialista"
                subtitulo="Tem uma situação parecida? Conte em poucas linhas."
              />
            </div>
            {area && (
              <Link href={rotaArea(area.slug)} className="mt-6 block text-[0.9rem] text-bordo-700 underline underline-offset-4">
                Conheça nossa atuação em {area.nome}
              </Link>
            )}
          </aside>
        </div>
      </article>
      <JsonLd
        data={grafo(
          schemaArtigo({
            titulo: post.title,
            descricao: post.description,
            slug: post.slug,
            data: post.date,
            atualizado: post.updated,
            autor: post.author,
            capa: post.cover,
          }),
        )}
      />
    </>
  );
}

import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { EQUIPE } from "@/lib/content/equipe";
import { AREAS_NAV, rotaArea } from "@/lib/nav";
import { SITE } from "@/lib/site";

const ULTIMA_REVISAO = "2026-10-19";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string) => new URL(p, SITE.url).toString();
  const posts = await getPosts();

  const fixas: MetadataRoute.Sitemap = [
    { url: u("/"), lastModified: ULTIMA_REVISAO },
    { url: u("/areas-de-atuacao"), lastModified: ULTIMA_REVISAO },
    { url: u("/quem-somos"), lastModified: ULTIMA_REVISAO },
    { url: u("/contato"), lastModified: ULTIMA_REVISAO },
    { url: u("/blog"), lastModified: posts[0]?.date ?? ULTIMA_REVISAO },
    { url: u("/politica-de-privacidade"), lastModified: ULTIMA_REVISAO },
    { url: u("/lgpd-dados-pessoais"), lastModified: ULTIMA_REVISAO },
  ];

  const areas = AREAS_NAV.map((a) => ({
    url: u(rotaArea(a.slug)),
    lastModified: ULTIMA_REVISAO,
  }));

  const equipe = EQUIPE.filter((m) => m.grupo !== "conselho").map((m) => ({
    url: u(`/quem-somos/${m.slug}`),
    lastModified: ULTIMA_REVISAO,
  }));

  const artigos = posts.map((p) => ({
    url: u(`/blog/${p.slug}`),
    lastModified: p.updated ?? p.date,
  }));

  return [...fixas, ...areas, ...equipe, ...artigos];
}

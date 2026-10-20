import type { Metadata } from "next";
import { SITE } from "@/lib/site";

interface MetaPagina {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** Imagem OG específica; por padrão usa a opengraph-image da rota. */
  imagem?: string;
  tipo?: "website" | "article";
  publicado?: string;
  noindex?: boolean;
  /** Ignora o template "%s | Nicoli Advogados" (títulos de área já trazem a marca). */
  tituloAbsoluto?: boolean;
}

/** Metadata completa (title, description, canonical, OG, Twitter) para cada página. */
export function metaPagina({
  title,
  description,
  path,
  keywords,
  imagem = "/opengraph-image",
  tipo = "website",
  publicado,
  noindex,
  tituloAbsoluto,
}: MetaPagina): Metadata {
  const canonical = path === "/" ? "/" : path.replace(/\/$/, "");
  return {
    title: tituloAbsoluto ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: tipo,
      locale: "pt_BR",
      url: canonical,
      siteName: SITE.nome,
      title,
      description,
      images: [{ url: imagem, alt: title }],
      ...(publicado ? { publishedTime: publicado } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [imagem] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

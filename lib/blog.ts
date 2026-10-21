import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cacheLife } from "next/cache";
import { tempoLeitura } from "@/lib/utils";

/** Blog em MDX (content/blog/*.mdx). Leitura do disco no build, com cache. */

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  category?: string;
  area?: string;
  /** Outras áreas em cuja página o artigo também aparece. */
  areasExtras?: string[];
  cover?: string;
  coverAlt?: string;
  minutos: number;
}

export interface Post extends PostMeta {
  conteudo: string;
}

const DIR = path.join(process.cwd(), "content", "blog");

function normalizarData(valor: unknown): string {
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return String(valor ?? "").slice(0, 10);
}

async function lerPost(arquivo: string): Promise<(Post & { draft: boolean }) | null> {
  const bruto = await readFile(path.join(DIR, arquivo), "utf8");
  const { data, content } = matter(bruto);
  if (!data.title) return null;
  return {
    slug: arquivo.replace(/\.mdx$/, ""),
    title: String(data.title),
    description: String(data.description ?? ""),
    date: normalizarData(data.date),
    updated: data.updated ? normalizarData(data.updated) : undefined,
    author: String(data.author ?? "Luís Gustavo Nicoli"),
    category: data.category ? String(data.category) : undefined,
    area: data.area ? String(data.area) : undefined,
    areasExtras: Array.isArray(data.areasExtras) ? data.areasExtras.map(String) : undefined,
    cover: data.cover ? String(data.cover) : undefined,
    coverAlt: data.coverAlt ? String(data.coverAlt) : undefined,
    minutos: tempoLeitura(content),
    conteudo: content,
    draft: Boolean(data.draft),
  };
}

export async function getPosts(): Promise<PostMeta[]> {
  "use cache";
  cacheLife("max");
  let arquivos: string[] = [];
  try {
    arquivos = (await readdir(DIR)).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }
  const posts = await Promise.all(arquivos.map(lerPost));
  return posts
    .filter((p): p is NonNullable<typeof p> => p !== null && !p.draft)
    .map(({ conteudo: _conteudo, draft: _draft, ...meta }) => meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("max");
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const post = await lerPost(`${slug}.mdx`);
    if (!post || post.draft) return null;
    const { draft: _draft, ...resto } = post;
    return resto;
  } catch {
    return null;
  }
}

export async function getPostsPorArea(area: string): Promise<PostMeta[]> {
  const posts = await getPosts();
  return posts.filter((p) => p.area === area || p.areasExtras?.includes(area));
}

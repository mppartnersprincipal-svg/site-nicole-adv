import { NextResponse, type NextRequest } from "next/server";
import REDIRECTS from "@/content/blog/_redirects.json";

/**
 * Redirects 301 das ~1.000 URLs do site antigo (WordPress) para as novas rotas.
 * Lookup O(1) num Map — mais leve que 1.000 regras no next.config, que são testadas em sequência.
 * Também remove a barra final (skipTrailingSlashRedirect ligado), para URL antiga com "/" sair em 1 salto.
 */

interface Redirecionamento {
  source: string;
  destination: string;
}

const decodificar = (p: string): string => {
  try {
    return decodeURIComponent(p);
  } catch {
    return p; // %-sequência malformada (ex.: /%E0%A4%A) não pode derrubar a requisição com 500
  }
};

const normalizar = (p: string): string => decodificar(p).replace(/\/+$/, "").toLowerCase() || "/";

const MAPA = new Map<string, string>(
  (REDIRECTS as Redirecionamento[])
    .filter((r) => r.source && r.destination && normalizar(r.source) !== normalizar(r.destination))
    .map((r) => [normalizar(r.source), r.destination]),
);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const destino = MAPA.get(normalizar(pathname));
  if (!destino) {
    // skipTrailingSlashRedirect está ligado: a remoção da barra final é feita aqui (1 salto só)
    if (pathname.length > 1 && pathname.endsWith("/")) {
      const semBarra = request.nextUrl.clone();
      semBarra.pathname = pathname.replace(/\/+$/, "");
      return NextResponse.redirect(semBarra, 308);
    }
    return NextResponse.next();
  }
  const url = new URL(destino, request.url);
  // Preserva UTMs/gclid de anúncios e links antigos
  request.nextUrl.searchParams.forEach((valor, chave) => url.searchParams.set(chave, valor));
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: [
    // Todas as páginas (para tratar barra final); assets e arquivos com extensão ficam de fora
    "/((?!_next/|api/|images/|brand/|llms\\.txt|sitemap\\.xml|robots\\.txt|opengraph-image|icon|apple-icon|favicon\\.ico|.*\\.[a-z0-9]{2,5}$).+)",
  ],
};

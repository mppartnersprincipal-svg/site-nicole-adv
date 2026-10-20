"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { iniciarColetor, registrarPagina } from "@/lib/painel/coletor";

/**
 * Coleta própria e anônima do painel /dashboard (ver lib/painel/coletor.ts).
 * Independe do GTM e do banner: não usa cookie nem dado pessoal. Só no SiteChrome, nunca no painel.
 */
export function Coletor() {
  const pathname = usePathname();

  useEffect(() => {
    iniciarColetor();
  }, []);

  useEffect(() => {
    // O document.title ainda pode ser o da rota anterior no instante da troca
    const id = window.setTimeout(() => registrarPagina(pathname, document.title), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

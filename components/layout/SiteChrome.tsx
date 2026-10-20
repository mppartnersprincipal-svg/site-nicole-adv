import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { JsonLd } from "@/components/seo/JsonLd";
import { Analytics } from "@/components/tracking";
import { grafo, schemaOrganizacao, schemaWebsite } from "@/lib/schema";

interface SiteChromeProps {
  children: ReactNode;
}

/**
 * Moldura das páginas públicas: header, rodapé, WhatsApp flutuante, medição (GTM + banner LGPD) e schema.
 * Fica fora do layout raiz para o /dashboard não carregar GTM nem contar visitas da equipe no GA4.
 * Usada por app/(site)/layout.tsx e por app/not-found.tsx (que renderiza só dentro do layout raiz).
 */
export function SiteChrome({ children }: SiteChromeProps) {
  return (
    <>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <SmoothScroll />
      <Analytics />
      <JsonLd data={grafo(schemaOrganizacao(), schemaWebsite())} />
    </>
  );
}

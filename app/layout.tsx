import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

// next/font baixa e serve as fontes do próprio domínio (sem requisição ao Google em runtime)
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

// Itálico só aparece abaixo da dobra: sem preload para não disputar banda com o LCP
const cormorantItalico = Cormorant_Garamond({
  variable: "--font-cormorant-italico",
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
  display: "swap",
  preload: false,
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.nome} | Advogados em Goiânia`,
    template: `%s | ${SITE.nomeCurto}`,
  },
  description: SITE.descricao,
  applicationName: SITE.nome,
  authors: [{ name: SITE.nome, url: SITE.url }],
  creator: SITE.nome,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { type: "website", locale: "pt_BR", siteName: SITE.nome },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  other: { "geo.region": "BR-GO", "geo.placename": "Goiânia" },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${cormorantItalico.variable} ${jost.variable}`}>
      <body className="min-h-dvh">
        {/* Sem JS o Reveal nunca "abre": força o conteúdo visível */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        {/* Header, rodapé e medição ficam em SiteChrome (app/(site)/layout.tsx): o /dashboard não os carrega */}
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { PainelApp } from "@/components/painel/PainelApp";

export const metadata: Metadata = {
  title: "Painel de resultados",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Painel interno (GA4 + Google Ads). Fora de app/(site): sem header, rodapé, GTM nem banner de cookies,
 * para as visitas da equipe não entrarem no GA4. Login por senha (lib/painel/auth.ts).
 */
export default function DashboardPage() {
  return <PainelApp />;
}

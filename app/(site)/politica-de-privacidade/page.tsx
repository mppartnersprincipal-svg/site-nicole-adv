import { PaginaLegal } from "@/components/shared/PaginaLegal";
import { POLITICA_PRIVACIDADE } from "@/lib/content/legal";
import { FOTO_PAGINA } from "@/lib/fotos-site";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  title: "Política de Privacidade",
  description:
    "Como a Nicoli Sociedade de Advogados trata dados pessoais coletados no site, cookies, finalidades, bases legais e direitos do titular, conforme a LGPD.",
  path: "/politica-de-privacidade",
});

export default function PoliticaPrivacidadePage() {
  return (
    <PaginaLegal
      titulo="Política de Privacidade"
      path="/politica-de-privacidade"
      atualizadoEm="outubro de 2026"
      secoes={POLITICA_PRIVACIDADE}
      foto={FOTO_PAGINA.privacidade}
    />
  );
}

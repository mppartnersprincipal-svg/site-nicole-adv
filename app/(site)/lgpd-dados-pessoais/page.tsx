import { PaginaLegal } from "@/components/shared/PaginaLegal";
import { LGPD_DADOS } from "@/lib/content/legal";
import { FOTO_PAGINA } from "@/lib/fotos-site";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  title: "LGPD – Dados Pessoais",
  description:
    "Canal do titular de dados da Nicoli Sociedade de Advogados: encarregado (DPO), direitos previstos no art. 18 da LGPD e como exercê-los.",
  path: "/lgpd-dados-pessoais",
});

export default function LgpdPage() {
  return (
    <PaginaLegal titulo="LGPD – Dados Pessoais" path="/lgpd-dados-pessoais" atualizadoEm="outubro de 2026" secoes={LGPD_DADOS} foto={FOTO_PAGINA.lgpd} />
  );
}

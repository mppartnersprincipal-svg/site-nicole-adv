import Link from "next/link";
import { FotoHero } from "@/components/shared/FotoHero";
import { Button } from "@/components/ui/Button";
import { FOTO_PAGINA } from "@/lib/fotos-site";
import { AREAS_NAV, rotaArea } from "@/lib/nav";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-areia pb-24 pt-[calc(var(--header-h)+4rem)]">
      <div className="container-site relative grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-20">
        <div>
          <p className="eyebrow text-champanhe-700">Erro 404</p>
          <h1 className="mt-6 text-h1 text-bordo-700">Esta página não foi encontrada</h1>
          <p className="mt-6 text-lead text-cinza">
            O endereço pode ter mudado com o novo site. Veja as áreas de atuação ou volte para a página inicial.
          </p>
          <div className="mt-10">
            <Button href="/">Ir para a página inicial</Button>
          </div>
          <ul className="mt-14 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {AREAS_NAV.map((a) => (
              <li key={a.slug}>
                <Link href={rotaArea(a.slug)} className="text-bordo-700 underline-offset-4 hover:underline">
                  {a.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <FotoHero foto={FOTO_PAGINA.naoEncontrada} />
      </div>
    </section>
  );
}

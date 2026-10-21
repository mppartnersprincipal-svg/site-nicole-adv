import Link from "next/link";
import { LogoHorizontal } from "@/components/brand/LogoHorizontal";
import {
  IconeEmail,
  IconeFacebook,
  IconeInstagram,
  IconeKwai,
  IconeLinkedin,
  IconeLocal,
  IconeRelogio,
  IconeTelefone,
  IconeTiktok,
  IconeWhatsApp,
  IconeYoutube,
} from "@/components/icons/Icones";
import { PreferenciasCookiesLink } from "@/components/tracking/PreferenciasCookiesLink";
import { AREAS_NAV, rotaArea } from "@/lib/nav";
import { MENSAGEM_WHATSAPP_PADRAO, SITE } from "@/lib/site";

const REDES = [
  { href: SITE.redes.instagram, label: "Instagram", Icone: IconeInstagram },
  { href: SITE.redes.linkedin, label: "LinkedIn", Icone: IconeLinkedin },
  { href: SITE.redes.facebook, label: "Facebook", Icone: IconeFacebook },
  { href: SITE.redes.youtube, label: "YouTube", Icone: IconeYoutube },
  { href: SITE.redes.tiktok, label: "TikTok", Icone: IconeTiktok },
  { href: SITE.redes.kwai, label: "Kwai", Icone: IconeKwai },
];

const INSTITUCIONAL = [
  { href: "/quem-somos", label: "Nosso escritório" },
  { href: "/quem-somos#socios", label: "Os sócios" },
  { href: "/quem-somos#conselho", label: "Conselho administrativo" },
  { href: "/blog", label: "Blog & Mídias" },
  { href: "/contato", label: "Contato" },
];

export function Footer() {
  const ano = 2026;
  const whatsapp = `https://wa.me/${SITE.whatsapp.numero}?text=${encodeURIComponent(MENSAGEM_WHATSAPP_PADRAO)}`;
  return (
    <footer className="grao bg-bordo-900 text-marfim/80" data-section="footer">
      <div className="container-site pb-10 pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" aria-label="Página inicial" className="inline-block text-marfim">
              <LogoHorizontal className="h-20 w-auto" />
            </Link>
            <p className="mt-6 max-w-xs font-display text-2xl leading-snug text-marfim">{SITE.slogan}</p>
            <ul className="mt-8 flex flex-wrap gap-1" aria-label="Redes sociais">
              {REDES.map(({ href, label, Icone }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex size-11 items-center justify-center border border-marfim/15 text-marfim/80 transition-colors duration-300 hover:border-champanhe-500 hover:text-champanhe-400"
                  >
                    <Icone className="size-[1.1rem]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Áreas para empresas">
            <p className="eyebrow mb-5 text-champanhe-400">Empresas e patrimônios</p>
            <ul className="space-y-2.5 text-[0.95rem]">
              {AREAS_NAV.filter((a) => a.publico === "empresas").map((a) => (
                <li key={a.slug}>
                  <Link href={rotaArea(a.slug)} className="transition-colors hover:text-marfim">
                    {a.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-12">
            <nav aria-label="Áreas para pessoas">
              <p className="eyebrow mb-5 text-champanhe-400">Pessoas e famílias</p>
              <ul className="space-y-2.5 text-[0.95rem]">
                {AREAS_NAV.filter((a) => a.publico === "pessoas").map((a) => (
                  <li key={a.slug}>
                    <Link href={rotaArea(a.slug)} className="transition-colors hover:text-marfim">
                      {a.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Institucional">
              <p className="eyebrow mb-5 text-champanhe-400">Institucional</p>
              <ul className="space-y-2.5 text-[0.95rem]">
                {INSTITUCIONAL.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-marfim">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <address className="not-italic">
            <p className="eyebrow mb-5 text-champanhe-400">Fale conosco</p>
            <ul className="space-y-4 text-[0.95rem]">
              <li className="flex gap-3">
                <IconeLocal className="mt-1 size-4 shrink-0 text-champanhe-400" />
                <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-marfim">
                  {SITE.endereco.rua}, {SITE.endereco.bairro}
                  <br />
                  {SITE.endereco.cidade}/{SITE.endereco.uf} · CEP {SITE.endereco.cep}
                </a>
              </li>
              <li className="flex gap-3">
                <IconeWhatsApp className="mt-1 size-4 shrink-0 text-champanhe-400" />
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" data-track-location="footer" className="hover:text-marfim">
                  {SITE.whatsapp.exibicao}
                </a>
              </li>
              <li className="flex gap-3">
                <IconeTelefone className="mt-1 size-4 shrink-0 text-champanhe-400" />
                <a href={`tel:${SITE.telefone.e164}`} data-track-location="footer" className="hover:text-marfim">
                  {SITE.telefone.exibicao}
                </a>
              </li>
              <li className="flex gap-3">
                <IconeEmail className="mt-1 size-4 shrink-0 text-champanhe-400" />
                <a href={`mailto:${SITE.email}`} className="break-all hover:text-marfim">
                  {SITE.email}
                </a>
              </li>
              <li className="flex gap-3">
                <IconeRelogio className="mt-1 size-4 shrink-0 text-champanhe-400" />
                <span>{SITE.horario}</span>
              </li>
            </ul>
          </address>
        </div>

        <div className="linhas-paralelas mt-16 text-champanhe-400" aria-hidden="true" />

        <div className="mt-8 flex flex-col gap-4 text-[0.8125rem] text-marfim/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {ano} {SITE.nome} · CNPJ {SITE.cnpj}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/politica-de-privacidade" className="hover:text-marfim">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="/lgpd-dados-pessoais" className="hover:text-marfim">
                LGPD – Dados Pessoais
              </Link>
            </li>
            <li>
              <PreferenciasCookiesLink className="hover:text-marfim" />
            </li>
          </ul>
        </div>
        <p className="mt-6 max-w-3xl text-[0.75rem] leading-relaxed text-marfim/45">
          Conteúdo de caráter exclusivamente informativo, em conformidade com o Código de Ética e Disciplina da OAB e o
          Provimento 205/2021. As informações deste site não substituem a consulta a um advogado.
        </p>
      </div>
    </footer>
  );
}

import Image, { getImageProps } from "next/image";
import { CenaGsap } from "@/components/motion/CenaGsap";
import { Button } from "@/components/ui/Button";
import type { HomeHero } from "@/lib/content/home";
import type { FotoSite } from "@/lib/foto";

interface HeroHomeProps {
  hero: HomeHero;
  /** Foto ampla do escritório com o nome na parede (fundo full-bleed). */
  fundo: FotoSite;
  /** Segunda foto com a marca, em quadro sobreposto (desktop). */
  destaque: FotoSite;
  whatsappUrl: string;
}

/**
 * Hero full-bleed: foto ampla com o letreiro NICOLI ao fundo, véu bordô para contraste
 * (texto marfim sobre o véu escuro), quadro de destaque e parallax via GSAP.
 * O LCP é a foto de fundo (priority + fetchPriority alta, art direction por tela).
 */
export function HeroHome({ hero, fundo, destaque, whatsappUrl }: HeroHomeProps) {
  // q60: foto escura e com véu por cima — a perda de qualidade não aparece e o LCP chega antes
  const comum = { alt: fundo.alt, sizes: "100vw", priority: true, quality: 60 } as const;
  const {
    props: { srcSet: srcDesktop },
  } = getImageProps({ ...comum, src: fundo.src, width: fundo.width, height: fundo.height });
  const {
    props: { srcSet: srcMobile, ...img },
  } = getImageProps({
    ...comum,
    src: fundo.srcMobile ?? fundo.src,
    width: fundo.srcMobile ? 828 : fundo.width,
    height: fundo.srcMobile ? 1300 : fundo.height,
  });

  return (
    <section
      data-hero
      data-section="home-hero"
      aria-labelledby="hero-titulo"
      className="relative isolate overflow-hidden bg-bordo-950 text-marfim"
    >
      <CenaGsap className="relative flex min-h-[100svh] flex-col">
        {/* Fundo com parallax (a folga -inset-y dá espaço para o deslocamento) */}
        <div className="absolute inset-x-0 -bottom-[14%] top-[calc(var(--header-h)+0.5rem)] -z-20 md:top-0" data-parallax="0.3">
          <picture>
            <source media="(min-width: 768px)" srcSet={srcDesktop} sizes="100vw" />
            <img
              {...img}
              srcSet={srcMobile}
              alt={fundo.alt}
              fetchPriority="high"
              className="zoom-hero h-full w-full object-contain object-top md:object-cover md:object-[50%_0%]"
              style={fundo.blurDataURL ? { backgroundImage: `url(${fundo.blurDataURL})`, backgroundSize: "cover" } : undefined}
            />
          </picture>
        </div>
        {/* Véu de contraste: forte onde está o texto, aberto onde está o letreiro */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(28,0,1,0.96)_0%,rgba(28,0,1,0.82)_45%,rgba(28,0,1,0.25)_100%)] md:bg-[linear-gradient(100deg,rgba(28,0,1,0.94)_0%,rgba(28,0,1,0.84)_40%,rgba(28,0,1,0.3)_72%,rgba(28,0,1,0.1)_100%),linear-gradient(to_top,rgba(28,0,1,0.7)_0%,rgba(28,0,1,0)_40%)]"
        />
        <div aria-hidden="true" className="grao absolute inset-0 -z-10" />

        <div className="container-site relative grid flex-1 items-end gap-12 pb-16 pt-[calc(var(--header-h)+6rem)] md:items-end md:pb-20 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="entrada-hero max-w-3xl">
            {/* No mobile o letreiro da foto já assina a marca: o eyebrow só repetiria o nome */}
            <p className="eyebrow mb-7 text-champanhe-400 max-md:hidden">{hero.eyebrow}</p>
            <h1 id="hero-titulo" className="text-[clamp(2.4rem,1.45rem+3.2vw,4.75rem)] leading-[1.04] text-marfim">
              {hero.titulo}
              <br />
              <em className="font-display italic text-champanhe-400">{hero.slogan}</em>
            </h1>
            <div className="linhas-paralelas linha-hero mt-9 w-24 text-champanhe-400 !opacity-80" aria-hidden="true" />
            <p className="mt-8 max-w-xl text-lead text-marfim/85">{hero.subtitulo}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="/contato#formulario" variante="claro" trackEvent="click_cta" trackLocation="home-hero">
                {hero.ctaPrimario.rotulo}
              </Button>
              <Button href={whatsappUrl} variante="whatsapp" trackLocation="home-hero">
                {hero.ctaSecundario.rotulo}
              </Button>
            </div>
          </div>

          <div className="relative hidden self-end justify-self-end lg:block" data-parallax="-0.3">
            <div className="moldura w-[min(17rem,20vw)] p-3 [--moldura-cor:var(--cor-champanhe-500)]">
              <div className="relative aspect-[4/5] overflow-hidden bg-bordo-900 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
                <Image
                  src={destaque.src}
                  alt={destaque.alt}
                  fill
                  sizes="26vw"
                  placeholder={destaque.blurDataURL ? "blur" : "empty"}
                  blurDataURL={destaque.blurDataURL}
                  className="object-cover"
                  data-parallax-escala="1.18"
                />
              </div>
            </div>
            <p className="mt-4 text-right font-display text-[1.15rem] italic text-marfim/80">
              “Tradição e modernidade a serviço dos nossos clientes.”
            </p>
          </div>
        </div>

        <div className="container-site relative hidden pb-8 md:block" aria-hidden="true">
          <div className="flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.3em] text-marfim/60">
            <span className="relative h-10 w-px overflow-hidden bg-marfim/20">
              <span className="indicador-scroll absolute inset-x-0 top-0 h-1/2 bg-champanhe-400" />
            </span>
            Role para conhecer
          </div>
        </div>
      </CenaGsap>
    </section>
  );
}

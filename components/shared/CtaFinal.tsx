import { LogoSimbolo } from "@/components/brand/LogoSimbolo";
import { CenaGsap } from "@/components/motion/CenaGsap";
import { TextoAnimado } from "@/components/motion/TextoAnimado";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { MENSAGEM_WHATSAPP_PADRAO, SITE } from "@/lib/site";

interface CtaFinalProps {
  titulo: string;
  texto: string;
  mensagemWhatsapp?: string;
  local?: string;
}

/** Bloco final de conversão: bordô, moldura aberta da marca e dois caminhos (WhatsApp ou telefone). */
export function CtaFinal({ titulo, texto, mensagemWhatsapp = MENSAGEM_WHATSAPP_PADRAO, local = "cta-final" }: CtaFinalProps) {
  const wa = `https://wa.me/${SITE.whatsapp.numero}?text=${encodeURIComponent(mensagemWhatsapp)}`;
  return (
    <section className="secao bg-marfim" data-section={local} aria-labelledby={`${local}-titulo`}>
      <div className="container-site">
        <CenaGsap className="grao moldura relative overflow-hidden bg-bordo-700 px-6 py-16 [--moldura-cor:var(--cor-champanhe-500)] sm:px-12 md:px-20 md:py-24">
          {/* Símbolo em marca d'água: desliza e gira levemente com o scroll */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-1/2 h-[130%] -translate-y-1/2" data-parallax="-0.4">
            <LogoSimbolo variante="compacto" className="h-full w-auto text-marfim opacity-[0.06]" data-girar="-12" />
          </div>
          <div className="relative max-w-2xl">
            <TextoAnimado as="p" efeito="cortina" className="eyebrow mb-6 text-champanhe-400">
              Primeiro passo
            </TextoAnimado>
            <TextoAnimado as="h2" id={`${local}-titulo`} efeito="palavras" className="text-h2 text-marfim">
              {titulo}
            </TextoAnimado>
            <TextoAnimado as="p" efeito="linhas" atraso={0.3} className="mt-6 text-lead text-marfim/80">
              {texto}
            </TextoAnimado>
            <Reveal className="mt-10 flex flex-col gap-4 sm:flex-row" delay={250}>
              <Button href={wa} variante="claro" trackLocation={local}>
                Conversar pelo WhatsApp
              </Button>
              <Button href={`tel:${SITE.telefone.e164}`} variante="contorno-claro" icone={false} trackLocation={local}>
                Ligar {SITE.telefone.exibicao}
              </Button>
            </Reveal>
          </div>
        </CenaGsap>
      </div>
    </section>
  );
}

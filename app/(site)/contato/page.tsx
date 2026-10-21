import { IconeEmail, IconeLocal, IconeRelogio, IconeTelefone, IconeWhatsApp } from "@/components/icons/Icones";
import { LeadForm } from "@/components/lead/LeadForm";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FotoLateral } from "@/components/shared/FotoLateral";
import { MapaEscritorio } from "@/components/shared/MapaEscritorio";
import { FOTO_PAGINA } from "@/lib/fotos-site";
import { FaqLista } from "@/components/shared/FaqLista";
import { Reveal } from "@/components/ui/Reveal";
import { metaPagina } from "@/lib/seo";
import { MENSAGEM_WHATSAPP_PADRAO, SITE } from "@/lib/site";

export const metadata = metaPagina({
  title: "Contato: agende uma reunião",
  description:
    "Fale com a Nicoli Sociedade de Advogados: Rua 89, nº 240, Setor Sul, Goiânia/GO. WhatsApp (62) 99570-0037 e telefone (62) 3412-2828. Atendimento presencial e online.",
  path: "/contato",
});

const FAQ_CONTATO = [
  {
    pergunta: "O atendimento pode ser remoto?",
    resposta:
      "Sim. O atendimento pode ser presencial, na sede em Goiânia, ou remoto, com atuação em todo o Brasil.",
  },
  {
    pergunta: "O que acontece depois que eu envio o formulário?",
    resposta:
      "O WhatsApp abre com um resumo das informações que você preencheu. Ao enviar, a mensagem chega ao WhatsApp oficial do escritório, (62) 99570-0037.",
  },
];

const WHATSAPP = `https://wa.me/${SITE.whatsapp.numero}?text=${encodeURIComponent(MENSAGEM_WHATSAPP_PADRAO)}`;

export default function ContatoPage() {
  const canais = [
    { Icone: IconeWhatsApp, rotulo: "WhatsApp", valor: SITE.whatsapp.exibicao, href: WHATSAPP },
    { Icone: IconeTelefone, rotulo: "Telefone", valor: SITE.telefone.exibicao, href: `tel:${SITE.telefone.e164}` },
    { Icone: IconeEmail, rotulo: "E-mail", valor: SITE.email, href: `mailto:${SITE.email}` },
  ];

  return (
    <>
      <section data-hero className="relative overflow-hidden bg-areia pb-20 pt-[calc(var(--header-h)+2.5rem)] md:pt-[calc(var(--header-h)+4rem)]">
        <div className="container-site relative lg:static">
          <Breadcrumbs itens={[{ nome: "Contato", path: "/contato" }]} />
          <div className="mt-10 grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div className="entrada-hero relative z-10 order-1">
              <p className="eyebrow mb-6 text-champanhe-700">Contato</p>
              <h1 className="text-h1 text-bordo-700">Vamos conversar sobre o seu caso</h1>
              <p className="mt-7 max-w-xl text-lead text-cinza">
                Atendimento presencial em Goiânia e remoto para todo o Brasil, de segunda a sexta, das 8h às 18h.
              </p>

              <ul className="mt-12 divide-y divide-pedra border-y border-pedra">
                {canais.map(({ Icone, rotulo, valor, href }) => (
                  <li key={rotulo}>
                    <a
                      href={href}
                      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      data-track-location="contato"
                      className="group/canal flex items-center gap-5 py-5"
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center border border-bordo-700/25 text-bordo-700 transition-colors duration-300 group-hover/canal:bg-bordo-700 group-hover/canal:text-marfim">
                        <Icone className="size-5" />
                      </span>
                      <span>
                        <span className="block text-[0.78rem] uppercase tracking-[0.16em] text-cinza">{rotulo}</span>
                        <span className="block break-all font-display text-[1.4rem] text-grafite transition-colors group-hover/canal:text-bordo-700">
                          {valor}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <address className="mt-10 grid gap-6 not-italic sm:grid-cols-2">
                <p className="flex gap-3 text-cinza">
                  <IconeLocal className="mt-1 size-5 shrink-0 text-bordo-700" />
                  <span>
                    <span className="block text-grafite">{SITE.endereco.rua}</span>
                    {SITE.endereco.bairro}, {SITE.endereco.cidade}/{SITE.endereco.uf}
                    <br />
                    CEP {SITE.endereco.cep}
                  </span>
                </p>
                <p className="flex gap-3 text-cinza">
                  <IconeRelogio className="mt-1 size-5 shrink-0 text-bordo-700" />
                  <span>{SITE.horario}</span>
                </p>
              </address>
            </div>

            <FotoLateral foto={FOTO_PAGINA.contato} />

            <div id="formulario" className="relative z-10 order-3 scroll-mt-28 border border-pedra bg-marfim p-6 shadow-[0_40px_80px_-40px_rgba(43,1,2,0.35)] sm:p-9">
              <LeadForm formId="contato" titulo="Agende uma reunião" />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Mapa" data-section="contato-mapa">
        <MapaEscritorio />
      </section>

      <section className="secao" data-section="contato-faq" aria-labelledby="faq-contato">
        <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="eyebrow mb-5 text-champanhe-700">Antes de falar conosco</p>
            <h2 id="faq-contato" className="text-h2 text-bordo-700">
              Como funciona o primeiro contato
            </h2>
          </Reveal>
          <FaqLista faqs={FAQ_CONTATO} />
        </div>
      </section>
    </>
  );
}

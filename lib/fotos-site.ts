import type { FotoSite } from "@/lib/foto";
import { EQUIPE_FOTOS, GALERIA_COMPLETA, HERO_AMPLO, HERO_DESTAQUE, IMAGENS } from "@/lib/images";

/** Curadoria: qual foto do escritório vai em cada lugar do site. */

/** Hero: plano amplo com o letreiro NICOLI na parede (fundo) + recepção com a marca (quadro). */
export const FOTO_HERO_FUNDO: FotoSite = HERO_AMPLO;
export const FOTO_HERO_DESTAQUE: FotoSite = HERO_DESTAQUE;

const nicoli = EQUIPE_FOTOS["luis-gustavo-nicoli"];
export const FOTO_MANIFESTO: FotoSite = {
  src: nicoli.src,
  width: nicoli.width,
  height: nicoli.height,
  blurDataURL: nicoli.blurDataURL,
  alt: "Luís Gustavo Nicoli, sócio-fundador e CEO da Nicoli Sociedade de Advogados",
};

export const FOTO_DETALHE: FotoSite = IMAGENS.letraNMonumentalParedeTijolos;
export const FOTO_HISTORIA: FotoSite = IMAGENS.estatuaThemisVertical;
export const FOTO_ESTRUTURA: FotoSite = IMAGENS.salaDeReuniaoLetreiroNicoli;

/** Galeria horizontal da home: 20 fotos em ritmo alternado (amplas e detalhes). */
export const GALERIA: FotoSite[] = [...GALERIA_COMPLETA];

/** Foto do hero de cada página interna. */
export const FOTO_PAGINA = {
  areas: IMAGENS.salaAtendimentoVanGogh,
  quemSomos: IMAGENS.recepcaoBalcaoMarmoreNicoli,
  blog: IMAGENS.bibliotecaJuridicaEstante,
  contato: IMAGENS.fachadaLetreiroNicoli,
  privacidade: IMAGENS.quadrosCorredorCasario,
  lgpd: IMAGENS.esculturaDouradaSilencio,
  naoEncontrada: IMAGENS.letraNMonumentalParedeTijolos,
} satisfies Record<string, FotoSite>;

/** Foto do hero de cada área de atuação (ambientes do escritório que dialogam com o tema). */
const FOTO_POR_AREA: Record<string, FotoSite> = {
  "direito-empresarial": IMAGENS.salaReuniaoMesaRedonda,
  "trabalhista-empresarial": IMAGENS.salaDeReuniaoLetreiroNicoli,
  "direito-civil": IMAGENS.estatuaThemisBalcaoMarmore,
  agronegocio: IMAGENS.vasosCeramicaCostelaDeAdao,
  "direito-tributario": IMAGENS.estanteLivrosJuridicosSocio,
  "holding-e-planejamento-societario": IMAGENS.salaSocioBibliotecaVaranda,
  "contencioso-estrategico": IMAGENS.relogiosFusosLondresBrasiliaNovaYork,
  "advogado-trabalhista": IMAGENS.livrosAdvocaciaTrabalhistaConstituicao,
  "familia-e-sucessoes": IMAGENS.loungePoltronasClaras,
  "direito-da-saude": IMAGENS.salaDeEsperaPoltronas,
  "direito-previdenciario": IMAGENS.salaDeEsperaChesterfieldTijolo,
};

export function fotoDaArea(slug: string): FotoSite {
  return FOTO_POR_AREA[slug] ?? IMAGENS.recepcaoBalcaoMarmoreNicoli;
}

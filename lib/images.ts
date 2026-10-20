/**
 * Manifesto de imagens otimizadas (gerado a partir dos originais em "Fotos-Vídeos").
 * Todas em WebP. Variações de largura: <nome>-{640,1280,1920}.webp; heros também <nome>-mobile.webp (828x1035, 4:5).
 * Use com next/image: <Image src={img.src} width={img.width} height={img.height} alt={img.alt} placeholder="blur" blurDataURL={img.blurDataURL} />
 */

export type UsoImagem = "hero" | "detalhe" | "reuniao" | "editorial" | "fachada";

export interface ImagemEscritorio {
  /** Versão 1920px de largura. */
  src: string;
  /** Recorte retrato para hero no mobile (828x1035, 4:5; no hero amplo, 828x1300). */
  srcMobile?: string;
  /** Variações por largura, para srcset manual (2560 só no hero amplo). */
  srcSet: { 640: string; 1280: string; 1920: string; 2560?: string };
  width: number;
  height: number;
  alt: string;
  blurDataURL: string;
  uso: UsoImagem;
}

export interface FotoEquipe {
  /** 960x1200 (4:5). */
  src: string;
  /** 480x600 (4:5). */
  srcSm: string;
  blurDataURL: string;
  width: number;
  height: number;
}

export interface FotoColaborador {
  nome: string;
  /** 480x600 (4:5). */
  src: string;
  blurDataURL: string;
  width: number;
  height: number;
}

const BASE = "/images/escritorio";

export const IMAGENS = {
  salaDeEsperaChesterfieldTijolo: {
    src: `${BASE}/sala-de-espera-chesterfield-tijolo-1920.webp`,
    srcMobile: `${BASE}/sala-de-espera-chesterfield-tijolo-mobile.webp`,
    srcSet: {
      640: `${BASE}/sala-de-espera-chesterfield-tijolo-640.webp`,
      1280: `${BASE}/sala-de-espera-chesterfield-tijolo-1280.webp`,
      1920: `${BASE}/sala-de-espera-chesterfield-tijolo-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Sala de espera da Nicoli Sociedade de Advogados com sofá chesterfield de couro caramelo, poltronas claras, parede de tijolos aparentes e revestimento de madeira em diagonal",
    blurDataURL:
      "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAQAgCdASoQAAsAA4BaJbACdAC1oNtm3FeAAP577wve07wk0OKgwZJk6bq4/ax8MRj0Mez5w6SI/z1UPbddn+vvqzIYE0/tjv2Ioo/MAAA=",
    uso: "hero",
  },
  salaDeReuniaoLetreiroNicoli: {
    src: `${BASE}/sala-de-reuniao-letreiro-nicoli-1920.webp`,
    srcMobile: `${BASE}/sala-de-reuniao-letreiro-nicoli-mobile.webp`,
    srcSet: {
      640: `${BASE}/sala-de-reuniao-letreiro-nicoli-640.webp`,
      1280: `${BASE}/sala-de-reuniao-letreiro-nicoli-1280.webp`,
      1920: `${BASE}/sala-de-reuniao-letreiro-nicoli-1920.webp`,
    },
    width: 1920,
    height: 1080,
    alt: "Sala de reuniões com mesa de mármore branco, cadeiras executivas pretas e letreiro \"Nicoli Sociedade de Advogados\" sobre parede de madeira e tijolos iluminados",
    blurDataURL:
      "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAkAA4BaJaACdADvBrGNWAAA/vWy4cl5uH/iPTzNLJvgYXL+rOEFnIA6eTJp9biRlEnYMuXa44kB12mHQ0oGurWk04bnmgwAAA==",
    uso: "hero",
  },
  fachadaLetreiroNicoli: {
    src: `${BASE}/fachada-letreiro-nicoli-1920.webp`,
    srcSet: {
      640: `${BASE}/fachada-letreiro-nicoli-640.webp`,
      1280: `${BASE}/fachada-letreiro-nicoli-1280.webp`,
      1920: `${BASE}/fachada-letreiro-nicoli-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Fachada do escritório com letreiro \"Nicoli Sociedade de Advogados\" em letras bordô sobre mármore e plantas pendentes",
    blurDataURL:
      "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAsAA4BaJZwAAud2coCInoAA/qL/ynnYAx2yYze46/PyyRdoyy0oCVUFjTjZ5pjDD+zq/XYSLi2xpdczVwBA65JLCbLAfAAAAA==",
    uso: "fachada",
  },
  recepcaoBalcaoMarmoreNicoli: {
    src: `${BASE}/recepcao-balcao-marmore-nicoli-1920.webp`,
    srcMobile: `${BASE}/recepcao-balcao-marmore-nicoli-mobile.webp`,
    srcSet: {
      640: `${BASE}/recepcao-balcao-marmore-nicoli-640.webp`,
      1280: `${BASE}/recepcao-balcao-marmore-nicoli-1280.webp`,
      1920: `${BASE}/recepcao-balcao-marmore-nicoli-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Recepção do escritório com balcão de mármore com o nome Nicoli em vermelho, quadro com moldura dourada e corredor iluminado ao fundo",
    blurDataURL:
      "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAwAgCdASoQAAsAA4BaJYgCdAEf6RZDY724AAD+5ucfpFh/pxDbuf3rR0thJoqfLcFPH8ll88p10IXuzW8KGouxiHXltR4AM27JpMIEpiHBRx/dy9aLwUw6KRhzJ4AA",
    uso: "hero",
  },
  letraNMonumentalParedeTijolos: {
    src: `${BASE}/letra-n-monumental-parede-tijolos-1920.webp`,
    srcSet: {
      640: `${BASE}/letra-n-monumental-parede-tijolos-640.webp`,
      1280: `${BASE}/letra-n-monumental-parede-tijolos-1280.webp`,
      1920: `${BASE}/letra-n-monumental-parede-tijolos-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Letra \"N\" do símbolo da Nicoli em estrutura metálica bordô fixada em muro de tijolos, com jardim de folhagens na base",
    blurDataURL:
      "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACQAQCdASoQAAsAA4BaJbACdAC/h8AA/aDIAggzBP7QD+erf3aUEuQt+3sjWfnAipmU71lYEoucxRpe+vVnw/D+1O3w9PAAAAA=",
    uso: "detalhe",
  },
  bibliotecaJuridicaEstante: {
    src: `${BASE}/biblioteca-juridica-estante-1920.webp`,
    srcSet: {
      640: `${BASE}/biblioteca-juridica-estante-640.webp`,
      1280: `${BASE}/biblioteca-juridica-estante-1280.webp`,
      1920: `${BASE}/biblioteca-juridica-estante-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Estante iluminada com livros jurídicos, obras de direito do trabalho e coleções encadernadas em vermelho",
    blurDataURL:
      "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQAgCdASoQAAsAA4BaJbACdAEfZfYP2rMAAP6tA9vQEbysy3vpsA0QbJePOhLNYsvuAoML0aY+HxTwulFm2ROtJLBMdBBT86RY4tk8wT+9WeRUnYKkTTmbBiOANZbsJX5YP4AA",
    uso: "detalhe",
  },
  salaDeEsperaPoltronas: {
    src: `${BASE}/sala-de-espera-poltronas-1920.webp`,
    srcSet: {
      640: `${BASE}/sala-de-espera-poltronas-640.webp`,
      1280: `${BASE}/sala-de-espera-poltronas-1280.webp`,
      1920: `${BASE}/sala-de-espera-poltronas-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Poltronas estofadas em tecido claro com iluminação indireta no rodapé e sofá de couro ao fundo na sala de espera",
    blurDataURL:
      "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAQAgCdASoQAAsAA4BaJbACdAC3aUX+UVDAAPyKcxB4c8ctTtMgCB6C+TDmysJeqOdeBiX2NKP+bW5fe47UgYCc+2hSbAcyVGG1qk/oPtlyBOvj9t8d+kAAAAA=",
    uso: "reuniao",
  },
  estatuaThemisVertical: {
    src: `${BASE}/estatua-themis-vertical-1920.webp`,
    srcSet: {
      640: `${BASE}/estatua-themis-vertical-640.webp`,
      1280: `${BASE}/estatua-themis-vertical-1280.webp`,
      1920: `${BASE}/estatua-themis-vertical-1920.webp`,
    },
    width: 1920,
    height: 2880,
    alt: "Estatueta de Têmis em bronze segurando a balança da Justiça, em primeiro plano diante da parede de tijolos",
    blurDataURL:
      "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAABQBACdASoQABgAPu1iqk4ppaQiMAgBMB2JbACdL1AB29e+Ppv4wdcPulaAAP7uk/sz2oxHtbWuKeG16gB+ogRAoYQM8NoPdBiMPKcwXmSYZBXQu3g2gYIP5jknP/erITe4GU8TzB9BOvvdSFRoAVeQxO8IGJhkEqz/Etx4hMDzbQ8LAAA=",
    uso: "editorial",
  },
  relogiosFusosLondresBrasiliaNovaYork: {
    src: `${BASE}/relogios-fusos-londres-brasilia-nova-york-1920.webp`,
    srcSet: {
      640: `${BASE}/relogios-fusos-londres-brasilia-nova-york-640.webp`,
      1280: `${BASE}/relogios-fusos-londres-brasilia-nova-york-1280.webp`,
      1920: `${BASE}/relogios-fusos-londres-brasilia-nova-york-1920.webp`,
    },
    width: 1920,
    height: 2880,
    alt: "Três relógios de parede com os fusos horários de Londres, Brasília e Nova York em pilar de pedra clara",
    blurDataURL:
      "data:image/webp;base64,UklGRq4AAABXRUJQVlA4IKIAAAAQBACdASoQABgAPu1iqk4ppaQiMAgBMB2JQBOgA3CDfA+/bZ0V4EKeAAD9OvXXnN97TYAo7d7vJ2DWVpQJF4mDcCwb5T09ckl5P0MnWnqqHa9M3p9sZlXXfAlIPUQY8/quovPy/zguzdZtrcVwvv5Icf1U0OQoo4mxFnqDLFvuZTJRRLvuSEhOVFuQ/JJPUKdY5bVlZLdU6wH/MlL4KCgAAAA=",
    uso: "editorial",
  },
  salaReuniaoNoiteEstrelada: {
    src: `${BASE}/sala-reuniao-noite-estrelada-1920.webp`,
    srcSet: {
      640: `${BASE}/sala-reuniao-noite-estrelada-640.webp`,
      1280: `${BASE}/sala-reuniao-noite-estrelada-1280.webp`,
      1920: `${BASE}/sala-reuniao-noite-estrelada-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Sala de reunião com mesa de vidro escuro, cadeiras de couro caramelo, televisor e reprodução de \"A Noite Estrelada\" em parede de madeira",
    blurDataURL:
      "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAADwAQCdASoQAAsAA4BaJbACdAD0pFyQK9AA/rWtb17/bEsEO/mRhKnOH7U/4FpqW1tJbrCi7uwqQxiASMJ0B2s7D4cYI2qU7tV1YbDTOAnxTKKRI+DRIicWe/8kNEvTo7S+9AAA",
    uso: "reuniao",
  },
  estatuaThemisBalcaoMarmore: {
    src: `${BASE}/estatua-themis-balcao-marmore-1920.webp`,
    srcSet: {
      640: `${BASE}/estatua-themis-balcao-marmore-640.webp`,
      1280: `${BASE}/estatua-themis-balcao-marmore-1280.webp`,
      1920: `${BASE}/estatua-themis-balcao-marmore-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Estatueta de Têmis, deusa da Justiça, com balança e espada sobre balcão de mármore, com a sala de espera desfocada ao fundo",
    blurDataURL:
      "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAwAgCdASoQAAsAA4BaJbACdAEKvB58gcxlYAD+8WlTE/92u6et2xPTTmfrYJ6gtAYDXJ49UvN22rrLNUPDLAhdGsqw8jQwMnk33YPsz8wAAA==",
    uso: "detalhe",
  },
  salaSocioBibliotecaVaranda: {
    src: `${BASE}/sala-socio-biblioteca-varanda-1920.webp`,
    srcSet: {
      640: `${BASE}/sala-socio-biblioteca-varanda-640.webp`,
      1280: `${BASE}/sala-socio-biblioteca-varanda-1280.webp`,
      1920: `${BASE}/sala-socio-biblioteca-varanda-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Sala de atendimento do sócio com mesa de mármore, cadeiras estofadas, estante de livros e porta de vidro para a varanda",
    blurDataURL:
      "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADwAQCdASoQAAsAA4BaJYwCdAC1SsuJrGgA/kOHTIUN4Gkdq78skEYbjMRtoxsZjn1OlAjiFriUox8NTBmg42pl0FnsmAt/g+0nLXLJDXtGxxHm5NxlGDZkMUqAAA==",
    uso: "reuniao",
  },
  salaReuniaoMesaRedonda: {
    src: `${BASE}/sala-reuniao-mesa-redonda-1920.webp`,
    srcSet: {
      640: `${BASE}/sala-reuniao-mesa-redonda-640.webp`,
      1280: `${BASE}/sala-reuniao-mesa-redonda-1280.webp`,
      1920: `${BASE}/sala-reuniao-mesa-redonda-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Sala de reunião reservada com mesa redonda de madeira e cadeiras executivas de couro preto",
    blurDataURL:
      "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQAgCdASoQAAsAA4BaJbACdADpMJHdfpsAAPKnoznfzbfO+lc5E2k5HydGv5Tplb+Qc32jj15fPIHA1vooGJcMq4DNecC1NbBtlPg5Yb3Ikjlx89Gjrof5qTEg6OVIzbydAAAA",
    uso: "reuniao",
  },
  quadroVanGoghSalaSocio: {
    src: `${BASE}/quadro-van-gogh-sala-socio-1920.webp`,
    srcSet: {
      640: `${BASE}/quadro-van-gogh-sala-socio-640.webp`,
      1280: `${BASE}/quadro-van-gogh-sala-socio-1280.webp`,
      1920: `${BASE}/quadro-van-gogh-sala-socio-1920.webp`,
    },
    width: 1920,
    height: 2880,
    alt: "Reprodução do autorretrato de Van Gogh com chapéu de palha em moldura dourada na parede da sala do sócio",
    blurDataURL:
      "data:image/webp;base64,UklGRq4AAABXRUJQVlA4IKIAAABQBACdASoQABgAPu1iqU2ppaOiMAgBMB2JQBOmUFH/AOhUzB4fyk0m0pdQAPZeM7XTA+vQMjR9VvlVOQUBk2RpJDi9AMid1OixFw5I7hYmRuq2878jldIOCYw6Tq4grq5XC0+7OdmIVCYa9u7lPd7RKVDfFIguOIShcjfhLLY5AscKcnnM6ApkJtfFWxzaYIEgpUdM1QF5FXaS8N//IMAAAAA=",
    uso: "editorial",
  },
  fachadaLetreiroPerspectiva: {
    src: `${BASE}/fachada-letreiro-perspectiva-1920.webp`,
    srcSet: {
      640: `${BASE}/fachada-letreiro-perspectiva-640.webp`,
      1280: `${BASE}/fachada-letreiro-perspectiva-1280.webp`,
      1920: `${BASE}/fachada-letreiro-perspectiva-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Vista em perspectiva do letreiro da Nicoli Sociedade de Advogados na fachada de mármore, com folhagens e estrutura de concreto",
    blurDataURL:
      "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAsAA4BaJZwAAsc8Bv4aNLAA/ohnc4Eb3hloWE6vKKb8nu0Kgq3CCtMveiz8Rx6lQ0FOM/IoqFviW795pEDU3wJoK6Sk0GGKzusAAAA=",
    uso: "fachada",
  },
  poltronaVermelhaTelefoneAntigo: {
    src: `${BASE}/poltrona-vermelha-telefone-antigo-1920.webp`,
    srcSet: {
      640: `${BASE}/poltrona-vermelha-telefone-antigo-640.webp`,
      1280: `${BASE}/poltrona-vermelha-telefone-antigo-1280.webp`,
      1920: `${BASE}/poltrona-vermelha-telefone-antigo-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Poltrona de couro vermelho ao lado de mesa de apoio com telefone antigo de disco preto",
    blurDataURL:
      "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAQAgCdASoQAAsAA4BaJbACdAEQTOgmSqRQAP5tEk2GAQEOLACxFrRWE4vXmA5B/Yf4xOc2ERVHYgdLkIFF4hJtSFOir1lnEAA=",
    uso: "detalhe",
  },
  chesterfieldCouroOrquidea: {
    src: `${BASE}/chesterfield-couro-orquidea-1920.webp`,
    srcSet: {
      640: `${BASE}/chesterfield-couro-orquidea-640.webp`,
      1280: `${BASE}/chesterfield-couro-orquidea-1280.webp`,
      1920: `${BASE}/chesterfield-couro-orquidea-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Detalhe do sofá chesterfield em couro caramelo com capitonê, mesa lateral com orquídea e poltrona em tecido pied-de-poule diante da parede de tijolos",
    blurDataURL:
      "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAQAgCdASoQAAsAA4BaJbACdADcT7tI7hkAAP5+hoHMx9rLQnrsnFrzItoH5/QGHE2rB4KZj0IZQq7EjPP49eLfc9SEQjOkQBl3eydd9Rid9Vs89SUFKAAA",
    uso: "detalhe",
  },
  escadaIluminadaMadeira: {
    src: `${BASE}/escada-iluminada-madeira-1920.webp`,
    srcSet: {
      640: `${BASE}/escada-iluminada-madeira-640.webp`,
      1280: `${BASE}/escada-iluminada-madeira-1280.webp`,
      1920: `${BASE}/escada-iluminada-madeira-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Escada de mármore com degraus iluminados por fita de LED, emoldurada por ripas de madeira e reflexo no vidro do corredor",
    blurDataURL:
      "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAAAwAgCdASoQAAsAA4BaJbACdLoAAhjdaFw3IAD+7y2QJB0c+yOY9Ae0zqXvnJoEz1Ap0xDNSp1OvN+la2vTRqdBzb+nPX4VuZm1RrIjh+w1EyufOkk4Rza627yFHFHyBUgAAA==",
    uso: "editorial",
  },
  quadrosCorredorCasario: {
    src: `${BASE}/quadros-corredor-casario-1920.webp`,
    srcSet: {
      640: `${BASE}/quadros-corredor-casario-640.webp`,
      1280: `${BASE}/quadros-corredor-casario-1280.webp`,
      1920: `${BASE}/quadros-corredor-casario-1920.webp`,
    },
    width: 1920,
    height: 2880,
    alt: "Dois quadros a óleo de casarios mediterrâneos em molduras de madeira, iluminados por spot na parede de cimento queimado do corredor",
    blurDataURL:
      "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAABwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JbACdMoR3ACIRFHGca7wd9mmotAD431dOCK8eq8uj4IyW0DrTeiKURsLNtlQ6QuF7shgvhbJCu5xbzZhe0d6OLA8WsRPYrH8VziqSJ9ZNQdZ15J8VqMQ2tTmhUKQAAAA=",
    uso: "editorial",
  },
  sinalizacaoSalaReuniao1: {
    src: `${BASE}/sinalizacao-sala-reuniao-1-1920.webp`,
    srcSet: {
      640: `${BASE}/sinalizacao-sala-reuniao-1-640.webp`,
      1280: `${BASE}/sinalizacao-sala-reuniao-1-1280.webp`,
      1920: `${BASE}/sinalizacao-sala-reuniao-1-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Sinalização em acrílico vermelho \"Reunião 1\" com ícone de pessoas na porta de vidro, com mesa redonda de madeira desfocada ao fundo",
    blurDataURL:
      "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAAAQAgCdASoQAAsAA4BaJbACdAEN1sDNaceQAPwxjq11eqLEgAva8yWD1FwvFxJwYWWflvB+TL3MSD3RtkeHewz1eZrvhij3YypfdYxQe3jgzCVeAAA=",
    uso: "detalhe",
  },
  salaSocioCantinhoCafe: {
    src: `${BASE}/sala-socio-cantinho-cafe-1920.webp`,
    srcSet: {
      640: `${BASE}/sala-socio-cantinho-cafe-640.webp`,
      1280: `${BASE}/sala-socio-cantinho-cafe-1280.webp`,
      1920: `${BASE}/sala-socio-cantinho-cafe-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Canto da sala do sócio com máquina de café, taças de cristal, bambu da sorte, parede de madeira em diagonal, estante de livros e mesa de mármore",
    blurDataURL:
      "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAwAgCdASoQAAsAA4BaJYgCdAELY9EKMkVrAAD+3dCzs6YrK7oh1iGtFbMvOt8d8z8jKfLm3zUrLEbIum0JLpYsSB2Ufr87Ovk/S9VbeS2gAA==",
    uso: "reuniao",
  },
  vasosCeramicaCostelaDeAdao: {
    src: `${BASE}/vasos-ceramica-costela-de-adao-1920.webp`,
    srcSet: {
      640: `${BASE}/vasos-ceramica-costela-de-adao-640.webp`,
      1280: `${BASE}/vasos-ceramica-costela-de-adao-1280.webp`,
      1920: `${BASE}/vasos-ceramica-costela-de-adao-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Vasos de cerâmica em tom areia com folhas de costela-de-adão sobre mesa de apoio, ao lado de poltrona com braço de madeira e persiana escura",
    blurDataURL:
      "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADwAQCdASoQAAsAA4BaJQBOgBazcypYRgAA/sRiCpcIduJH/f2pFp4HbfoitCw3QDJQpSYuJ98finpOUW/yNRupTmjvuAB06IAAAA==",
    uso: "detalhe",
  },
  salaAtendimentoVanGogh: {
    src: `${BASE}/sala-atendimento-van-gogh-1920.webp`,
    srcSet: {
      640: `${BASE}/sala-atendimento-van-gogh-640.webp`,
      1280: `${BASE}/sala-atendimento-van-gogh-1280.webp`,
      1920: `${BASE}/sala-atendimento-van-gogh-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Sala de atendimento com poltronas estofadas em verde-claro, vasos com plantas, autorretrato de Van Gogh em moldura dourada e porta de vidro para a varanda",
    blurDataURL:
      "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAACwAQCdASoQAAsAA4BaJQAAOFYqK6NAAP7t30n/MqTUHomHJZNVMVBT7KRFe+IT/ZR/weHY+Dmt8G/zofZ0DYkLblaEjESqx2r82s9zAta2r7enYEAAAA==",
    uso: "reuniao",
  },
  estanteLivrosJuridicosSocio: {
    src: `${BASE}/estante-livros-juridicos-socio-1920.webp`,
    srcSet: {
      640: `${BASE}/estante-livros-juridicos-socio-640.webp`,
      1280: `${BASE}/estante-livros-juridicos-socio-1280.webp`,
      1920: `${BASE}/estante-livros-juridicos-socio-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Estante iluminada com livros jurídicos coloridos sobre aparador preto com porta-retratos, balança da Justiça e cadeira executiva na sala do sócio",
    blurDataURL:
      "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAQAgCdASoQAAsAA4BaJZgCdAENrUe4eAQAAP7Sh/R0G6aJC0zGMet0SxR3Jdm+19Iq20r8bY17ynTLficBMHvTSyktOUg+GujPku247b3h+JpAFYpUeAAA",
    uso: "detalhe",
  },
  livrosAdvocaciaTrabalhistaConstituicao: {
    src: `${BASE}/livros-advocacia-trabalhista-constituicao-1920.webp`,
    srcSet: {
      640: `${BASE}/livros-advocacia-trabalhista-constituicao-640.webp`,
      1280: `${BASE}/livros-advocacia-trabalhista-constituicao-1280.webp`,
      1920: `${BASE}/livros-advocacia-trabalhista-constituicao-1920.webp`,
    },
    width: 1920,
    height: 2880,
    alt: "Livros \"Advocacia Trabalhista\" e \"Constituição Federal\" empilhados sobre mesa de madeira ao lado de jornal dobrado",
    blurDataURL:
      "data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAADQAwCdASoQABgAPu1iqU2ppaOiMAgBMB2JbACdACGHUrBgh9/kv8AA4jJVX6IcBMXc/F64xEzFnmmCDPo+TU+tzoZ+1PJMsdT3dh1/ZY3E8Q1XgV0ZpYBdCiMMfDrqEc12KRazVoAnV4/G2JGgmL4UA04/kFRkouB4je+tL6GclWBw76Rz6EeQjdZFnhVZ7w8IB8X5SXrAAA==",
    uso: "editorial",
  },
  loungePoltronasClaras: {
    src: `${BASE}/lounge-poltronas-claras-1920.webp`,
    srcSet: {
      640: `${BASE}/lounge-poltronas-claras-640.webp`,
      1280: `${BASE}/lounge-poltronas-claras-1280.webp`,
      1920: `${BASE}/lounge-poltronas-claras-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Lounge claro com duas poltronas de linho e madeira entalhada, almofadas com estampa de folhas e mesa lateral preta com vaso verde",
    blurDataURL:
      "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAQAgCdASoQAAsAA4BaJZQCdADG7c5xbUAAAP7XiW5qyu2g7/T6DYPf+UuJX290ufcwUZKYRix9zo+UQI0Qduz8eBTAit7aTbiwEQAA",
    uso: "reuniao",
  },
  esculturaDouradaSilencio: {
    src: `${BASE}/escultura-dourada-silencio-1920.webp`,
    srcSet: {
      640: `${BASE}/escultura-dourada-silencio-640.webp`,
      1280: `${BASE}/escultura-dourada-silencio-1280.webp`,
      1920: `${BASE}/escultura-dourada-silencio-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Escultura dourada de rosto com o dedo sobre os lábios, símbolo de sigilo, sobre bancada de madeira com livros empilhados e flores laranja ao fundo",
    blurDataURL:
      "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAADwAQCdASoQAAsAA4BaJYgCdAEQ9G4DMGgA/rIK1yimpTq23irtQPVsrJJm6bBCbNhDE9WWHE3ez8J/eQ9Fj9lce9QHx/GpsjFjyWxfewQdElaHI/UeWBVn3feQdRhYAAA=",
    uso: "detalhe",
  },
  sinalizacaoEstudioVideo: {
    src: `${BASE}/sinalizacao-estudio-video-1920.webp`,
    srcSet: {
      640: `${BASE}/sinalizacao-estudio-video-640.webp`,
      1280: `${BASE}/sinalizacao-estudio-video-1280.webp`,
      1920: `${BASE}/sinalizacao-estudio-video-1920.webp`,
    },
    width: 1920,
    height: 1280,
    alt: "Sinalização \"No ar\" e \"Vídeo\" em acrílico vermelho e verde sobre a porta de madeira do estúdio de gravação do escritório",
    blurDataURL:
      "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAgCdASoQAAsAA4BaJbACdAEXeWs4ThgAAP70mCweV5GAL9tc27hsKNWCDmKrNbQUecVxO9eHoFUhPvoPGE1nAAA=",
    uso: "detalhe",
  },
  heroAmploSalaReuniaoNicoli: {
    src: `${BASE}/hero-amplo-sala-reuniao-nicoli-1920.webp`,
    srcMobile: `${BASE}/hero-amplo-sala-reuniao-nicoli-mobile.webp`,
    srcSet: {
      640: `${BASE}/hero-amplo-sala-reuniao-nicoli-640.webp`,
      1280: `${BASE}/hero-amplo-sala-reuniao-nicoli-1280.webp`,
      1920: `${BASE}/hero-amplo-sala-reuniao-nicoli-1920.webp`,
      2560: `${BASE}/hero-amplo-sala-reuniao-nicoli-2560.webp`,
    },
    width: 1920,
    height: 1080,
    alt: "Sala de reuniões da Nicoli Sociedade de Advogados com letreiro \"Nicoli Sociedade de Advogados\" em aço escovado sobre painel de madeira em diagonal, parede de tijolos com iluminação rasante e mesa de mármore branco com cadeiras executivas pretas",
    blurDataURL:
      "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADwAQCdASoQAAkAA4BaJagCdAEK6ymrYwAA/vV+H3Sev6Al0AYCftkLf3QTK7YEBHNV00c5HmoKslcbP5hX8BHE5yBW2ztEMCAAAA==",
    uso: "hero",
  },
  fachadaNicoliDestaque: {
    src: `${BASE}/fachada-nicoli-destaque-960.webp`,
    srcSet: {
      640: `${BASE}/fachada-nicoli-destaque-640.webp`,
      1280: `${BASE}/fachada-nicoli-destaque-1280.webp`,
      1920: `${BASE}/fachada-nicoli-destaque-1920.webp`,
    },
    width: 960,
    height: 1200,
    alt: "Letreiro \"Nicoli Sociedade de Advogados\" em letras bordô tridimensionais sobre a fachada de mármore branco, com folhagens pendentes",
    blurDataURL:
      "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAADQAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JZQAASFwxwl+pGODmSsAA/p+VUETY4VI8FT/MpOXg8SKwIeWNjqb5399AgNqjoudv94P4MU3q36keWj9p42GDyJVhYoLkA+UIo2qshgMp4szEp0OIq2QDADwAAA==",
    uso: "fachada",
  },
} as const satisfies Record<string, ImagemEscritorio>;

export type ChaveImagem = keyof typeof IMAGENS;

/** Melhor foto para o hero da home. */
export const HERO_HOME: ImagemEscritorio = IMAGENS.salaDeEsperaChesterfieldTijolo;

/** Todas as fotos do escritório, da melhor para a pior (avaliação visual). */
export const IMAGENS_POR_QUALIDADE: readonly ImagemEscritorio[] = [
  IMAGENS.salaDeEsperaChesterfieldTijolo,
  IMAGENS.salaDeReuniaoLetreiroNicoli,
  IMAGENS.fachadaLetreiroNicoli,
  IMAGENS.recepcaoBalcaoMarmoreNicoli,
  IMAGENS.letraNMonumentalParedeTijolos,
  IMAGENS.bibliotecaJuridicaEstante,
  IMAGENS.salaDeEsperaPoltronas,
  IMAGENS.estatuaThemisVertical,
  IMAGENS.relogiosFusosLondresBrasiliaNovaYork,
  IMAGENS.salaReuniaoNoiteEstrelada,
  IMAGENS.estatuaThemisBalcaoMarmore,
  IMAGENS.salaSocioBibliotecaVaranda,
  IMAGENS.salaReuniaoMesaRedonda,
  IMAGENS.quadroVanGoghSalaSocio,
  IMAGENS.fachadaLetreiroPerspectiva,
  IMAGENS.poltronaVermelhaTelefoneAntigo,
  IMAGENS.chesterfieldCouroOrquidea,
  IMAGENS.escadaIluminadaMadeira,
  IMAGENS.quadrosCorredorCasario,
  IMAGENS.sinalizacaoSalaReuniao1,
  IMAGENS.salaSocioCantinhoCafe,
  IMAGENS.vasosCeramicaCostelaDeAdao,
  IMAGENS.salaAtendimentoVanGogh,
  IMAGENS.estanteLivrosJuridicosSocio,
  IMAGENS.livrosAdvocaciaTrabalhistaConstituicao,
  IMAGENS.loungePoltronasClaras,
  IMAGENS.esculturaDouradaSilencio,
  IMAGENS.sinalizacaoEstudioVideo,
];

/** Hero amplo full-bleed (16:9): letreiro da Nicoli à direita, área escura à esquerda para texto claro. srcMobile 828x1300 com o letreiro no terço superior. */
export const HERO_AMPLO: ImagemEscritorio = IMAGENS.heroAmploSalaReuniaoNicoli;

/** Quadro 4:5 sobreposto ao hero, centrado no letreiro da fachada (src = 960x1200). */
export const HERO_DESTAQUE: ImagemEscritorio = IMAGENS.fachadaNicoliDestaque;

/** Sequência para carrossel: alterna planos amplos e detalhes, sem repetir ambiente seguido. */
export const GALERIA_COMPLETA: readonly ImagemEscritorio[] = [
  IMAGENS.salaDeEsperaChesterfieldTijolo,
  IMAGENS.sinalizacaoSalaReuniao1,
  IMAGENS.salaAtendimentoVanGogh,
  IMAGENS.escadaIluminadaMadeira,
  IMAGENS.salaDeReuniaoLetreiroNicoli,
  IMAGENS.vasosCeramicaCostelaDeAdao,
  IMAGENS.fachadaLetreiroNicoli,
  IMAGENS.estanteLivrosJuridicosSocio,
  IMAGENS.loungePoltronasClaras,
  IMAGENS.esculturaDouradaSilencio,
  IMAGENS.recepcaoBalcaoMarmoreNicoli,
  IMAGENS.quadrosCorredorCasario,
  IMAGENS.salaReuniaoNoiteEstrelada,
  IMAGENS.chesterfieldCouroOrquidea,
  IMAGENS.salaSocioCantinhoCafe,
  IMAGENS.livrosAdvocaciaTrabalhistaConstituicao,
  IMAGENS.letraNMonumentalParedeTijolos,
  IMAGENS.sinalizacaoEstudioVideo,
  IMAGENS.salaSocioBibliotecaVaranda,
  IMAGENS.estatuaThemisBalcaoMarmore,
];

/** Atalho: fotos filtradas por uso, mantendo a ordem de qualidade. */
export function imagensPorUso(uso: UsoImagem): ImagemEscritorio[] {
  return IMAGENS_POR_QUALIDADE.filter((img) => img.uso === uso);
}

const FOTOS_EQUIPE = {
  "henrique-segatto": {
    src: "/images/equipe/henrique-segatto.webp",
    srcSm: "/images/equipe/henrique-segatto-sm.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAADwAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JbACdLwABnWHEx762nmAQAP7un01rmyWq7hkvPmOWthnLMTBCc7a+lGuKoc94nFhPo3o7RzdTIt3vWThzcrPybcjQ6zqTl4a4jQJqYXop+dkO2X6lCaDzPMP+A7+/X/AAAAAA",
    width: 960,
    height: 1200,
  },
  "lucas-resende-telles": {
    src: "/images/equipe/lucas-resende-telles.webp",
    srcSm: "/images/equipe/lucas-resende-telles-sm.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAACQAwCdASoQABQAPu1iqU2ppaQiMAgBMB2JbACdABi9PJsoMmAgAP7uoVcLzm5PDf2cGiaNA/M5buCRd8q3cad9f6ZkY3FOOQxKpbCih2XZWqavUR9a9PY/JfxQvlbYzbaVcvgnhlRTuKsu3i5c9jxBgAA=",
    width: 960,
    height: 1200,
  },
  "luis-gustavo-nicoli": {
    src: "/images/equipe/luis-gustavo-nicoli.webp",
    srcSm: "/images/equipe/luis-gustavo-nicoli-sm.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAAAQBACdASoQABQAPu1iqU2ppaOiMAgBMB2JbACdACKq6CRWwB9ylwQPNAD+7owXZVEAGk18jYlX4QBc4LQqkuNi79PwTdwINSfIAmEwS7WPZX4Cg9RkdKDWsEP0vohpUu6kRGjVPFANe5YdXCywWyWiCJllh7Fh5Anh+THTYoE8PyY4AAA=",
    width: 960,
    height: 1200,
  },
  "raul-roudasse": {
    src: "/images/equipe/raul-roudasse.webp",
    srcSm: "/images/equipe/raul-roudasse-sm.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAADQAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JZgC/OBuepnWp3ooQGIAA/u6bkrYs1PxULPcFT4GPOCCvp8wk6xpyA2FqdteFQuLrkdBZ0fl8sEQuDxzV8qPgiGyvJHCFj78kscgTYAAAAA==",
    width: 960,
    height: 1200,
  },
  "bruna-ferreira": {
    src: "/images/equipe/bruna-ferreira.webp",
    srcSm: "/images/equipe/bruna-ferreira-sm.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JZgCdMoR3AB6UYhGLhUC+5wAA/u6fS/FCUtJ2FruSP66Z8IJWutlUCGh2ozejK16CffIEy6u2/D3DcTRMqTcV3WRJTpGxU5N/MrzfbhPzvlSI6eh4+Dd28QHBI+xCmmtyBOtdQ3D8CyWAAAA=",
    width: 960,
    height: 1200,
  },
  "laiza-cabral": {
    src: "/images/equipe/laiza-cabral.webp",
    srcSm: "/images/equipe/laiza-cabral-sm.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAAAQBACdASoQABQAPu1iqU2ppaQiMAgBMB2JZgCdMoACtb3rPBDvFihu7AD+6/8meVPsDwJUV9B6NdMZ8QESY0ZBC4PFHtpVSLh53ayvGzYd/VVCV/BcMAJlWb/2KBRIyud2njSLpiy6tHKoFRAqb56dYf5wq2J06kLqyaBZ/RHLJFTTwahpmwAAAAA=",
    width: 960,
    height: 1200,
  },
  "juliana-nicoli": {
    src: "/images/equipe/juliana-nicoli.webp",
    srcSm: "/images/equipe/juliana-nicoli-sm.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAABwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JagCdMoAlpxS+4qVzYydcCHzdgAD+7p9L7yDHNViT/tZnfheEQmLUhO+YfhzuKiiNPbI0lZNFNw2ovuvIeoFnGfbGi3pnNCy54bl8VGHuhCYY49T9GQDIqd/vBz4Y4/sNjP4QUCpjcg0/eUWtytxprmuRTJDsQihAhNwCCSvR4Fu0KbrFP5GjOrLBB/kAAAA=",
    width: 960,
    height: 1200,
  },
} as const satisfies Record<string, FotoEquipe>;

export type SlugEquipe = keyof typeof FOTOS_EQUIPE;

/** Fotos dos sócios/advogados em destaque. Indexável por string (retorna undefined se o slug não tiver foto). */
export const EQUIPE_FOTOS: Readonly<Record<SlugEquipe, FotoEquipe> & Partial<Record<string, FotoEquipe>>> = FOTOS_EQUIPE;

/** Demais colaboradores (mosaico "Nossa equipe"), em ordem alfabética. */
export const EQUIPE_COLABORADORES: readonly FotoColaborador[] = [
  {
    nome: "Arthur Costa",
    src: "/images/equipe/colaboradores/arthur-costa.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAADwAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JbACw7Bjd3cL6GjHN7COQAP7unw+GBkPxfdOP3pc7SeE3KVUY3NLScnzcNk0JbRtMpb8oKejAPZixaCX8hsIui5/I7CFs01feVns4zKzmY4BhYA1CcDx3wOSo392RM8EgAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Beatriz Paes",
    src: "/images/equipe/colaboradores/beatriz-paes.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JZgCdMoR4GB7ANvWf1t+38iAA/u6MUCwxIzn3D8+q5IJ7pvEp8FbKkhXWNhLOGYi9GYX9JZE5H/ndG2Qyskc1pKyTqr1IZXyJ0DYn1TR4mpfaYDPjVn7pkag1eT7pTrW5PxQstHPKDPSOUQUUprb4qki30XAA",
    width: 480,
    height: 600,
  },
  {
    nome: "Brenda Doris",
    src: "/images/equipe/colaboradores/brenda-doris.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAAAQBACdASoQABQAPu1iqU2ppaOiMAgBMB2JaACdMoACs+L1UP7XWteu0AD+7qFXDHh8gvelV6b+6uJSKdPtS8hh9+iipAomjpbe2fBUESPGuNyNgy7DhrnX58G7sO1KAGrs6+lQZM95FHzUXFmotsld3VYld3RMAAA=",
    width: 480,
    height: 600,
  },
  {
    nome: "Caio Vargas",
    src: "/images/equipe/colaboradores/caio-vargas.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JbACw7YuGo/x92AYiJkD1PVgA/u6bikaEuVGihvd+BNPY9aSAUervEilXFfLIWw3fqNDOyOnwLxK9kV3CReTmW/1rz9ik8gEFwWRM7PcPyX/Q+HRg6Pn9+v+KjnIN/gAAAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Dr. Bruno Souto",
    src: "/images/equipe/colaboradores/bruno-souto.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRooAAABXRUJQVlA4IH4AAACQBACdASoQABQAPu1iqU2ppaOiMAgBMB2JagCdMoGv/gNpEVDM+qX9+YXYxgAA/u6fD4YQd3igDI0nBKa7c18UBClCoyxNNFdZ5UfiOGqRYlt68BGlDhrV9veLB7swgKTDYYupef1tbyMcUyLtF5kLMCUmTsBwaA0z3oZ0gAA=",
    width: 480,
    height: 600,
  },
  {
    nome: "Dr. João Pedro Alves",
    src: "/images/equipe/colaboradores/joao-pedro-alves.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAADQAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JbACw7Buke5jYuuZ1ftgA/u6bkwub58tZZhA7edRy8PLOhocO79yDOwRnmO1pxAdF7vDLcFHzmN4nmg8QOR0LyQsAvj6MO9jPCBRHiOrA9FLx9fMkP8FEsp/8AAAA",
    width: 480,
    height: 600,
  },
  {
    nome: "Dr. Vinícius Menezes",
    src: "/images/equipe/colaboradores/vinicius-menezes.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAADQAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JagCdABjZ90vDj2fDuoAA/u6MI1qoBAF0Pnz2AgkvZHm7TUFjYUWJAOaiu8Iy8ThFq4tmPOAU1BuoAwcVxF+Bo25HYQTpYeAXYWTClxY8mvww1G66ZDoqxN37J2LAAAA=",
    width: 480,
    height: 600,
  },
  {
    nome: "Dra. Aline Radica",
    src: "/images/equipe/colaboradores/aline-radica.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAABwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JZgCdMoRwAB68Ww7niOStq+vjwAD+7qFYM3rsHB5mZZv+1YGD9rFE4wbQp8+zgr9z0kZur4PjlcTlOyk+6qRw5Sgt+Xlz7Cd/26q+onlLhY374f8wHJXW/mgGC6DxsNi+UYGPYvsnCVAV+d9AAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Dra. Julia Côrte",
    src: "/images/equipe/colaboradores/julia-corte.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JZgCdMoAC8LFi9i9fclRf2oAA/u6gs8LLchum8rmr5OG2h4gdQfFIMKtlqMBBUJOPTKjQ45q82DNCeYR8UTyUd927rNug4eS4Fw/ba4NZ4BnEbqBLqKIvVFU27h2Z+3nQAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Edberto Manoel",
    src: "/images/equipe/colaboradores/edberto-manoel.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAADQAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JagAAV7HSfe6WtK5zoZAA/u6fZC5msSLYvmiIOIjjD5AJaFkrVmLVgD7RpcccC/Um0mL2YWeFaZ5Af7kNX3/rXn0tH4zOc3wzDzq3qsnq0H9xEN/KJ5n+TQ0Lv/IAAAA=",
    width: 480,
    height: 600,
  },
  {
    nome: "Gabriel Borba",
    src: "/images/equipe/colaboradores/gabriel-borba.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAABwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JaACdAYtKyt1sRDxDFwX2+HU9AAD+7p8Pcwmc4tYeNng6kZvxzeus5mLzneeTvrZ5DCLuZUcLZeZyjJt6PxPRDyOxz9myzKgJaC+U7XcAZK150GcCYnQEYOCQ/wH7xnv/AAAA",
    width: 480,
    height: 600,
  },
  {
    nome: "Karinne Beatriz",
    src: "/images/equipe/colaboradores/karinne-beatriz.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAAAQBACdASoQABQAPu1iqU2ppaOiMAgBMB2JaACdABukfMACzCL3S4l2AAD+6/vyGsUZsVpshd8WKNbIsgdVceQVRAd/kfnx5UVba8bLCfl4WgLGRA52OtYXBWQThQ08R6QY+gr6qAAHxYVGc8ffZ1ZJuanIm3pi0GoAAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Laís Hungria",
    src: "/images/equipe/colaboradores/lais-hungria.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JZgCdMoACbv01n7pIj33bkgAA/u6fZC4s9SioXTtXrmr5nBXCrxba6KbPv99QnL+Wtua3P+mPGrlmBVrs0h4mRWbFfBFHuB4vI2DGwx6D5Sw29+tVx1uR78BJfFAY5P6MkX3RpwD3oYTF+l4V9vIJ4UXpGgZLB9NcJJrQAAA=",
    width: 480,
    height: 600,
  },
  {
    nome: "Leandro Dias",
    src: "/images/equipe/colaboradores/leandro-dias.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRowAAABXRUJQVlA4IIAAAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JagCsB2gDZSnS4bZYy3VMWxAA/u6d/2Yf9Mdjns594reOWmdWC618T6vgt+wRc+mHL/q0hWmSZJGofRflfZ+n98RHXy+TS0OSExTv0UEPW+xMUc//RZEiD7wa2pwU4i31ovhYveeAAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Lucas de Matos",
    src: "/images/equipe/colaboradores/lucas-de-matos.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JbACdEf/gN/1DabrLwq86ZrAA/u6gcNyR9dZywgaOU+NhqAUv9VEIebcSrT/XBtRICn9x7yvCjhrc7jGpWAt4Jcvk8w1gI+hXeFV1PcDBVvZR/HM0nssWRNVc4soVJyfVZwVJDdcD5AAA",
    width: 480,
    height: 600,
  },
  {
    nome: "Márcia Batista",
    src: "/images/equipe/colaboradores/marcia-batista.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JaACdMoADEc33OfgkreqLvEAA/u6UBvHpZYe7HW2UoT3Ny0UUQ1IjiwYO9Hc7u9Y62aoe77I1qpD6x6ate0Q+tWwSfGY+pv/1zfMfS7+PyoCibtk3Fw/0J8k9ZEZpAinigAAA",
    width: 480,
    height: 600,
  },
  {
    nome: "Michelle Lima",
    src: "/images/equipe/colaboradores/michelle-lima.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAAAQBACdASoQABQAPu1iqU2ppaOiMAgBMB2JagCdMoACtA+71Rnh+c48AAD+7qBydN1v14SGvQOOQzAIMFdIIhXsuAM1VG2CjYBgsfgwpvq3GwoO28NN0zrR+mfyNgy6YBsJLsxG4LefQgdqX8qEZtMNSq6o95ZJxAeDVkUbX4EnsonGoFuAAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Milena Palmerston",
    src: "/images/equipe/colaboradores/milena-palmerston.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAAAQBACdASoQABQAPu1iqU2ppaQiMAgBMB2JaACdMoAC8PZNKS4UyBBnhAD+7p9LoA7NXx3OU31yqGZet0J2+8APIi2BRhd8jyA5slqqinDnAq/PY4BAgQunU5yYqfUJvyAGbZ2nBF2FtoHEMXowLzUBeaAAAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Rafaela Lima",
    src: "/images/equipe/colaboradores/rafaela-lima.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JaACdMoACs/y0QUR+ZVPOkAAA/u6bveW/JEOuzCf9gVhRrr4bDN0yylFojx7J3kamDRYzvrfQRORaDFhQs9yNgujQiCpM0IEBDS73zQIGHQE5wyOZydaB5igGCLEh4FNAAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Sara Vieira",
    src: "/images/equipe/colaboradores/sara-vieira.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRooAAABXRUJQVlA4IH4AAABQBACdASoQABQAPu1iqU2ppaOiMAgBMB2JagCdMoKP+An+AzpnmDm8PtiAAP7uoVg24l/Ub9ilBNRI3GHECOTKCQWPilfUrkZmPGKdShU2UTTkjqF8S3GAbDux7QogU9B/MnSzl9c9ix/Q6SRMLAo0fYXXBTJVibiF8QkAAAA=",
    width: 480,
    height: 600,
  },
  {
    nome: "Suelene Abreu",
    src: "/images/equipe/colaboradores/suelene-abreu.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAABwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JagCdMoAlshbg71eYAzAzyUEgQAD+7qFhlqBFTKWvViHRr1pJbx8M3VwrPMgNU6shtvb/fJ4ZXLz51/NaB8ZltSmb+KTgr+qg6OuZXCt4KziSW6xaXogvOR0TdCRp8OV1fgvTsgsufEvaZYAAAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Suzana de Castro",
    src: "/images/equipe/colaboradores/suzana-de-castro.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAADwAwCdASoQABQAPu1iqU2ppaOiMAgBMB2JZgCdAB9x6dTOM0Q+rvWAAP7un01ucLButRU571hKEkf9m2sKWdYjwpj2nXZ8gFvz73DNNHbdAt1UoK9KXRdrkMYHi/ncE2TxFTYjxrK1yKiVhSjIj71Tg0hgWAAA",
    width: 480,
    height: 600,
  },
  {
    nome: "Suzane",
    src: "/images/equipe/colaboradores/suzane.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRowAAABXRUJQVlA4IIAAAAAwBACdASoQABQAPu1iqU2ppaOiMAgBMB2JZgCdMoADKT61knUYGQZukAAA/u6hYTngPD4XAk7/vRvVvNEb9tyDczI9EFMvsNYGZ+ryXRWLfAl2bv+KS7AGrL4pOCtdrkJArSt5rxW1m6ELyTE2P21mM8PNgfBOCUowYFQ8TPUwAA==",
    width: 480,
    height: 600,
  },
  {
    nome: "Vinícios Corsino",
    src: "/images/equipe/colaboradores/vinicios-corsino.webp",
    blurDataURL:
      "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAAAwBACdASoQABQAPu1iqU2ppaQiMAgBMB2JagCdL0iBVTNgtE1N4KdULwAA/u6MInIR0Ifs4vBLIdAG3QLLF+S4ZxclehVCffHdsNPR7Kck3EZlGK5ZFVqEsWlqeUbkWjiNVGmcFyOv3T32zVj6dtQCAkBowqm1X96lJG8YsJCMw7AA",
    width: 480,
    height: 600,
  },
];

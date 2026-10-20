# Design System — Nicoli Sociedade de Advogados

> Base: logo bordô (`ID Visual/LOGOS DO ESCRITÓRIO/BORDÔ/2.png`). Tokens implementados em `app/globals.css`.
> Direção: **claro editorial**, luxo discreto, sóbrio e moderno. Nada de "cara de loja".

## 1. Leitura da marca

| Elemento da logo | Tradução no sistema |
|---|---|
| **Moldura quadrada aberta** (cantos em L, aberta no canto superior direito e inferior esquerdo) | Classe `.moldura`: cantos em L em blocos de destaque (CTA final, retratos). Formas **retas**, raio 0–2px em todo o site, **exceto botões de ação (CTAs) e o botão flutuante do WhatsApp, que são em pílula (`rounded-full`)** para se destacarem como elementos clicáveis. |
| **"N" de linhas paralelas duplas** | Classe `.linhas-paralelas` (2 filetes de 1px, 3px de vão) como divisor; traço fino 1.25–1.5px nos ícones; terminação `square`. |
| **NICOLI** em sans geométrica | Fonte **Jost** (geométrica, parente da Futura) para interface, menus e corpo. |
| **S O C I E D A D E** com tracking largo | `.eyebrow`: caixa-alta, 12px, `letter-spacing: .26em`, com filete à esquerda. |
| Bordô **#530103** (amostrado do PNG e do fundo das fotos da equipe) | Cor de autoridade: títulos, CTAs primários, superfícies escuras. |
| Broche **"N" dourado** na lapela do sócio (fotos) | Acento **champanhe** para detalhes em superfícies escuras. |
| Lema "Aqui se joga em alto nível" (`BORDÔ/5.png`) | Tom interno: confiança e precisão. Não aparece como texto no site. |

## 2. Cores

| Token | Hex | Uso |
|---|---|---|
| `--cor-bordo-700` (`--cor-primaria`) | `#530103` | Marca, H1/H2, botão primário, superfícies de destaque |
| `--cor-bordo-800` | `#3d0102` | Hover do primário, seções escuras |
| `--cor-bordo-900` | `#2b0102` | Rodapé |
| `--cor-bordo-600` | `#6b1416` | Mensagens de erro em fundo claro |
| `--cor-champanhe-500` (`--cor-secundaria`) | `#c4a27a` | Foco, moldura em fundo bordô, detalhes |
| `--cor-champanhe-400` | `#d6bb96` | Texto de acento **apenas em fundo bordô** |
| `--cor-champanhe-700` | `#7d5f3d` | Eyebrows e números em fundo claro (único champanhe aprovado p/ texto claro) |
| `--cor-marfim` (`--cor-fundo`) | `#faf7f2` | Fundo principal |
| `--cor-areia` | `#f2ece3` | Seções alternadas, heros internos |
| `--cor-pedra` | `#e3dacd` | Bordas e divisórias |
| `--cor-grafite` (`--cor-texto`) | `#1e1a18` | Texto principal |
| `--cor-cinza` | `#5c534e` | Texto secundário |
| `--cor-whatsapp` | `#1f7a4d` | Exclusivo para ações de WhatsApp (verde escurecido para contraste AA com branco) |

**Contraste (WCAG 2.2 AA):** bordô/marfim 14.3:1 · grafite/marfim 16.2:1 · cinza/marfim 7.0:1 (6.4:1 em areia) · champanhe-700/marfim 5.5:1 (5.0:1 em areia) · champanhe-400/bordô-700 8.3:1 · champanhe-500/bordô-700 6.4:1 · branco/whatsapp 5.3:1. Todos ≥ 4.5:1.
**Proporção de uso:** ~70% marfim/areia · ~20% bordô · ~5% grafite · ≤5% champanhe.

## 3. Tipografia

| Papel | Fonte | Peso | Tamanho (fluido) | Entrelinha |
|---|---|---|---|---|
| Display (home) | Cormorant Garamond | 500 | `clamp(2.75rem → 6rem)` · `text-display` | 1.02 |
| H1 | Cormorant Garamond | 500 | `clamp(2.375rem → 4.5rem)` · `text-h1` | 1.06 |
| H2 | Cormorant Garamond | 500 | `clamp(2rem → 3.25rem)` · `text-h2` | 1.1 |
| H3 | Cormorant Garamond | 500 | `clamp(1.375rem → 1.75rem)` · `text-h3` | 1.25 |
| Lead | Jost | 400 | `clamp(1.0625rem → 1.25rem)` · `text-lead` | 1.65 |
| Corpo | Jost | 400 | 17px | 1.7 |
| Eyebrow / botões / menu | Jost | 500 | 12–13px, caixa-alta, tracking .12–.26em | — |

**Pareamento:** serifa de alto contraste (tradição) + sans geométrica da logo (modernidade). É a tradução de "Tradição e modernidade a serviço dos nossos clientes".
Fontes self-hosted via `next/font` (sem requisição externa), `display: swap`. Medida de leitura: máx. ~68 caracteres (`--container-texto`).

## 4. Espaço e grid

- Base 4px. Container `77.5rem` (1240px), gutter 20px (mobile) / 32px (≥768px).
- Ritmo de seção: `--secao-py: clamp(4.5rem, 3rem + 6vw, 9rem)`.
- Layouts assimétricos 0.8fr/1.2fr com coluna de título **sticky** no desktop (leitura editorial).
- Listas como **linhas editoriais numeradas** (01, 02…) com divisórias de 1px, em vez de grades de cards iguais.

## 5. Componentes

| Componente | Arquivo | Notas |
|---|---|---|
| Botão | `components/ui/Button.tsx` | Variantes: `primario`, `contorno`, `claro`, `contorno-claro`, `whatsapp`, `texto`. Altura mín. 48px, formato pílula (`rounded-full`). Hover: sobe 2px + sombra bordô; seta desliza. |
| Cabeçalho de seção | `components/ui/SectionHeading.tsx` | Eyebrow + H2 + lead; tons claro/escuro. |
| Reveal | `components/ui/Reveal.tsx` | Fade + slide-up 28px, react-spring (tension 120 / friction 24). Nunca no hero. |
| Header | `components/layout/Header.tsx` | Transparente → marfim translúcido com blur ao rolar; mega menu em 2 públicos; menu mobile em tela cheia. |
| Formulário de lead | `components/lead/LeadForm.tsx` | Labels flutuantes, máscara de telefone, campos de empresa só para o público "empresas", envio → WhatsApp. |
| FAQ | `components/shared/FaqLista.tsx` | `<details>` nativo + FAQPage schema. |
| CTA final | `components/shared/CtaFinal.tsx` | Bloco bordô com moldura champanhe e símbolo em marca d'água. |
| Lista de áreas | `components/shared/ListaAreas.tsx` | Cortina bordô que sobe no hover. |
| Retrato | `components/shared/MembroCard.tsx` | 4:5, fundo bordô padronizado, zoom lento no hover. |
| Credenciais | `components/shared/CredenciaisFaixa.tsx` | Somente fatos verificáveis. |

## 6. Movimento

| Token | Valor | Uso |
|---|---|---|
| `--ease-elegante` | `cubic-bezier(.22,1,.36,1)` | Padrão para tudo |
| `--dur-rapida` | 200ms | Cores, foco |
| `--dur-media` | 450ms | Sublinhados, menus |
| `--dur-lenta` | 800ms | Entradas |

- Entrada ao scroll: fade-in + slide-up (IntersectionObserver), escalonada em 50–90ms por item.
- Hero: só `transform` (nunca `opacity: 0`), para não atrasar o LCP.
- Linha do método preenchida pelo scroll via CSS `animation-timeline: view()` (sem JS; fallback estático).
- Lenis só em desktop com mouse, carregado no idle. `prefers-reduced-motion` desliga tudo.

### GSAP (ScrollTrigger + SplitText)

Carregado sob demanda (`lib/gsap.ts`): só após a 1ª interação ou ocioso pós-load, fora do bundle inicial. Textos já visíveis no carregamento nunca são escondidos (sem "pisca", sem prejuízo ao LCP).

| Seção (home) | Efeito da headline | Extra |
|---|---|---|
| Hero | entrada CSS (LCP) | parallax da foto de fundo e do quadro |
| Manifesto | `mascara` (linhas sobem da máscara) | palavras acendem com o scroll |
| Áreas | `letras` (giro 3D) | — |
| Diferenciais | `desfoque` | zoom-out da foto |
| Método | `inclinado` | seção fixada (pin), etapas e barra de progresso guiadas pelo scroll |
| Equipe | `lateral` | retratos revelados por clip-path |
| Galeria | — | trilho horizontal fixado, 20 fotos com parallax interno; swipe no mobile |
| Avaliações | `escala` | — |
| Blog | `cortina` | — |
| FAQ | `dispersao` | — |
| CTA final | `palavras` | símbolo gira e desliza |

Componentes: `components/motion/TextoAnimado.tsx`, `CenaGsap.tsx` (atributos `data-parallax`, `data-parallax-escala`, `data-revelar`, `data-scrub-texto`, `data-girar`), `SequenciaFixada.tsx`, `GaleriaHorizontal.tsx`. `SectionHeading` aceita `efeito`.

## 7. Iconografia

Traço 1.25–1.5px, `stroke-linecap: square`, cantos em ângulo: o mesmo DNA do "N". Arquivos: `components/icons/Icones.tsx` e `components/icons/AreaIcon.tsx`.

## 8. Fotografia

- Equipe: retratos 4:5 sobre bordô #530103 (versões "(2)"), sempre o mesmo enquadramento.
- Ambiente: fotos reais do escritório, luz quente, sem filtros pesados. WebP/AVIF, ≤ 220 KB no hero.

## 9. Voz (resumo)

Sóbria, moderna, direta, sem juridiquês. Frases curtas, voltadas a quem decide. Sem promessas de resultado, superlativos ou urgência artificial (Provimento 205/2021 da OAB).

@AGENTS.md

# Site — Nicoli Sociedade de Advogados

Site institucional full service (11 áreas de atuação, cada uma como página de captação para Google Ads), com blog migrado do WordPress, SEO local e GEO.

---

## Cliente

| Campo | Valor |
|-------|-------|
| Cliente | Nicoli Sociedade de Advogados (CNPJ 28.415.182/0001-80) |
| Segmento | Advocacia (Goiânia/GO, atuação nacional) |
| Objetivo do site | Captação via Google Ads + orgânico (SEO/GEO) para empresas e pessoas |
| WhatsApp | (62) 99570-0037 — **único destino de leads** |
| URL de produção | https://nicoliadvogados.adv.br |
| Responsável | Luis Gustavo Nicoli (CEO) |

---

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Next.js | 16.4 | App Router, `cacheComponents`, `partialPrefetching`, Turbopack |
| React | 19.3 | UI |
| TypeScript | 5 | Tipagem |
| Tailwind CSS | 4 | Estilização (tokens em `app/globals.css`) |
| @react-spring/web | — | Reveal ao scroll |
| Lenis | — | Smooth scroll (só desktop com mouse, carregado no idle) |
| next-mdx-remote + gray-matter + remark-gfm | — | Blog em MDX |

---

## Estrutura

```
app/
  page.tsx                        Home
  areas-de-atuacao/[slug]/        11 páginas de área (landing pages de Ads)
  quem-somos/ + [slug]/           Escritório, sócios, conselho + perfil de cada advogado
  blog/ + [slug]/                 442 posts MDX
  contato/  politica-de-privacidade/  lgpd-dados-pessoais/
  sitemap.ts  robots.ts  llms.txt/  opengraph-image.tsx
components/  brand/ home/ area/ lead/ layout/ shared/ ui/ icons/ seo/ tracking/
lib/
  content/        TODA a copy (áreas, home, sobre, equipe, avaliações, legal)
  site.ts         NAP e dados institucionais (fonte única)
  nav.ts          índice leve de áreas (menu)
  schema.ts       JSON-LD   seo.ts  metadata
  images.ts       manifesto das fotos (gerado)   fotos-site.ts  curadoria por seção
  blog.ts         leitura do MDX ("use cache")
  tracking.ts  attribution-core.ts  whatsapp.ts
content/blog/     *.mdx + _redirects.json (1.017 URLs antigas → novas)
proxy.ts          redirects 301 do site antigo (Map O(1))
gtm/              container GTM gerado + TRACKING.md
docs/             DESIGN-SYSTEM.md, briefing.txt, redirects-mapeamento.md
```

---

## Design

Ver `docs/DESIGN-SYSTEM.md`. Resumo: claro editorial; bordô `#530103` (logo), champanhe `#c4a27a` (broche), marfim `#faf7f2`; Cormorant Garamond (títulos) + Jost (UI/corpo); formas retas; moldura aberta e linhas paralelas como motivos.

---

## Regras de conteúdo (OAB)

- Provimento 205/2021: **sem** promessa de resultado, preços, superlativos, casos ou nomes de clientes.
- Avaliações em `lib/content/avaliacoes.ts` são PLACEHOLDERS até receber as reais do Google.

---

## Comandos

```bash
npm run dev      # http://localhost:3000
npm run build    # build de produção (478 páginas estáticas)
npm test         # 58 testes de tracking/WhatsApp (node:test)
node gtm/gen-container.mjs   # regenera o container GTM com IDs do .env.local
```

---

## Trackeamento

Implementado conforme padrão MP — detalhes em `gtm/TRACKING.md`.
- Conversão primária Google Ads: `generate_lead` (formulário → WhatsApp). Secundárias: `click_whatsapp`, `click_phone`.
- Consent Mode v2 (default negado) + banner LGPD. Captura de UTMs/gclid/gbraid/wbraid (first e last touch).
- Variáveis: `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_REVIEWS_URL` (ver `.env.example`).

---

## Deploy

- Vercel, branch `main`, domínio `nicoliadvogados.adv.br` (hoje WordPress — apontar DNS só após validar redirects em preview).

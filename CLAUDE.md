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
  layout.tsx                      Raiz: só html/body/fontes (o chrome do site fica no SiteChrome)
  not-found.tsx                   404 (envolve SiteChrome)
  (site)/layout.tsx               SiteChrome: header, rodapé, WhatsApp, GTM + banner LGPD, schema
  (site)/page.tsx                 Home
  (site)/areas-de-atuacao/[slug]/ 11 páginas de área (landing pages de Ads)
  (site)/quem-somos/ + [slug]/    Escritório, sócios, conselho + perfil de cada advogado
  (site)/blog/ + [slug]/          442 posts MDX
  (site)/contato/  politica-de-privacidade/  lgpd-dados-pessoais/
  (painel)/dashboard/             Painel GA4 + Google Ads (noindex, SEM GTM) — docs/DASHBOARD.md
  api/painel/                     login, ga4, google-ads (rotas protegidas por sessão)
  sitemap.ts  robots.ts  llms.txt/  opengraph-image.tsx
components/  brand/ home/ area/ lead/ layout/ shared/ ui/ icons/ seo/ tracking/ painel/
lib/
  content/        TODA a copy (áreas, home, sobre, equipe, avaliações, legal)
  site.ts         NAP e dados institucionais (fonte única)
  nav.ts          índice leve de áreas (menu)
  schema.ts       JSON-LD   seo.ts  metadata
  images.ts       manifesto das fotos (gerado)   fotos-site.ts  curadoria por seção
  blog.ts         leitura do MDX ("use cache")
  tracking.ts  attribution-core.ts  whatsapp.ts
  painel/         dashboard: auth, período, GA4 Data API, Google Ads API, formatação
content/blog/     *.mdx + _redirects.json (1.017 URLs antigas → novas)
proxy.ts          redirects 301 do site antigo (Map O(1))
gtm/              container GTM gerado + TRACKING.md
docs/             DESIGN-SYSTEM.md, DASHBOARD.md, briefing.txt, redirects-mapeamento.md
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
npm run build    # build de produção (482 rotas)
npm test         # 145 testes: tracking/WhatsApp + painel + SQL no PGlite (node:test, sem chamadas reais)
node gtm/gen-container.mjs   # regenera o container GTM com IDs do .env.local
```

---

## Trackeamento

Implementado conforme padrão MP — detalhes em `gtm/TRACKING.md`.
- Conversão primária Google Ads: `generate_lead` (formulário → WhatsApp). Secundárias: `click_whatsapp`, `click_phone`.
- Consent Mode v2 (default negado) + banner LGPD. Captura de UTMs/gclid/gbraid/wbraid (first e last touch).
- Variáveis: `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_REVIEWS_URL` (ver `.env.example`).

## Painel (`/dashboard`)

Porte do painel da Sólida: coleta própria anônima (Supabase, tabelas `nicoli_*`) + Google Ads (API via MCC) + GA4 (Data API), login por senha — ver `docs/DASHBOARD.md`.
- Fica fora de `app/(site)`: **nunca** colocar o `SiteChrome`/GTM nele (contaria as visitas da equipe no GA4).
- Coleta: `lib/painel/coletor.ts` (montado pelo `<Coletor />` no Analytics) → `/api/collect`; eventos de contato espelhados em `pushDataLayer` (`lib/tracking.ts`).
- Banco: `supabase/migrations/0001_nicoli_analytics.sql` (só `service_role`; testada em PGlite).
- Variáveis só de servidor: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DASHBOARD_PASSWORD`, `DASHBOARD_SECRET`, `GA4_PROPERTY_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_ADS_*`.
- Página nova do site vai em `app/(site)/`, senão fica sem header/rodapé/GTM.

---

## Deploy

- Vercel, branch `main`, domínio `nicoliadvogados.adv.br` (hoje WordPress — apontar DNS só após validar redirects em preview).

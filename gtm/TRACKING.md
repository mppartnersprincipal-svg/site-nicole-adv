# Trackeamento — Nicoli Sociedade de Advogados

GTM + GA4 + Google Ads (conversões otimizadas) + Meta Pixel, com **Consent Mode v2** (LGPD).
Cada página de área (`/areas-de-atuacao/<slug>`) é uma página de captação do Google Ads.
**Leads são somente via WhatsApp** (62 99570-0037): o formulário monta a mensagem e abre o `wa.me`.

| Peça | Arquivo |
|---|---|
| Helpers do dataLayer, atribuição, consentimento | `lib/tracking.ts` |
| Lógica pura (testada) | `lib/attribution-core.ts` |
| Lead → WhatsApp + conversão | `lib/whatsapp.ts` |
| Componentes (`<Analytics />`) | `components/tracking/` |
| Container GTM | `gtm/gen-container.mjs` → `gtm/gtm-container-nicoli.json` |
| Testes | `tests/*.test.mjs` (`npm test`) |

---

## 1. Como o site mede

1. **Consent Mode v2** — antes de qualquer tag, o site envia `consent default` com
   `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage` **negados**
   (`wait_for_update: 500`, região `BR` + padrão global), `ads_data_redaction` e `url_passthrough`.
   Se o visitante já decidiu antes (cookie `nicoli_consent`, 180 dias), a escolha é reaplicada na hora.
2. **GTM** carrega `afterInteractive` (não bloqueia o LCP). Sem `NEXT_PUBLIC_GTM_ID`, nenhum script de terceiro carrega.
3. **Banner LGPD** — Aceitar / Recusar / Preferências (Analytics e Marketing). A decisão gera
   `gtag('consent','update', …)` + evento `consent_update`. Recusar marketing apaga gclid/fbclid salvos.
   Link "Preferências de cookies" no rodapé: `openConsentPreferences()`.
4. **Atribuição** — UTMs, `gclid`, `gbraid`, `wbraid`, `fbclid`, página de entrada e host do referrer
   ficam em `localStorage` (`nicoli_attr`) + cookie first-party `_nicoli_attr` por **90 dias**,
   com **first touch** (primeira origem) e **last touch** (última origem não-direta).
   Todo evento leva esses dados + `traffic_channel` (`google_ads`, `meta_ads`, `google_organic`, `social`, `referral`, `direct`…).
5. **Sem PII no dataLayer**: nome, telefone, e-mail e resumo nunca vão em texto puro.
   Com consentimento de marketing, e-mail e telefone vão **normalizados e em SHA-256** em `user_data`
   (conversões otimizadas). O gclid nunca aparece na mensagem de WhatsApp — só a linha
   `Ref.: <área> · <utm_campaign | "Google Ads" | "orgânico">`.

---

## 2. Catálogo de eventos (dataLayer)

Todos os eventos levam: `page_path`, `page_title`, `page_location` (sem query), `traffic_channel`,
`landing_page`, `referrer_host`, `utm_*`, `gclid/gbraid/wbraid/fbclid` (quando houver),
`first_touch_channel/source/medium/campaign/landing`.

| Evento | Quando | Parâmetros próprios | Uso |
|---|---|---|---|
| `generate_lead` | Envio válido do formulário (antes de abrir o WhatsApp) | `form_id`, `lead_area`, `lead_method=whatsapp_form`, `lead_id`, `value=1`, `currency=BRL`, `has_email`, `has_company` | **Conversão PRIMÁRIA** Ads + evento-chave GA4 + Meta `Lead` |
| `form_submit` | Mesmo momento (vem antes do `generate_lead`) | igual acima (sem value) | GA4 (funil). **Não** é conversão no Ads (evita contagem dupla) |
| `form_start` | 1º foco num campo de `form[data-form-id]` | `form_id`, `lead_area` (`data-form-area`) | Funil (início × envio) |
| `click_whatsapp` | Clique em link `wa.me` / `api.whatsapp.com` | `link_location`, `link_label`, `link_url=wa.me` | Conversão **secundária** Ads + Meta `Contact` |
| `click_phone` | Clique em `tel:` | `link_location`, `link_label` | Conversão **secundária** Ads |
| `click_email` | Clique em `mailto:` | `link_location`, `link_label` | GA4 |
| `click_*` (ex.: `click_cta`) | Elemento com `data-track="click_cta"` | `link_location`, `link_label` (`data-track-label`), `link_url`, `lead_area` (`data-track-area`) | GA4 |
| `navigation_click` | Link dentro de `[data-track-nav]` | `nav_location`, `link_label`, `link_url` | GA4 (uso do menu) |
| `scroll_25` / `scroll_50` / `scroll_75` / `scroll_100` | Profundidade de rolagem, 1× por página | `percent_scrolled` | Engajamento |
| `section_view` | `[data-section]` 40% visível, 1× por página | `section_id` | Quais blocos são vistos |
| `blog_read` | `/blog/<slug>`: 75% do `[data-article]` **ou** 45 s na página | `article_slug`, `read_trigger` (`scroll_75`/`time_45s`) | Conteúdo |
| `virtual_page_view` | Troca de rota client-side (a 1ª página sai pela Google tag) | `page_location`, `page_referrer` | GA4 `page_view` + remarketing + Meta PageView |
| `consent_update` | Decisão no banner | `consent_analytics`, `consent_marketing`, `consent_origin` | Taxa de aceite; dispara o Meta Pixel quando concedido |

`link_location` = `data-track-location` mais próximo → `floating` (`[data-floating]`) → `data-section` → `footer` → `header` → `menu` → `conteudo`.

### Atributos para o dev de UI

```tsx
<a href={buildWhatsAppUrl({ mensagem })} data-track-location="hero" target="_blank" rel="noopener noreferrer">…</a>
<a href={url} data-floating aria-label="WhatsApp">…</a>                 // botão flutuante → link_location=floating
<button data-track="click_cta" data-track-label="Agendar conversa">…</button>
<nav data-track-nav="header">…</nav>
<section data-section="servicos">…</section>
<article data-article>…</article>                                       // páginas de blog
<form data-form-id="form-area-trabalhista" data-form-area="Direito Trabalhista">…</form>
```

Botão flutuante do WhatsApp com o banner aberto no celular: `bottom: calc(1.25rem + var(--consent-h, 0px))`.

---

## 3. Importar o container no GTM

1. Preencha `.env.local` (ver `.env.example`) com `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID`,
   `NEXT_PUBLIC_GOOGLE_ADS_ID`, `GOOGLE_ADS_LABEL_*` e `NEXT_PUBLIC_META_PIXEL_ID` (o que já existir).
2. `node gtm/gen-container.mjs` → gera `gtm/gtm-container-nicoli.json`.
   Tags cujo ID ainda é placeholder saem **pausadas** (o script lista quais).
3. GTM → **Administrador → Importar contêiner** → arquivo JSON → workspace novo →
   **Mesclar** + **Renomear conflitos** (ou **Substituir** num container vazio).
4. Confira as variáveis `CONST - *` (GA4, Ads ID, 3 labels, Meta Pixel ID) e **despause** as tags.
5. **Visualizar** (Tag Assistant) → testar (seção 8) → **Enviar / Publicar**.
6. Na Vercel: `NEXT_PUBLIC_GTM_ID` em Production e Preview → redeploy.

> Se a importação reclamar da variável **"UPD - Enhanced Conversions"** (tipo *Dados fornecidos pelo usuário*),
> recrie-a manualmente: tipo *Dados fornecidos pelo usuário* → *Configuração manual* → E-mail =
> `{{DLV - user_data.sha256_email_address}}`, Telefone = `{{DLV - user_data.sha256_phone_number}}`,
> e selecione-a na tag *Ads - Conversão - generate_lead* (Incluir dados fornecidos pelo usuário).

### O que o container contém

- **Google Tag - GA4** (Initialization) — `page_view` inicial automático (com gclid na URL).
- **GA4 - <evento>** para todos os eventos da seção 2 (parâmetros já mapeados).
- **Ads - Conversion Linker** (Initialization, `url_passthrough` ativo).
- **Ads - Remarketing** (All Pages + `virtual_page_view`).
- **Ads - Conversão - generate_lead (PRIMÁRIA)** — conversões otimizadas (`user_data` em SHA-256), `transaction_id = lead_id` (deduplicação), valor 1 BRL.
- **Ads - Conversão - click_whatsapp / click_phone (secundárias)**.
- **Meta Pixel** — Base (init + PageView), PageView SPA, `Lead` em `generate_lead` (com `eventID = lead_id`), `Contact` em `click_whatsapp`. Exigem `ad_storage` + `ad_user_data` concedidos; a Base também dispara no `consent_update` quando o visitante aceita depois.
- Consentimento: tags Google com checagem nativa (*sem consentimento adicional*); Meta com *consentimento adicional obrigatório*.

---

## 4. GA4

1. Propriedade "Nicoli Advogados" (fuso Brasília, BRL) → fluxo Web → copiar `G-…`.
2. **Medição aprimorada**: desligue *Rolagem* (o site manda `scroll_*`), *Interações de formulário*
   (o site manda `form_start/form_submit`) e, em *Visualizações de página → Configurações avançadas*,
   desmarque **"Mudanças de página com base em eventos do histórico do navegador"** (o site manda `virtual_page_view`; evita page_view duplicado).
3. **Eventos-chave**: `generate_lead` (principal), `click_whatsapp`, `click_phone`.
4. **Dimensões personalizadas (escopo evento)**: `lead_area`, `form_id`, `link_location`, `traffic_channel`,
   `first_touch_channel`, `first_touch_campaign`, `section_id`, `article_slug`, `nav_location`, `landing_page`.
5. Vincular **Google Ads** (Administrador → Vinculações de produtos) e ativar **Google Signals**. Retenção: 14 meses.

---

## 5. Google Ads — conversões

Ads → **Metas → Conversões → Nova ação de conversão → Site → configurar manualmente**:

| Ação | Categoria | Meta | Valor | Contagem | Janela |
|---|---|---|---|---|---|
| **Lead - Formulário WhatsApp** (`generate_lead`) | Enviar formulário de lead | **Primária** | 1 (ou valor médio do caso) | **Uma** | 30 dias clique / 1 dia view |
| **Clique WhatsApp** (`click_whatsapp`) | Contato | **Secundária** | 0 | Uma | 30 dias |
| **Clique Telefone** (`click_phone`) | Ligação via site | **Secundária** | 0 | Uma | 30 dias |

Para cada ação: **Configurar a tag → Usar o Gerenciador de tags** → copiar **ID** (`AW-…`) e **Rótulo**
→ preencher `.env.local` (`NEXT_PUBLIC_GOOGLE_ADS_ID`, `GOOGLE_ADS_LABEL_*`) e regerar o container
(ou editar as variáveis `CONST - Ads Label - *` direto no GTM).

**Por que o WhatsApp clique é secundário?** Quem clica no botão flutuante nem sempre manda mensagem;
o `generate_lead` só acontece com formulário válido (nome, telefone e resumo) — sinal mais forte para o Smart Bidding.
Se o volume de `generate_lead` for baixo (< 30/mês por campanha), considere promover `click_whatsapp`
a primária temporariamente e voltar quando houver volume.

### Conversões otimizadas (Enhanced Conversions)

1. Ads → Metas → Conversões → **Configurações** → *Conversões otimizadas para a Web* → **Ativar** → método **Google Tag Manager**.
2. Aceite os termos de dados do cliente.
3. O site já envia `user_data.sha256_email_address` e `user_data.sha256_phone_number` (normalizados: e-mail em minúsculas/gmail sem pontos; telefone `+55DDDNUMERO`) **somente** com consentimento de marketing.
4. Diagnóstico em 48–72h: ação "Lead - Formulário WhatsApp" → *Diagnóstico* → cobertura de conversões otimizadas.

### Importação GA4 → Ads (alternativa/backup)

Com a vinculação ativa: Ads → Conversões → Nova → **Importar → Propriedades do GA4 → Web** → `generate_lead`.
**Use só uma fonte como primária** (tag do Ads **ou** GA4 importado) para não contar em dobro —
recomendação: tag do Ads primária (mais rápida, com conversões otimizadas) e o evento GA4 importado como **secundário** (observação).

### Auto-tagging (gclid)

Ads → **Administrador → Configurações da conta → Codificação automática → ATIVADA**. Sem isso não há gclid,
o Conversion Linker não grava `_gcl_aw` e as conversões não são atribuídas ao clique.
Modelo sugerido de URL final: `{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_campanha}&utm_term={keyword}&utm_content={creative}`
(defina `{_campanha}` por campanha — esse valor aparece na linha "Ref.:" do WhatsApp).

---

## 6. Meta Pixel

Gerenciador de Eventos → criar Pixel → copiar o ID → `NEXT_PUBLIC_META_PIXEL_ID` / `CONST - Meta Pixel ID` → despausar.
Eventos: `PageView`, `Lead` (com `eventID = lead_id`, pronto para deduplicar se um dia houver CAPI), `Contact`.

---

## 7. Dashboard (Looker Studio)

Fontes: **GA4** + **Google Ads**. Página única, filtros no topo: período, `lead_area`, dispositivo, canal.

| Bloco | Métrica / dimensão |
|---|---|
| KPIs | Sessões, Usuários, `generate_lead` (evento-chave), taxa de conversão (leads/sessões), `click_whatsapp`, `click_phone`, custo/lead (Ads) |
| Conversões por área | `generate_lead` × dimensão `lead_area` (barras) |
| Origem / mídia | Sessões e leads por *Origem/mídia da sessão* e por `traffic_channel` |
| Campanhas | Campanha do Google Ads: impressões, cliques, custo, conversões, CPA |
| Dispositivo | Sessões e leads por *Categoria do dispositivo* |
| Funil | `form_start` → `form_submit` → `generate_lead` por `form_id` |
| Engajamento | `section_view` por `section_id`; `scroll_75`; `blog_read` por `article_slug` |
| Páginas de captação | Leads e taxa por *Página de destino* (`landing_page`) |

---

## 8. Checklist de go-live

- [ ] `NEXT_PUBLIC_GTM_ID` na Vercel (Production + Preview) e redeploy
- [ ] Container importado, `CONST - *` preenchidas, tags despausadas, versão **publicada**
- [ ] **Tag Assistant** (tagassistant.google.com) no domínio final:
  - [ ] Antes de decidir: *Consent* mostra tudo `denied` no primeiro evento; GA4/Ads enviam pings sem cookies
  - [ ] Clicar **Aceitar** → `consent_update` → `granted`; Meta Pixel Base dispara
  - [ ] Recarregar: consentimento já vem `granted` (cookie `nicoli_consent`), sem banner
  - [ ] Clicar **Recusar** (aba anônima): Meta não dispara; `_nicoli_attr` sem gclid
- [ ] Acessar uma página de área com `?gclid=teste123&utm_campaign=teste` → enviar formulário:
  - [ ] `form_submit` → `user_data` (hashes) → `generate_lead` → tag *Ads - Conversão - generate_lead* disparou
  - [ ] Nada de nome/telefone/e-mail em texto puro no dataLayer (aba *Data Layer*)
  - [ ] WhatsApp abriu com a mensagem e a linha `Ref.: <área> · teste`, sem o gclid
- [ ] Clique no botão flutuante → `click_whatsapp` (`link_location=floating`) + Ads secundária + Meta `Contact`
- [ ] Clique em `tel:` → `click_phone`
- [ ] Navegação pelo menu → `navigation_click` + `virtual_page_view` (sem page_view duplicado no GA4)
- [ ] Rolagem → `scroll_25/50/75/100`; seções → `section_view`; post do blog → `blog_read`
- [ ] **GA4 DebugView** (Administrador → DebugView) recebendo os eventos com os parâmetros
- [ ] Banner no celular não cobre o botão do WhatsApp (`--consent-h`) e não causa CLS (Lighthouse)
- [ ] Google Ads: auto-tagging ativo; ações de conversão com status "Gravando conversões" em até 48 h
- [ ] Conversões otimizadas: diagnóstico sem erros após 72 h
- [ ] Política de Privacidade (`/politica-de-privacidade`) cita GA4, Google Ads, Meta, cookies `nicoli_consent` e `_nicoli_attr`

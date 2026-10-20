# Painel de resultados — `/dashboard`

Painel interno com as métricas do **GA4** e do **Google Ads** do site da Nicoli. Só leitura: o painel
nunca altera campanhas nem configurações. Login por senha única.

```
/dashboard (login) ──▶ /api/painel/login       (cookie httpOnly de 30 dias)
                   ├─▶ /api/painel/ga4         ──▶ GA4 Data API (conta de serviço, papel Leitor)
                   └─▶ /api/painel/google-ads  ──▶ Google Ads API (OAuth da M|P, via MCC 603-989-2603)
```

- O `/dashboard` fica **fora** de `app/(site)`: não carrega header, rodapé, GTM nem banner de cookies,
  para as visitas da equipe não entrarem no GA4.
- `noindex` em três camadas: metadata da página, cabeçalho `X-Robots-Tag` e `Disallow` no robots.txt.
- GA4 e Ads são consultados em paralelo e de forma independente: se um falhar, o outro continua.
- Erros do Google nunca chegam crus ao navegador (podem conter dados da conta): o servidor troca por
  mensagens seguras em pt-BR.
- Sem coleta própria (Supabase): os números vêm direto do GA4 e do Ads, que já recebem os eventos pelo GTM
  respeitando o Consent Mode (LGPD).

## Arquivos

| Arquivo | Função |
|---|---|
| `app/(painel)/dashboard/page.tsx` | Página (noindex) |
| `app/api/painel/{login,ga4,google-ads}/route.ts` | Rotas protegidas pela sessão |
| `lib/painel/auth.ts` | Senha + token HMAC (`DASHBOARD_PASSWORD`, `DASHBOARD_SECRET`) |
| `lib/painel/periodo.ts` | Período `?de=&ate=` no fuso de Goiânia + período anterior |
| `lib/painel/ga4.ts` | Data API (2 lotes: visão geral e detalhe) |
| `lib/painel/google-ads.ts` | SearchStream (totais, anterior, série diária, campanhas, conversões por ação) |
| `lib/painel/formato.ts` | Números, moeda e rótulos em pt-BR (áreas, canais, eventos) |
| `components/painel/*` | Interface (KPIs, colunas diárias, rankings, tabela de campanhas) |
| `tests/painel-*.test.mjs` | 61 testes com respostas simuladas (nenhuma chamada real) |

## O que o painel mostra

**Topo:** contatos pelo site (GA4: `generate_lead` + `click_whatsapp` + `click_phone`), investimento e
custo por conversão do Ads. Tudo comparado ao período anterior de mesmo tamanho.

**Google Ads:** investimento, conversões, custo/conversão, cliques, CTR, CPC médio; investimento por dia;
conversões por ação; tabela de campanhas (inclusive pausadas).

**GA4:** sessões, usuários, engajamento, eventos-chave; sessões por dia; ações no site (funil do
`gtm/TRACKING.md`); **páginas que geraram contato** (as 11 áreas aparecem pelo nome); origem das sessões;
páginas de entrada; dispositivos.

> Os números de "contatos" (GA4) e "conversões" (Ads) não batem 1:1: o GA4 conta todos os visitantes
> que aceitaram cookies de análise, de qualquer origem; o Ads conta só cliques de anúncio, com modelo de
> atribuição próprio e conversões fracionárias.

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

Cadastrar em **Production** (e Preview, se quiser testar lá). **Só valem depois de redeploy.**

| Variável | Valor | Onde achar |
|---|---|---|
| `DASHBOARD_PASSWORD` | senha do painel (mín. 8) | definir |
| `DASHBOARD_SECRET` | texto aleatório (mín. 16) | definir |
| `GA4_PROPERTY_ID` | número da propriedade (**não** o `G-`) | GA4 → Administrador → Detalhes da propriedade |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON da conta de serviço `dashboard-ga4@…` | mesmo dos outros painéis (Construbloc) |
| `GOOGLE_ADS_DEVELOPER_TOKEN` / `_CLIENT_ID` / `_CLIENT_SECRET` / `_REFRESH_TOKEN` | iguais aos outros painéis | `.env.local` da Construbloc |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | `603-989-2603` (MCC da M\|P) | fixo |
| `GOOGLE_ADS_CUSTOMER_ID` | conta de anúncios **da Nicoli** (10 dígitos) | Google Ads pela MCC → Contas |
| `GOOGLE_ADS_API_VERSION` | opcional (padrão `v25`) | — |

Passos extras:
1. GA4 da Nicoli → Administrador → Gerenciamento de acesso à propriedade → adicionar o `client_email`
   do JSON como **Leitor**.
2. A conta de anúncios da Nicoli precisa estar vinculada à MCC `603-989-2603`.
3. Redeploy.

## Erros conhecidos

| O painel mostra | Causa |
|---|---|
| "Painel não configurado" no login | faltou redeploy, ou senha < 8 / segredo < 16 |
| Google Ads com o nome da **M\|P** | `GOOGLE_ADS_CUSTOMER_ID` com a conta da agência — trocar pela da Nicoli |
| "conta de administrador (MCC)" | colocaram o ID da MCC em `GOOGLE_ADS_CUSTOMER_ID` |
| "configuração … precisa ser revisada" | ID com formato errado (ex.: o `AW-…` de conversão no lugar da conta) |
| GA4 "Adicione o e-mail dela como Leitor" | conta de serviço sem acesso à propriedade |
| GA4 "use o ID numérico" | colocaram o `G-XXXX` em `GA4_PROPERTY_ID` |
| "Ações no site" vazio | GTM ainda não publicado, ou eventos sem consentimento de análise |

## Conferência depois do deploy

```bash
curl -s -X POST -H 'Content-Type: application/json' -d '{"password":"x"}' https://nicoliadvogados.adv.br/api/painel/login
# → {"error":"Senha incorreta."}
curl -sI https://nicoliadvogados.adv.br/dashboard | grep -i x-robots   # → noindex, nofollow
curl -s -o /dev/null -w "%{http_code}" https://nicoliadvogados.adv.br/api/painel/ga4   # → 401
```

Depois, entrar no painel e conferir: nome da conta no bloco Google Ads = Nicoli (não M|P) e dados do GA4.

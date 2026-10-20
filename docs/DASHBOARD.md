# Painel de resultados — `/dashboard`

Porte do painel da **Sólida Transporte** (mesmos blocos e layout, cores da Nicoli), com o GA4 como
seção extra. Login por senha única. Só leitura: nunca altera campanhas.

```
Site (app/(site)) ──▶ lib/painel/coletor.ts ──sendBeacon──▶ /api/collect ──▶ Supabase (nicoli_sessions, nicoli_events)
       └── lib/tracking.ts (dataLayer → GTM → GA4/Ads) ──espelha contatos──▶ coletor
/dashboard (login) ──▶ funções SQL nicoli_* (service role)
                   ├─▶ Google Ads API (OAuth da M|P, via MCC 603-989-2603)
                   └─▶ GA4 Data API (conta de serviço, papel Leitor)
```

## Blocos (na ordem da página)

1. **Visão geral**: visitas, páginas vistas, tempo por visita e por página, cliques no WhatsApp,
   formulários enviados, cliques no telefone, conversão (visitas → contato), com variação vs. período anterior.
2. **Google Ads**: investimento, impressões, cliques, CTR, CPC, conversões, custo/conversão, conversões por ação, campanhas.
3. **GA4**: sessões, usuários, engajamento, eventos-chave, origem, dispositivo e eventos do site.
4. **Visitas por dia** + **origem** (Google Ads × orgânico × direto × redes).
5. **Novo × recorrente**, **cobertura de consentimento** (banner LGPD) e **funil do formulário**.
6. **Dispositivo**, **contatos por área** e **WhatsApp por botão**.
7. **Contatos pelo site**: formulário/WhatsApp/telefone × área × origem × onde foi clicado.
8. **Jornadas**: o caminho de cada lead (origem → páginas → contato), com filtros.
9. **Páginas** (mais vistas; tempo, rolagem e contatos por página).
10. **Horários** (dia × hora) e **cidades/estados**.
11. **Campanhas no site** (UTM/gclid) e **blog** (visitas, leituras completas, tempo, rolagem).
12. **Tudo que foi clicado** e **ao vivo** (atualiza a cada 30 s).

Filtros na URL: `?periodo=hoje|7d|30d|90d|custom&de=&ate=&origem=google_ads|…` (link compartilhável).

## Coleta própria e LGPD

- Anônima: sessão = UUID aleatório em `sessionStorage`; sem cookie, sem IP gravado (só hash em memória
  para limitar abuso), sem user-agent cru (só família de navegador/sistema). Cidade/estado vêm do header da Vercel.
- **Visitante recorrente** (ID em `localStorage`, 13 meses) só para quem **aceitou cookies de análise**.
  Recusar apaga o ID na hora.
- Espelha do dataLayer só: `click_*`, `generate_lead`, `form_start`, `blog_read`, `consent_update`, e só os
  parâmetros `link_location`, `link_label`, `link_url`, `lead_area`, `form_id`, `article_slug`, `read_trigger`,
  `consent_*` (nunca UTM/gclid por evento, nunca dado do formulário).
- Contatos (WhatsApp, telefone, formulário) são enviados na hora; o resto vai em lotes de 5 s ou ao sair da página.
- Não coleta em `/dashboard` nem `/api`, nem de robôs (`navigator.webdriver`, UA de bot).
- Retenção: `select nicoli_purge(13)` apaga sessões com mais de 13 meses (agendar no pg_cron, opcional).

## Banco (Supabase)

Migração: [`supabase/migrations/0001_nicoli_analytics.sql`](../supabase/migrations/0001_nicoli_analytics.sql)
(idempotente; testada em PGlite por `tests/painel-sql.test.mjs`).

- Projeto compartilhado dos painéis da M|P (`khipnjfbxjgvmjvyxero`), separação **só pelo prefixo `nicoli_`**.
- RLS ligado e **nenhuma** permissão para `anon`/`authenticated`: tabelas e funções só pelo `service_role`.
  (Diferente da Sólida, que libera leitura para `authenticated`: num projeto compartilhado isso exporia os dados.)
- Para aplicar: Supabase → SQL Editor do projeto → colar o arquivo inteiro → Run.

## Variáveis (Vercel → Settings → Environment Variables, Production) + redeploy

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | `https://khipnjfbxjgvmjvyxero.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | igual aos outros painéis (`.env.local` da Construbloc) |
| `DASHBOARD_PASSWORD` / `DASHBOARD_SECRET` | senha (mín. 8) / texto aleatório (mín. 16) |
| `GA4_PROPERTY_ID` | `277798652` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON da conta de serviço `dashboard-ga4@…` (Leitor no GA4 da Nicoli) |
| `GOOGLE_ADS_DEVELOPER_TOKEN` / `_CLIENT_ID` / `_CLIENT_SECRET` / `_REFRESH_TOKEN` | iguais aos outros painéis |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | `603-989-2603` (MCC da M\|P) |
| `GOOGLE_ADS_CUSTOMER_ID` | conta de anúncios da Nicoli (10 dígitos) |

## Erros conhecidos

| O painel mostra | Causa |
|---|---|
| "Coleta própria aguardando conexão" | faltam `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` ou o redeploy |
| KPIs zerados com Supabase configurado | migração não aplicada (as funções `nicoli_*` não existem) |
| "Painel não configurado" no login | senha < 8 / segredo < 16, ou falta redeploy |
| Google Ads com o nome da **M\|P** | `GOOGLE_ADS_CUSTOMER_ID` com a conta da agência |
| "conta de administrador (MCC)" | ID da MCC em `GOOGLE_ADS_CUSTOMER_ID` |
| GA4 "Adicione o e-mail dela como Leitor" | conta de serviço sem acesso à propriedade |
| Cidades vazias | normal em ambiente local (vêm dos headers da Vercel) |

## Testes

`npm test` roda tudo sem chamadas reais: GA4 e Ads com respostas simuladas, validação do lote da coleta,
origem, filtro, jornadas e a migração SQL inteira no PGlite (triggers, agregações e permissões).

Conferência no ar:
```bash
curl -s -o /dev/null -w "%{http_code}" -X POST -H 'Content-Type: text/plain' -A 'Mozilla/5.0 (iPhone)' \
  --data '{"v":1,"sid":"0f8fad5b-d9cb-469f-a165-70867728950e","e":[]}' https://DOMINIO/api/collect   # → 204
curl -sI https://DOMINIO/dashboard | grep -i x-robots                                               # → noindex, nofollow
```

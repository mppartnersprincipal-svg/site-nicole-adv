# Mapeamento de redirects — site antigo (WordPress) → site novo

Gerado em 2026-10-19 a partir da API REST do WordPress (`/wp-json/wp/v2/posts`, 442 posts publicados), do sitemap Yoast (`/sitemap_index.xml`) e dos redirects 301 que o site antigo já fazia (slugs antigos).

Arquivo consumido pelo Next: `content/blog/_redirects.json` (array `{ source, destination }`, usar como `permanent: true`).

## Resumo

| Tipo | Qtde | Regra |
| --- | --- | --- |
| Posts (permalink atual) | 442 | `/<slug>/` → `/blog/<slug>` |
| Posts (permalink antigo com categoria) | 459 | `/<categoria>/<slug>/` → `/blog/<slug>` (estrutura usada antes; ainda há muitos links internos e externos com ela) |
| Slugs antigos de posts | 83 | URLs que o WP/Yoast já redirecionava (301) para o slug atual |
| Páginas institucionais/LPs | 27 | ver tabela abaixo |
| Arquivos de categoria | 6 | `/topicos/<categoria>/` → `/blog` |
| **Total** | **1017** | |

## Observações técnicas

- As origens estão **sem barra final** (`/holding-familiar`). Com `trailingSlash: false` (padrão), o Next primeiro normaliza `/holding-familiar/` → `/holding-familiar` (308) e depois aplica o 301. Validar em preview com `curl -I` se o resultado é 1 ou 2 saltos; se preferir 1 salto, aplicar os redirects na Vercel (`vercel.json`) ou num Proxy.
- Não foram incluídos redirects cujo destino é o mesmo path (só muda a barra final), pois virariam loop: `/politica-de-privacidade/`, `/contato/`, `/blog/`, `/areas-de-atuacao/`. A normalização automática de barra final do Next já cobre esses casos.
- `/blog/` no WP redirecionava para `/blog-e-midias/`; no site novo `/blog` é o próprio blog, então não há regra para ele.
- Arquivos em `/wp-content/uploads/...` (imagens, PDFs) **não** têm redirect. Links externos para essas mídias quebrarão quando o WordPress sair do ar.
- Slugs antigos com maiúscula (ex.: `/FGTS/`, que aparece em links internos) foram incluídos como estão; o matching de `redirects()` do Next diferencia maiúsculas.

## Páginas institucionais, LPs e arquivos

| Origem (antiga) | Destino (novo) | Observação / dúvida |
| --- | --- | --- |
| `/politica-de-privacidade/` | `/politica-de-privacidade` | **Não incluído no JSON** (mesmo path). Conteúdo antigo é de 2021; conferir se o texto novo substitui. |
| `/lgpd-lei-geral-de-protecao-de-dados-pessoais/` | `/lgpd-dados-pessoais` | — |
| `/nosso-escritorio/` | `/quem-somos` | — |
| `/contato/` | `/contato` | **Não incluído no JSON** (mesmo path). — |
| `/contate-nos/` | `/contato` | Slug antigo que o WordPress já redirecionava para /contato/. |
| `/blog-e-midias/` | `/blog` | — |
| `/blog/` | `/blog` | **Não incluído no JSON** (mesmo path). No WP, /blog/ redirecionava para /blog-e-midias/; no site novo /blog é o próprio blog. |
| `/areas-de-atuacao/` | `/areas-de-atuacao` | **Não incluído no JSON** (mesmo path). — |
| `/servicos-pessoas/` | `/areas-de-atuacao` | Página antiga "Serviços Pessoas" era quase toda trabalhista para empregados; poderia ir para /areas-de-atuacao/advogado-trabalhista. Optei pela listagem geral de áreas. |
| `/servicos-empresas/` | `/areas-de-atuacao/trabalhista-empresarial` | Página antiga "Serviços Empresas" tratava de defesa trabalhista para empresas. |
| `/advogado-trabalhista-para-empregador/` | `/areas-de-atuacao/trabalhista-empresarial` | Título antigo era "Direito Empresarial", mas o conteúdo é trabalhista para empregador. |
| `/negocio-seguro/` | `/areas-de-atuacao/trabalhista-empresarial` | LP de produto ("Negócio Seguro": contratos e documentos para evitar processos trabalhistas). Não há equivalente no site novo. |
| `/direito-trabalhista/` | `/areas-de-atuacao/advogado-trabalhista` | Página atendia trabalhadores e empresas; o foco principal (hero) era o trabalhador. Atenção: /direito-trabalhista/<slug>/ era também o permalink antigo dos posts (tratado por regras específicas). |
| `/advogado-de-direito-trabalhista/` | `/areas-de-atuacao/advogado-trabalhista` | — |
| `/trabalhista-empregado/` | `/areas-de-atuacao/advogado-trabalhista` | — |
| `/acoes-trabalhistas/` | `/areas-de-atuacao/advogado-trabalhista` | LP de captação de ações trabalhistas (provavelmente usada em Google Ads). Conferir se as campanhas ativas apontam para ela. |
| `/direito-previdenciario/` | `/areas-de-atuacao/direito-previdenciario` | — |
| `/planejamento-previdenciario/` | `/areas-de-atuacao/direito-previdenciario` | Não há página específica de planejamento previdenciário no site novo. |
| `/gestao-previdenciaria-2-2/` | `/areas-de-atuacao/direito-previdenciario` | Página marcada como "Não Usada" no WP, mas está no sitemap. |
| `/lp-beneficios-inss/` | `/areas-de-atuacao/direito-previdenciario` | LP de campanha (benefícios do INSS). Conferir se ainda há anúncios ativos apontando para ela. |
| `/lp-direito-revisao-de-aposentadoria/` | `/areas-de-atuacao/direito-previdenciario` | LP de campanha (revisão de aposentadoria). Conferir anúncios ativos. |
| `/direito-civil/` | `/areas-de-atuacao/direito-civil` | — |
| `/calculadora-de-ferias/` | `/areas-de-atuacao/advogado-trabalhista` | Ferramenta (calculadora) sem equivalente no site novo; perde-se a funcionalidade. Avaliar recriar a calculadora ou apontar para o post /blog/ferias-do-trabalho. |
| `/calculadora-de-rescisao-de-contrato-clt/` | `/areas-de-atuacao/advogado-trabalhista` | Ferramenta (calculadora) sem equivalente; alternativa: /blog/acerto-trabalhista. |
| `/trabalhe-conosco/` | `/contato` | Sem página "Trabalhe conosco" no site novo. |
| `/obrigado-beneficiario/` | `/contato` | Página de obrigado (fora do sitemap). Se as conversões do Google Ads dependem dessas URLs, recriar as páginas de obrigado em vez de redirecionar. |
| `/obrigado-aposentado/` | `/contato` | Página de obrigado (fora do sitemap). Mesma observação acima. |
| `/obrigado-empregador/` | `/contato` | Página de obrigado (fora do sitemap). Mesma observação acima. |
| `/obrigado-empregado/` | `/contato` | Página de obrigado (fora do sitemap). Mesma observação acima. |
| `/obrigado-por-seu-contato-sobre-acoes-trabalhistas/` | `/contato` | Página de obrigado (fora do sitemap). Mesma observação acima. |
| `/author/luis/` | `/quem-somos` | Arquivo de autor do WP; não há página de autor no site novo. |
| `/topicos/direito-trabalhista/` | `/blog` | Arquivo de categoria; se o blog novo tiver filtro por área (ex.: /blog?area=advogado-trabalhista), apontar para ele. |
| `/topicos/previdenciario/` | `/blog` | Idem. |
| `/topicos/direito-do-agronegocio/` | `/blog` | Idem. |
| `/topicos/direito-empresarial/` | `/blog` | Idem. |
| `/topicos/direito-de-familia/` | `/blog` | Idem. |
| `/topicos/noticias/` | `/blog` | Idem. |

## Slugs antigos de posts (já redirecionados pelo WordPress)

| Origem (antiga) | Destino (novo) | Observação |
| --- | --- | --- |
| `/direito-do-agronegocio/advogado-do-agronegocio-como-encontrar-o-melhor` | `/blog/advogado-agronegocio` | Retornava 404 no site antigo; inferido pelo slug (o WP redirecionava /o-que-faz-um-advogado-de-direito-rural/ para o mesmo post). |
| `/previdenciario/revisao-da-vida-toda` | `/blog/revisao-da-vida-toda-pedido-administrativo-antes-acao-judicial` | No WP redirecionava para um anexo (imagem); apontado para o post mais próximo do tema. |
| `/planejamento-patrimonial-tudo-o-que-voce-precisa-saber-para-proteger-seu-patrimonio` | `/blog/como-fazer-planejamento-sucessorio` | — |
| `/pejotizacao-do-trabalho` | `/blog/contratacao-pj` | — |
| `/demissao-por-justa-causa-como-contestar-e-proteger-seus-direitos` | `/blog/demissao-por-justa-causa` | — |
| `/tudo-sobre-fgts` | `/blog/fgts` | — |
| `/13o-salario` | `/blog/13-salario` | — |
| `/o-que-e-intrajornada` | `/blog/intervalo-intrajornada` | — |
| `/print-vale-como-prova-na-justica-descubra-o-que-diz-a-lei` | `/blog/print-vale-como-prova-judicial` | — |
| `/como-calcular-sua-rescisao` | `/blog/acerto-trabalhista` | — |
| `/vale-refeicao-no-home-office` | `/blog/beneficios-trabalhistas-no-home-office` | — |
| `/contrato-temporario` | `/blog/trabalho-temporario` | — |
| `/o-que-faz-um-advogado-de-direito-rural` | `/blog/advogado-agronegocio` | — |
| `/FGTS` | `/blog/fgts` | — |
| `/acidente-trajeto-veiculo-empresa` | `/blog/acidente-de-trajeto-empresa` | — |
| `/11-regras-essenciais-sobre-o-decimo-terceiro-salario` | `/blog/13-salario` | — |
| `/estabilidade-gestante-contrato-experiencia` | `/blog/direitos-trabalhistas-da-mulher-gestante` | — |
| `/nao-trabalho-de-carteira-assinada-quais-sao-meus-direitos` | `/blog/trabalho-sem-carteira-assinada` | — |
| `/fgts-quando-voce-tem-direito-ao-saque-e-como-funciona-o-processo` | `/blog/fgts` | — |
| `/direito-trabalhista/como-solicitar-seguro-desemprego` | `/blog/seguro-desemprego` | — |
| `/saiba-todas-as-regras-do-13o-salario` | `/blog/13-salario` | — |
| `/quando-um-trabalho-e-considerado-vinculo-empregaticio-na-clt` | `/blog/contratacao-pj` | — |
| `/direitos-e-deveres-do-trabalhador-remoto-o-que-diz-a-legislacao-atual` | `/blog/home-office` | — |
| `/horas-extras-como-calcular-e-garantir-seus-direitos` | `/blog/horas-extras` | — |
| `/saude-mental-no-trabalho-como-cultivar-uma-rotina-mais-saudavel-e-menos-estressante` | `/blog/saude-mental-no-trabalho` | — |
| `/trabalhoxterceirizacao` | `/blog/terceirizacao-ou-trabalho-temporario` | — |
| `/ferias-atrasadas-saiba-exatamente-o-que-voce-tem-direito-a-receber` | `/blog/ferias-atrasadas` | — |
| `/tudo-sobre-ferias` | `/blog/ferias-do-trabalho` | — |
| `/transtornos-mentais-no-trabalho-saiba-quais-sao-seus-direitos-e-como-se-proteger` | `/blog/saude-mental-no-trabalho` | — |
| `/pagamento-de-trabalho-no-feriado-como-funciona` | `/blog/trabalhar-no-feriado` | — |
| `/aviso-de-ferias-coletivas` | `/blog/ferias-coletivas` | — |
| `/direito-trabalhista/o-que-e-intrajornada` | `/blog/intervalo-intrajornada` | — |
| `/direito-trabalhista/pensao-por-morte-como-funciona-e-quem-pode-receber` | `/blog/pensao-por-morte` | — |
| `/direito-trabalhista/aposentadoria-especial-profissoes-e-regras` | `/blog/aposentadoria-especial` | — |
| `/direito-trabalhista/tudo-sobre-ferias` | `/blog/ferias-do-trabalho` | — |
| `/direito-trabalhista/saiba-todas-as-regras-do-13o-salario` | `/blog/13-salario` | — |
| `/direito-trabalhista/tudo-sobre-fgts` | `/blog/fgts` | — |
| `/direito-trabalhista/acidentes-de-trabalho-direitos-responsabilidades-e-recursos-legais` | `/blog/acidente-do-trabalho` | — |
| `/direito-trabalhista/a-importancia-da-promocao-de-um-ambiente-de-trabalho-livre-de-acidentes` | `/blog/acidente-do-trabalho` | — |
| `/direito-trabalhista/voce-sabe-como-funciona-o-banco-de-horas` | `/blog/banco-de-horas` | — |
| `/direito-trabalhista/substituir-horas-extras-por-banco-de-horas` | `/blog/banco-de-horas` | — |
| `/direito-trabalhista/a-contratacao-de-funcionarios-pessoa-juridica-pj-e-uma-pratica-comum-em-muitas-empresas-especialmente-em-setores-como-tecnologia-consultoria-e-servicos-no-entanto-e-importante-entender-que-exist` | `/blog/contratacao-pj` | — |
| `/direito-trabalhista/como-funciona-o-seguro-desemprego` | `/blog/seguro-desemprego` | — |
| `/direito-trabalhista/quando-um-trabalho-e-considerado-vinculo-empregaticio-na-clt` | `/blog/contratacao-pj` | — |
| `/direito-trabalhista/veja-os-direitos-garantidos-pela-clt-para-quem-trabalha-no-feriado` | `/blog/trabalhar-no-feriado` | — |
| `/direito-trabalhista/feriado-empregado-home-office` | `/blog/beneficios-trabalhistas-no-home-office` | — |
| `/direito-trabalhista/controle-de-ponto-para-empregados-externos` | `/blog/ponto-eletronico` | — |
| `/direito-trabalhista/ajuda-de-custo-home-office` | `/blog/beneficios-trabalhistas-no-home-office` | — |
| `/direito-trabalhista/entenda-tudo-sobre-assedio-moral-no-trabalho` | `/blog/assedio-no-trabalho` | — |
| `/direito-trabalhista/acidente-no-trabalho` | `/blog/acidente-do-trabalho` | — |
| `/direito-trabalhista/direitos-dos-trabalhadores-insalubres` | `/blog/adicional-de-insalubridade` | — |
| `/direito-trabalhista/o-que-e-acidente-de-trabalho-e-como-lidar` | `/blog/acidente-do-trabalho` | — |
| `/direito-trabalhista/o-que-pode-dar-demissao-por-justa-causa` | `/blog/demissao-por-justa-causa` | — |
| `/direito-trabalhista/o-que-e-rescisao-indireta-do-contrato-de-trabalho` | `/blog/rescisao-indireta` | — |
| `/direito-trabalhista/rescisao-do-contrato-de-trabalho` | `/blog/direitos-na-rescisao-do-contrato-de-trabalho` | — |
| `/direito-trabalhista/como-calcular-sua-rescisao` | `/blog/direitos-na-rescisao-do-contrato-de-trabalho` | — |
| `/direito-trabalhista/pejotizacao-apos-a-reforma-trabalhista` | `/blog/contratacao-pj` | — |
| `/direito-trabalhista/como-lidar-com-a-saude-mental-no-trabalho-estrategias-para-empresas-e-funcionarios` | `/blog/saude-mental-no-trabalho` | — |
| `/direito-trabalhista/entendendo-os-tipos-de-aposentadoria-do-inss` | `/blog/tipos-de-aposentadoria-do-inss` | — |
| `/direito-trabalhista/questoes-medicas-como-tratar-no-trabalho` | `/blog/atestado-medico` | — |
| `/previdenciario/quem-esta-afastado-do-trabalho-recebe-o-13o-salario-entenda-seus-direitos` | `/blog/13-salario` | — |
| `/direito-trabalhista/seus-direitos-apos-pedir-demissao` | `/blog/pedi-demissao-direitos-a-receber` | — |
| `/direito-trabalhista/aposentadoria-rural-regras-e-beneficios` | `/blog/aposentadoria-rural` | — |
| `/direito-trabalhista/pejotizacao-do-trabalho` | `/blog/contratacao-pj` | — |
| `/direito-trabalhista/novo-calculo-de-horas-extras` | `/blog/horas-extras` | — |
| `/direito-trabalhista/nao-trabalho-de-carteira-assinada-quais-sao-meus-direitos` | `/blog/trabalho-sem-carteira-assinada` | — |
| `/direito-trabalhista/13-salario-pode-ser-parcelado` | `/blog/13-salario` | — |
| `/direito-do-agronegocio/o-que-faz-um-advogado-de-direito-rural` | `/blog/advogado-agronegocio` | — |
| `/direito-trabalhista/trabalhar-com-carteira-assinada-vantagens-e-desvantagens` | `/blog/trabalho-sem-carteira-assinada` | — |
| `/direito-trabalhista/fgts-nao-esta-sendo-depositado` | `/blog/empresa-nao-deposita-fgts` | — |
| `/direito-trabalhista/11-regras-essenciais-sobre-o-decimo-terceiro-salario` | `/blog/13-salario` | — |
| `/direito-trabalhista/pagamento-das-ferias` | `/blog/ferias-do-trabalho` | — |
| `/direito-trabalhista/regras-do-trabalho-hibrido` | `/blog/trabalho-hibrido` | — |
| `/direito-trabalhista/vale-refeicao-no-home-office` | `/blog/beneficios-trabalhistas-no-home-office` | — |
| `/direito-trabalhista/pj-gera-vinculo-de-emprego` | `/blog/contratacao-pj` | — |
| `/direito-trabalhista/controle-de-ponto-para-motoristas` | `/blog/ponto-eletronico` | — |
| `/direito-trabalhista/mudancas-saque-aniversario-fgts` | `/blog/fgts` | — |
| `/direito-trabalhista/nova-portaria-do-ponto-eletronico` | `/blog/ponto-eletronico` | — |
| `/direito-trabalhista/o-que-devo-receber-quando-sou-demitido` | `/blog/demissao-sem-justa-causa` | — |
| `/tag/descanso-semanal-remunerado` | `/blog/descanso-semanal-remunerado` | — |
| `/direito-trabalhista/aposentadoria-especial` | `/blog/aposentadoria-especial` | — |
| `/acidente-do-trabalho/acidente-do-trabalho` | `/blog/acidente-do-trabalho` | — |
| `/pagamento-de-salario-por-pix/pagamento-de-salario-por-pix` | `/blog/pagamento-de-salario-por-pix` | — |

Links internos antigos **sem destino** (não viraram redirect): `/direito-trabalhista/cipa-em-home-office/` (o WP redirecionava para um anexo de imagem; não existe post sobre CIPA — o link foi removido do corpo de 4 posts, mantendo o texto) e `/advogado-direito-familia/` (já dava 404; no corpo do post foi apontado para `/areas-de-atuacao/familia-e-sucessoes`).

## Posts

Cada post também tem o redirect `/<categoria>/<slug>/` (categorias: `direito-trabalhista`, `previdenciario`, `noticias`, `direito-empresarial`, `direito-do-agronegocio`, `direito-de-familia`).

| Origem (antiga) | Destino (novo) | Área mapeada | Observação |
| --- | --- | --- | --- |
| `/desconto-de-pensao-alimenticia-no-salario/` | `/blog/desconto-de-pensao-alimenticia-no-salario` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista) |
| `/advogado-agronegocio/` | `/blog/advogado-agronegocio` | `agronegocio` | — |
| `/holding-familiar/` | `/blog/holding-familiar` | `holding-e-planejamento-societario` | área pelo tema (categoria original: Direito do Agronegócio) |
| `/como-fazer-planejamento-sucessorio/` | `/blog/como-fazer-planejamento-sucessorio` | `familia-e-sucessoes` | — |
| `/direitos-na-terceirizacao-do-trabalho/` | `/blog/direitos-na-terceirizacao-do-trabalho` | `advogado-trabalhista` | — |
| `/saude-mental-no-trabalho/` | `/blog/saude-mental-no-trabalho` | `advogado-trabalhista` | — |
| `/pensao-por-morte/` | `/blog/pensao-por-morte` | `direito-previdenciario` | — |
| `/verbas-remuneratorias-indenizatorias/` | `/blog/verbas-remuneratorias-indenizatorias` | `advogado-trabalhista` | — |
| `/atestado-medico/` | `/blog/atestado-medico` | `advogado-trabalhista` | — |
| `/adicional-de-periculosidade-e-insalubridade/` | `/blog/adicional-de-periculosidade-e-insalubridade` | `advogado-trabalhista` | — |
| `/trabalho-aos-domingos/` | `/blog/trabalho-aos-domingos` | `advogado-trabalhista` | — |
| `/trabalhar-no-feriado/` | `/blog/trabalhar-no-feriado` | `advogado-trabalhista` | — |
| `/assedio-sexual-no-trabalho/` | `/blog/assedio-sexual-no-trabalho` | `advogado-trabalhista` | — |
| `/aposentadoria-por-tempo-de-contribuicao/` | `/blog/aposentadoria-por-tempo-de-contribuicao` | `direito-previdenciario` | — |
| `/aposentadoria-invalidez/` | `/blog/aposentadoria-invalidez` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/acerto-trabalhista/` | `/blog/acerto-trabalhista` | `advogado-trabalhista` | — |
| `/principais-direitos-trabalhistas/` | `/blog/principais-direitos-trabalhistas` | `advogado-trabalhista` | — |
| `/print-vale-como-prova-judicial/` | `/blog/print-vale-como-prova-judicial` | `advogado-trabalhista` | — |
| `/licenca-paternidade/` | `/blog/licenca-paternidade` | `advogado-trabalhista` | — |
| `/descanso-semanal-remunerado/` | `/blog/descanso-semanal-remunerado` | `advogado-trabalhista` | — |
| `/intervalo-intrajornada/` | `/blog/intervalo-intrajornada` | `advogado-trabalhista` | — |
| `/intervalo-interjornada/` | `/blog/intervalo-interjornada` | `advogado-trabalhista` | — |
| `/jornada-de-trabalho/` | `/blog/jornada-de-trabalho` | `advogado-trabalhista` | — |
| `/reforma-trabalhista/` | `/blog/reforma-trabalhista` | `advogado-trabalhista` | — |
| `/cat-comunicacao-de-acidente-de-trabalho/` | `/blog/cat-comunicacao-de-acidente-de-trabalho` | `advogado-trabalhista` | — |
| `/acidente-de-trajeto-empresa/` | `/blog/acidente-de-trajeto-empresa` | `advogado-trabalhista` | — |
| `/tipos-de-aposentadoria-do-inss/` | `/blog/tipos-de-aposentadoria-do-inss` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/13-salario/` | `/blog/13-salario` | `advogado-trabalhista` | — |
| `/trabalho-temporario/` | `/blog/trabalho-temporario` | `advogado-trabalhista` | — |
| `/fgts/` | `/blog/fgts` | `advogado-trabalhista` | — |
| `/seguro-desemprego/` | `/blog/seguro-desemprego` | `advogado-trabalhista` | — |
| `/demissao-por-acordo-trabalhista/` | `/blog/demissao-por-acordo-trabalhista` | `advogado-trabalhista` | — |
| `/trabalho-hibrido/` | `/blog/trabalho-hibrido` | `advogado-trabalhista` | — |
| `/ferias-indenizadas/` | `/blog/ferias-indenizadas` | `advogado-trabalhista` | — |
| `/vender-ferias/` | `/blog/vender-ferias` | `advogado-trabalhista` | — |
| `/horas-extras-no-home-office/` | `/blog/horas-extras-no-home-office` | `advogado-trabalhista` | — |
| `/contratacao-pj/` | `/blog/contratacao-pj` | `advogado-trabalhista` | — |
| `/ponto-eletronico/` | `/blog/ponto-eletronico` | `advogado-trabalhista` | — |
| `/auxilio-doenca/` | `/blog/auxilio-doenca` | `direito-previdenciario` | — |
| `/aposentadoria-especial/` | `/blog/aposentadoria-especial` | `direito-previdenciario` | — |
| `/tudo-sobre-o-aviso-previo/` | `/blog/tudo-sobre-o-aviso-previo` | `advogado-trabalhista` | — |
| `/acidente-de-trabalho-no-home-office/` | `/blog/acidente-de-trabalho-no-home-office` | `advogado-trabalhista` | — |
| `/beneficios-trabalhistas-no-home-office/` | `/blog/beneficios-trabalhistas-no-home-office` | `advogado-trabalhista` | — |
| `/regras-trabalhistas-para-operadores-de-caixa/` | `/blog/regras-trabalhistas-para-operadores-de-caixa` | `advogado-trabalhista` | — |
| `/ferias-coletivas/` | `/blog/ferias-coletivas` | `advogado-trabalhista` | — |
| `/encontrar-advogado-trabalhista/` | `/blog/encontrar-advogado-trabalhista` | `advogado-trabalhista` | — |
| `/auxilio-doenca-acidentario/` | `/blog/auxilio-doenca-acidentario` | `direito-previdenciario` | — |
| `/auxilio-acidente/` | `/blog/auxilio-acidente` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/provar-a-doenca-causada-pelo-trabalho/` | `/blog/provar-a-doenca-causada-pelo-trabalho` | `advogado-trabalhista` | — |
| `/demitido-com-doenca-ocupacional/` | `/blog/demitido-com-doenca-ocupacional` | `advogado-trabalhista` | — |
| `/indenizacao-por-doenca-ocupacional/` | `/blog/indenizacao-por-doenca-ocupacional` | `advogado-trabalhista` | — |
| `/home-office/` | `/blog/home-office` | `advogado-trabalhista` | — |
| `/demitido-durante-tratamento-medico/` | `/blog/demitido-durante-tratamento-medico` | `advogado-trabalhista` | — |
| `/ferias-vencidas/` | `/blog/ferias-vencidas` | `advogado-trabalhista` | — |
| `/contratos-de-trabalho/` | `/blog/contratos-de-trabalho` | `advogado-trabalhista` | — |
| `/trabalho-sem-carteira-assinada/` | `/blog/trabalho-sem-carteira-assinada` | `advogado-trabalhista` | — |
| `/sindrome-de-burnout-direitos-trabalhistas/` | `/blog/sindrome-de-burnout-direitos-trabalhistas` | `advogado-trabalhista` | — |
| `/direitos-trabalhistas-da-mulher-gestante/` | `/blog/direitos-trabalhistas-da-mulher-gestante` | `advogado-trabalhista` | — |
| `/prorrogar-divida-rural/` | `/blog/prorrogar-divida-rural` | `agronegocio` | várias categorias (Direito do Agronegócio + Direito Empresarial) |
| `/doenca-do-trabalho/` | `/blog/doenca-do-trabalho` | `direito-previdenciario` | várias categorias (Direito Previdenciário + Direito Trabalhista) |
| `/assedio-no-trabalho/` | `/blog/assedio-no-trabalho` | `advogado-trabalhista` | — |
| `/acidente-do-trabalho/` | `/blog/acidente-do-trabalho` | `advogado-trabalhista` | — |
| `/atraso-de-salario/` | `/blog/atraso-de-salario` | `advogado-trabalhista` | — |
| `/empresa-nao-deposita-fgts/` | `/blog/empresa-nao-deposita-fgts` | `advogado-trabalhista` | — |
| `/demissao-sem-justa-causa/` | `/blog/demissao-sem-justa-causa` | `advogado-trabalhista` | — |
| `/estabilidade-no-emprego/` | `/blog/estabilidade-no-emprego` | `advogado-trabalhista` | — |
| `/banco-de-horas/` | `/blog/banco-de-horas` | `advogado-trabalhista` | — |
| `/ferias-do-trabalho/` | `/blog/ferias-do-trabalho` | `advogado-trabalhista` | — |
| `/reverter-a-justa-causa/` | `/blog/reverter-a-justa-causa` | `advogado-trabalhista` | — |
| `/salario-maternidade/` | `/blog/salario-maternidade` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/licenca-maternidade/` | `/blog/licenca-maternidade` | `direito-previdenciario` | várias categorias (Direito Previdenciário + Direito Trabalhista) |
| `/direitos-de-criancas-autistas/` | `/blog/direitos-de-criancas-autistas` | `familia-e-sucessoes` | várias categorias (Direito de Família + Direito Previdenciário) |
| `/adicional-de-periculosidade/` | `/blog/adicional-de-periculosidade` | `advogado-trabalhista` | — |
| `/adicional-de-insalubridade/` | `/blog/adicional-de-insalubridade` | `advogado-trabalhista` | — |
| `/horas-extras/` | `/blog/horas-extras` | `advogado-trabalhista` | — |
| `/aposentadoria-rural/` | `/blog/aposentadoria-rural` | `direito-previdenciario` | várias categorias (Direito do Agronegócio + Direito Trabalhista) |
| `/direitos-trabalhistas-do-trabalhador-rural/` | `/blog/direitos-trabalhistas-do-trabalhador-rural` | `advogado-trabalhista` | — |
| `/direitos-do-funcionario-afastado/` | `/blog/direitos-do-funcionario-afastado` | `advogado-trabalhista` | — |
| `/rescisao-indireta/` | `/blog/rescisao-indireta` | `advogado-trabalhista` | — |
| `/direitos-na-rescisao-do-contrato-de-trabalho/` | `/blog/direitos-na-rescisao-do-contrato-de-trabalho` | `advogado-trabalhista` | — |
| `/demissao-por-justa-causa/` | `/blog/demissao-por-justa-causa` | `advogado-trabalhista` | — |
| `/pedi-demissao-direitos-a-receber/` | `/blog/pedi-demissao-direitos-a-receber` | `advogado-trabalhista` | — |
| `/blindagem-juridica-no-transporte-3-pontos-que-nao-podem-faltar-nos-seus-contratos-e-seguros/` | `/blog/blindagem-juridica-no-transporte-3-pontos-que-nao-podem-faltar-nos-seus-contratos-e-seguros` | `direito-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/clausulas-essenciais-para-contratos-com-fornecedores-no-varejo/` | `/blog/clausulas-essenciais-para-contratos-com-fornecedores-no-varejo` | `direito-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-a-estruturacao-juridica-de-cooperativas-e-associacoes-impulsiona-o-agronegocio/` | `/blog/como-a-estruturacao-juridica-de-cooperativas-e-associacoes-impulsiona-o-agronegocio` | `agronegocio` | área pelo tema (categoria original: Direito Trabalhista) |
| `/seu-bonus-de-produtividade-deve-sim-entrar-no-13o-e-nas-ferias/` | `/blog/seu-bonus-de-produtividade-deve-sim-entrar-no-13o-e-nas-ferias` | `advogado-trabalhista` | — |
| `/contratos-informais-valem-quando-a-conversa-de-whatsapp-vira-prova-judicial/` | `/blog/contratos-informais-valem-quando-a-conversa-de-whatsapp-vira-prova-judicial` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/demissao-durante-tratamento-medico-e-legal/` | `/blog/demissao-durante-tratamento-medico-e-legal` | `advogado-trabalhista` | — |
| `/como-funciona-a-adocao-no-brasil/` | `/blog/como-funciona-a-adocao-no-brasil` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-funciona-a-adocao-no-brasil-aspectos-legais-e-processo/` | `/blog/como-funciona-a-adocao-no-brasil-aspectos-legais-e-processo` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista); sem imagem de capa |
| `/aposentadoria-por-tempo-de-contribuicao-requisitos-e-como-calcular/` | `/blog/aposentadoria-por-tempo-de-contribuicao-requisitos-e-como-calcular` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/diferencas-entre-uniao-estavel-e-casamento/` | `/blog/diferencas-entre-uniao-estavel-e-casamento` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista) |
| `/dia-mundial-da-saude/` | `/blog/dia-mundial-da-saude` | `direito-da-saude` | área pelo tema (categoria original: Direito Trabalhista) |
| `/e-justo-pagar-pelos-erros-do-inss/` | `/blog/e-justo-pagar-pelos-erros-do-inss` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/saiba-como-a-clausula-de-sub-rogacao-pode-proteger-seu-patrimonio-particular/` | `/blog/saiba-como-a-clausula-de-sub-rogacao-pode-proteger-seu-patrimonio-particular` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista) |
| `/o-medicamento-mais-caro-do-mundo-custa-r-6-milhoes/` | `/blog/o-medicamento-mais-caro-do-mundo-custa-r-6-milhoes` | `direito-da-saude` | área pelo tema (categoria original: Direito Trabalhista) |
| `/direitos-dos-avos-convivencia-e-papel-na-familia/` | `/blog/direitos-dos-avos-convivencia-e-papel-na-familia` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista) |
| `/nova-regulamentacao-do-trabalho-aos-domingos-e-feriados-o-que-muda-a-partir-de-julho-de-2025/` | `/blog/nova-regulamentacao-do-trabalho-aos-domingos-e-feriados-o-que-muda-a-partir-de-julho-de-2025` | `advogado-trabalhista` | — |
| `/revisao-da-aposentadoria-quando-vale-a-pena-pedir/` | `/blog/revisao-da-aposentadoria-quando-vale-a-pena-pedir` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/impacto-das-redes-sociais-nas-disputas-familiares/` | `/blog/impacto-das-redes-sociais-nas-disputas-familiares` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista) |
| `/responsabilidade-civil-em-erros-medicos/` | `/blog/responsabilidade-civil-em-erros-medicos` | `direito-da-saude` | área pelo tema (categoria original: Direito Trabalhista) |
| `/negativa-de-plano-de-saude-o-que-fazer/` | `/blog/negativa-de-plano-de-saude-o-que-fazer` | `direito-da-saude` | área pelo tema (categoria original: Direito Trabalhista) |
| `/o-que-o-filme-o-oleo-de-lorenzo-ensina-sobre-direito-da-saude/` | `/blog/o-que-o-filme-o-oleo-de-lorenzo-ensina-sobre-direito-da-saude` | `direito-da-saude` | área pelo tema (categoria original: Direito Trabalhista) |
| `/guarda-unilateral-x-guarda-compartilhada-entenda-as-diferencas-e-qual-e-a-melhor-opcao/` | `/blog/guarda-unilateral-x-guarda-compartilhada-entenda-as-diferencas-e-qual-e-a-melhor-opcao` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista) |
| `/os-erros-mais-comuns-ao-lidar-com-um-divorcio-e-como-evita-los/` | `/blog/os-erros-mais-comuns-ao-lidar-com-um-divorcio-e-como-evita-los` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista) |
| `/o-que-nao-pode-faltar-em-um-contrato-de-trabalho/` | `/blog/o-que-nao-pode-faltar-em-um-contrato-de-trabalho` | `advogado-trabalhista` | — |
| `/5-direitos-essenciais-que-todo-beneficiario-de-plano-de-saude-precisa-conhecer/` | `/blog/5-direitos-essenciais-que-todo-beneficiario-de-plano-de-saude-precisa-conhecer` | `direito-da-saude` | área pelo tema (categoria original: Direito Trabalhista) |
| `/comprar-um-imovel-em-2025-dicas-essenciais-para-realizar-seu-sonho-com-seguranca/` | `/blog/comprar-um-imovel-em-2025-dicas-essenciais-para-realizar-seu-sonho-com-seguranca` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/direitos-dos-estagiarios-o-que-empresas-e-estudantes-precisam-saber/` | `/blog/direitos-dos-estagiarios-o-que-empresas-e-estudantes-precisam-saber` | `advogado-trabalhista` | — |
| `/lgpd-no-trabalho-como-seus-dados-sao-protegidos/` | `/blog/lgpd-no-trabalho-como-seus-dados-sao-protegidos` | `advogado-trabalhista` | — |
| `/metas-de-vendas-no-natal-quais-sao-os-limites-para-as-empresas/` | `/blog/metas-de-vendas-no-natal-quais-sao-os-limites-para-as-empresas` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-evitar-golpes-nas-compras-de-final-de-ano/` | `/blog/como-evitar-golpes-nas-compras-de-final-de-ano` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/compras-online-e-direito-de-arrependimento-como-garantir-seus-direitos-ao-comprar-pela-internet/` | `/blog/compras-online-e-direito-de-arrependimento-como-garantir-seus-direitos-ao-comprar-pela-internet` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/direitos-do-passageiro-em-viagens-como-se-proteger-de-cancelamentos-e-overbooking/` | `/blog/direitos-do-passageiro-em-viagens-como-se-proteger-de-cancelamentos-e-overbooking` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-organizar-escalas-de-plantao-no-fim-do-ano-dicas-e-regras-importantes/` | `/blog/como-organizar-escalas-de-plantao-no-fim-do-ano-dicas-e-regras-importantes` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/produto-com-defeito-como-trocar-ou-solicitar-reembolso-e-garantir-seus-direitos/` | `/blog/produto-com-defeito-como-trocar-ou-solicitar-reembolso-e-garantir-seus-direitos` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/promocoes-de-final-de-ano-como-evitar-fraudes-e-praticas-abusivas-nas-compras-de-natal/` | `/blog/promocoes-de-final-de-ano-como-evitar-fraudes-e-praticas-abusivas-nas-compras-de-natal` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/direitos-de-ferias-no-final-do-ano-tudo-o-que-voce-precisa-saber-para-planejar-seu-recesso/` | `/blog/direitos-de-ferias-no-final-do-ano-tudo-o-que-voce-precisa-saber-para-planejar-seu-recesso` | `advogado-trabalhista` | — |
| `/black-friday-e-seus-direitos-trabalhistas-como-se-preparar-para-a-data-sem-perder-seus-direitos/` | `/blog/black-friday-e-seus-direitos-trabalhistas-como-se-preparar-para-a-data-sem-perder-seus-direitos` | `advogado-trabalhista` | — |
| `/posso-acumular-aposentadoria-e-pensao-por-morte-entenda-em-quais-casos-isso-e-permitido/` | `/blog/posso-acumular-aposentadoria-e-pensao-por-morte-entenda-em-quais-casos-isso-e-permitido` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/ferias-atrasadas/` | `/blog/ferias-atrasadas` | `advogado-trabalhista` | — |
| `/aposentadoria-como-ter-seguranca-nos-seus-direitos-trabalhistas/` | `/blog/aposentadoria-como-ter-seguranca-nos-seus-direitos-trabalhistas` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/salario-bruto-vs-salario-liquido-voce-sabe-a-diferenca/` | `/blog/salario-bruto-vs-salario-liquido-voce-sabe-a-diferenca` | `advogado-trabalhista` | — |
| `/doencas-graves-e-seus-direitos/` | `/blog/doencas-graves-e-seus-direitos` | `advogado-trabalhista` | — |
| `/acidente-de-trabalho-entenda-a-estabilidade-e-a-importancia-da-emissao-da-cat/` | `/blog/acidente-de-trabalho-entenda-a-estabilidade-e-a-importancia-da-emissao-da-cat` | `advogado-trabalhista` | — |
| `/intervalo-intrajornada-como-funciona-o-direito-ao-descanso-e-alimentacao-durante-o-expediente/` | `/blog/intervalo-intrajornada-como-funciona-o-direito-ao-descanso-e-alimentacao-durante-o-expediente` | `advogado-trabalhista` | — |
| `/trabalhar-aos-domingos-e-feriados-quais-sao-seus-direitos-e-como-funciona-a-remuneracao/` | `/blog/trabalhar-aos-domingos-e-feriados-quais-sao-seus-direitos-e-como-funciona-a-remuneracao` | `advogado-trabalhista` | — |
| `/quem-pode-emitir-a-cat-entenda-seus-direitos-e-responsabilidades/` | `/blog/quem-pode-emitir-a-cat-entenda-seus-direitos-e-responsabilidades` | `advogado-trabalhista` | — |
| `/o-que-mudou-com-a-reforma-trabalhista-2/` | `/blog/o-que-mudou-com-a-reforma-trabalhista-2` | `advogado-trabalhista` | — |
| `/apoio-funcionarios-com-cancer/` | `/blog/apoio-funcionarios-com-cancer` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/horas-extras-ou-banco-de-horas-saiba-como-fazer-a-escolha-certa/` | `/blog/horas-extras-ou-banco-de-horas-saiba-como-fazer-a-escolha-certa` | `advogado-trabalhista` | — |
| `/quais-sao-seus-direitos-sobre-intervalos-de-descanso-no-trabalho/` | `/blog/quais-sao-seus-direitos-sobre-intervalos-de-descanso-no-trabalho` | `advogado-trabalhista` | — |
| `/medico-qual-e-a-melhor-escolha-para-sua-carreira-pj-ou-clt/` | `/blog/medico-qual-e-a-melhor-escolha-para-sua-carreira-pj-ou-clt` | `advogado-trabalhista` | — |
| `/trabalha-em-condicoes-perigosas-saiba-quais-sao-seus-direitos-e-como-se-proteger/` | `/blog/trabalha-em-condicoes-perigosas-saiba-quais-sao-seus-direitos-e-como-se-proteger` | `advogado-trabalhista` | — |
| `/o-que-pode-ser-descontado-do-seu-salario-entenda-os-seus-direitos/` | `/blog/o-que-pode-ser-descontado-do-seu-salario-entenda-os-seus-direitos` | `advogado-trabalhista` | — |
| `/contribuicao-sindical-o-que-e-obrigatorio-e-o-que-voce-pode-escolher-pagar/` | `/blog/contribuicao-sindical-o-que-e-obrigatorio-e-o-que-voce-pode-escolher-pagar` | `advogado-trabalhista` | — |
| `/acordo-coletivo-x-convencao-coletiva-entenda-as-diferencas-e-como-impactam-seus-direitos-2/` | `/blog/acordo-coletivo-x-convencao-coletiva-entenda-as-diferencas-e-como-impactam-seus-direitos-2` | `advogado-trabalhista` | — |
| `/ergonomia-no-home-office-dicas-para-montar-um-espaco-de-trabalho-saudavel-em-casa/` | `/blog/ergonomia-no-home-office-dicas-para-montar-um-espaco-de-trabalho-saudavel-em-casa` | `advogado-trabalhista` | — |
| `/gerenciamento-eficaz-de-equipes-remotas-como-manter-a-produtividade-e-o-engajamento/` | `/blog/gerenciamento-eficaz-de-equipes-remotas-como-manter-a-produtividade-e-o-engajamento` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/seguranca-no-trabalho-remoto-como-proteger-seus-dados-e-equipamentos-de-forma-eficiente/` | `/blog/seguranca-no-trabalho-remoto-como-proteger-seus-dados-e-equipamentos-de-forma-eficiente` | `advogado-trabalhista` | — |
| `/trabalho-remoto-como-alcancar-alta-produtividade-e-superar-os-desafios-do-home-office/` | `/blog/trabalho-remoto-como-alcancar-alta-produtividade-e-superar-os-desafios-do-home-office` | `advogado-trabalhista` | — |
| `/como-implementar-um-bom-canal-de-denuncias-na-sua-empresa-dicas-importantes/` | `/blog/como-implementar-um-bom-canal-de-denuncias-na-sua-empresa-dicas-importantes` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-promover-um-ambiente-de-trabalho-seguro-e-livre-de-assedio/` | `/blog/como-promover-um-ambiente-de-trabalho-seguro-e-livre-de-assedio` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/epi-e-legislacao-trabalhista-entenda-as-obrigacoes-legais/` | `/blog/epi-e-legislacao-trabalhista-entenda-as-obrigacoes-legais` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/treinamento-de-epi-a-chave-para-a-seguranca-no-ambiente-de-trabalho/` | `/blog/treinamento-de-epi-a-chave-para-a-seguranca-no-ambiente-de-trabalho` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/tipos-de-epi-conheca-os-equipamentos-essenciais-para-sua-seguranca/` | `/blog/tipos-de-epi-conheca-os-equipamentos-essenciais-para-sua-seguranca` | `advogado-trabalhista` | — |
| `/uso-dos-epis/` | `/blog/uso-dos-epis` | `advogado-trabalhista` | — |
| `/ferias-proporcionais/` | `/blog/ferias-proporcionais` | `advogado-trabalhista` | — |
| `/documentos-na-admissao-ou-demissao/` | `/blog/documentos-na-admissao-ou-demissao` | `advogado-trabalhista` | — |
| `/regras-prazos-direitos/` | `/blog/regras-prazos-direitos` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/reducao-da-capacidade-de-trabalho-conheca-seus-direitos-e-as-opcoes-possiveis/` | `/blog/reducao-da-capacidade-de-trabalho-conheca-seus-direitos-e-as-opcoes-possiveis` | `advogado-trabalhista` | — |
| `/pensionamento-por-invalidez-saiba-quando-voce-tem-direito-a-receber/` | `/blog/pensionamento-por-invalidez-saiba-quando-voce-tem-direito-a-receber` | `advogado-trabalhista` | — |
| `/terceirizacao-ou-trabalho-temporario/` | `/blog/terceirizacao-ou-trabalho-temporario` | `advogado-trabalhista` | — |
| `/o-que-e-e-quais-cuidados/` | `/blog/o-que-e-e-quais-cuidados` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/entenda-a-diferenca-intervalo-repouso-semanal-e-dsr/` | `/blog/entenda-a-diferenca-intervalo-repouso-semanal-e-dsr` | `advogado-trabalhista` | — |
| `/tipos-de-contratos-de-trabalho-qual-o-melhor-para-sua-empresa/` | `/blog/tipos-de-contratos-de-trabalho-qual-o-melhor-para-sua-empresa` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/o-que-fazer-se-suas-ferias-nao-forem-concedidas/` | `/blog/o-que-fazer-se-suas-ferias-nao-forem-concedidas` | `advogado-trabalhista` | — |
| `/direito-as-ferias-para-trabalhadores-autonomos-o-que-diz-a-legislacao/` | `/blog/direito-as-ferias-para-trabalhadores-autonomos-o-que-diz-a-legislacao` | `advogado-trabalhista` | — |
| `/ferias-e-afastamentos/` | `/blog/ferias-e-afastamentos` | `advogado-trabalhista` | — |
| `/plr/` | `/blog/plr` | `advogado-trabalhista` | — |
| `/auxilio-doenca-2/` | `/blog/auxilio-doenca-2` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/beneficios-trabalhistas/` | `/blog/beneficios-trabalhistas` | `advogado-trabalhista` | — |
| `/reforma-trabalhista-2/` | `/blog/reforma-trabalhista-2` | `advogado-trabalhista` | — |
| `/direitos-dos-trabalhadores/` | `/blog/direitos-dos-trabalhadores` | `advogado-trabalhista` | — |
| `/jornada-de-trabalho-conceitos-e-definicoes/` | `/blog/jornada-de-trabalho-conceitos-e-definicoes` | `advogado-trabalhista` | — |
| `/entenda-a-importancia-dos-epis-no-trabalho/` | `/blog/entenda-a-importancia-dos-epis-no-trabalho` | `advogado-trabalhista` | — |
| `/insalubres-no-ambiente-de-trabalho/` | `/blog/insalubres-no-ambiente-de-trabalho` | `advogado-trabalhista` | — |
| `/ganhei-a-causa-trabalhista-mas-nao-recebi-o-que-fazer/` | `/blog/ganhei-a-causa-trabalhista-mas-nao-recebi-o-que-fazer` | `advogado-trabalhista` | — |
| `/direito-do-trabalhador-pcd/` | `/blog/direito-do-trabalhador-pcd` | `advogado-trabalhista` | — |
| `/pagamento-facultativo-ou-de-contribuinte-individual/` | `/blog/pagamento-facultativo-ou-de-contribuinte-individual` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/posso-exigir-que-o-funcionario-cumpra-o-aviso-previo/` | `/blog/posso-exigir-que-o-funcionario-cumpra-o-aviso-previo` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/projeto-de-lei-para-motoristas-de-app/` | `/blog/projeto-de-lei-para-motoristas-de-app` | `advogado-trabalhista` | — |
| `/como-sair-da-empresa-por-sindrome-de-burnout/` | `/blog/como-sair-da-empresa-por-sindrome-de-burnout` | `advogado-trabalhista` | — |
| `/qual-e-a-funcao-do-sindicato/` | `/blog/qual-e-a-funcao-do-sindicato` | `advogado-trabalhista` | — |
| `/imposto-de-renda-para-trabalhadores/` | `/blog/imposto-de-renda-para-trabalhadores` | `direito-tributario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/por-que-pedem-o-fim-da-escala-6x1/` | `/blog/por-que-pedem-o-fim-da-escala-6x1` | `advogado-trabalhista` | — |
| `/tudo-sobre-aviso-previo/` | `/blog/tudo-sobre-aviso-previo` | `advogado-trabalhista` | — |
| `/regras-da-negociacao-salarial/` | `/blog/regras-da-negociacao-salarial` | `advogado-trabalhista` | — |
| `/regras-para-troca-de-nome/` | `/blog/regras-para-troca-de-nome` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/posso-pagar-inss-morando-no-exterior/` | `/blog/posso-pagar-inss-morando-no-exterior` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/aposentadoria-para-enfermeiros/` | `/blog/aposentadoria-para-enfermeiros` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/donas-de-casa-podem-pagar-inss/` | `/blog/donas-de-casa-podem-pagar-inss` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-lidar-com-atrasos/` | `/blog/como-lidar-com-atrasos` | `advogado-trabalhista` | — |
| `/o-que-pode-levar-a-perda-da-aposentadoria/` | `/blog/o-que-pode-levar-a-perda-da-aposentadoria` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/burnout-no-ambiente-de-trabalho-como-agir/` | `/blog/burnout-no-ambiente-de-trabalho-como-agir` | `advogado-trabalhista` | — |
| `/demissao-por-fit-cultural-nao-e-justa-causa/` | `/blog/demissao-por-fit-cultural-nao-e-justa-causa` | `advogado-trabalhista` | — |
| `/a-transformacao-do-acesso-a-justica-com-tecnologia/` | `/blog/a-transformacao-do-acesso-a-justica-com-tecnologia` | — | sem área (post institucional/genérico) |
| `/como-funciona-a-coleta-de-provas-em-processos-trabalhistas/` | `/blog/como-funciona-a-coleta-de-provas-em-processos-trabalhistas` | `advogado-trabalhista` | — |
| `/com-o-envelhecimento-da-populacao-como-fica-a-previdencia/` | `/blog/com-o-envelhecimento-da-populacao-como-fica-a-previdencia` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/a-justica-aceita-prints-como-prova/` | `/blog/a-justica-aceita-prints-como-prova` | `advogado-trabalhista` | — |
| `/como-funciona-a-prova-da-oab/` | `/blog/como-funciona-a-prova-da-oab` | — | sem área (post institucional/genérico) |
| `/a-automacao-ameaca-o-futuro-do-trabalho/` | `/blog/a-automacao-ameaca-o-futuro-do-trabalho` | `advogado-trabalhista` | — |
| `/o-que-fazer-apos-a-perda-da-safra/` | `/blog/o-que-fazer-apos-a-perda-da-safra` | `agronegocio` | área pelo tema (categoria original: Direito Trabalhista) |
| `/saude-mental-e-teletrabalho/` | `/blog/saude-mental-e-teletrabalho` | `advogado-trabalhista` | — |
| `/planos-de-saude-e-seguros-entenda/` | `/blog/planos-de-saude-e-seguros-entenda` | `direito-da-saude` | área pelo tema (categoria original: Direito Trabalhista) |
| `/direitos-do-consumidor-em-servicos-publicos-e-concessionarias/` | `/blog/direitos-do-consumidor-em-servicos-publicos-e-concessionarias` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/praticas-comerciais-abusivas/` | `/blog/praticas-comerciais-abusivas` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/quais-sao-as-responsabilidade-do-fornecedor/` | `/blog/quais-sao-as-responsabilidade-do-fornecedor` | `direito-civil` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-funciona-a-previdencia-complementar/` | `/blog/como-funciona-a-previdencia-complementar` | `direito-previdenciario` | — |
| `/o-que-e-pente-fino-previdenciario/` | `/blog/o-que-e-pente-fino-previdenciario` | `direito-previdenciario` | — |
| `/o-que-e-desaposentacao/` | `/blog/o-que-e-desaposentacao` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/impacto-da-reforma-na-aposentadoria-de-professores/` | `/blog/impacto-da-reforma-na-aposentadoria-de-professores` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/revisoes-de-beneficios-previdenciarios/` | `/blog/revisoes-de-beneficios-previdenciarios` | `direito-previdenciario` | — |
| `/beneficios-por-incapacidade-durante-a-pandemia/` | `/blog/beneficios-por-incapacidade-durante-a-pandemia` | `direito-previdenciario` | — |
| `/como-funciona-a-aposentadoria-para-autonomos/` | `/blog/como-funciona-a-aposentadoria-para-autonomos` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/trabalho-infantil-o-que-a-legislacao-fala-sobre-isso/` | `/blog/trabalho-infantil-o-que-a-legislacao-fala-sobre-isso` | `advogado-trabalhista` | — |
| `/vale-transporte-e-beneficio/` | `/blog/vale-transporte-e-beneficio` | `advogado-trabalhista` | — |
| `/coisas-que-o-rh-nao-pode-fazer/` | `/blog/coisas-que-o-rh-nao-pode-fazer` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/o-que-e-o-intervalo-interjornada/` | `/blog/o-que-e-o-intervalo-interjornada` | `advogado-trabalhista` | — |
| `/o-que-e-prova-de-vida-e-como-fazer/` | `/blog/o-que-e-prova-de-vida-e-como-fazer` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/empresas-podem-sugerir-previdencia-privada/` | `/blog/empresas-podem-sugerir-previdencia-privada` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-encontrar-o-melhor-advogado-para-a-minha-necessidade/` | `/blog/como-encontrar-o-melhor-advogado-para-a-minha-necessidade` | — | sem área (post institucional/genérico) |
| `/por-que-buscar-ajuda-juridica-para-o-meu-processo/` | `/blog/por-que-buscar-ajuda-juridica-para-o-meu-processo` | — | sem área (post institucional/genérico) |
| `/voce-sabe-o-que-e-licenca-nojo/` | `/blog/voce-sabe-o-que-e-licenca-nojo` | `advogado-trabalhista` | — |
| `/politicas-agricolas/` | `/blog/politicas-agricolas` | `agronegocio` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-funciona-a-analise-do-inss/` | `/blog/como-funciona-a-analise-do-inss` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/protecao-da-propriedade-intelectual/` | `/blog/protecao-da-propriedade-intelectual` | `direito-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/uberizacao-do-trabalho/` | `/blog/uberizacao-do-trabalho` | `advogado-trabalhista` | — |
| `/licenca-por-motivos-pessoais/` | `/blog/licenca-por-motivos-pessoais` | `advogado-trabalhista` | — |
| `/a-empresa-pode-me-monitorar/` | `/blog/a-empresa-pode-me-monitorar` | `advogado-trabalhista` | — |
| `/lei-geral-de-protecao-de-dados/` | `/blog/lei-geral-de-protecao-de-dados` | `advogado-trabalhista` | — |
| `/importancia-da-assessoria-juridica-trabalhista/` | `/blog/importancia-da-assessoria-juridica-trabalhista` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/empresa-pode-demitir-funcionario-por-causa-da-vida-pessoal/` | `/blog/empresa-pode-demitir-funcionario-por-causa-da-vida-pessoal` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/meus-beneficios-podem-ser-descontados/` | `/blog/meus-beneficios-podem-ser-descontados` | `advogado-trabalhista` | — |
| `/uberizacao-trabalhista/` | `/blog/uberizacao-trabalhista` | `advogado-trabalhista` | — |
| `/como-lidar-com-o-whatsapp-e-as-relacoes-de-trabalho/` | `/blog/como-lidar-com-o-whatsapp-e-as-relacoes-de-trabalho` | `advogado-trabalhista` | — |
| `/o-que-e-teletrabalho/` | `/blog/o-que-e-teletrabalho` | `advogado-trabalhista` | — |
| `/o-que-mudou-com-a-reforma-trabalhista/` | `/blog/o-que-mudou-com-a-reforma-trabalhista` | `advogado-trabalhista` | — |
| `/aposentadoria-por-invalidez-direitos-e-processo-de-requerimento/` | `/blog/aposentadoria-por-invalidez-direitos-e-processo-de-requerimento` | `direito-previdenciario` | — |
| `/quais-sao-as-mudancas-da-lei-do-caminhoneiro-em-relacao-a-jornada-de-trabalho/` | `/blog/quais-sao-as-mudancas-da-lei-do-caminhoneiro-em-relacao-a-jornada-de-trabalho` | `advogado-trabalhista` | — |
| `/qual-e-a-documentacao-necessaria-para-dar-entrada-na-aposentadoria/` | `/blog/qual-e-a-documentacao-necessaria-para-dar-entrada-na-aposentadoria` | `direito-previdenciario` | — |
| `/recesso-de-fim-de-ano-ferias-ou-folga/` | `/blog/recesso-de-fim-de-ano-ferias-ou-folga` | `advogado-trabalhista` | — |
| `/tipos-de-contratos-de-trabalho-entenda-seus-direitos-e-obrigacoes/` | `/blog/tipos-de-contratos-de-trabalho-entenda-seus-direitos-e-obrigacoes` | `advogado-trabalhista` | — |
| `/construcao-civil-garantindo-os-direitos-dos-trabalhadores-de-forma-eficiente/` | `/blog/construcao-civil-garantindo-os-direitos-dos-trabalhadores-de-forma-eficiente` | `advogado-trabalhista` | — |
| `/se-voce-e-produtor-rural-pessoa-fisica-pode-estar-pagando-uma-taxa-nao-obrigatoria/` | `/blog/se-voce-e-produtor-rural-pessoa-fisica-pode-estar-pagando-uma-taxa-nao-obrigatoria` | `agronegocio` | — |
| `/black-friday-conheca-todos-os-seus-direitos-na-hora-extra/` | `/blog/black-friday-conheca-todos-os-seus-direitos-na-hora-extra` | `advogado-trabalhista` | — |
| `/direitos-previdenciarios-para-homens-em-tratamento-contra-o-cancer-de-prostata/` | `/blog/direitos-previdenciarios-para-homens-em-tratamento-contra-o-cancer-de-prostata` | `direito-previdenciario` | várias categorias (Direito Previdenciário + Direito Trabalhista) |
| `/quem-mora-perto-da-empresa-tem-direito-ao-vale-transporte/` | `/blog/quem-mora-perto-da-empresa-tem-direito-ao-vale-transporte` | `advogado-trabalhista` | — |
| `/quais-acordos-trabalhadores-e-chefes-podem-fazer/` | `/blog/quais-acordos-trabalhadores-e-chefes-podem-fazer` | `advogado-trabalhista` | — |
| `/estava-no-periodo-de-experiencia-mas-fui-demitido-quais-sao-meus-direitos/` | `/blog/estava-no-periodo-de-experiencia-mas-fui-demitido-quais-sao-meus-direitos` | `advogado-trabalhista` | — |
| `/condicoes-de-trabalho-qual-e-o-papel-do-direito-trabalhista/` | `/blog/condicoes-de-trabalho-qual-e-o-papel-do-direito-trabalhista` | `advogado-trabalhista` | — |
| `/medico-autonomo-e-empregado-conheca-as-diferencas-e-direitos/` | `/blog/medico-autonomo-e-empregado-conheca-as-diferencas-e-direitos` | `advogado-trabalhista` | área pelo tema (categoria original: Direito de Família) |
| `/desafios-do-trabalho-remoto-direitos-e-deveres/` | `/blog/desafios-do-trabalho-remoto-direitos-e-deveres` | `advogado-trabalhista` | — |
| `/quando-eu-posso-precisar-de-auxilio-no-direito-previdenciario/` | `/blog/quando-eu-posso-precisar-de-auxilio-no-direito-previdenciario` | `direito-previdenciario` | — |
| `/direitos-trabalhistas-que-voce-tem-e-talvez-nao-saiba/` | `/blog/direitos-trabalhistas-que-voce-tem-e-talvez-nao-saiba` | `advogado-trabalhista` | — |
| `/quais-sao-as-exigencias-proibidas-em-uma-vaga/` | `/blog/quais-sao-as-exigencias-proibidas-em-uma-vaga` | `advogado-trabalhista` | — |
| `/vendedor-com-acumulo-de-funcoes-entenda-seus-direitos-trabalhistas/` | `/blog/vendedor-com-acumulo-de-funcoes-entenda-seus-direitos-trabalhistas` | `advogado-trabalhista` | — |
| `/conheca-os-direitos-trabalhistas-em-caso-de-cancer-de-mama/` | `/blog/conheca-os-direitos-trabalhistas-em-caso-de-cancer-de-mama` | `direito-previdenciario` | várias categorias (Direito Previdenciário + Direito Trabalhista) |
| `/portadores-de-doencas-graves-tem-isencao-no-imposto-de-renda/` | `/blog/portadores-de-doencas-graves-tem-isencao-no-imposto-de-renda` | `direito-tributario` | área pelo tema (categoria original: Direito Previdenciário) |
| `/via-varejo-anuncia-plano-de-demissoes-em-massa-crise-no-setor-varejista-pode-afetar-trabalhadores/` | `/blog/via-varejo-anuncia-plano-de-demissoes-em-massa-crise-no-setor-varejista-pode-afetar-trabalhadores` | `advogado-trabalhista` | — |
| `/quais-sao-os-cadastros-obrigatorios-do-imovel-rural/` | `/blog/quais-sao-os-cadastros-obrigatorios-do-imovel-rural` | `agronegocio` | — |
| `/como-declarar-imposto-sobre-a-propriedade-rural-ditr/` | `/blog/como-declarar-imposto-sobre-a-propriedade-rural-ditr` | `agronegocio` | — |
| `/advogado-de-familia-em-goiania/` | `/blog/advogado-de-familia-em-goiania` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito Trabalhista) |
| `/entenda-o-que-e-politica-agricola/` | `/blog/entenda-o-que-e-politica-agricola` | `agronegocio` | — |
| `/posso-perder-a-propriedade-rural-caso-nao-respeite-os-direitos-dos-trabalhadores/` | `/blog/posso-perder-a-propriedade-rural-caso-nao-respeite-os-direitos-dos-trabalhadores` | `agronegocio` | — |
| `/funcionario-agredido-deve-ser-indenizado/` | `/blog/funcionario-agredido-deve-ser-indenizado` | `advogado-trabalhista` | — |
| `/venda-de-imovel-rural-em-condominio-como-funciona/` | `/blog/venda-de-imovel-rural-em-condominio-como-funciona` | `agronegocio` | — |
| `/fundo-de-garantia-de-operacoes-fgo/` | `/blog/fundo-de-garantia-de-operacoes-fgo` | `agronegocio` | várias categorias (Direito do Agronegócio + Direito Empresarial) |
| `/recurso-administrativo-do-inss/` | `/blog/recurso-administrativo-do-inss` | `direito-previdenciario` | — |
| `/cedula-de-credito-rural-entenda-o-que-e/` | `/blog/cedula-de-credito-rural-entenda-o-que-e` | `agronegocio` | — |
| `/trabalho-escravo-contemporaneo/` | `/blog/trabalho-escravo-contemporaneo` | `advogado-trabalhista` | — |
| `/tudo-sobre-o-direito-trabalhista/` | `/blog/tudo-sobre-o-direito-trabalhista` | `advogado-trabalhista` | — |
| `/socio-pode-ter-bens-bloqueados-por-dividas-da-empresa/` | `/blog/socio-pode-ter-bens-bloqueados-por-dividas-da-empresa` | `direito-empresarial` | várias categorias (Direito do Agronegócio + Direito Empresarial) |
| `/novas-regras-pat/` | `/blog/novas-regras-pat` | `advogado-trabalhista` | — |
| `/aposentadoria-especial-do-medico-veja-como-funciona/` | `/blog/aposentadoria-especial-do-medico-veja-como-funciona` | `direito-previdenciario` | várias categorias (Direito Previdenciário + Direito Trabalhista) |
| `/advogado-agrario-como-encontrar-o-melhor/` | `/blog/advogado-agrario-como-encontrar-o-melhor` | `agronegocio` | — |
| `/licencas-ambientais-para-atividades-agricolas/` | `/blog/licencas-ambientais-para-atividades-agricolas` | `agronegocio` | — |
| `/planejamento-sucessorio-propriedades-rurais/` | `/blog/planejamento-sucessorio-propriedades-rurais` | `familia-e-sucessoes` | área pelo tema (categoria original: Direito do Agronegócio) |
| `/programas-do-governo-de-incentivo-e-financiamento-agricola/` | `/blog/programas-do-governo-de-incentivo-e-financiamento-agricola` | `agronegocio` | — |
| `/agressao-ambiente-trabalho/` | `/blog/agressao-ambiente-trabalho` | `advogado-trabalhista` | — |
| `/doencas-isentas-de-carencia-do-inss/` | `/blog/doencas-isentas-de-carencia-do-inss` | `direito-previdenciario` | — |
| `/novos-direitos-e-regras-para-pais-e-maes-com-filhos-nas-empresas/` | `/blog/novos-direitos-e-regras-para-pais-e-maes-com-filhos-nas-empresas` | `advogado-trabalhista` | — |
| `/escolher-melhor-advogado-previdenciario/` | `/blog/escolher-melhor-advogado-previdenciario` | `direito-previdenciario` | — |
| `/extrato-cnis/` | `/blog/extrato-cnis` | `direito-previdenciario` | — |
| `/prova-de-vida-inss-2023/` | `/blog/prova-de-vida-inss-2023` | `direito-previdenciario` | — |
| `/aposentadoria-autismo/` | `/blog/aposentadoria-autismo` | `direito-previdenciario` | — |
| `/pequena-propriedade-rural-pode-ser-penhorada-e-leiloada/` | `/blog/pequena-propriedade-rural-pode-ser-penhorada-e-leiloada` | `agronegocio` | — |
| `/modelos-de-negocio-no-agronegocio/` | `/blog/modelos-de-negocio-no-agronegocio` | `agronegocio` | — |
| `/controle-da-jornada-de-trabalho-do-motorista/` | `/blog/controle-da-jornada-de-trabalho-do-motorista` | `advogado-trabalhista` | — |
| `/advogado-agrario-como-contratar-o-melhor/` | `/blog/advogado-agrario-como-contratar-o-melhor` | `agronegocio` | — |
| `/auxilio-creche/` | `/blog/auxilio-creche` | `advogado-trabalhista` | — |
| `/principais-motivos-para-anulacao-do-leilao-extrajudicial/` | `/blog/principais-motivos-para-anulacao-do-leilao-extrajudicial` | `agronegocio` | — |
| `/cancelar-o-leilao-judicial-de-imovel-rural/` | `/blog/cancelar-o-leilao-judicial-de-imovel-rural` | `agronegocio` | — |
| `/credito-rural-atrasado-inscrito-na-divida-ativa/` | `/blog/credito-rural-atrasado-inscrito-na-divida-ativa` | `agronegocio` | — |
| `/adicional-periculosidade-eletricitario/` | `/blog/adicional-periculosidade-eletricitario` | `advogado-trabalhista` | — |
| `/regras-emissao-cpr/` | `/blog/regras-emissao-cpr` | `agronegocio` | — |
| `/comissao-de-vendedor/` | `/blog/comissao-de-vendedor` | `advogado-trabalhista` | — |
| `/renegociar-dividas-rurais/` | `/blog/renegociar-dividas-rurais` | `agronegocio` | — |
| `/viuva-direito-aposentadoria-marido/` | `/blog/viuva-direito-aposentadoria-marido` | `direito-previdenciario` | — |
| `/consultar-resultado-pericia-inss/` | `/blog/consultar-resultado-pericia-inss` | `direito-previdenciario` | — |
| `/acao-trabalhista-trabalhando-na-empresa/` | `/blog/acao-trabalhista-trabalhando-na-empresa` | `advogado-trabalhista` | — |
| `/horas-extras-motorista-de-onibus/` | `/blog/horas-extras-motorista-de-onibus` | `advogado-trabalhista` | — |
| `/bpc-loas/` | `/blog/bpc-loas` | `direito-previdenciario` | — |
| `/auxilio-reclusao/` | `/blog/auxilio-reclusao` | `direito-previdenciario` | — |
| `/condenacao-de-quase-1-milhao-empregado-morto-pela-covid-19/` | `/blog/condenacao-de-quase-1-milhao-empregado-morto-pela-covid-19` | `advogado-trabalhista` | — |
| `/revisao-da-vida-toda-pedido-administrativo-antes-acao-judicial/` | `/blog/revisao-da-vida-toda-pedido-administrativo-antes-acao-judicial` | `direito-previdenciario` | — |
| `/empresa-pode-cobrar-uniforme/` | `/blog/empresa-pode-cobrar-uniforme` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/documentos-auxilio-doenca/` | `/blog/documentos-auxilio-doenca` | `direito-previdenciario` | — |
| `/tabela-de-contribuicoes-inss/` | `/blog/tabela-de-contribuicoes-inss` | `direito-previdenciario` | várias categorias (Direito Previdenciário + Direito Trabalhista) |
| `/acao-trabalhista-outro-estado/` | `/blog/acao-trabalhista-outro-estado` | `advogado-trabalhista` | — |
| `/salario-por-fora-consequencias-para-empresa/` | `/blog/salario-por-fora-consequencias-para-empresa` | `trabalhista-empresarial` | várias categorias (Direito Empresarial + Direito Trabalhista) |
| `/cartao-de-credito-devedor-trabalhista/` | `/blog/cartao-de-credito-devedor-trabalhista` | `trabalhista-empresarial` | várias categorias (Direito Empresarial + Direito Trabalhista) |
| `/motivos-demora-analise-inss/` | `/blog/motivos-demora-analise-inss` | `direito-previdenciario` | — |
| `/socio-oculto-divida-trabalhista/` | `/blog/socio-oculto-divida-trabalhista` | `trabalhista-empresarial` | várias categorias (Direito Empresarial + Direito Trabalhista) |
| `/espolio-responde-por-dividas-trabalhistas/` | `/blog/espolio-responde-por-dividas-trabalhistas` | `advogado-trabalhista` | — |
| `/impacto-agronegocio-economia/` | `/blog/impacto-agronegocio-economia` | `agronegocio` | várias categorias (Direito do Agronegócio + Direito Empresarial) |
| `/nova-reforma-trabalhista-novo-governo/` | `/blog/nova-reforma-trabalhista-novo-governo` | `advogado-trabalhista` | — |
| `/salario-minimo-imposto-de-renda/` | `/blog/salario-minimo-imposto-de-renda` | `direito-tributario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/transferencia-de-local-de-trabalho/` | `/blog/transferencia-de-local-de-trabalho` | `advogado-trabalhista` | — |
| `/aposentadoria-profissionais-saude/` | `/blog/aposentadoria-profissionais-saude` | `direito-previdenciario` | — |
| `/profissionais-da-saude-verbas-trabalhistas/` | `/blog/profissionais-da-saude-verbas-trabalhistas` | `advogado-trabalhista` | — |
| `/meu-socio-faleceu-como-fica-empresa/` | `/blog/meu-socio-faleceu-como-fica-empresa` | `holding-e-planejamento-societario` | área pelo tema (categoria original: Direito Empresarial) |
| `/programa-emprega-mais-mulheres/` | `/blog/programa-emprega-mais-mulheres` | `advogado-trabalhista` | — |
| `/aposentadoria-da-pessoa-com-deficiencia/` | `/blog/aposentadoria-da-pessoa-com-deficiencia` | `direito-previdenciario` | — |
| `/vendedor-deve-trabalhar-aos-finais-de-semana-e-feriados/` | `/blog/vendedor-deve-trabalhar-aos-finais-de-semana-e-feriados` | `advogado-trabalhista` | área pelo tema (categoria original: Direito Previdenciário) |
| `/hora-extra-para-vendedor/` | `/blog/hora-extra-para-vendedor` | `advogado-trabalhista` | — |
| `/direitos-trabalhistas-do-atleta-profissional/` | `/blog/direitos-trabalhistas-do-atleta-profissional` | `advogado-trabalhista` | — |
| `/direitos-trabalhistas-do-jogador-de-futebol/` | `/blog/direitos-trabalhistas-do-jogador-de-futebol` | `advogado-trabalhista` | — |
| `/inss-e-aplicado-sobre-horas-extras/` | `/blog/inss-e-aplicado-sobre-horas-extras` | `direito-previdenciario` | várias categorias (Direito Previdenciário + Direito Trabalhista) |
| `/direito-de-imagem-do-jogador/` | `/blog/direito-de-imagem-do-jogador` | `advogado-trabalhista` | — |
| `/abandono-de-emprego/` | `/blog/abandono-de-emprego` | `advogado-trabalhista` | — |
| `/calcular-o-valor-da-aposentadoria/` | `/blog/calcular-o-valor-da-aposentadoria` | `direito-previdenciario` | — |
| `/responsabilidade-civil-da-empresa-em-acidente-de-trabalho/` | `/blog/responsabilidade-civil-da-empresa-em-acidente-de-trabalho` | `advogado-trabalhista` | — |
| `/contrato-de-freelancer/` | `/blog/contrato-de-freelancer` | `advogado-trabalhista` | — |
| `/folgar-domingos-por-mes/` | `/blog/folgar-domingos-por-mes` | `advogado-trabalhista` | — |
| `/demissao-deve-receber-a-plr/` | `/blog/demissao-deve-receber-a-plr` | `advogado-trabalhista` | — |
| `/servidor-temporario-direito-ao-fgts/` | `/blog/servidor-temporario-direito-ao-fgts` | `advogado-trabalhista` | — |
| `/cancelar-promessa-de-contratacao/` | `/blog/cancelar-promessa-de-contratacao` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/doencas-para-isencao-do-imposto-de-renda/` | `/blog/doencas-para-isencao-do-imposto-de-renda` | `direito-tributario` | área pelo tema (categoria original: Direito Previdenciário) |
| `/hora-extra-para-funcionario-de-banco/` | `/blog/hora-extra-para-funcionario-de-banco` | `advogado-trabalhista` | — |
| `/direitos-no-home-office/` | `/blog/direitos-no-home-office` | `advogado-trabalhista` | — |
| `/home-office-e-teletrabalho/` | `/blog/home-office-e-teletrabalho` | `advogado-trabalhista` | — |
| `/empresas-em-home-office/` | `/blog/empresas-em-home-office` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/revisao-de-aposentadoria-por-acao-trabalhista/` | `/blog/revisao-de-aposentadoria-por-acao-trabalhista` | `direito-previdenciario` | várias categorias (Direito Previdenciário + Direito Trabalhista) |
| `/prazo-para-a-empresa-assinar-carteira/` | `/blog/prazo-para-a-empresa-assinar-carteira` | `advogado-trabalhista` | — |
| `/consequencias-da-falta-injustificada/` | `/blog/consequencias-da-falta-injustificada` | `advogado-trabalhista` | — |
| `/prescricao-no-processo-do-trabalho/` | `/blog/prescricao-no-processo-do-trabalho` | `advogado-trabalhista` | — |
| `/print-vale-como-prova-na-justica-do-trabalho/` | `/blog/print-vale-como-prova-na-justica-do-trabalho` | `advogado-trabalhista` | — |
| `/estabilidade-no-emprego-lei-maria-da-penha/` | `/blog/estabilidade-no-emprego-lei-maria-da-penha` | `advogado-trabalhista` | — |
| `/meu-inss/` | `/blog/meu-inss` | `direito-previdenciario` | — |
| `/direitos-da-empregada-domestica/` | `/blog/direitos-da-empregada-domestica` | `advogado-trabalhista` | — |
| `/exigencias-proibidas-em-anuncios-de-vagas/` | `/blog/exigencias-proibidas-em-anuncios-de-vagas` | `advogado-trabalhista` | — |
| `/hora-extra-jornada-12-36/` | `/blog/hora-extra-jornada-12-36` | `advogado-trabalhista` | — |
| `/relatorio-de-vendas-para-vendedor/` | `/blog/relatorio-de-vendas-para-vendedor` | `advogado-trabalhista` | — |
| `/controle-do-trabalho-por-tacografo/` | `/blog/controle-do-trabalho-por-tacografo` | `advogado-trabalhista` | sem imagem de capa |
| `/beneflex/` | `/blog/beneflex` | `advogado-trabalhista` | sem imagem de capa |
| `/equiparacao-salarial/` | `/blog/equiparacao-salarial` | `advogado-trabalhista` | sem imagem de capa |
| `/contrato-de-trabalho-intermitente/` | `/blog/contrato-de-trabalho-intermitente` | `advogado-trabalhista` | — |
| `/trabalhador-autonomo-exclusivo/` | `/blog/trabalhador-autonomo-exclusivo` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/contratar-empresa-terceirizada/` | `/blog/contratar-empresa-terceirizada` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/seguro-de-vida-para-estagiarios/` | `/blog/seguro-de-vida-para-estagiarios` | `advogado-trabalhista` | — |
| `/vale-combustivel/` | `/blog/vale-combustivel` | `advogado-trabalhista` | — |
| `/alteracao-do-nome-do-funcionario/` | `/blog/alteracao-do-nome-do-funcionario` | `advogado-trabalhista` | — |
| `/desconto-de-vale-transporte/` | `/blog/desconto-de-vale-transporte` | `advogado-trabalhista` | — |
| `/aposentadoria-por-idade/` | `/blog/aposentadoria-por-idade` | `direito-previdenciario` | — |
| `/dispensa-discriminatoria/` | `/blog/dispensa-discriminatoria` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/diario-de-bordo-do-motorista/` | `/blog/diario-de-bordo-do-motorista` | `advogado-trabalhista` | — |
| `/contrato-de-trabalho-eventual/` | `/blog/contrato-de-trabalho-eventual` | `advogado-trabalhista` | — |
| `/mensagem-fora-do-horario-de-trabalho/` | `/blog/mensagem-fora-do-horario-de-trabalho` | `advogado-trabalhista` | sem imagem de capa |
| `/reduzir-salario/` | `/blog/reduzir-salario` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/empresa-nao-paga-inss/` | `/blog/empresa-nao-paga-inss` | `advogado-trabalhista` | — |
| `/premiacao-de-funcionarios/` | `/blog/premiacao-de-funcionarios` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/acordos-trabalhistas-valem-igual-a-lei/` | `/blog/acordos-trabalhistas-valem-igual-a-lei` | `advogado-trabalhista` | — |
| `/licenca-para-casamento/` | `/blog/licenca-para-casamento` | `advogado-trabalhista` | — |
| `/descontado-do-salario/` | `/blog/descontado-do-salario` | `advogado-trabalhista` | — |
| `/salario-familia/` | `/blog/salario-familia` | `advogado-trabalhista` | — |
| `/noticia-agressao-no-trabalho/` | `/blog/noticia-agressao-no-trabalho` | `advogado-trabalhista` | — |
| `/nova-lei-do-home-office/` | `/blog/nova-lei-do-home-office` | `advogado-trabalhista` | — |
| `/habilitar-credito-trabalhista-na-falencia/` | `/blog/habilitar-credito-trabalhista-na-falencia` | `advogado-trabalhista` | — |
| `/direitos-do-trabalhador-na-empresa-em-recuperacao-judicial/` | `/blog/direitos-do-trabalhador-na-empresa-em-recuperacao-judicial` | `advogado-trabalhista` | — |
| `/habilitar-credito-trabalhista-na-recuperacao-judicial/` | `/blog/habilitar-credito-trabalhista-na-recuperacao-judicial` | `advogado-trabalhista` | — |
| `/mae-que-acompanha-filho-doente/` | `/blog/mae-que-acompanha-filho-doente` | `advogado-trabalhista` | — |
| `/adicional-de-insalubridade-para-auxiliar-de-limpeza/` | `/blog/adicional-de-insalubridade-para-auxiliar-de-limpeza` | `advogado-trabalhista` | — |
| `/adicional-de-insalubridade-para-soldador/` | `/blog/adicional-de-insalubridade-para-soldador` | `advogado-trabalhista` | — |
| `/beneficios-do-inss-para-mei/` | `/blog/beneficios-do-inss-para-mei` | `direito-previdenciario` | área pelo tema (categoria original: Direito Trabalhista) |
| `/vender-vale-alimentacao-e-refeicao/` | `/blog/vender-vale-alimentacao-e-refeicao` | `advogado-trabalhista` | — |
| `/mecanico-direito-a-periculosidade/` | `/blog/mecanico-direito-a-periculosidade` | `advogado-trabalhista` | — |
| `/direitos-trabalhistas-da-cozinheira/` | `/blog/direitos-trabalhistas-da-cozinheira` | `advogado-trabalhista` | — |
| `/adicional-de-insalubridade-para-auxiliar-de-enfermagem/` | `/blog/adicional-de-insalubridade-para-auxiliar-de-enfermagem` | `advogado-trabalhista` | — |
| `/falta-em-semana-de-feriado/` | `/blog/falta-em-semana-de-feriado` | `advogado-trabalhista` | — |
| `/adotante-tem-direito-a-estabilidade/` | `/blog/adotante-tem-direito-a-estabilidade` | `advogado-trabalhista` | — |
| `/novos-prazos-inss-e-fgts-de-empregados-domesticos/` | `/blog/novos-prazos-inss-e-fgts-de-empregados-domesticos` | `advogado-trabalhista` | — |
| `/adicional-de-periculosidade-para-eletricista/` | `/blog/adicional-de-periculosidade-para-eletricista` | `advogado-trabalhista` | — |
| `/licenca-maternidade-a-adotante/` | `/blog/licenca-maternidade-a-adotante` | `advogado-trabalhista` | — |
| `/acordo-coletivo-de-trabalho/` | `/blog/acordo-coletivo-de-trabalho` | `advogado-trabalhista` | — |
| `/familia-de-vitima-da-covid-ganha-indenizacao/` | `/blog/familia-de-vitima-da-covid-ganha-indenizacao` | `advogado-trabalhista` | — |
| `/noticia-trabalho-hibrido-nova-realidade-no-mercado/` | `/blog/noticia-trabalho-hibrido-nova-realidade-no-mercado` | `advogado-trabalhista` | — |
| `/acao-trabalhista/` | `/blog/acao-trabalhista` | `advogado-trabalhista` | — |
| `/periodo-de-sobreaviso/` | `/blog/periodo-de-sobreaviso` | `advogado-trabalhista` | — |
| `/cotas-para-pcd-nas-empresas/` | `/blog/cotas-para-pcd-nas-empresas` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/abono-salarial/` | `/blog/abono-salarial` | `advogado-trabalhista` | — |
| `/seguranca-do-trabalho/` | `/blog/seguranca-do-trabalho` | `advogado-trabalhista` | — |
| `/adicional-por-tempo-de-servico/` | `/blog/adicional-por-tempo-de-servico` | `advogado-trabalhista` | — |
| `/desvio-de-funcao/` | `/blog/desvio-de-funcao` | `advogado-trabalhista` | — |
| `/adiantamento-de-salario/` | `/blog/adiantamento-de-salario` | `advogado-trabalhista` | — |
| `/noticia-aumento-de-atestados-medicos-falsos/` | `/blog/noticia-aumento-de-atestados-medicos-falsos` | `advogado-trabalhista` | — |
| `/nicoli-sociedade-de-advogados-anuncia-novas-contratacoes/` | `/blog/nicoli-sociedade-de-advogados-anuncia-novas-contratacoes` | — | sem área (post institucional/genérico) |
| `/insalubridade-para-motorista/` | `/blog/insalubridade-para-motorista` | `advogado-trabalhista` | — |
| `/aviso-retroativo/` | `/blog/aviso-retroativo` | `advogado-trabalhista` | — |
| `/atestado-de-saude-ocupacional/` | `/blog/atestado-de-saude-ocupacional` | `advogado-trabalhista` | — |
| `/horas-in-itinere/` | `/blog/horas-in-itinere` | `advogado-trabalhista` | — |
| `/adicional-para-motorista-de-caminhao-munck/` | `/blog/adicional-para-motorista-de-caminhao-munck` | `advogado-trabalhista` | — |
| `/vale-cultura/` | `/blog/vale-cultura` | `advogado-trabalhista` | — |
| `/vale-transporte/` | `/blog/vale-transporte` | `advogado-trabalhista` | — |
| `/contratacao-de-mei/` | `/blog/contratacao-de-mei` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/vale-refeicao/` | `/blog/vale-refeicao` | `advogado-trabalhista` | — |
| `/vale-alimentacao/` | `/blog/vale-alimentacao` | `advogado-trabalhista` | — |
| `/premio-quality-para-nicoli-sociedade-de-advogados/` | `/blog/premio-quality-para-nicoli-sociedade-de-advogados` | — | sem área (post institucional/genérico) |
| `/adicional-de-penosidade/` | `/blog/adicional-de-penosidade` | `advogado-trabalhista` | — |
| `/rescisao-por-falecimento-do-empregado/` | `/blog/rescisao-por-falecimento-do-empregado` | `advogado-trabalhista` | — |
| `/pagamento-de-salario-em-duplicidade/` | `/blog/pagamento-de-salario-em-duplicidade` | `advogado-trabalhista` | — |
| `/reajuste-salarial-2022/` | `/blog/reajuste-salarial-2022` | `advogado-trabalhista` | — |
| `/turno-ininterrupto-de-revezamento/` | `/blog/turno-ininterrupto-de-revezamento` | `advogado-trabalhista` | — |
| `/adicional-de-transferencia/` | `/blog/adicional-de-transferencia` | `advogado-trabalhista` | — |
| `/regras-para-trabalhador-acima-de-50-anos/` | `/blog/regras-para-trabalhador-acima-de-50-anos` | `advogado-trabalhista` | — |
| `/lgpd-para-o-rh/` | `/blog/lgpd-para-o-rh` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/emenda-de-feriados/` | `/blog/emenda-de-feriados` | `advogado-trabalhista` | — |
| `/regras-no-trabalho-a-ceu-aberto/` | `/blog/regras-no-trabalho-a-ceu-aberto` | `advogado-trabalhista` | — |
| `/adicional-noturno/` | `/blog/adicional-noturno` | `advogado-trabalhista` | — |
| `/compliance-trabalhista/` | `/blog/compliance-trabalhista` | `advogado-trabalhista` | — |
| `/audiencia-trabalhista/` | `/blog/audiencia-trabalhista` | `advogado-trabalhista` | — |
| `/prescricao-trabalhista/` | `/blog/prescricao-trabalhista` | `advogado-trabalhista` | — |
| `/fiscalizacao-do-trabalho/` | `/blog/fiscalizacao-do-trabalho` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/como-funciona-o-teletrabalho/` | `/blog/como-funciona-o-teletrabalho` | `advogado-trabalhista` | — |
| `/descontar-comissao-de-vendedor/` | `/blog/descontar-comissao-de-vendedor` | `advogado-trabalhista` | — |
| `/cigarro-no-trabalho/` | `/blog/cigarro-no-trabalho` | `advogado-trabalhista` | — |
| `/quem-paga-exame-demissional/` | `/blog/quem-paga-exame-demissional` | `trabalhista-empresarial` | área pelo tema (categoria original: Direito Trabalhista) |
| `/limbo-previdenciario-trabalhista/` | `/blog/limbo-previdenciario-trabalhista` | `advogado-trabalhista` | — |
| `/empregado-utiliza-motocicleta-adicional-de-periculosidade/` | `/blog/empregado-utiliza-motocicleta-adicional-de-periculosidade` | `advogado-trabalhista` | — |
| `/contrato-de-experiencia/` | `/blog/contrato-de-experiencia` | `advogado-trabalhista` | — |
| `/pagamento-de-salario-por-pix/` | `/blog/pagamento-de-salario-por-pix` | `advogado-trabalhista` | — |
| `/direitos-trabalhistas-do-motorista/` | `/blog/direitos-trabalhistas-do-motorista` | `advogado-trabalhista` | — |
| `/empresa-com-dividas-trabalhistas/` | `/blog/empresa-com-dividas-trabalhistas` | `advogado-trabalhista` | — |
| `/nova-reforma-trabalhista/` | `/blog/nova-reforma-trabalhista` | `advogado-trabalhista` | — |
| `/a-empresa-pode-cancelar-o-plano-de-saude/` | `/blog/a-empresa-pode-cancelar-o-plano-de-saude` | `direito-da-saude` | área pelo tema (categoria original: Direito Trabalhista) |
| `/diferencas-aviso-previo-trabalhado-ou-indenizado/` | `/blog/diferencas-aviso-previo-trabalhado-ou-indenizado` | `advogado-trabalhista` | — |
| `/empresa-faliu-direitos-do-trabalhador/` | `/blog/empresa-faliu-direitos-do-trabalhador` | `advogado-trabalhista` | — |
| `/portabilidade-de-salario/` | `/blog/portabilidade-de-salario` | `advogado-trabalhista` | — |
| `/rescisao-contratual-por-culpa-da-empresa/` | `/blog/rescisao-contratual-por-culpa-da-empresa` | `advogado-trabalhista` | — |
| `/carteira-de-trabalho-digital/` | `/blog/carteira-de-trabalho-digital` | `advogado-trabalhista` | — |
| `/nova-marca-do-escritorio-nicoli-sociedade-de-advogados/` | `/blog/nova-marca-do-escritorio-nicoli-sociedade-de-advogados` | — | sem área (post institucional/genérico) |
| `/podcast-nicoli-sociedade-de-advogados/` | `/blog/podcast-nicoli-sociedade-de-advogados` | — | sem área (post institucional/genérico) |

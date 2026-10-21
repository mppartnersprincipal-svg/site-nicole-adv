/** Política de Privacidade e página "LGPD – Dados Pessoais". Revisar com o escritório antes do go-live. */

export interface SecaoLegal {
  titulo: string;
  paragrafos: string[];
  itens?: string[];
}

export const ULTIMA_ATUALIZACAO_LEGAL = "outubro de 2026";

const CONTROLADOR = "Nicoli Sociedade de Advogados";
const CNPJ = "28.415.182/0001-80";
const ENDERECO = "Rua 89, nº 240, Setor Sul, Goiânia/GO, CEP 74093-140";
const DPO_NOME = "Luis Gustavo Nicoli";
const DPO_EMAIL = "luis.gustavo@nicoliadvogados.adv.br";

export const POLITICA_PRIVACIDADE: SecaoLegal[] = [
  {
    titulo: "1. Apresentação",
    paragrafos: [
      `Esta Política de Privacidade explica como a ${CONTROLADOR}, inscrita no CNPJ sob o nº ${CNPJ}, com sede na ${ENDERECO}, trata os dados pessoais de quem visita o site nicoliadvogados.adv.br e entra em contato com o escritório.`,
      "O tratamento segue a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD), o Marco Civil da Internet (Lei nº 12.965/2014) e o dever de sigilo profissional previsto no Estatuto da Advocacia e no Código de Ética e Disciplina da OAB.",
      `Última atualização: ${ULTIMA_ATUALIZACAO_LEGAL}.`,
    ],
  },
  {
    titulo: "2. Controlador e encarregado (DPO)",
    paragrafos: [
      `O controlador dos dados pessoais é a ${CONTROLADOR}. O encarregado pelo tratamento de dados pessoais é ${DPO_NOME}, que pode ser contatado pelo e-mail ${DPO_EMAIL}.`,
    ],
  },
  {
    titulo: "3. Quais dados coletamos",
    paragrafos: ["Coletamos apenas os dados necessários para as finalidades descritas nesta política."],
    itens: [
      "Dados informados por você no formulário de contato: nome, telefone, e-mail, empresa, ramo de atividade, cargo e resumo do caso.",
      "Dados de navegação coletados por cookies e tecnologias semelhantes, quando autorizados: páginas visitadas, tempo de permanência, tipo de dispositivo, navegador, localização aproximada e origem do acesso, incluindo parâmetros de campanha (UTM).",
      "Dados estatísticos de navegação, coletados de forma anônima pelo próprio site, sem cookies e sem gravar o endereço IP: páginas visitadas, tempo de permanência, rolagem, cliques em links e botões, origem do acesso (incluindo parâmetros de campanha), tipo de dispositivo, navegador e localização aproximada (cidade, estado e país).",
      "Dados trocados em conversas pelo WhatsApp, por e-mail ou por telefone, quando você entra em contato.",
    ],
  },
  {
    titulo: "4. Como funciona o formulário de contato",
    paragrafos: [
      "O site não armazena em servidor os dados preenchidos no formulário. Ao enviar, as informações são organizadas em uma mensagem e encaminhadas pelo WhatsApp ao número oficial do escritório, (62) 99570-0037.",
      "A partir desse momento, a mensagem fica sujeita também à política de privacidade do WhatsApp, e a conversa passa a ser tratada pelo escritório como um atendimento, protegido pelo sigilo profissional.",
      "Informações de origem da visita, como os parâmetros de campanha (UTM), podem ser incluídas na mensagem para que o escritório saiba por qual canal você chegou.",
    ],
  },
  {
    titulo: "5. Finalidades e bases legais",
    paragrafos: ["Tratamos dados pessoais para as seguintes finalidades, com as respectivas bases legais do art. 7º da LGPD:"],
    itens: [
      "Responder ao seu contato e agendar o atendimento: procedimentos preliminares a contrato, a pedido do titular (art. 7º, V).",
      "Prestar os serviços jurídicos contratados: execução de contrato e exercício regular de direitos em processo judicial, administrativo ou arbitral (art. 7º, V e VI).",
      "Cumprir obrigações legais e regulatórias, inclusive as da OAB: cumprimento de obrigação legal ou regulatória (art. 7º, II).",
      "Medir a audiência do site e melhorar a experiência de navegação: consentimento (art. 7º, I), coletado pelo banner de cookies.",
      "Gerar estatísticas anônimas de uso do site e avaliar o desempenho das campanhas, pela medição própria descrita no item 6: legítimo interesse (art. 7º, IX), sem identificar o visitante.",
      "Exibir anúncios e medir campanhas de marketing: consentimento (art. 7º, I), coletado pelo banner de cookies.",
    ],
  },
  {
    titulo: "6. Cookies e tecnologias de rastreamento",
    paragrafos: [
      "Utilizamos cookies e tecnologias semelhantes. Os cookies estritamente necessários garantem o funcionamento do site. Os cookies de análise e de publicidade só são ativados após o seu consentimento, pelo banner exibido na primeira visita.",
      "Adotamos o Modo de Consentimento (Consent Mode) do Google: enquanto você não autoriza, as ferramentas do Google funcionam em modo restrito, sem gravar cookies de análise ou de publicidade. Você pode alterar sua escolha a qualquer momento pelo link de preferências de cookies no rodapé do site ou pelas configurações do seu navegador.",
    ],
    itens: [
      "Google Tag Manager: gerencia a ativação das demais ferramentas, conforme o consentimento.",
      "Google Analytics 4: mede o uso do site de forma estatística, como páginas visitadas e origem do acesso.",
      "Google Ads: mede a efetividade de anúncios e permite exibir anúncios relevantes a quem já visitou o site.",
      "Meta Pixel: mede campanhas no Facebook e no Instagram e permite exibir anúncios a públicos semelhantes.",
      "Medição própria do site: registra de forma anônima as visitas e interações descritas no item 3, sem cookies e sem gravar o endereço IP. Usa um identificador aleatório de sessão, guardado no armazenamento temporário do navegador e apagado quando a aba é fechada. Somente se você aceitar os cookies de análise, um identificador aleatório de visitante fica guardado no navegador por até 13 meses, para distinguir visitas novas de recorrentes; recusar ou retirar o consentimento o apaga na hora.",
    ],
  },
  {
    titulo: "7. Compartilhamento de dados",
    paragrafos: [
      "Não vendemos dados pessoais. O compartilhamento ocorre apenas quando necessário e com os seguintes destinatários:",
    ],
    itens: [
      "Provedores de tecnologia que viabilizam o site, a comunicação e a medição de audiência, como Google, Meta (incluindo o WhatsApp), a empresa de hospedagem e o provedor de banco de dados que armazena as estatísticas anônimas de navegação.",
      "Ferramentas internas de atendimento e gestão de relacionamento usadas pelo escritório.",
      "Órgãos do Poder Judiciário, da administração pública e outras partes, quando necessário à prestação do serviço jurídico ou por obrigação legal.",
    ],
  },
  {
    titulo: "8. Transferência internacional",
    paragrafos: [
      "Alguns fornecedores, como Google, Meta e os provedores de hospedagem e de banco de dados, podem armazenar e processar dados em servidores fora do Brasil. Nesses casos, a transferência observa o art. 33 da LGPD e as garantias contratuais oferecidas por esses fornecedores.",
    ],
  },
  {
    titulo: "9. Por quanto tempo guardamos os dados",
    paragrafos: [
      "Os dados de contato que não resultem em contratação são mantidos pelo tempo necessário ao atendimento e, depois, eliminados ou anonimizados. Os dados de clientes são mantidos durante a prestação do serviço e pelos prazos exigidos em lei ou necessários ao exercício regular de direitos. Os dados de navegação seguem os prazos de retenção configurados nas ferramentas de análise e publicidade. As estatísticas anônimas da medição própria são mantidas por até 13 meses e, depois, eliminadas.",
    ],
  },
  {
    titulo: "10. Segurança",
    paragrafos: [
      "Adotamos medidas técnicas e administrativas para proteger os dados pessoais contra acesso não autorizado, perda ou alteração, como conexão criptografada (HTTPS), controle de acesso e sigilo profissional da equipe. Nenhum sistema é totalmente imune a incidentes; caso ocorra um incidente relevante, adotaremos as providências previstas na LGPD.",
    ],
  },
  {
    titulo: "11. Seus direitos",
    paragrafos: [
      `Você pode exercer os direitos previstos no art. 18 da LGPD a qualquer momento, pelo e-mail ${DPO_EMAIL}. Os direitos estão detalhados na página "LGPD – Dados Pessoais".`,
    ],
  },
  {
    titulo: "12. Alterações desta política",
    paragrafos: [
      "Esta política pode ser atualizada para refletir mudanças na legislação ou nos nossos processos. A data da última atualização fica sempre indicada no início do documento.",
    ],
  },
];

export const LGPD_DADOS: SecaoLegal[] = [
  {
    titulo: "Compromisso com a proteção de dados",
    paragrafos: [
      `A ${CONTROLADOR} (CNPJ ${CNPJ}) trata dados pessoais com responsabilidade, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) e com o dever de sigilo profissional da advocacia.`,
      `Esta página resume como você pode exercer os seus direitos. As regras completas estão na Política de Privacidade. Última atualização: ${ULTIMA_ATUALIZACAO_LEGAL}.`,
    ],
  },
  {
    titulo: "Encarregado pelo tratamento de dados (DPO)",
    paragrafos: [
      `O encarregado pelo tratamento de dados pessoais do escritório é ${DPO_NOME}. Para qualquer solicitação relacionada aos seus dados, escreva para ${DPO_EMAIL}.`,
      `Endereço para correspondência: ${ENDERECO}.`,
    ],
  },
  {
    titulo: "Seus direitos como titular (art. 18 da LGPD)",
    paragrafos: ["Você pode solicitar, a qualquer momento e mediante requisição:"],
    itens: [
      "Confirmação da existência de tratamento dos seus dados.",
      "Acesso aos dados.",
      "Correção de dados incompletos, inexatos ou desatualizados.",
      "Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei.",
      "Portabilidade dos dados a outro fornecedor de serviço, observados os segredos comercial e industrial.",
      "Eliminação dos dados tratados com base no seu consentimento, ressalvadas as hipóteses de guarda previstas em lei.",
      "Informação sobre as entidades públicas e privadas com as quais compartilhamos seus dados.",
      "Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa.",
      "Revogação do consentimento.",
      "Oposição a tratamento realizado com base em outra hipótese legal, em caso de descumprimento da LGPD.",
    ],
  },
  {
    titulo: "Como fazer uma solicitação",
    paragrafos: [
      `Envie um e-mail para ${DPO_EMAIL}, informando seu nome completo, o direito que deseja exercer e um meio de contato. Para proteger seus dados, poderemos pedir informações que confirmem a sua identidade.`,
      "Responderemos no prazo previsto na LGPD. Algumas solicitações podem ser limitadas quando a manutenção dos dados for exigida por lei, por obrigação regulatória da advocacia ou para o exercício regular de direitos.",
      "Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).",
    ],
  },
  {
    titulo: "Formulário de contato e WhatsApp",
    paragrafos: [
      "O site não armazena em servidor os dados do formulário de contato. As informações são enviadas diretamente ao WhatsApp oficial do escritório, onde passam a ser tratadas como atendimento, sob sigilo profissional.",
    ],
  },
  {
    titulo: "Cookies e preferências",
    paragrafos: [
      "Ferramentas de análise e publicidade, como Google Analytics 4, Google Ads e Meta Pixel, gerenciadas pelo Google Tag Manager, só são ativadas com o seu consentimento, por meio do Modo de Consentimento do Google. Você pode rever sua escolha a qualquer momento pelo link de preferências de cookies no rodapé do site.",
      "O site também faz uma medição própria e anônima de visitas e interações, sem cookies e sem gravar o endereço IP, para gerar estatísticas de uso. Os detalhes estão no item 6 da Política de Privacidade.",
    ],
  },
];

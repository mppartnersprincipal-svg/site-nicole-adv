/**
 * Leads via WhatsApp — o site NÃO tem backend: o formulário monta uma mensagem
 * e abre o wa.me do escritório. A medição (form_submit + generate_lead) é feita
 * antes de abrir o WhatsApp, sem PII em texto puro no dataLayer.
 */

import { MENSAGEM_WHATSAPP_PADRAO, SITE } from "./site";
import { campaignLabel, normalizeEmailForHash, normalizePhoneE164BR } from "./attribution-core";
import type { Attribution } from "./attribution-core";
import { getAttribution, pushHashedUserData, trackEvent, trackEventAndWait } from "./tracking";

export interface LeadForm {
  nome: string;
  telefone: string;
  email?: string;
  empresa?: string;
  ramo?: string;
  cargo?: string;
  resumo: string;
  area?: string;
}

export type LeadErros = Partial<Record<keyof LeadForm, string>>;

export type ResultadoValidacao = { ok: true; dados: LeadForm } | { ok: false; erros: LeadErros };

const LIMITES = {
  nomeMin: 3,
  nomeMax: 120,
  campoMax: 120,
  emailMax: 160,
  resumoMin: 10,
  resumoMax: 1000,
} as const;

/** Tempo máximo esperando o GTM antes de abrir o WhatsApp. */
const TIMEOUT_NAVEGACAO_MS = 800;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ------------------------------------------------------------------ */
/* Helpers de texto                                                    */
/* ------------------------------------------------------------------ */

/** Remove caracteres de controle (mantém quebras de linha) e apara. */
function limparTexto(valor: unknown, multilinha = false): string {
  if (typeof valor !== "string") return "";
  const semControle = valor.replace(multilinha ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, " ");
  if (!multilinha) return semControle.replace(/\s+/g, " ").trim();
  return semControle
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function opcional(valor: unknown, max: number = LIMITES.campoMax): string | undefined {
  const v = limparTexto(valor);
  return v ? v.slice(0, max) : undefined;
}

/** Só dígitos, sem o 55 do país (aceita "+55 (62) 99570-0037"). */
export function somenteDigitosTelefone(telefone: string): string {
  let d = (telefone ?? "").replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  return d;
}

/** "62995700037" → "(62) 99570-0037"; "6234122828" → "(62) 3412-2828". */
export function formatarTelefoneBR(telefone: string): string {
  const d = somenteDigitosTelefone(telefone);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return telefone;
}

function telefoneValido(d: string): boolean {
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99 || d[0] === "0" || d[1] === "0") return false;
  // celular (11 dígitos) começa com 9; fixo (10 dígitos) começa com 2–5
  if (d.length === 11) return d[2] === "9";
  return /[2-5]/.test(d[2]);
}

/* ------------------------------------------------------------------ */
/* Validação                                                           */
/* ------------------------------------------------------------------ */

/** Valida e normaliza o formulário (sem libs). Mensagens em pt-BR. */
export function validarLead(d: Partial<LeadForm>): ResultadoValidacao {
  const erros: LeadErros = {};

  const nome = limparTexto(d?.nome);
  if (nome.length < LIMITES.nomeMin) erros.nome = "Informe seu nome (mínimo de 3 letras).";
  else if (nome.length > LIMITES.nomeMax) erros.nome = "O nome está muito longo.";

  const telefone = somenteDigitosTelefone(limparTexto(d?.telefone));
  if (!telefone) erros.telefone = "Informe um telefone para contato.";
  else if (!telefoneValido(telefone)) erros.telefone = "Informe um telefone válido com DDD, ex.: (62) 99999-9999.";

  const email = limparTexto(d?.email).toLowerCase();
  if (email && (email.length > LIMITES.emailMax || !EMAIL_RE.test(email))) {
    erros.email = "Informe um e-mail válido ou deixe em branco.";
  }

  const resumo = limparTexto(d?.resumo, true);
  if (resumo.length < LIMITES.resumoMin) erros.resumo = "Conte um pouco mais sobre o caso (mínimo de 10 caracteres).";
  else if (resumo.length > LIMITES.resumoMax) erros.resumo = "O resumo pode ter no máximo 1000 caracteres.";

  if (Object.keys(erros).length > 0) return { ok: false, erros };

  const dados: LeadForm = { nome, telefone, resumo };
  if (email) dados.email = email;
  const empresa = opcional(d.empresa);
  const ramo = opcional(d.ramo);
  const cargo = opcional(d.cargo);
  const area = opcional(d.area);
  if (empresa) dados.empresa = empresa;
  if (ramo) dados.ramo = ramo;
  if (cargo) dados.cargo = cargo;
  if (area) dados.area = area;
  return { ok: true, dados };
}

/* ------------------------------------------------------------------ */
/* Mensagem + URL                                                      */
/* ------------------------------------------------------------------ */

/** Link wa.me do escritório com o texto codificado. `origem` é só para rastreio (não vai na URL). */
export function buildWhatsAppUrl(opts: { mensagem: string; origem?: string }): string {
  const texto = limparTexto(opts?.mensagem ?? "", true) || MENSAGEM_WHATSAPP_PADRAO;
  return `https://wa.me/${SITE.whatsapp.numero}?text=${encodeURIComponent(texto)}`;
}

/**
 * Mensagem elegante para o WhatsApp (negrito com *asteriscos*).
 * Termina com uma linha discreta "Ref.: <área> · <campanha ou 'orgânico'>".
 * `atribuicao` é opcional (padrão: getAttribution()) — útil em testes.
 */
export function buildLeadMessage(dados: LeadForm, atribuicao?: Attribution): string {
  const attr = atribuicao ?? getAttribution();
  const area = limparTexto(dados.area) || "Geral";
  const linhas: string[] = [
    "Olá! Vim pelo site da Nicoli Sociedade de Advogados e gostaria de agendar uma reunião.",
    "",
    `*Nome:* ${limparTexto(dados.nome)}`,
    `*Telefone:* ${formatarTelefoneBR(limparTexto(dados.telefone))}`,
  ];
  const opcionais: Array<[string, string | undefined]> = [
    ["E-mail", dados.email],
    ["Empresa", dados.empresa],
    ["Ramo", dados.ramo],
    ["Cargo", dados.cargo],
    ["Área", dados.area],
  ];
  for (const [rotulo, valor] of opcionais) {
    const v = limparTexto(valor);
    if (v) linhas.push(`*${rotulo}:* ${v}`);
  }
  linhas.push("", "*Resumo do caso:*", limparTexto(dados.resumo, true), "", `_Ref.: ${area} · ${campaignLabel(attr)}_`);
  return linhas.join("\n");
}

/* ------------------------------------------------------------------ */
/* Envio                                                               */
/* ------------------------------------------------------------------ */

function gerarLeadId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    // segue para o fallback
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function abrirWhatsApp(url: string): void {
  // Sem "noopener" na feature string: com ele o navegador SEMPRE retorna null e
  // não daria para detectar bloqueio de pop-up. Cortamos o opener manualmente.
  let janela: Window | null = null;
  try {
    janela = window.open(url, "_blank");
  } catch {
    janela = null;
  }
  if (janela) {
    try {
      janela.opener = null;
    } catch {
      // cross-origin: ignorável
    }
    return;
  }
  // Pop-up bloqueado → abre na mesma aba (no celular abre o app do WhatsApp)
  window.location.href = url;
}

async function enviarConversao(dados: LeadForm, formId: string, area: string, url: string): Promise<void> {
  const leadId = gerarLeadId();
  const base = {
    form_id: formId,
    lead_area: area,
    lead_method: "whatsapp_form",
    lead_id: leadId,
    has_email: Boolean(dados.email),
    has_company: Boolean(dados.empresa),
  };
  trackEvent("form_submit", base);
  try {
    const telefoneE164 = normalizePhoneE164BR(dados.telefone) ?? undefined;
    const emailNormalizado = dados.email ? normalizeEmailForHash(dados.email) : undefined;
    await pushHashedUserData({ emailNormalizado, telefoneE164 });
  } catch {
    // enhanced conversions é opcional — nunca bloqueia o lead
  }
  await trackEventAndWait("generate_lead", { ...base, value: 1, currency: "BRL" }, TIMEOUT_NAVEGACAO_MS);
  abrirWhatsApp(url);
}

/**
 * Dispara form_submit + generate_lead (sem PII) e abre o WhatsApp.
 * Chame no onSubmit DEPOIS de `validarLead()` dar ok.
 */
export function submitLeadViaWhatsApp(dados: LeadForm, opts: { formId: string; area?: string }): string | undefined {
  if (typeof window === "undefined") return undefined;
  const area = limparTexto(opts.area ?? dados.area) || "geral";
  const mensagem = buildLeadMessage({ ...dados, area: dados.area ?? opts.area });
  const url = buildWhatsAppUrl({ mensagem, origem: opts.formId });
  enviarConversao(dados, opts.formId, area, url).catch(() => {
    // falha de medição nunca impede o contato
    window.location.href = url;
  });
  return url;
}

"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { IconeCheck, IconeWhatsApp } from "@/components/icons/Icones";
import { submitLeadViaWhatsApp, validarLead, type LeadForm as DadosLead } from "@/lib/whatsapp";
import type { Publico } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LeadFormProps {
  formId: string;
  /** Nome da área (vai na mensagem e no evento). */
  area?: string;
  publico?: Publico;
  titulo?: string;
  subtitulo?: string;
  tom?: "claro" | "escuro";
  className?: string;
}

type Erros = Partial<Record<keyof DadosLead, string>>;

const RAMOS = ["Agronegócio", "Construção civil", "Mercado imobiliário", "Transporte", "Comércio", "Serviços", "Outro"];

function mascaraTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function LeadForm({
  formId,
  area,
  publico = "empresas",
  titulo = "Agende uma conversa",
  subtitulo = "Conte brevemente o seu caso. Você continua a conversa com a nossa equipe pelo WhatsApp.",
  tom = "claro",
  className,
}: LeadFormProps) {
  const uid = useId();
  const [erros, setErros] = useState<Erros>({});
  const [telefone, setTelefone] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [urlWhatsApp, setUrlWhatsApp] = useState<string>();
  const statusRef = useRef<HTMLDivElement>(null);
  const escuro = tom === "escuro";
  const ehEmpresa = publico === "empresas";

  // O botão de envio some ao enviar: leva o foco para a confirmação (senão ele cai no <body>)
  useEffect(() => {
    if (enviado) statusRef.current?.focus();
  }, [enviado]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const campo = (k: string) => {
      const v = fd.get(k);
      return typeof v === "string" && v.trim() ? v.trim() : undefined;
    };
    const resultado = validarLead({
      nome: campo("nome"),
      telefone: campo("telefone"),
      email: campo("email"),
      empresa: campo("empresa"),
      ramo: campo("ramo"),
      cargo: campo("cargo"),
      resumo: campo("resumo"),
      area,
    });
    if (!resultado.ok) {
      setErros(resultado.erros);
      const primeiro = Object.keys(resultado.erros)[0];
      if (primeiro) document.getElementById(`${uid}-${primeiro}`)?.focus();
      return;
    }
    setErros({});
    setUrlWhatsApp(submitLeadViaWhatsApp(resultado.dados, { formId, area }));
    setEnviado(true);
  }

  const campoCls = cn(
    "peer block w-full border-0 border-b bg-transparent px-0 pb-2.5 pt-6 text-[1rem] outline-none transition-colors duration-300 placeholder:text-transparent focus:ring-0",
    escuro
      ? "border-marfim/30 text-marfim focus:border-champanhe-400"
      : "border-grafite/25 text-grafite focus:border-bordo-700",
  );
  const labelCls = cn(
    "pointer-events-none absolute left-0 top-6 origin-left text-[0.95rem] transition-transform duration-300 ease-elegante peer-focus:-translate-y-5 peer-focus:scale-[0.8] peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:scale-[0.8]",
    escuro ? "text-marfim/65" : "text-cinza",
  );

  const renderCampo = ({
    nome,
    label,
    tipo = "text",
    obrigatorio,
    auto,
    modo,
  }: {
    nome: keyof DadosLead;
    label: string;
    tipo?: string;
    obrigatorio?: boolean;
    auto?: string;
    modo?: "text" | "tel" | "email";
  }) => {
    const id = `${uid}-${nome}`;
    const erro = erros[nome];
    const ehTel = nome === "telefone";
    return (
      <div className="relative">
        <input
          id={id}
          name={nome}
          type={tipo}
          inputMode={modo}
          autoComplete={auto}
          placeholder={label}
          required={obrigatorio}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : undefined}
          className={campoCls}
          {...(ehTel
            ? { value: telefone, onChange: (ev: ChangeEvent<HTMLInputElement>) => setTelefone(mascaraTelefone(ev.target.value)) }
            : {})}
        />
        <label htmlFor={id} className={labelCls}>
          {label}
          {obrigatorio && <span aria-hidden="true"> *</span>}
        </label>
        {erro && (
          <p id={`${id}-erro`} role="alert" className={cn("mt-1.5 text-[0.8125rem]", escuro ? "text-champanhe-400" : "text-bordo-600")}>
            {erro}
          </p>
        )}
      </div>
    );
  };

  if (enviado) {
    return (
      <div ref={statusRef} tabIndex={-1} className={cn("flex flex-col items-start gap-5 outline-none", className)} role="status" aria-live="polite">
        <span className={cn("flex size-12 items-center justify-center border", escuro ? "border-champanhe-400 text-champanhe-400" : "border-bordo-700 text-bordo-700")}>
          <IconeCheck className="size-6" />
        </span>
        <p className={cn("font-display text-h3", escuro ? "text-marfim" : "text-bordo-700")}>Pronto, sua mensagem foi preparada.</p>
        <p className={escuro ? "text-marfim/75" : "text-cinza"}>
          Abrimos o WhatsApp com o resumo do seu caso. É só tocar em enviar. Se a janela não abriu, use o link abaixo.
        </p>
        {urlWhatsApp && (
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location="lead-form-confirmacao"
            className={cn("inline-flex min-h-12 items-center gap-2 text-sm font-medium underline underline-offset-4", escuro ? "text-champanhe-400" : "text-bordo-700")}
          >
            <IconeWhatsApp className="size-4" />
            Abrir o WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={() => setEnviado(false)}
          className={cn("text-sm underline underline-offset-4", escuro ? "text-marfim/80" : "text-bordo-700")}
        >
          Editar informações
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      data-form-id={formId}
      data-form-area={area}
      aria-labelledby={`${uid}-titulo`}
      className={cn("flex flex-col", className)}
    >
      <p id={`${uid}-titulo`} className={cn("font-display text-h3", escuro ? "text-marfim" : "text-bordo-700")}>
        {titulo}
      </p>
      <p className={cn("mt-2 text-[0.95rem]", escuro ? "text-marfim/70" : "text-cinza")}>{subtitulo}</p>

      <div className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {renderCampo({ nome: "nome", label: "Nome completo", obrigatorio: true, auto: "name", })}
        {renderCampo({ nome: "telefone", label: "WhatsApp", tipo: "tel", modo: "tel", obrigatorio: true, auto: "tel-national", })}
        <div className="sm:col-span-2">
          {renderCampo({ nome: "email", label: "E-mail", tipo: "email", modo: "email", auto: "email", })}
        </div>
        {ehEmpresa && (
          <>
            {renderCampo({ nome: "empresa", label: "Empresa", auto: "organization", })}
            {renderCampo({ nome: "cargo", label: "Cargo", auto: "organization-title", })}
            <div className="relative sm:col-span-2">
              <select
                id={`${uid}-ramo`}
                name="ramo"
                defaultValue=""
                className={cn(campoCls, "cursor-pointer appearance-none pt-6", escuro && "[&>option]:text-grafite")}
              >
                <option value="">Selecione</option>
                {RAMOS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <label htmlFor={`${uid}-ramo`} className={cn(labelCls, "-translate-y-5 scale-[0.8]")}>
                Ramo de atividade
              </label>
            </div>
          </>
        )}
        <div className="relative sm:col-span-2">
          <textarea
            id={`${uid}-resumo`}
            name="resumo"
            rows={3}
            required
            placeholder="Resumo do caso"
            aria-invalid={erros.resumo ? true : undefined}
            aria-describedby={erros.resumo ? `${uid}-resumo-erro` : `${uid}-resumo-dica`}
            className={cn(campoCls, "resize-none")}
          />
          <label htmlFor={`${uid}-resumo`} className={labelCls}>
            Resumo do caso<span aria-hidden="true"> *</span>
          </label>
          {erros.resumo ? (
            <p id={`${uid}-resumo-erro`} role="alert" className={cn("mt-1.5 text-[0.8125rem]", escuro ? "text-champanhe-400" : "text-bordo-600")}>
              {erros.resumo}
            </p>
          ) : (
            <p id={`${uid}-resumo-dica`} className={cn("mt-1.5 text-[0.75rem]", escuro ? "text-marfim/60" : "text-cinza")}>
              Não inclua dados sensíveis. Os detalhes são tratados com sigilo na conversa.
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="group/btn mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-whatsapp px-6 text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-white transition-[transform,box-shadow,filter] duration-300 ease-elegante hover:brightness-110 hover:shadow-[0_14px_30px_-12px_rgba(31,122,77,0.6)] active:scale-[0.98] motion-safe:hover:-translate-y-0.5"
      >
        <IconeWhatsApp className="size-5" />
        Enviar e continuar no WhatsApp
      </button>
      <p className={cn("mt-4 text-[0.75rem] leading-relaxed", escuro ? "text-marfim/60" : "text-cinza")}>
        Ao enviar, você concorda com a nossa{" "}
        <Link href="/politica-de-privacidade" className="underline underline-offset-2">
          Política de Privacidade
        </Link>
        . Seus dados são usados apenas para retornar o contato.
      </p>
    </form>
  );
}

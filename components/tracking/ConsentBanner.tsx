"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { CONSENT_OPEN_EVENT, readConsent, saveConsent } from "@/lib/tracking";

const CSS_VAR = "--consent-h";
const MQ_DESKTOP = "(min-width: 640px)";
const FOCAVEIS = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const noop = () => () => {};
/** false no servidor e na hidratação; true depois — o banner nunca entra no HTML estático (sem CLS/LCP). */
function useHidratado(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

function definirAltura(px: number): void {
  try {
    document.documentElement.style.setProperty(CSS_VAR, `${Math.max(0, Math.round(px))}px`);
  } catch {
    // ignore
  }
}

interface InterruptorProps {
  id: string;
  rotulo: string;
  descricao: string;
  ativo: boolean;
  onChange: (valor: boolean) => void;
}

function Interruptor({ id, rotulo, descricao, ativo, onChange }: InterruptorProps) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-pedra py-4">
      <div>
        <p id={`${id}-rotulo`} className="text-[0.95rem] font-medium text-grafite">
          {rotulo}
        </p>
        <p id={`${id}-desc`} className="mt-1 text-sm leading-relaxed text-cinza">
          {descricao}
        </p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={ativo}
        aria-labelledby={`${id}-rotulo`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!ativo)}
        className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-[2px] border transition-colors duration-200 ${
          ativo ? "border-bordo-700 bg-bordo-700" : "border-pedra bg-areia"
        }`}
      >
        <span className="sr-only">{ativo ? "Ativado" : "Desativado"}</span>
        <span
          aria-hidden="true"
          className={`inline-block h-4 w-4 rounded-[1px] bg-marfim shadow-sm transition-transform duration-200 ${
            ativo ? "translate-x-[22px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

/**
 * Banner LGPD (Consent Mode v2). Discreto no canto inferior esquerdo; no
 * celular ocupa a largura toda e publica a altura em `--consent-h` no <html>
 * para o botão flutuante do WhatsApp subir: `bottom: calc(1rem + var(--consent-h, 0px))`.
 * Reabra com `openConsentPreferences()` (lib/tracking.ts).
 */
export function ConsentBanner() {
  const hidratado = useHidratado();
  const [decidiuAgora, setDecidiuAgora] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  const bannerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const retornoFoco = useRef<HTMLElement | null>(null);
  const uid = useId();
  const tituloId = `${uid}-titulo`;
  const descId = `${uid}-desc`;
  const modalTituloId = `${uid}-modal-titulo`;

  const mostrarBanner = hidratado && !decidiuAgora && readConsent() === null;

  const abrirPreferencias = useCallback(() => {
    const salvo = readConsent();
    setAnalytics(salvo ? salvo.analytics : true);
    setMarketing(salvo ? salvo.marketing : true);
    retornoFoco.current = (document.activeElement as HTMLElement | null) ?? null;
    setAberto(true);
  }, []);

  const fecharPreferencias = useCallback(() => {
    setAberto(false);
    window.requestAnimationFrame(() => retornoFoco.current?.focus?.());
  }, []);

  const decidir = useCallback(
    (escolha: { analytics: boolean; marketing: boolean }, origem: string) => {
      saveConsent(escolha, origem);
      setDecidiuAgora(true);
      if (aberto) fecharPreferencias();
    },
    [aberto, fecharPreferencias],
  );

  // Reabrir pelas "Preferências de cookies" do rodapé
  useEffect(() => {
    window.addEventListener(CONSENT_OPEN_EVENT, abrirPreferencias);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, abrirPreferencias);
  }, [abrirPreferencias]);

  // Altura exposta em --consent-h (só no celular, onde o banner cobre a base da tela)
  useEffect(() => {
    const el = bannerRef.current;
    if (!mostrarBanner || !el) {
      definirAltura(0);
      return;
    }
    const mq = window.matchMedia(MQ_DESKTOP);
    const atualizar = () => definirAltura(mq.matches ? 0 : el.getBoundingClientRect().height);
    atualizar();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(atualizar) : null;
    ro?.observe(el);
    mq.addEventListener("change", atualizar);
    return () => {
      ro?.disconnect();
      mq.removeEventListener("change", atualizar);
      definirAltura(0);
    };
  }, [mostrarBanner]);

  // Foco inicial no modal
  useEffect(() => {
    if (!aberto) return;
    const primeiro = modalRef.current?.querySelector<HTMLElement>(FOCAVEIS);
    primeiro?.focus();
  }, [aberto]);

  const onKeyDownModal = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      fecharPreferencias();
      return;
    }
    if (e.key !== "Tab" || !modalRef.current) return;
    const itens = Array.from(modalRef.current.querySelectorAll<HTMLElement>(FOCAVEIS));
    if (itens.length === 0) return;
    const primeiro = itens[0];
    const ultimo = itens[itens.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  };

  if (!hidratado) return null;

  const botaoBase =
    "inline-flex min-h-11 items-center justify-center rounded-[2px] px-5 text-[0.8125rem] font-medium uppercase tracking-[0.12em] transition-colors duration-200";

  return (
    <>
      {mostrarBanner ? (
        <div
          ref={bannerRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={tituloId}
          aria-describedby={descId}
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-pedra bg-marfim text-grafite shadow-[0_-8px_30px_rgba(30,26,24,0.08)] sm:inset-x-auto sm:bottom-5 sm:right-24 sm:max-w-[26rem] sm:border"
        >
          <div aria-hidden="true" className="h-[3px] w-full bg-bordo-700" />
          <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            <p id={tituloId} className="font-display text-[1.375rem] leading-tight text-bordo-700">
              Sua privacidade
            </p>
            <p id={descId} className="mt-2 text-[0.9375rem] leading-relaxed text-cinza">
              Usamos cookies essenciais e, com a sua permissão, cookies de medição e de marketing para entender o
              uso do site e avaliar nossos anúncios. Saiba mais na{" "}
              <Link
                href="/politica-de-privacidade"
                className="text-bordo-700 underline underline-offset-[3px] hover:text-bordo-600"
              >
                Política de Privacidade
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => decidir({ analytics: true, marketing: true }, "banner_aceitar")}
                className={`${botaoBase} flex-1 bg-bordo-700 text-marfim hover:bg-bordo-800 sm:flex-none`}
              >
                Aceitar
              </button>
              <button
                type="button"
                onClick={() => decidir({ analytics: false, marketing: false }, "banner_recusar")}
                className={`${botaoBase} flex-1 border border-bordo-700 text-bordo-700 hover:bg-bordo-100 sm:flex-none`}
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={abrirPreferencias}
                className="min-h-11 px-2 text-sm text-champanhe-700 underline underline-offset-[3px] hover:text-bordo-700"
              >
                Preferências
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {aberto ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-grafite/50 sm:items-center sm:p-6">
          <div className="absolute inset-0" aria-hidden="true" onClick={fecharPreferencias} />
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTituloId}
            onKeyDown={onKeyDownModal}
            className="relative w-full max-w-lg border border-pedra bg-marfim text-grafite shadow-xl sm:rounded-[2px]"
          >
            <div aria-hidden="true" className="h-[3px] w-full bg-bordo-700" />
            <div className="px-5 pb-5 pt-5 sm:px-7 sm:pb-7">
              <div className="flex items-start justify-between gap-4">
                <h2 id={modalTituloId} className="font-display text-[1.625rem] leading-tight text-bordo-700">
                  Preferências de cookies
                </h2>
                <button
                  type="button"
                  onClick={fecharPreferencias}
                  aria-label="Fechar preferências"
                  className="-mr-2 -mt-1 inline-flex h-11 w-11 items-center justify-center text-2xl leading-none text-cinza hover:text-bordo-700"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-cinza">
                Escolha o que podemos usar. Você pode mudar quando quiser pelo rodapé do site.
              </p>
              <div className="mt-4">
                <div className="flex items-start justify-between gap-6 border-t border-pedra py-4">
                  <div>
                    <p className="text-[0.95rem] font-medium text-grafite">Essenciais</p>
                    <p className="mt-1 text-sm leading-relaxed text-cinza">
                      Necessários para o site funcionar e para lembrar a sua escolha.
                    </p>
                  </div>
                  <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.12em] text-champanhe-700">
                    Sempre ativos
                  </span>
                </div>
                <Interruptor
                  id={`${uid}-analytics`}
                  rotulo="Medição (Analytics)"
                  descricao="Estatísticas de visitas e navegação, de forma agregada (Google Analytics)."
                  ativo={analytics}
                  onChange={setAnalytics}
                />
                <Interruptor
                  id={`${uid}-marketing`}
                  rotulo="Marketing"
                  descricao="Mensuração de anúncios e remarketing (Google Ads e Meta)."
                  ativo={marketing}
                  onChange={setMarketing}
                />
              </div>
              <div className="mt-2 flex flex-col-reverse gap-2 border-t border-pedra pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => decidir({ analytics, marketing }, "preferencias_salvar")}
                  className={`${botaoBase} border border-bordo-700 text-bordo-700 hover:bg-bordo-100`}
                >
                  Salvar preferências
                </button>
                <button
                  type="button"
                  onClick={() => decidir({ analytics: true, marketing: true }, "preferencias_aceitar")}
                  className={`${botaoBase} bg-bordo-700 text-marfim hover:bg-bordo-800`}
                >
                  Aceitar todos
                </button>
              </div>
              <p className="mt-4 text-xs text-cinza">
                Detalhes na{" "}
                <Link href="/politica-de-privacidade" className="text-bordo-700 underline underline-offset-[3px]">
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

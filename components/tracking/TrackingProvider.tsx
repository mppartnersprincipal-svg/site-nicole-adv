"use client";

import Script from "next/script";
import type { ReactNode } from "react";
import { consentBootstrapSnippet } from "@/lib/attribution-core";
import { GTM_ID } from "@/lib/tracking";

interface TrackingProviderProps {
  /** Opcional: o provider não exige envolver a árvore (pode ser usado sozinho). */
  children?: ReactNode;
}

const GTM_ID_VALIDO = /^GTM-[A-Z0-9]+$/.test(GTM_ID) ? GTM_ID : "";

function gtmLoaderSnippet(id: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
}

/**
 * Scripts de medição.
 * 1) Consent Mode v2 (default DENIED, região BR, wait_for_update 500) — `beforeInteractive`,
 *    antes de qualquer código do Next. Restaura a escolha salva no cookie `nicoli_consent`.
 * 2) GTM — `afterInteractive` (não bloqueia LCP). O loader repete o snippet de consentimento
 *    (idempotente) para garantir a ordem mesmo se o 1º não tiver rodado.
 * Sem NEXT_PUBLIC_GTM_ID, só o consentimento é inicializado (nenhum script de terceiro).
 */
export function TrackingProvider({ children }: TrackingProviderProps) {
  const consentimento = consentBootstrapSnippet();
  return (
    <>
      {/* Regra do Pages Router; no App Router o beforeInteractive vale no root layout (onde <Analytics /> fica). */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script id="nicoli-consent-default" strategy="beforeInteractive">
        {consentimento}
      </Script>
      {GTM_ID_VALIDO ? (
        <>
          <Script id="nicoli-gtm" strategy="afterInteractive">
            {consentimento + gtmLoaderSnippet(GTM_ID_VALIDO)}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID_VALIDO}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}
      {children}
    </>
  );
}

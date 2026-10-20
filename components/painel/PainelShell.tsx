import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BotaoSair } from "./BotaoSair";

/** Casca do painel: cabeçalho escuro com logo, link para o site e Sair (como o AdminShell da Sólida). */
export function PainelShell({ children, isLogado }: { children: ReactNode; isLogado: boolean }) {
  return (
    <div className="min-h-dvh bg-surface-alt font-sans">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-bordo-900 text-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo estático pequeno; invertido para o fundo escuro */}
            <img src="/brand/logo-horizontal-bordo.png" alt="Nicoli Sociedade de Advogados" className="h-8 w-auto brightness-0 invert" />
            <span className="hidden text-xs font-semibold tracking-[0.2em] text-champanhe-400 uppercase sm:inline">Painel</span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              <span className="hidden sm:inline">Ver site</span>
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
            {isLogado ? <BotaoSair /> : null}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>
    </div>
  );
}

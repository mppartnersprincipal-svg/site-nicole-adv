"use client";

import { useState, type FormEvent } from "react";

interface LoginPainelProps {
  onEntrar: () => void;
}

export function LoginPainel({ onEntrar }: LoginPainelProps) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isEnviando, setIsEnviando] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsEnviando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/painel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: senha }),
      });
      if (resposta.ok) {
        onEntrar();
        return;
      }
      const corpo = (await resposta.json().catch(() => ({}))) as { error?: string };
      setErro(corpo.error ?? "Não foi possível entrar. Tente novamente.");
    } catch {
      setErro("Sem conexão com o servidor. Tente novamente.");
    } finally {
      setIsEnviando(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-bordo-900 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-marfim p-8 shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element -- logo estático pequeno, sem otimização necessária */}
        <img src="/brand/logo-horizontal-bordo.png" alt="Nicoli Sociedade de Advogados" className="h-10 w-auto" />
        <h1 className="mt-8 font-display text-3xl text-bordo-700">Painel de resultados</h1>
        <p className="mt-2 text-sm text-cinza">Google Analytics e Google Ads do site.</p>
        <label htmlFor="senha" className="mt-8 block text-sm font-medium text-grafite">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mt-2 w-full border border-pedra bg-branco px-3 py-3 text-grafite outline-none focus:border-bordo-700 focus:ring-2 focus:ring-champanhe-400"
        />
        {erro && (
          <p role="alert" className="mt-3 text-sm text-bordo-600">
            {erro}
          </p>
        )}
        <button
          type="submit"
          disabled={isEnviando}
          className="mt-6 w-full bg-bordo-700 px-4 py-3 text-sm font-medium uppercase tracking-[0.14em] text-marfim transition hover:bg-bordo-600 disabled:opacity-60"
        >
          {isEnviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

/** Login por senha única (POST /api/painel/login → cookie httpOnly); depois recarrega o painel no servidor. */
export function LoginPainel() {
  const router = useRouter();
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
        router.refresh();
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
    <div className="grid min-h-[60vh] place-items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-[0_8px_24px_rgba(30,26,24,0.06)]">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-tint text-brand-action">
          <Lock aria-hidden className="size-4" />
        </span>
        <h1 className="mt-5 font-sans text-2xl font-bold text-ink">Painel de resultados</h1>
        <p className="mt-1 text-sm text-ink-muted">Visitas, contatos, Google Ads e GA4 do site.</p>
        <label htmlFor="senha" className="mt-6 block text-sm font-semibold text-ink">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mt-2 min-h-11 w-full rounded-full border border-line bg-white px-4 text-ink outline-none focus:border-brand-action focus:ring-2 focus:ring-champanhe-400"
        />
        {erro ? (
          <p role="alert" className="mt-3 text-sm text-brand-hover">
            {erro}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isEnviando}
          className="mt-6 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-action px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {isEnviando ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
          {isEnviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

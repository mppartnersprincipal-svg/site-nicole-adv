"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { sairDoPainel } from "@/app/(painel)/dashboard/actions";

export function BotaoSair() {
  const router = useRouter();
  const [isSaindo, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isSaindo}
      onClick={() =>
        startTransition(async () => {
          await sairDoPainel();
          router.refresh();
        })
      }
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-sm font-semibold text-white/80 transition-colors hover:border-white hover:text-white disabled:opacity-60"
    >
      <LogOut aria-hidden className="size-3.5" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}

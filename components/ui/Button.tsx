import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconeSeta, IconeWhatsApp } from "@/components/icons/Icones";

type Variante = "primario" | "contorno" | "claro" | "contorno-claro" | "whatsapp" | "texto";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variante?: Variante;
  className?: string;
  /** Mostra seta (padrão) ou ícone do WhatsApp para variante whatsapp. */
  icone?: boolean;
  externo?: boolean;
  trackEvent?: string;
  trackLabel?: string;
  trackLocation?: string;
  ariaLabel?: string;
}

const BASE =
  "group/btn relative inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 py-3 text-[0.8125rem] font-medium uppercase tracking-[0.16em] transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-elegante active:scale-[0.98] motion-safe:hover:-translate-y-0.5";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-bordo-700 text-marfim shadow-[0_1px_0_0_var(--cor-bordo-900)] hover:bg-bordo-800 hover:shadow-[0_14px_30px_-12px_rgba(83,1,3,0.55)]",
  contorno:
    "border border-bordo-700/40 text-bordo-700 hover:border-bordo-700 hover:bg-bordo-700 hover:text-marfim",
  claro: "bg-marfim text-bordo-800 hover:bg-white hover:shadow-[0_14px_30px_-12px_rgba(0,0,0,0.45)]",
  "contorno-claro": "border border-marfim/40 text-marfim hover:border-marfim hover:bg-marfim hover:text-bordo-800",
  whatsapp:
    "bg-whatsapp text-white hover:brightness-110 hover:shadow-[0_14px_30px_-12px_rgba(31,122,77,0.6)]",
  texto:
    "min-h-0 rounded-none px-0 py-1 text-bordo-700 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-100 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-0 motion-safe:hover:translate-y-0",
};

export function Button({
  href,
  children,
  variante = "primario",
  className,
  icone = true,
  externo,
  trackEvent,
  trackLabel,
  trackLocation,
  ariaLabel,
}: ButtonProps) {
  const ehExterno = externo ?? /^(https?:|tel:|mailto:)/.test(href);
  const classes = cn(BASE, VARIANTES[variante], className);
  const conteudo = (
    <>
      {variante === "whatsapp" && <IconeWhatsApp className="size-5 shrink-0" />}
      <span>{children}</span>
      {icone && variante !== "whatsapp" && (
        <IconeSeta className="size-4 shrink-0 transition-transform duration-300 ease-elegante group-hover/btn:translate-x-1" />
      )}
    </>
  );
  const dataAttrs = {
    "data-track": trackEvent,
    "data-track-label": trackLabel ?? (typeof children === "string" ? children : undefined),
    "data-track-location": trackLocation,
  };

  if (ehExterno) {
    const novaAba = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        {...(novaAba ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...dataAttrs}
      >
        {conteudo}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={ariaLabel} {...dataAttrs}>
      {conteudo}
    </Link>
  );
}

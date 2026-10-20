import type { SVGProps } from "react";

/**
 * Símbolo da Nicoli Sociedade de Advogados: moldura quadrada aberta + "N" de linhas paralelas + ®.
 *
 * Variantes:
 * - `completo` (padrão): fiel ao original, para 64px de altura ou mais.
 * - `compacto`: "N" de traço único e sem ®, legível em 24–48px (header, favicon).
 * Vetorizado a partir da identidade visual oficial (potrace). Usa `currentColor`:
 * defina a cor via CSS (ex.: `text-[#530103]` no fundo claro, `text-[#FAF7F2]` no escuro).
 * Sem width/height fixos — dimensione com classes (ex.: `h-10 w-auto`).
 */
export interface LogoSimboloProps extends SVGProps<SVGSVGElement> {
  /** Texto acessível. Sem `title`, o SVG é tratado como decorativo (aria-hidden). */
  title?: string;
  variante?: "completo" | "compacto";
}

const PATHS = {
  completo:
    "m3.3 3.1c-.5.5-.4 489.8.1 490 .7.3 207.1.2 207.6-.1.5-.3.5-.6.5-9.8l-.3-9.9-187.4-.5c-.6-.4-.6-448.9 0-449.3.7-.5 448.3-.3 448.7.2.3.3.4 14.9.4 92.5l.2 92.5 9.9.3c9.4 0 9.7 0 10-.5.4-.7.4-204.6 0-205.3-.3-.4-3.3-.4-244.8-.4zm367 42.1l-2.5.8c-.8 0-3.8 1.7-5.3 3.1-1.2 1.2-3.5 4.8-3.5 5.6l-.4.9c-.7.7-.7 7.8-.1 8.6l.7 1.3c.7 2.5 3.5 5.7 6.3 7.1l1.8 1.1 4.2 1.1c1.7.3 6.2-.5 7.2-1.3l2.6-1.6c6-4 8-12 4.7-18.6-3-5.9-9.6-9.3-15.7-8.1zm-1.2 1.6c-12.5 3.8-13.3 20.3-1.3 25.7 2.8 1.2 9 .8 11.5-.8l1-.5c.7-.4 3.7-3.3 3.7-3.6l1.7-3.6c.6-1.3.6-7 0-8.4-1.4-3.1-2.1-4.2-3.6-5.6-3.5-3.2-8.6-4.5-13-3.2zm-.6 5.4c-1.2.2-1.3.3-1.2 8.1l.1 7.3.7.3c1.2.4 1.4-.3 1.4-3.6 0-3.3.1-3.5 2.7-3.2 2.4.2 3.5 1.4 3.9 3.9.2 1.7 1.1 2.9 2 2.9.6 0 .8-.1.9-.6.1-1.1-1.7-5.9-2.4-6.2-.6-.2-.4-.8.5-1.5 2.5-2.2 2.2-5.3-.6-6.8-1.1-.7-5.9-1-8-.6zm1.6 1.7c-.5.3-.6.6-.6 2.6 0 2.8 0 2.8 3 2.7 2.3-.1 2.3-.1 3.2-1.1.9-1 1-2 .2-3.2-.8-1.2-4.6-1.9-5.8-1zm-61 7.5c-.3.3-.3 14.3-.3 150 0 136.4-.1 149.6-.4 149.5l-.5-.1-131.7-201.9c-.4-1-.7-1.2-1.1-.9-.3.3-.4 3.7-.3 17.6l-.2 17.3c-.2.3-1.3-.6-1.5-1.2l-20.3-31.4c-1.4-2.2-2-2.9-2.3-2.7-.5.3-.3 268.3.2 268.7.7.6 8.5.5 8.9-.2.4-.4.4-16.8.4-118.4l.1-118.2c.3-.5.6-.2 1.9 1.9l12.8 19.7v107.3c0 93.3 0 107.3.3 107.8.4.4.6.5 4.1.5l4.8-.4v-99.9c0-83.3.1-99.9.3-100.1.3-.2.7.2 1.9 2.3l129.8 199c.3.8 1.5 2 1.8 1.7l.3-17.3c0-14.8.1-17.1.4-17.1.3 0 1.6 1.8 7.3 10.5l14.4 22.2c.6 1.1 1.5 2 1.8 1.8l.3-184c0-181.5-.1-183.9-.5-184.1-.7-.4-7.7-.4-8.3 0-.5.2-.5 2.4-.5 168.4l-.2 168.4c-.4.2-1.4-1-3.4-4.2l-11.4-17.3v-157.6c0-155.4 0-157.5-.5-157.7-.8-.5-7.9-.4-8.4.1zm-125 128.2v18.8l122.1 187.2c1.2 1.9 1.9 2.7 2.4 2.7l.2-19-123.7-189.7c-.2-.8-.8-.8-1 0z",
  compacto:
    "m3.3 3.1c-.5.5-.4 489.8.1 490 .7.3 207.1.2 207.6-.1.5-.3.5-.6.5-9.8l-.3-9.9-187.4-.5c-.6-.4-.6-448.9 0-449.3.7-.5 448.3-.3 448.7.2.3.3.4 14.9.4 92.5l.2 92.5 9.9.3c9.4 0 9.7 0 10-.5.4-.7.4-204.6 0-205.3-.3-.4-3.3-.4-244.8-.4zM156 165L181 165L314.5 389.6L314.5 61L335.5 61L335.5 425L310.5 425L177 200.4L177 425L156 425z",
} as const;

export function LogoSimbolo({ title, variante = "completo", ...props }: LogoSimboloProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 495 495"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path fillRule={variante === "completo" ? "evenodd" : undefined} d={PATHS[variante]} />
    </svg>
  );
}

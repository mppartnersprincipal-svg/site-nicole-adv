import { IconeMais } from "@/components/icons/Icones";
import type { Faq } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FaqListaProps {
  faqs: Faq[];
  tom?: "claro" | "escuro";
}

/**
 * Acordeão nativo (<details>): acessível por teclado, sem JS, e com as respostas
 * no HTML — indexáveis por buscadores e citáveis por IAs (GEO).
 */
export function FaqLista({ faqs, tom = "claro" }: FaqListaProps) {
  const escuro = tom === "escuro";
  return (
    <div className={cn("border-t", escuro ? "border-marfim/15" : "border-pedra")}>
      {faqs.map((faq, i) => (
        <details
          key={faq.pergunta}
          className={cn("group border-b", escuro ? "border-marfim/15" : "border-pedra")}
          {...(i === 0 ? { open: true } : {})}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden",
              escuro ? "text-marfim" : "text-grafite",
            )}
          >
            <h3 className="font-display text-[1.3rem] leading-snug md:text-[1.45rem]">{faq.pergunta}</h3>
            <span
              className={cn(
                "mt-1 flex size-9 shrink-0 items-center justify-center border transition-[transform,background-color,color] duration-500 ease-elegante group-open:rotate-45",
                escuro
                  ? "border-marfim/25 text-champanhe-400 group-open:bg-champanhe-500 group-open:text-bordo-900"
                  : "border-bordo-700/30 text-bordo-700 group-open:bg-bordo-700 group-open:text-marfim",
              )}
              aria-hidden="true"
            >
              <IconeMais className="size-4" />
            </span>
          </summary>
          <p className={cn("max-w-3xl pb-7 pr-12 leading-relaxed", escuro ? "text-marfim/75" : "text-cinza")}>
            {faq.resposta}
          </p>
        </details>
      ))}
    </div>
  );
}

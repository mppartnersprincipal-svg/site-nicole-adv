import type { ReactNode } from "react";
import { TextoAnimado, type EfeitoTexto, type EfeitoTitulo } from "@/components/motion/TextoAnimado";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  titulo: ReactNode;
  texto?: ReactNode;
  id?: string;
  alinhamento?: "esquerda" | "centro";
  tom?: "claro" | "escuro";
  nivel?: "h2" | "h3";
  /** Efeito da headline ao entrar na tela — varie por seção. */
  efeito?: EfeitoTitulo;
  className?: string;
}

/** Cada efeito de título tem uma subheadline "par", para o conjunto ter coerência. */
const PAR_DO_TEXTO: Record<EfeitoTitulo, EfeitoTexto> = {
  mascara: "linhas",
  letras: "subir",
  desfoque: "desfoque",
  inclinado: "linhas",
  lateral: "lateral",
  escala: "subir",
  palavras: "linhas",
  cortina: "lateral",
  dispersao: "desfoque",
};

export function SectionHeading({
  eyebrow,
  titulo,
  texto,
  id,
  alinhamento = "esquerda",
  tom = "claro",
  nivel = "h2",
  efeito = "mascara",
  className,
}: SectionHeadingProps) {
  const escuro = tom === "escuro";
  return (
    <div
      className={cn(
        "max-w-3xl",
        alinhamento === "centro" && "mx-auto text-center [&_.eyebrow]:justify-center",
        className,
      )}
    >
      {eyebrow && (
        <TextoAnimado as="p" efeito="cortina" className={cn("eyebrow mb-5", escuro ? "text-champanhe-400" : "text-champanhe-700")}>
          {eyebrow}
        </TextoAnimado>
      )}
      <TextoAnimado
        as={nivel}
        id={id}
        efeito={efeito}
        atraso={0.1}
        className={cn(nivel === "h2" ? "text-h2" : "text-h3", escuro ? "text-marfim" : "text-bordo-700")}
      >
        {titulo}
      </TextoAnimado>
      {texto && (
        <TextoAnimado
          as="p"
          efeito={PAR_DO_TEXTO[efeito]}
          atraso={0.35}
          className={cn("mt-6 text-lead", escuro ? "text-marfim/75" : "text-cinza")}
        >
          {texto}
        </TextoAnimado>
      )}
    </div>
  );
}

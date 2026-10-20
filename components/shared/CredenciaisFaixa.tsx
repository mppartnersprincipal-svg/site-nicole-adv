import { cn } from "@/lib/utils";

/** Provas de autoridade — somente fatos do briefing (sem números de casos/resultados). */
const CREDENCIAIS = [
  { valor: "23+", rotulo: "anos de advocacia trabalhista do sócio-fundador" },
  { valor: "Mestre", rotulo: "em Direito do Trabalho" },
  { valor: "11", rotulo: "áreas de atuação com núcleos especializados" },
  { valor: "Brasil", rotulo: "atuação em todo o território nacional" },
];

interface CredenciaisFaixaProps {
  itens?: Array<{ valor: string; rotulo: string }>;
  tom?: "claro" | "escuro";
  className?: string;
}

export function CredenciaisFaixa({ itens = CREDENCIAIS, tom = "claro", className }: CredenciaisFaixaProps) {
  const escuro = tom === "escuro";
  return (
    <dl
      className={cn(
        "grid grid-cols-2 border-y lg:grid-cols-4",
        escuro ? "border-marfim/15 text-marfim" : "border-pedra text-grafite",
        className,
      )}
    >
      {itens.map((c, i) => (
        <div
          key={c.rotulo}
          className={cn(
            "flex flex-col gap-1 px-1 py-6 sm:px-6 lg:py-8",
            i % 2 === 1 && "border-l",
            i >= 2 && "border-t lg:border-t-0",
            i === 2 && "lg:border-l",
            escuro ? "border-marfim/15" : "border-pedra",
          )}
        >
          <dt className="sr-only">{c.rotulo}</dt>
          <dd className={cn("font-display text-[2rem] leading-none md:text-[2.5rem]", escuro ? "text-champanhe-400" : "text-bordo-700")}>
            {c.valor}
          </dd>
          <dd className={cn("text-[0.85rem] leading-snug", escuro ? "text-marfim/70" : "text-cinza")}>{c.rotulo}</dd>
        </div>
      ))}
    </dl>
  );
}

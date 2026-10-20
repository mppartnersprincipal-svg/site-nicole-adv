import { LogoSimbolo } from "@/components/brand/LogoSimbolo";
import { cn } from "@/lib/utils";

interface LogoHeaderProps {
  className?: string;
}

/**
 * Assinatura horizontal para alturas pequenas (header): símbolo compacto + wordmark
 * em Jost, que reproduz a geometria do "NICOLI" da logo e se mantém legível em 40px.
 */
export function LogoHeader({ className }: LogoHeaderProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoSimbolo variante="compacto" className="h-10 w-auto shrink-0 md:h-11" />
      <span className="flex flex-col leading-none">
        <span className="font-sans text-[1.35rem] font-medium tracking-[0.12em] md:text-[1.5rem]">NICOLI</span>
        <span className="mt-1 font-sans text-[0.5rem] tracking-[0.32em] md:text-[0.55rem]">SOCIEDADE DE ADVOGADOS</span>
      </span>
    </span>
  );
}

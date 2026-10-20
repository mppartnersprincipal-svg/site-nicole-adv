"use client";

import { animated, useSpring } from "@react-spring/web";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Atraso em ms (útil para escalonar itens de uma lista). */
  delay?: number;
  /** Deslocamento vertical inicial em px. */
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}

const SPRING_ELEGANTE = { tension: 120, friction: 24, mass: 1 };

function prefereMenosMovimento(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Fade-in + slide-up ao entrar na viewport (IntersectionObserver + react-spring).
 * Nunca usar em elementos candidatos a LCP (hero) — eles devem pintar imediatamente.
 */
export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefereMenosMovimento()) {
      setVisivel(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setVisivel(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const estilo = useSpring({
    opacity: visivel ? 1 : 0,
    transform: visivel ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
    delay: visivel ? delay : 0,
    config: SPRING_ELEGANTE,
  });

  const Componente = animated[as];
  return (
    <Componente ref={ref as never} style={estilo} className={className} data-reveal="">
      {children}
    </Componente>
  );
}

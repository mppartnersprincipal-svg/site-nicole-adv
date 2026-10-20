"use client";

import { useSyncExternalStore } from "react";

const CONSULTA = "(prefers-reduced-motion: reduce)";

function assinar(aviso: () => void): () => void {
  const mql = window.matchMedia(CONSULTA);
  mql.addEventListener("change", aviso);
  return () => mql.removeEventListener("change", aviso);
}

/** true quando o sistema pede menos animação (substitui o useReducedMotion do framer-motion). */
export function useMenosMovimento(): boolean {
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(CONSULTA).matches,
    () => true,
  );
}

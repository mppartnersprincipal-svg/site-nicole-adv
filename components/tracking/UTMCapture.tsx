"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/tracking";

/**
 * Captura UTMs e click IDs (gclid, gbraid, wbraid, fbclid) na entrada e a cada
 * troca de rota. Lê `window.location.search` direto (sem useSearchParams, para
 * não forçar CSR bailout). Não renderiza nada.
 */
export function UTMCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
  }, [pathname]);

  return null;
}

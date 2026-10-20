import { Suspense } from "react";
import { ConsentBanner } from "./ConsentBanner";
import { TrackingEvents } from "./TrackingEvents";
import { TrackingProvider } from "./TrackingProvider";
import { UTMCapture } from "./UTMCapture";

/**
 * Componente único de medição — coloque UMA vez dentro do <body> do app/layout.tsx.
 * Não precisa envolver children.
 *
 * - Scripts (Consent Mode + GTM) ficam fora do Suspense → entram no shell estático.
 * - UTMCapture/TrackingEvents usam usePathname → dentro de <Suspense> (cacheComponents).
 */
export function Analytics() {
  return (
    <>
      <TrackingProvider />
      <Suspense fallback={null}>
        <UTMCapture />
        <TrackingEvents />
      </Suspense>
      <ConsentBanner />
    </>
  );
}

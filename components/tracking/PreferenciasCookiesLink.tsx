"use client";

import { openConsentPreferences } from "@/lib/tracking";

export function PreferenciasCookiesLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => openConsentPreferences()} className={className}>
      Preferências de cookies
    </button>
  );
}

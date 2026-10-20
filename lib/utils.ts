/** Junta classes condicionais sem dependências externas. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function absoluteUrl(path: string, base: string): string {
  return new URL(path, base).toString();
}

const DATA_FMT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatarData(iso: string): string {
  return DATA_FMT.format(new Date(`${iso}T12:00:00Z`));
}

export function tempoLeitura(texto: string): number {
  const PALAVRAS_POR_MINUTO = 200;
  const palavras = texto.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palavras / PALAVRAS_POR_MINUTO));
}

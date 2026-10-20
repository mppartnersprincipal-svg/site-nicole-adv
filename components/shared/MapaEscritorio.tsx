import { SITE } from "@/lib/site";

interface MapaEscritorioProps {
  className?: string;
}

/** Mapa do Google com a sede. Carrega só quando entra na viewport (loading="lazy"). */
export function MapaEscritorio({ className = "h-[420px]" }: MapaEscritorioProps) {
  return (
    <iframe
      title={`Mapa: ${SITE.nome}, ${SITE.endereco.rua}, ${SITE.endereco.bairro}, ${SITE.endereco.cidade}`}
      src={SITE.mapsEmbedUrl}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={`block w-full border-0 grayscale-[0.6] sepia-[0.15] ${className}`}
    />
  );
}

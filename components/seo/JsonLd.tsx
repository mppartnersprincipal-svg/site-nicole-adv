interface JsonLdProps {
  data: Record<string, unknown>;
}

/** JSON-LD com escape de "<" — conteúdo vem só de dados internos do site. */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

import type { SVGProps } from "react";

/** Ícones das áreas de atuação, desenhados com traço fino e cantos retos. */

const PATHS: Record<string, string[]> = {
  empresa: ["M4 20V8h7v12", "M11 20V4h9v16", "M3 20h18", "M14 8h3M14 12h3M14 16h3M7 12h1M7 16h1"],
  "trabalho-empresa": ["M3 8h18v11H3z", "M8 8V5h8v3", "M3 13h18", "M11 12h2v2h-2z"],
  civil: ["M12 3v18", "M5 21h14", "M4 8h16", "m4 8-2 6h4z", "m20 8-2 6h4z", "M12 3l-2 2h4z"],
  agro: ["M12 21V9", "M12 13c-4 0-6-3-6-6 4 0 6 3 6 6Z", "M12 11c0-4 2.5-6 6-6 0 4-2.5 6-6 6Z", "M5 21h14"],
  tributario: ["M5 3h14v18H5z", "M8 7h8", "M8 11h2M14 11h2M8 15h2M14 15h2", "M8 18h8"],
  holding: ["M12 3 3 8h18z", "M5 8v10M9.7 8v10M14.3 8v10M19 8v10", "M3 21h18", "M3 18h18"],
  contencioso: ["m14 4 6 6", "m11 7 6 6", "m12.5 5.5-6 6", "m4 20 6.5-6.5", "M13 21h8"],
  trabalhador: ["M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2", "M12 13v4"],
  familia: ["M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M17 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M2 21v-3a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v3", "M14 21v-2.5a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4V21"],
  saude: ["M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"],
  previdencia: ["M4 10 12 4l8 6", "M6 10v9h12v-9", "M10 19v-5h4v5", "M3 21h18"],
};

interface AreaIconProps extends SVGProps<SVGSVGElement> {
  nome: string;
}

export function AreaIcon({ nome, ...props }: AreaIconProps) {
  const paths = PATHS[nome] ?? PATHS.empresa;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      width="1em"
      height="1em"
      {...props}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

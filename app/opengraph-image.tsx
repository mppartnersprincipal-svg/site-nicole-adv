import { ImageResponse } from "next/og";

export const alt = "Nicoli Sociedade de Advogados — Técnica de quem advoga. Visão de quem empreende.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem de compartilhamento padrão: moldura aberta da marca sobre bordô. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#530103",
          color: "#faf7f2",
          padding: 80,
          position: "relative",
          fontFamily: "serif",
        }}
      >
        <div style={{ position: "absolute", left: 60, top: 60, width: 520, height: 8, background: "#c4a27a" }} />
        <div style={{ position: "absolute", left: 60, top: 60, width: 8, height: 510, background: "#c4a27a" }} />
        <div style={{ position: "absolute", right: 60, top: 60, width: 8, height: 230, background: "#c4a27a" }} />
        <div style={{ position: "absolute", left: 60, bottom: 60, width: 260, height: 8, background: "#c4a27a" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 60 }}>
          <div style={{ fontSize: 112, letterSpacing: 6, fontFamily: "sans-serif" }}>NICOLI</div>
          <div style={{ fontSize: 30, letterSpacing: 14, marginTop: 6, fontFamily: "sans-serif", color: "#d6bb96" }}>
            SOCIEDADE DE ADVOGADOS
          </div>
          <div style={{ fontSize: 44, marginTop: 56, maxWidth: 860, lineHeight: 1.2 }}>
            Técnica de quem advoga. Visão de quem empreende.
          </div>
          <div style={{ fontSize: 26, marginTop: 28, color: "#e9dccb", fontFamily: "sans-serif" }}>
            Goiânia/GO · Atuação em todo o Brasil
          </div>
        </div>
      </div>
    ),
    size,
  );
}

import type { NextConfig } from "next";

const SEGURANCA = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [96, 160, 256, 384, 480],
    minimumCacheTTL: 31536000,
    qualities: [60, 75],
  },
  poweredByHeader: false,
  // Barra final tratada no proxy.ts para os redirects do site antigo saírem em 1 salto
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      { source: "/areas", destination: "/areas-de-atuacao", permanent: true },
      { source: "/equipe", destination: "/quem-somos#socios", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: SEGURANCA },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;

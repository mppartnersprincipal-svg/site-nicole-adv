import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const BLOQUEADO = ["/api/", "/dashboard"];

/**
 * Buscadores e assistentes de IA liberados (GEO). AI Overviews usam o Googlebot comum;
 * Google-Extended só controla uso em treino/Gemini. Cada grupo repete o disallow,
 * porque um robô segue apenas o grupo mais específico que casa com ele.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: BLOQUEADO },
      {
        userAgent: [
          "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User",
          "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot", "DuckAssistBot",
        ],
        allow: "/",
        disallow: BLOQUEADO,
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

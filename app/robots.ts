import type { MetadataRoute } from "next";

const BASE = "https://kathanpatel.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Perplexity — cites sources with links, drives real traffic
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      // All other crawlers (AI + search)
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host:    BASE,
  };
}
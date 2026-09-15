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
      /* /_next/ must stay crawlable: it serves the JS, CSS and optimised images
         Google needs to render the page. Blocked, Googlebot saw the hero in its
         pre-hydration state (inline opacity:0) — invisible text it won't rank
         or use for snippets. */
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host:    BASE,
  };
}
import type { MetadataRoute } from "next";

const BASE = "https://kathanpatel.vercel.app";

async function getBlogPosts(): Promise<{ slug: string; publishedAt: string | null }[]> {
  try {
    const { getAllPostsMeta } = await import("@/lib/blog");
    return await getAllPostsMeta();
  } catch {
    return [];
  }
}

/* ── lastmod ─────────────────────────────────────────────────────────
   These must reflect the last *meaningful content change* for each page, which
   is why they are explicit constants rather than `new Date()`. Emitting the
   build time on every deploy is the well-known anti-pattern that gets a site's
   lastmod discounted wholesale — it claims every page changed every deploy, so
   crawlers stop believing any of it.

   The flip side is the bug this replaces: the homepage was pinned to
   2025-03-01, so every change shipped since then told crawlers "nothing to see
   here" and suppressed recrawling. Bump the relevant date when a page's
   content actually changes. */
const LAST_MODIFIED = {
  home:          new Date("2026-08-25"),  // AI-assisted delivery section added
  hire:          new Date("2025-04-01"),
  contact:       new Date("2025-04-01"),
  aiIntegration: new Date("2025-04-01"),
  legalTech:     new Date("2026-08-20"),
  estimator:     new Date("2026-06-11"),
  github:        new Date("2025-03-01"),
} as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  /* The blog index genuinely changes when a post is published, so it tracks the
     newest post date rather than the build clock. */
  const newestPost = posts
    .map((p) => (p.publishedAt ? new Date(p.publishedAt).getTime() : 0))
    .reduce((a, b) => Math.max(a, b), 0);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                                  lastModified: LAST_MODIFIED.home,          changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/hire`,                        lastModified: LAST_MODIFIED.hire,          changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/contact`,                     lastModified: LAST_MODIFIED.contact,       changeFrequency: "monthly", priority: 0.9  },
    { url: `${BASE}/ai-integration`,              lastModified: LAST_MODIFIED.aiIntegration, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/legal-tech-integration`,      lastModified: LAST_MODIFIED.legalTech,     changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/free-project-cost-estimator`, lastModified: LAST_MODIFIED.estimator,     changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/blog`,                        lastModified: newestPost ? new Date(newestPost) : LAST_MODIFIED.home, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/github`,                      lastModified: LAST_MODIFIED.github,        changeFrequency: "weekly",  priority: 0.7  },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url:             `${BASE}/blog/${post.slug}`,
    lastModified:    post.publishedAt ? new Date(post.publishedAt) : LAST_MODIFIED.home,
    changeFrequency: "weekly" as const,
    priority:        0.7,
  }));

  return [...staticPages, ...blogPages];
}

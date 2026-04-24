import type { MetadataRoute } from "next";

const BASE = "https://kathanpatel.dev"; // ← Replace with your real domain

// Attempt to load blog slugs; gracefully return [] if Supabase isn't configured
async function getBlogSlugs(): Promise<string[]> {
  try {
    const { getAllSlugs } = await import("@/lib/blog");
    return await getAllSlugs();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getBlogSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/hire`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/contact`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/projects`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/about`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/experience`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/skills`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/github`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/blog`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/estimator`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/education`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
  ];

  const blogPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url:              `${BASE}/blog/${slug}`,
    lastModified:     new Date(),
    changeFrequency:  "weekly" as const,
    priority:         0.7,
  }));

  return [...staticPages, ...blogPages];
}

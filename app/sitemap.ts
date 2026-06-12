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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                     lastModified: new Date("2025-03-01"), changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/hire`,           lastModified: new Date("2025-04-01"), changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/contact`,        lastModified: new Date("2025-04-01"), changeFrequency: "monthly", priority: 0.9  },
    { url: `${BASE}/ai-integration`, lastModified: new Date("2025-04-01"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/free-project-cost-estimator`, lastModified: new Date("2026-06-11"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/blog`,           lastModified: new Date(),             changeFrequency: "weekly",  priority: 0.8  },  
    { url: `${BASE}/github`,         lastModified: new Date("2025-03-01"), changeFrequency: "weekly",  priority: 0.7  },  
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url:             `${BASE}/blog/${post.slug}`,
    lastModified:    post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.7,
  }));

  return [...staticPages, ...blogPages];
}
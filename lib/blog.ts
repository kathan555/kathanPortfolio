import { createClient } from "@supabase/supabase-js";

// Use a server-side client for SSR/RSC calls
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// ─── Content Block Types ──────────────────────────────────────────────────────
export type HeadingBlock  = { type: "heading";  level: 2 | 3; content: string };
export type TextBlock     = { type: "text";     content: string };
export type ImageBlock    = { type: "image";    url: string; caption?: string; alt?: string };
export type VideoBlock    = { type: "video";    url: string; platform: "youtube" | "vimeo" | "url"; title?: string };
export type LinkBlock     = { type: "link";     url: string; title: string; description?: string };
export type CodeBlock     = { type: "code";     language: string; content: string };
export type QuoteBlock    = { type: "quote";    content: string; author?: string };
export type DividerBlock  = { type: "divider" };

export type ContentBlock =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | VideoBlock
  | LinkBlock
  | CodeBlock
  | QuoteBlock
  | DividerBlock;

// ─── Blog Post Type ───────────────────────────────────────────────────────────
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  content: ContentBlock[];
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
};

// ─── Queries ─────────────────────────────────────────────────────────────────
export async function getAllPosts(): Promise<BlogPost[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, tags, published_at, created_at, published")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getAllPosts error:", error.message);
    return [];
  }
  return (data ?? []) as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) return null;
  return data as BlogPost;
}

export async function getAllSlugs(): Promise<string[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}

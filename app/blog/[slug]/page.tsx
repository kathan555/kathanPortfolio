import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Clock, ArrowRight } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";
import { LeadCapturePopup } from "@/components/LeadCapturePopup";
import { getAllSlugs, getPostBySlug, getAllPosts, type ContentBlock } from "@/lib/blog";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

function readingTime(post: { content?: unknown[]; excerpt?: string | null; title?: string }) {
  const blocks = Array.isArray(post.content) ? post.content : [];

  const text = blocks
    .map((block) => {
      if (!block || typeof block !== "object") return "";

      const candidate = block as { content?: unknown; title?: unknown; caption?: unknown };
      return [candidate.content, candidate.title, candidate.caption]
        .filter((value): value is string => typeof value === "string")
        .join(" ");
    })
    .join(" ")
    .trim();

  const fallbackText = [post.title ?? "", post.excerpt ?? ""].join(" ").trim();
  const sourceText = text.length > 0 ? text : fallbackText;
  const wordCount = sourceText.length > 0 ? sourceText.split(/\s+/).length : 0;

  return Math.max(1, Math.ceil(wordCount / 200));
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  const canonicalPath = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `https://kathanpatel.vercel.app${canonicalPath}`,
      type: "article",
      locale: "en_US",
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

/* ── Audience heuristic ──
   Classifies a post by its title + tags so the CTA and lead popup match
   reader intent: business readers get a project pitch, developers get a
   lighter ask. Defaults to "dev" — most posts are technical guides. */
type PostAudience = "business" | "ai-dev" | "dev";

const BUSINESS_INTENT_RE =
  /cost|price|pricing|budget|estimat|hire|hiring|freelanc|outsourc|migrat|mvp|startup|business/i;
const AI_TOPIC_RE =
  /\bai\b|gemini|openai|gpt|llm|copilot|chatbot|semantic kernel|machine learning/i;

function getPostAudience(post: { title: string; tags: string[] }): PostAudience {
  const haystack = [post.title, ...post.tags].join(" ");
  if (BUSINESS_INTENT_RE.test(haystack)) return "business";
  if (AI_TOPIC_RE.test(haystack)) return "ai-dev";
  return "dev";
}

/* ── YouTube / Vimeo ID helpers ── */
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&\s]+)/);
  return m ? m[1] : null;
}
function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

/* ── Block renderer ── */
function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2>{block.content}</h2>
      ) : (
        <h3>{block.content}</h3>
      );

    case "text":
      return <p dangerouslySetInnerHTML={{ __html: block.content }} />;

    case "image":
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.url}
            alt={block.alt ?? block.caption ?? ""}
            className="w-full rounded-xl object-cover border border-border"
          />
          {block.caption && (
            <figcaption className="text-center text-xs text-muted-foreground mt-2 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "video": {
      const ytId = block.platform === "youtube" ? getYouTubeId(block.url) : null;
      const vmId = block.platform === "vimeo" ? getVimeoId(block.url) : null;

      if (ytId)
        return (
          <div className="my-6 aspect-video rounded-xl overflow-hidden border border-border">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${ytId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={block.title ?? "YouTube video"}
            />
          </div>
        );

      if (vmId)
        return (
          <div className="my-6 aspect-video rounded-xl overflow-hidden border border-border">
            <iframe
              className="w-full h-full"
              src={`https://player.vimeo.com/video/${vmId}`}
              allowFullScreen
              title={block.title ?? "Vimeo video"}
            />
          </div>
        );

      return (
        <div className="my-6">
          <video controls className="w-full rounded-xl border border-border">
            <source src={block.url} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    case "link":
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 flex items-start gap-3 p-4 glass-card rounded-xl border-blue-500/20 hover:border-blue-500/40 transition-all group no-underline"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-blue-400 group-hover:underline">{block.title}</p>
            {block.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{block.description}</p>
            )}
            <p className="text-xs text-muted-foreground/50 mt-0.5 truncate">{block.url}</p>
          </div>
          <span className="text-muted-foreground group-hover:text-blue-400 text-sm mt-0.5 shrink-0">
            ↗
          </span>
        </a>
      );

    case "code":
      return (
        <div className="overflow-x-auto max-w-full my-6 rounded-xl border border-border">
          <pre className="!my-0 !rounded-xl">
            <code className={`language-${block.language}`}>{block.content}</code>
          </pre>
        </div>
      );

    case "quote":
      return (
        <blockquote>
          {block.content}
          {block.author && (
            <cite className="block text-xs not-italic mt-2 text-muted-foreground">
              — {block.author}
            </cite>
          )}
        </blockquote>
      );

    case "divider":
      return <hr />;

    case "svg":
      return (
        <figure className="my-6">
          <div
            className="w-full overflow-x-auto rounded-xl"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: block.content }}
            role="img"
            aria-label={block.alt}
          />
          {block.alt && (
            <figcaption className="text-center text-xs text-muted-foreground mt-2 italic">
              {block.alt}
            </figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}

/* ── Contextual end-of-post CTA ──
   The pitch changes with the audience: AI-tutorial readers are routed to
   the AI integration service, business-intent readers to the estimator,
   and general dev readers to the hire page. */
const POST_CTAS: Record<
  PostAudience,
  { eyebrow: string; title: string; body: string; primary: { href: string; label: string }; secondary: { href: string; label: string } }
> = {
  "ai-dev": {
    eyebrow: "From demo to production",
    title: "Building AI into a real product?",
    body: "I integrate Gemini, Azure OpenAI, and Semantic Kernel into production .NET applications — rate limiting, fallbacks, cost control, and all the parts tutorials skip.",
    primary:   { href: "/ai-integration", label: "AI Integration Services" },
    secondary: { href: "/free-project-cost-estimator", label: "Estimate Your Project" },
  },
  business: {
    eyebrow: "Planning a project?",
    title: "Get a realistic budget in 60 seconds",
    body: "Describe your project once and get an instant AI-generated cost range with a phase-by-phase breakdown — free, no sign-up.",
    primary:   { href: "/free-project-cost-estimator", label: "Free Cost Estimator" },
    secondary: { href: "/hire", label: "Rates & Availability" },
  },
  dev: {
    eyebrow: "Work with me",
    title: "Need a senior .NET developer on your team?",
    body: "I take on freelance Blazor, ASP.NET Core, and WPF work — remote, worldwide, with transparent rates and weekly demos.",
    primary:   { href: "/hire", label: "Hire Me" },
    secondary: { href: "/free-project-cost-estimator", label: "Estimate a Project" },
  },
};

function PostCTA({ audience }: { audience: PostAudience }) {
  const cta = POST_CTAS[audience];
  return (
    <div className="mt-12 glass-card rounded-2xl p-7 sm:p-8 border-blue-500/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 pointer-events-none" />
      <div className="relative">
        <p className="font-mono text-blue-400 text-xs tracking-[0.25em] uppercase mb-2">
          {cta.eyebrow}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
          {cta.title}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-xl">
          {cta.body}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={cta.primary.href}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
          >
            {cta.primary.label}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href={cta.secondary.href}
            className="inline-flex items-center gap-2 px-6 py-3 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 font-medium rounded-xl transition-all hover:-translate-y-0.5"
          >
            {cta.secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getAllPosts()]);
  if (!post) notFound();

  const readTime = readingTime(post);
  const audience = getPostAudience(post);
  const postUrl  = `https://kathanpatel.vercel.app/blog/${post.slug}`;

  /* ── Structured data: BlogPosting + BreadcrumbList ── */
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ?? "https://kathanpatel.vercel.app/og-image.png",
    url: postUrl,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.published_at ?? post.created_at,
    keywords: post.tags.join(", "),
    inLanguage: "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    author: { "@id": "https://kathanpatel.vercel.app/#person" },
    publisher: { "@id": "https://kathanpatel.vercel.app/#person" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://kathanpatel.vercel.app" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://kathanpatel.vercel.app/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  /* ── Related posts: sort by tag overlap, cap at 5 ── */
  const related = allPosts
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      ...p,
      overlap: p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap || (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, 5);

  return (
    <div className="min-h-screen pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Two-column grid: content left, sidebar right ──
            items-start only on lg: in mobile's column direction it would stop
            children stretching, letting wide <pre> lines blow out the layout. */}
        <div className="flex flex-col lg:flex-row gap-10 lg:items-start">

          {/* ── LEFT: main article column ── */}
          <div className="flex-1 min-w-0">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-400 transition-colors mb-10 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-10">
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed mb-5">{post.excerpt}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {post.published_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.published_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readTime} min read
                </span>
              </div>
            </header>

            {/* Cover image */}
            {post.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full rounded-2xl object-cover border border-border mb-10 max-h-96"
              />
            )}

            {/* Article body */}
            <article className="blog-content">
              {post.content.map((block, i) => (
                <BlockRenderer key={i} block={block} />
              ))}
            </article>

            {/* Share buttons */}
            <ShareButtons
              title={post.title}
              url={`https://kathanpatel.vercel.app/blog/${post.slug}`}
              tags={post.tags}
            />

            {/* Contextual CTA — matched to the post's audience */}
            <PostCTA audience={audience} />

            {/* Post footer */}
            <div className="mt-10 pt-8 border-t border-border">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-blue-500/40 text-muted-foreground hover:text-foreground rounded-xl transition-all text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                All Posts
              </Link>
            </div>

            {/* ── Mobile: related posts below article ── */}
            {related.length > 0 && (
              <div className="mt-12 lg:hidden">
                <RelatedPostsList posts={related} />
              </div>
            )}
          </div>

          {/* ── RIGHT: sticky sidebar (desktop only) ── */}
          {related.length > 0 && (
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-28 self-start overflow-y-auto max-h-[calc(100vh-8rem)] pr-1">
              <RelatedPostsList posts={related} />
            </aside>
          )}
        </div>
      </div>

      {/* Lead capture popup — variant matched to the post's audience */}
      <LeadCapturePopup
        postTitle={post.title}
        postSlug={post.slug}
        variant={audience === "business" ? "business" : "developer"}
      />
    </div>
  );
}

/* ── Related posts list (shared between sidebar and mobile) ── */
type RelatedPost = {
  id: string | number;
  slug: string;
  title: string;
  excerpt?: string | null;
  cover_image?: string | null;
  tags: string[];
  published_at?: string | null;
  content?: unknown[];
  overlap?: number;
};

function RelatedPostsList({ posts }: { posts: RelatedPost[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-blue-400 text-xs font-medium tracking-wider uppercase">
          Related Posts
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="group flex gap-3 glass-card rounded-xl p-3 hover:border-blue-500/30 transition-all duration-300"
          >
            {/* Thumbnail */}
            {p.cover_image && (
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.cover_image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0">
              {/* Tags — max 2 */}
              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {p.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono"
                    >
                      <Tag className="w-2 h-2" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <p className="text-sm font-semibold text-foreground group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                {p.title}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                {p.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(p.published_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readingTime(p)} min
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-3.5 h-3.5 shrink-0 self-center text-muted-foreground/40 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      <Link
        href="/blog"
        className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-blue-400 transition-colors py-2"
      >
        View all posts
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
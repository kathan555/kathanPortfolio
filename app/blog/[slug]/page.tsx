import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Clock } from "lucide-react";
import { getAllSlugs, getPostBySlug, type ContentBlock } from "@/lib/blog";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
  };
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
        <pre>
          <code className={`language-${block.language}`}>{block.content}</code>
        </pre>
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

    default:
      return null;
  }
}

/* ── Page ── */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const wordCount = post.content.length * 150;
  const readTime  = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Post footer */}
        <div className="mt-16 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-blue-500/40 text-muted-foreground hover:text-foreground rounded-xl transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            All Posts
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all text-sm"
          >
            Discuss this post →
          </Link>
        </div>
      </div>
    </div>
  );
}

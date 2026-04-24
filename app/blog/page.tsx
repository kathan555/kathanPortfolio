import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Tag, ArrowRight, PenLine, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Kathan Patel's blog — thoughts on .NET, architecture, engineering leadership, and modern software development.",
};

export const revalidate = 60;

function readingTime(post: { content: unknown[] }) {
  // ~200 words per content block average
  //const words = post.content.length * 150;
  //return Math.max(1, Math.round(words / 200));
  return 1;
}

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-14">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Writing
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-2 mb-4">
              The <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Thoughts on .NET, architecture, engineering leadership, and the things I learn
              building complex systems.
            </p>
          </div>
        </ScrollReveal>

        {/* Empty state */}
        {posts.length === 0 ? (
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-16 text-center max-w-lg mx-auto">
              <PenLine className="w-14 h-14 text-muted-foreground mx-auto mb-5" />
              <h3 className="font-display text-xl font-bold mb-2">First post coming soon</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Posts are managed via the Supabase dashboard. Create a row in the{" "}
                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-blue-400">
                  blog_posts
                </code>{" "}
                table with{" "}
                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-teal-400">
                  published = true
                </code>{" "}
                to see it here.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm hover:bg-blue-500/20 transition-all"
              >
                Suggest a topic →
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => (
              <ScrollReveal key={post.id} delay={i * 0.07}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block glass-card rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Cover image */}
                    {post.cover_image && (
                      <div className="md:w-60 shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-7 flex flex-col flex-1">
                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-blue-400 transition-colors mb-2 leading-tight">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-5 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Meta footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                        <div className="flex items-center gap-4">
                          {post.published_at && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(post.published_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {readingTime(post)} min read
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-blue-400 font-medium group-hover:gap-2 transition-all">
                          Read more
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

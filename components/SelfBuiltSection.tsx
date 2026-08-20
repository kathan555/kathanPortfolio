"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { selfBuilt } from "@/lib/data";
import { Github, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
   Independent Builds
   Counterpart to <ProjectsSection /> (client work). These are products
   designed and shipped SOLO — each card links to its public GitHub repo and,
   where one exists, a live demo. Shares the domain-colour system with
   ProjectsSection so the two sections read as one design language.
   ───────────────────────────────────────────────────────────────────────── */

const domainColors: Record<string, string> = {
  blue:   "bg-blue-500/10   border-blue-500/25   text-blue-400",
  teal:   "bg-rose-500/10   border-rose-500/25   text-rose-400",
  purple: "bg-purple-500/10 border-purple-500/25 text-purple-400",
  orange: "bg-orange-500/10 border-orange-500/25 text-orange-400",
  green:  "bg-green-500/10  border-green-500/25  text-green-400",
};

const dotColors: Record<string, string> = {
  blue:   "bg-blue-400",
  teal:   "bg-rose-400",
  purple: "bg-purple-400",
  orange: "bg-orange-400",
  green:  "bg-green-400",
};

function BuildCard({ project, index }: { project: typeof selfBuilt[0]; index: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <div className="project-card glass-card rounded-2xl p-6 h-full flex flex-col border-blue-500/10 group">
        {/* Header — domain badge + "Solo build" chip */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0",
              domainColors[project.domainColor] ?? domainColors.blue
            )}
          >
            {project.domain}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono whitespace-nowrap border border-border rounded-md px-2 py-0.5 bg-muted/40">
            <Sparkles className="w-3 h-3 shrink-0 text-blue-400" />
            Solo build
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-bold text-foreground mb-0.5 group-hover:text-blue-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-blue-400 font-medium mb-3">{project.subtitle}</p>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Highlights */}
        <ul className="space-y-1.5 mb-5 flex-1">
          {project.highlights.map((h, j) => (
            <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                  dotColors[project.domainColor] ?? dotColors.blue
                )}
              />
              {h}
            </li>
          ))}
        </ul>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground font-mono"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 5 && (
            <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground">
              +{project.tags.length - 5} more
            </span>
          )}
        </div>

        {/* Links — GitHub repo + optional live demo */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/60">
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-blue-400 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            View code
          </a>
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors ml-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function SelfBuiltSection() {
  const headerRef    = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section id="builds" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
            Independent Builds
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
            What I ship on my own
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            These aren&apos;t client deliverables — they&apos;re products I scoped, designed, and
            shipped solo, moving fast with an AI-accelerated workflow. A few (like this site&apos;s
            live AI assistant) put AI directly in the product. It&apos;s the clearest look at how I
            work when I own every decision — from architecture to the last commit.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {selfBuilt.map((project, i) => (
            <BuildCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

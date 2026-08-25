"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { aiWorkflow } from "@/lib/data";
import {
  ClipboardList, BookOpen, Terminal, ShieldCheck,
  MessageSquare, ShieldAlert, ArrowRight,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   AI-Assisted Development

   The CV added this as a five-bullet capability list. A list is the wrong
   shape for it here: on a CV the reader is scanning for keywords, but a
   visitor on this page is deciding whether AI-assisted delivery is a reason
   to trust the work or a reason to distrust it. So the five practices are
   laid out as the pipeline a project actually moves through, each one paired
   with the failure it prevents, and the whole thing is anchored by measured
   numbers from a real build — including what the review pass caught.

   "I use AI" is table stakes. The discipline around it is the differentiator,
   and that is what this section is built to show.
   ───────────────────────────────────────────────────────────────────────── */

const ICONS: Record<string, ReactNode> = {
  map:      <ClipboardList className="w-4 h-4" />,
  book:     <BookOpen      className="w-4 h-4" />,
  terminal: <Terminal      className="w-4 h-4" />,
  shield:   <ShieldCheck   className="w-4 h-4" />,
  message:  <MessageSquare className="w-4 h-4" />,
};

/* ─── One step in the pipeline ──────────────────────────────────────────── */
function PillarRow({
  pillar,
  index,
  isLast,
}: {
  pillar: (typeof aiWorkflow.pillars)[number];
  index: number;
  isLast: boolean;
}) {
  return (
    <ScrollReveal delay={index * 0.07}>
      <div className="relative flex gap-4 sm:gap-5">
        {/* Rail: numbered node + connecting line down to the next step */}
        <div className="flex flex-col items-center shrink-0">
          <span
            className="
              relative z-10 w-10 h-10 rounded-xl shrink-0
              flex items-center justify-center
              border border-blue-500/25 bg-blue-500/[0.07] text-blue-400
              backdrop-blur-sm
            "
          >
            {ICONS[pillar.icon]}
          </span>
          {!isLast && (
            <span
              aria-hidden
              className="w-px flex-1 mt-1 mb-1 bg-gradient-to-b from-blue-500/25 to-blue-500/5"
            />
          )}
        </div>

        {/* Body */}
        <div className={isLast ? "pb-0" : "pb-8"}>
          <div className="flex items-baseline gap-2.5 mb-1.5">
            <span className="font-mono text-[10px] text-blue-400/60 tracking-[0.3em] uppercase">
              {pillar.step}
            </span>
            <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">
              {pillar.title}
            </h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-2.5">
            {pillar.body}
          </p>

          {/* The point of the practice, stated as the risk it removes. This is
              the line a nervous buyer is actually reading for. */}
          <p className="flex items-start gap-2 text-xs text-emerald-500/90 leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{pillar.guards}</span>
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}

/* ─── Section ───────────────────────────────────────────────────────────── */
export function AIWorkflowSection() {
  const { eyebrow, heading, intro, pillars, proof } = aiWorkflow;

  return (
    <section id="workflow" className="py-24 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <ScrollReveal>
          <div className="mb-14 max-w-3xl">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-widest uppercase">
              {eyebrow}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2 mb-4 leading-tight">
              {heading}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {intro}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-10 xl:gap-16 items-start">

          {/* ── Left: the pipeline ───────────────────────────────────────── */}
          <div>
            {pillars.map((pillar, i) => (
              <PillarRow
                key={pillar.step}
                pillar={pillar}
                index={i}
                isLast={i === pillars.length - 1}
              />
            ))}
          </div>

          {/* ── Right: measured proof ────────────────────────────────────────
              Sticky on large screens so the numbers stay in view while the
              reader works down the five steps. */}
          <ScrollReveal delay={0.15}>
            <div className="lg:sticky lg:top-28">
              <div className="glass-card rounded-2xl p-6 border-blue-500/20">
                <p className="font-mono text-[10px] text-blue-400 tracking-[0.25em] uppercase mb-1">
                  Proof
                </p>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  {proof.label}
                </p>

                <div className="space-y-5">
                  {proof.stats.map((stat, i) => (
                    <motion.div
                      key={stat.unit}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                      className="pb-5 border-b border-border/50 last:border-0 last:pb-0"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-3xl font-bold gradient-text leading-none">
                          {stat.value}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {stat.unit}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {stat.note}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* The honest half. Without it the numbers above read as a
                    speed brag; with it they read as a controlled process. */}
                <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06]">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {proof.caveat}
                  </p>
                </div>

                <Link
                  href="/ai-integration"
                  className="
                    group mt-5 inline-flex items-center gap-1.5
                    text-sm font-medium text-blue-400 hover:underline underline-offset-4
                  "
                >
                  How I add AI to your product
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

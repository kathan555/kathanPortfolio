"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Clock, CheckCircle, Code2, Users,
  Zap, Globe, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { AnimatedCounter } from "@/components/AnimatedCounter";

// ── Real career stats ─────────────────────────────────────────────────────────
const stats = [
  {
    value:   8,
    suffix:  "+",
    label:   "Years of .NET experience",
    sub:     "Since 2018 — .NET Framework through .NET 9",
    icon:    <Clock     className="w-5 h-5" />,
    color:   "blue",
  },
  {
    value:   6,
    suffix:  "+",
    label:   "Production apps shipped",
    sub:     "Legal tech, fintech, healthcare, e-commerce",
    icon:    <CheckCircle className="w-5 h-5" />,
    color:   "teal",
  },
  {
    value:   2,
    suffix:  "",
    label:   "Companies led as Tech Lead",
    sub:     "Digip Technologies, Parkar Digital + 1",
    icon:    <Users      className="w-5 h-5" />,
    color:   "purple",
  },
  {
    value:   10,
    suffix:  "+",
    label:   "Technologies mastered",
    sub:     "Blazor, WPF, ASP.NET Core, React & more",
    icon:    <Code2      className="w-5 h-5" />,
    color:   "orange",
  },
];

// ── Working principles — what a client actually experiences ───────────────────
const principles = [
  {
    icon:  "📋",
    title: "Spec before sprint",
    desc:  "Every project starts with a written scope document. No ambiguity, no hidden costs, no scope creep surprises.",
  },
  {
    icon:  "🎥",
    title: "Weekly demos",
    desc:  "You see working software every week — not a status report. If it doesn't work, you know before the invoice arrives.",
  },
  {
    icon:  "🔒",
    title: "You own everything",
    desc:  "Full source code, Git history, and deployment access handed over at project end. Zero dependency on me to keep the lights on.",
  },
  {
    icon:  "📞",
    title: "One point of contact",
    desc:  "You talk directly to the developer building your software — no account managers, no relay chains, no delays.",
  },
  {
    icon:  "⚡",
    title: "Fast responses",
    desc:  "Messages answered within a few hours during business days. Urgent production issues treated as exactly that.",
  },
  {
    icon:  "📄",
    title: "NDA on request",
    desc:  "Happy to sign a Non-Disclosure Agreement before any project discussion. Your ideas stay yours.",
  },
];

// ── Where I have worked ───────────────────────────────────────────────────────
const timeline = [
  { year: "2024–Now", role: "Technical Lead",        company: "Digip Technologies",  type: "current" },
  { year: "2023–24",  role: "Senior Engineer (SE-1)", company: "Parkar Digital",      type: "past"    },
  { year: "2018–23",  role: "Senior Developer",       company: "Digip Technologies",  type: "past"    },
];

const colorMap: Record<string, string> = {
  blue:   "bg-blue-500/10   border-blue-500/20   text-blue-400",
  teal:   "bg-teal-500/10   border-teal-500/20   text-teal-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
};

function StatCard({
  stat, delay,
}: {
  stat: typeof stats[0];
  delay: number;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className="glass-card rounded-2xl p-6 flex flex-col gap-4 hover:border-blue-500/20 transition-all duration-300 group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[stat.color]}`}>
        {stat.icon}
      </div>
      <div>
        <div className="font-display text-4xl font-extrabold gradient-text leading-none mb-1">
          <AnimatedCounter target={stat.value} suffix={stat.suffix} duration={1800} />
        </div>
        <p className="font-display font-bold text-foreground text-sm">{stat.label}</p>
        <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
      </div>
    </motion.div>
  );
}

export function TrustSection() {
  const headerRef    = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  const principlesRef    = useRef<HTMLDivElement>(null);
  const principlesInView = useInView(principlesRef, { once: true, margin: "-60px" });

  const timelineRef    = useRef<HTMLDivElement>(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-60px" });

  return (
    <section id="trust" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
            Track Record
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2 mb-3">
            8 Years. Real Numbers.
          </h2>
          <p className="text-muted-foreground max-w-xl text-lg">
            No fluff — just the actual career numbers and the working principles
            every client experiences firsthand.
          </p>
        </motion.div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-16">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 0.08} />
          ))}
        </div>

        {/* ── Career timeline strip ── */}
        <motion.div
          ref={timelineRef}
          initial={{ opacity: 0, y: 20 }}
          animate={timelineInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="glass-card rounded-2xl p-5 sm:p-6 mb-16"
        >
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="font-display font-semibold text-sm text-foreground">
              Career Timeline
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {timeline.map((item, i) => (
              <div
                key={i}
                className={`flex-1 rounded-xl p-4 border transition-all ${
                  item.type === "current"
                    ? "border-teal-500/30 bg-teal-500/6"
                    : "border-border bg-muted/20"
                }`}
              >
                {item.type === "current" && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">
                      Current
                    </span>
                  </div>
                )}
                <p className="font-mono text-xs text-muted-foreground mb-1">{item.year}</p>
                <p className="font-display font-bold text-sm text-foreground leading-tight">
                  {item.role}
                </p>
                <p className="text-xs text-blue-400 mt-0.5">{item.company}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Working principles ── */}
        <motion.div
          ref={principlesRef}
          initial={{ opacity: 0, y: 20 }}
          animate={principlesInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <h3 className="font-display font-bold text-foreground">
              How I Work — What Clients Experience
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {principles.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                animate={principlesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:border-blue-500/20 transition-all duration-200"
              >
                <span className="text-2xl shrink-0">{p.icon}</span>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-1 text-sm">
                    {p.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── "Currently building towards" note ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={principlesInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card rounded-2xl p-6 sm:p-8 border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-2xl">
            🌱
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground mb-1">
              Client reviews coming soon
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I&apos;m actively taking on new freelance projects. After we work together,
              your feedback will appear here. If you&apos;d like to be among my first
              portfolio clients, I offer <span className="text-blue-400 font-medium">
              discounted first-project rates</span> in exchange for a honest review.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/25 whitespace-nowrap shrink-0"
          >
            Let&apos;s Talk
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

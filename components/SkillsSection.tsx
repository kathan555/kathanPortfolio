"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ScrollReveal, StaggerChildren, staggerItem } from "@/components/ScrollReveal";
import { skills } from "@/lib/data";
import {
  Code2, Layers, Database, Monitor, Wrench, Zap,
  Brain, RefreshCw, Link2, Users,
} from "lucide-react";
import { motion } from "framer-motion";

/* ─── Icon / meta map ──────────────────────────────────────────────────── */

type SkillMeta = {
  src?: string;
  glow: string;        // CSS color for hover glow
  invert?: boolean;    // invert white for dark logos
};

const SKILL_META: Record<string, SkillMeta> = {
  /* Frontend */
  "React":         { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",               glow: "#00D8FF" },
  "Next.js":       { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",             glow: "#512BD4" },
  "TypeScript":    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",     glow: "#3178C6" },
  "JavaScript":    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",     glow: "#F7DF1E" },
  "Tailwind CSS":  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",   glow: "#38BDF8" },
  "HTML5":         { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",               glow: "#E34F26" },
  "CSS3":          { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",                 glow: "#1572B6" },
  "Vite":          { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg",             glow: "#646CFF" },
  "Figma":         { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",               glow: "#F24943" },
  /* .NET / Backend */
  "C#":            { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg",             glow: "#9B4F96" },
  ".NET 9":        { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg",     glow: "#512BD4" },
  ".NET":          { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg",     glow: "#512BD4" },
  "ASP.NET Core":  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg",     glow: "#512BD4" },
  "Blazor":        { src: "https://cdn.simpleicons.org/blazor/512BD4",                                                        glow: "#512BD4" },
  "WPF":           { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows8/windows8-original.svg",         glow: "#0078D7" },
  "Node.js":       { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",             glow: "#68A063" },
  "Swagger":       { src: "https://cdn.simpleicons.org/swagger/85EA2D",                                                       glow: "#85EA2D" },
  "SignalR":       { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg",     glow: "#512BD4" },
  /* Database */
  "PostgreSQL":    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",     glow: "#336791" },
  "SQLite":        { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg",             glow: "#0F80CC" },
  "MSSQL":         { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-original.svg", glow: "#CC2935" },
  "SQL Server":    { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-original.svg", glow: "#CC2935" },
  "MySQL":         { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",               glow: "#4479A1" },
  "Prisma":        { src: "https://cdn.simpleicons.org/prisma/ffffff",                                                        glow: "#a8b3cf", invert: false },
  "Redis":         { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",               glow: "#DC382D" },
  /* Tools */
  "Git":           { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg",                   glow: "#F05029" },
  "Docker":        { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",             glow: "#2496ED" },
  "GitHub":        { src: "https://cdn.simpleicons.org/github/ffffff", glow: "#ffffff" },
  "Azure":         { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",               glow: "#0089D6" },
  "VS Code":       { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg",             glow: "#007ACC" },
  "Postman":       { src: "https://cdn.simpleicons.org/postman/FF6C37",                                                       glow: "#FF6C37" },
  "Hangfire":      { glow: "#60a5fa" },
  "REST APIs":     { glow: "#22c55e" },
  "OAuth 2.0":     { glow: "#a78bfa" },
  "JWT":           { glow: "#fb923c" },
  "Linq":          { glow: "#512BD4" },
  "EF Core":       { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg",     glow: "#512BD4" },
  /* Aliases from lib/data.ts */
  "jQuery":        { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jquery/jquery-original.svg",             glow: "#0769AD" },
  "Blazor Server": { src: "https://cdn.simpleicons.org/blazor/512BD4",                                                        glow: "#512BD4" },
  ".NET Core 6/9": { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg",     glow: "#512BD4" },
  "MS-SQL":        { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-original.svg", glow: "#CC2935" },
  "HTML/CSS":      { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",               glow: "#E34F26" },
  "XAML":          { glow: "#0078D7" },
  "React.js":      { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",               glow: "#00D8FF" },
  "Razor Pages":   { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg",     glow: "#512BD4" },
  "LINQ":          { glow: "#512BD4" },
  "SourceTree":    { glow: "#205081" },
  "Telerik":       { glow: "#5ce500" },
  "SciChart":      { glow: "#60a5fa" },
  "Syncfusion":    { glow: "#F4511E" },
  "LEAD Tools":    { glow: "#60a5fa" },
  "DevExpress":    { glow: "#FF5722" },
  "ABP.io":        { glow: "#512BD4" },
  /* AI stack. No OpenAI entry: Simple Icons removed the mark and devicon 403s,
     so any URL here would render an empty tile. Azure below covers Azure OpenAI. */
  "Gemini":        { src: "https://cdn.simpleicons.org/googlegemini/8E75B2",                                                 glow: "#8E75B2" },
  "Anthropic":     { src: "https://cdn.simpleicons.org/anthropic/D4A27F",                                                    glow: "#D4A27F" },
};

/* ─── Featured stack ────────────────────────────────────────────────────────
   Names and logos only. This grid previously carried a 1–5 dot rating and an
   "Expert / Advanced / Proficient" badge per item — self-assessed skill levels
   read as a junior signal to anyone hiring, and they volunteer weaknesses
   nobody asked about. What a technology is used for belongs here; how good
   someone claims to be at it does not. */

const FEATURED = [
  { name: "C#" },
  { name: ".NET 9" },
  { name: "Blazor" },
  { name: "React" },
  { name: "Next.js" },
  { name: "TypeScript" },
  { name: "Gemini" },
  { name: "Anthropic" },
  { name: "PostgreSQL" },
  { name: "Docker" },
  { name: "Azure" },
  { name: "Git" },
];

type FeaturedSkill = (typeof FEATURED)[number];

/* ─── Capability areas ──────────────────────────────────────────────────────
   Replaces the percentage bars. A buyer cannot act on "DevOps / CI-CD 70%",
   and a declared 70% is an argument against hiring. These say what the work
   actually is instead. */

const CAPABILITIES = [
  {
    icon: <Layers className="w-4 h-4" />,
    title: "Architecture & system design",
    body:  "Turning ambiguous requirements into a structure that still makes sense in year three.",
  },
  {
    icon: <Brain className="w-4 h-4" />,
    title: "AI integration",
    body:  "Gemini, Azure OpenAI and Semantic Kernel wired into production apps — rate limits, fallbacks and cost control included.",
  },
  {
    icon: <RefreshCw className="w-4 h-4" />,
    title: "Legacy modernisation",
    body:  "Incremental migration off ageing stacks, one slice at a time, without a big-bang rewrite.",
  },
  {
    icon: <Link2 className="w-4 h-4" />,
    title: "Platform integration",
    body:  "OAuth 2.0, scheduled sync and idempotent writes between systems that were never designed to talk.",
  },
  {
    icon: <Users className="w-4 h-4" />,
    title: "Technical leadership",
    body:  "Leading sprints, reviewing code, and mentoring whoever inherits the codebase.",
  },
];

/* ─── Category icon map ────────────────────────────────────────────────── */

const iconMap: Record<string, ReactNode> = {
  code:     <Code2    className="w-5 h-5" />,
  layers:   <Layers   className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  monitor:  <Monitor  className="w-5 h-5" />,
  wrench:   <Wrench   className="w-5 h-5" />,
};

/* ─── SkillLogo ─────────────────────────────────────────────────────────── */

/* Logos come from third-party CDNs, so a mark being pulled or renamed upstream
   is a real failure mode. Previously an errored image was just hidden, leaving
   an empty tile with no clue what it was; now it falls back to the same
   initials treatment used when no logo is configured at all. */
function SkillLogo({ name, size = 28 }: { name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const meta = SKILL_META[name];

  if (!meta?.src || failed) {
    return (
      <span
        className="font-mono font-bold leading-none"
        style={{ color: meta?.glow ?? "#60a5fa", fontSize: size * 0.55 }}
      >
        {name.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      src={meta.src}
      alt={name}
      width={size}
      height={size}
      style={meta.invert ? { filter: "brightness(0) invert(1)" } : undefined}
      className="object-contain"
      onError={() => setFailed(true)}
    />
  );
}

/* ─── FeaturedCard ──────────────────────────────────────────────────────── */

function FeaturedCard({ skill }: { skill: FeaturedSkill }) {
  const meta = SKILL_META[skill.name];
  const glow = meta?.glow ?? "#60a5fa";

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative glass-card rounded-2xl p-5 flex flex-col items-center gap-3 cursor-default overflow-hidden"
      style={{ "--skill-glow": glow } as CSSProperties}
    >
      {/* Glow backdrop on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glow}18 0%, transparent 70%)` }}
      />
      {/* Border glow */}
      <div
        className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-opacity-40 transition-all duration-500 pointer-events-none"
        style={{ borderColor: `${glow}40` }}
      />

      {/* Logo */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${glow}12`, border: `1px solid ${glow}25` }}
      >
        {/* SkillLogo falls back to initials itself, for both a missing config
            and a logo that fails to load from the CDN. */}
        <SkillLogo name={skill.name} size={36} />
      </div>

      {/* Name */}
      <p className="font-display font-semibold text-sm text-foreground text-center leading-tight transition-colors">
        {skill.name}
      </p>
    </motion.div>
  );
}

/* ─── CapabilityRow ─────────────────────────────────────────────────────── */

function CapabilityRow({ icon, title, body }: (typeof CAPABILITIES)[number]) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-display font-semibold text-sm text-foreground leading-snug">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{body}</p>
      </div>
    </div>
  );
}

/* ─── SkillBadge (in category cards) ───────────────────────────────────── */

function SkillBadge({ skill }: { skill: string }) {
  const meta = SKILL_META[skill];
  const glow = meta?.glow ?? "#60a5fa";

  return (
    <motion.span
      variants={staggerItem}
      whileHover={{ scale: 1.05 }}
      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 cursor-default"
      style={{
        background: `${glow}0a`,
        borderColor: `${glow}25`,
        color: "var(--muted-foreground)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = `${glow}18`;
        (e.currentTarget as HTMLElement).style.borderColor = `${glow}50`;
        (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = `${glow}0a`;
        (e.currentTarget as HTMLElement).style.borderColor = `${glow}25`;
        (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
      }}
    >
      {meta?.src && (
        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
          <SkillLogo name={skill} size={16} />
        </span>
      )}
      {skill}
    </motion.span>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */

export function SkillsSection() {
  return (
    <section id="skills" className="py-24 relative overflow-hidden">

      {/* CSS keyframes */}
      <style>{`
        @keyframes skills-orb {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(40px,-30px); }
        }
        @keyframes skills-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .skills-orb { animation: skills-orb 14s ease-in-out infinite; }
      `}</style>

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/2 to-transparent" />
        <div
          className="skills-orb absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgb(var(--c-blue-500) / 0.09) 0%, transparent 70%)" }}
        />
        <div
          className="skills-orb absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgb(var(--c-purple-500) / 0.08) 0%, transparent 70%)", animationDelay: "7s" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-widest uppercase">
              Skills
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-2">
              Technical{" "}
              <span
                style={{
                  /* Theme-aware: the literal hexes here were dark-mode blues
                     that washed out to near-invisible on the light ground. */
                  background:
                    "linear-gradient(90deg,rgb(var(--c-blue-400)),rgb(var(--c-purple-400)),rgb(var(--c-blue-400)))",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "skills-shimmer 4s linear infinite",
                }}
              >
                Arsenal
              </span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-lg">
              8+ years shipping production software — desktop, web, and AI-enabled
              systems, across .NET and the modern JavaScript stack.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Featured hero grid ── */}
        <ScrollReveal delay={0.05}>
          <div className="mb-6 flex items-center gap-3">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-xs text-blue-400 tracking-widest uppercase font-medium">
              Core Expertise
            </span>
            <div className="flex-1 h-px bg-blue-500/15" />
          </div>
          <StaggerChildren className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-20">
            {FEATURED.map((skill) => (
              <FeaturedCard key={skill.name} skill={skill} />
            ))}
          </StaggerChildren>
        </ScrollReveal>

        {/* ── Two-column: category cards + skill bars ── */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-12 items-start">

          {/* Left: Category cards */}
          <div>
            <ScrollReveal>
              <div className="mb-6 flex items-center gap-3">
                <Layers className="w-4 h-4 text-purple-400" />
                <span className="font-mono text-xs text-purple-400 tracking-widest uppercase font-medium">
                  By Category
                </span>
                <div className="flex-1 h-px bg-purple-500/15" />
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-4">
              {skills.map((category, i) => (
                <ScrollReveal key={category.category} delay={i * 0.07}>
                  <div className="glass-card rounded-2xl p-5 h-full hover:border-blue-500/20 transition-all duration-300 group">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                        {iconMap[category.icon]}
                      </div>
                      <h3 className="font-display font-semibold text-foreground text-sm">
                        {category.category}
                      </h3>
                    </div>
                    {/* Badges with logos */}
                    <StaggerChildren className="flex flex-wrap gap-2">
                      {category.items.map((skill) => (
                        <SkillBadge key={skill} skill={skill} />
                      ))}
                    </StaggerChildren>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right: What the work actually is —
              replaces the old percentage bars and the "25+ Technologies"
              style counters, both of which measured the wrong thing. */}
          <div>
            <ScrollReveal>
              <div className="mb-6 flex items-center gap-3">
                <Code2 className="w-4 h-4 text-rose-400" />
                <span className="font-mono text-xs text-rose-400 tracking-widest uppercase font-medium">
                  Where I&apos;m Brought In
                </span>
                <div className="flex-1 h-px bg-rose-500/15" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="glass-card rounded-2xl p-6 space-y-5">
                {CAPABILITIES.map((c) => (
                  <CapabilityRow key={c.title} {...c} />
                ))}

                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Not sure which of these your project needs?{" "}
                    <Link
                      href="/contact"
                      className="text-blue-400 font-medium hover:underline underline-offset-2"
                    >
                      Describe it and I&apos;ll tell you.
                    </Link>
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
} 
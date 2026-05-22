"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollReveal, StaggerChildren, staggerItem } from "@/components/ScrollReveal";
import { skills } from "@/lib/data";
import { Code2, Layers, Database, Monitor, Wrench, Zap } from "lucide-react";
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
  "GitHub":        { glow: "#ffffff"},
  "Azure":         { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",               glow: "#0089D6" },
  "VS Code":       { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg",             glow: "#007ACC" },
  "Postman":       { src: "https://cdn.simpleicons.org/postman/FF6C37",                                                       glow: "#FF6C37" },
  "Hangfire":      { glow: "#60a5fa" },
  "REST APIs":     { glow: "#22c55e" },
  "OAuth 2.0":     { glow: "#a78bfa" },
  "JWT":           { glow: "#fb923c" },
  "Linq":          { glow: "#512BD4" },
  "EF Core":       { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dotnetcore/dotnetcore-original.svg",     glow: "#512BD4" },
};

/* ─── Featured hero skills ─────────────────────────────────────────────── */

const FEATURED = [
  { name: "React",        level: 5, label: "Expert" },
  { name: "Next.js",      level: 5, label: "Expert" },
  { name: "TypeScript",   level: 5, label: "Expert" },
  { name: "C#",           level: 5, label: "Expert" },
  { name: ".NET 9",       level: 5, label: "Expert" },
  { name: "Blazor",       level: 4, label: "Advanced" },
  { name: "Tailwind CSS", level: 5, label: "Expert" },
  { name: "Prisma",       level: 4, label: "Advanced" },
  { name: "PostgreSQL",   level: 4, label: "Advanced" },
  { name: "Docker",       level: 3, label: "Proficient" },
  { name: "Git",          level: 5, label: "Expert" },
  ,
];

const LEVEL_COLOR: Record<string, string> = {
  Expert:     "text-blue-400   border-blue-400/30   bg-blue-400/10",
  Advanced:   "text-purple-400 border-purple-400/30 bg-purple-400/10",
  Proficient: "text-teal-400   border-teal-400/30   bg-teal-400/10",
};

/* ─── Skill bar data ───────────────────────────────────────────────────── */

const SKILL_BARS = [
  { name: "C# / .NET Ecosystem", pct: 95, color: "#512BD4" },
  { name: "React / Next.js",     pct: 92, color: "#00D8FF" },
  { name: "TypeScript",          pct: 90, color: "#3178C6" },
  { name: "Database Design",     pct: 85, color: "#336791" },
  { name: "System Architecture", pct: 88, color: "#a78bfa" },
  { name: "DevOps / CI-CD",      pct: 70, color: "#2496ED" },
];

/* ─── Category icon map ────────────────────────────────────────────────── */

const iconMap: Record<string, React.ReactNode> = {
  code:     <Code2    className="w-5 h-5" />,
  layers:   <Layers   className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  monitor:  <Monitor  className="w-5 h-5" />,
  wrench:   <Wrench   className="w-5 h-5" />,
};

/* ─── SkillLogo ─────────────────────────────────────────────────────────── */

function SkillLogo({ name, size = 28 }: { name: string; size?: number }) {
  const meta = SKILL_META[name];
  if (!meta?.src) return null;
  return (
    <img
      src={meta.src}
      alt={name}
      width={size}
      height={size}
      style={meta.invert ? { filter: "brightness(0) invert(1)" } : undefined}
      className="object-contain"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

/* ─── FeaturedCard ──────────────────────────────────────────────────────── */

function FeaturedCard({ skill, index }: { skill: typeof FEATURED[0]; index: number }) {
  const meta = SKILL_META[skill.name];
  const glow = meta?.glow ?? "#60a5fa";

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative glass-card rounded-2xl p-5 flex flex-col items-center gap-3 cursor-default overflow-hidden"
      style={{ "--skill-glow": glow } as React.CSSProperties}
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
        {meta?.src ? (
          <SkillLogo name={skill.name} size={36} />
        ) : (
          <span className="text-2xl font-bold font-mono" style={{ color: glow }}>
            {skill.name.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Name */}
      <p className="font-display font-semibold text-sm text-foreground text-center leading-tight transition-colors">
        {skill.name}
      </p>

      {/* Dots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i < skill.level ? glow : `${glow}30`,
              boxShadow: i < skill.level ? `0 0 4px ${glow}80` : "none",
            }}
          />
        ))}
      </div>

      {/* Level badge */}
      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLOR[skill.label]}`}>
        {skill.label}
      </span>
    </motion.div>
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

/* ─── AnimatedBar ───────────────────────────────────────────────────────── */

function AnimatedBar({ name, pct, color, started }: { name: string; pct: number; color: string; started: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{name}</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: started ? `${pct}%` : "0%",
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: started ? `0 0 8px ${color}60` : "none",
            transitionDelay: "200ms",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */

export function SkillsSection() {
  const [barsStarted, setBarsStarted] = useState(false);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setBarsStarted(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)" }}
        />
        <div
          className="skills-orb absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", animationDelay: "7s" }}
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
                  background: "linear-gradient(90deg,#60a5fa,#a78bfa,#60a5fa)",
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
              8+ years across the full .NET ecosystem — from desktop to cloud.
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
            {FEATURED.map((skill, i) => (
              <FeaturedCard key={skill.name} skill={skill} index={i} />
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

          {/* Right: Proficiency bars */}
          <div>
            <ScrollReveal>
              <div className="mb-6 flex items-center gap-3">
                <Code2 className="w-4 h-4 text-teal-400" />
                <span className="font-mono text-xs text-teal-400 tracking-widest uppercase font-medium">
                  Proficiency
                </span>
                <div className="flex-1 h-px bg-teal-500/15" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div
                ref={barsRef}
                className="glass-card rounded-2xl p-6 space-y-5"
              >
                {SKILL_BARS.map((bar) => (
                  <AnimatedBar
                    key={bar.name}
                    name={bar.name}
                    pct={bar.pct}
                    color={bar.color}
                    started={barsStarted}
                  />
                ))}

                {/* Legend */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground/60">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Expert</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Quick stat cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: "Technologies", value: "25+", color: "#60a5fa" },
                { label: "Frameworks",   value: "12+", color: "#a78bfa" },
                { label: "Years Coding", value: "8+",  color: "#34d399" },
                { label: "Open Source",  value: "10+", color: "#fb923c" },
              ].map((s) => (
                <ScrollReveal key={s.label} delay={0.15}>
                  <div className="glass-card rounded-xl p-4 text-center group hover:border-opacity-40 transition-all duration-300"
                    style={{ "--s-color": s.color } as React.CSSProperties}
                  >
                    <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
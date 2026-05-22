"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { personalInfo, summary } from "@/lib/data";
import { Mail, Phone, MapPin, Github, Linkedin, Sparkles, Code2, Layers, Users, Cpu } from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const ROLES = [
  "Full Stack Developer",
  "Software Architect",
  "Technical Lead",
  ".NET & React Expert",
];

const TECH_ROW_1 = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Vite",
  ".NET 9", "C#", "Blazor", "ASP.NET Core", "WPF",
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Vite",
  ".NET 9", "C#", "Blazor", "ASP.NET Core", "WPF",
];
const TECH_ROW_2 = [
  "Prisma", "PostgreSQL", "SQLite", "MSSQL", "Hangfire",
  "OAuth 2.0", "JWT", "REST APIs", "Playwright", "Git",
  "Prisma", "PostgreSQL", "SQLite", "MSSQL", "Hangfire",
  "OAuth 2.0", "JWT", "REST APIs", "Playwright", "Git",
];

const STATS = [
  { end: 8,   suffix: "+", label: "Years Experience", icon: Cpu },
  { end: 6,  suffix: "+", label: "Projects Delivered", icon: Layers },
  { end: 10,  suffix: "+", label: "Happy Clients", icon: Users },
  { end: 100, suffix: "%", label: "Commitment", icon: Sparkles },
];

const HIGHLIGHTS = [
  {
    icon: "🚀",
    title: "Technical Leadership",
    desc: "Lead sprints, align client goals, and drive cross-functional teams to deliver on time.",
  },
  {
    icon: "🏗️",
    title: "Architecture & Design",
    desc: "Translate complex business requirements into scalable, maintainable system architectures.",
  },
  {
    icon: "💡",
    title: "Full Stack Expertise",
    desc: "End-to-end proficiency from WPF desktop apps to Blazor web platforms and RESTful APIs.",
  },
  {
    icon: "🤝",
    title: "Mentorship",
    desc: "Guide junior developers in best practices, code quality, and technical problem-solving.",
  },
];

/* ─── Counter hook ──────────────────────────────────────────────────────── */

function useCounter(end: number, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, started]);
  return count;
}

/* ─── StatCard ──────────────────────────────────────────────────────────── */

function StatCard({
  stat,
  started,
  delay,
}: {
  stat: (typeof STATS)[0];
  started: boolean;
  delay: number;
}) {
  const count = useCounter(stat.end, 1800, started);
  const Icon = stat.icon;
  return (
    <div
      className="flex flex-col items-center gap-1 px-6 py-5 rounded-2xl glass-card border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-1 group-hover:bg-blue-500/20 transition-colors">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <span className="font-display text-3xl font-bold text-foreground tabular-nums">
        {count}
        <span className="text-blue-400">{stat.suffix}</span>
      </span>
      <span className="text-xs text-muted-foreground font-medium tracking-wide text-center">
        {stat.label}
      </span>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */

export function AboutSection() {
  const [roleIdx, setRoleIdx] = useState(0);
  const [roleVisible, setRoleVisible] = useState(true);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  /* Role cycling */
  useEffect(() => {
    const id = setInterval(() => {
      setRoleVisible(false);
      setTimeout(() => {
        setRoleIdx((i) => (i + 1) % ROLES.length);
        setRoleVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  /* Trigger counters when stats row enters view */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="about" className="py-24 relative overflow-hidden">

      {/* ── CSS keyframes ── */}
      <style>{`
        @keyframes about-float-a {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes about-float-b {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-7px) rotate(-1deg); }
        }
        @keyframes about-float-c {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes about-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes about-marquee-rev {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes about-ping-soft {
          0%,100% { transform: scale(1); opacity:1; }
          50%      { transform: scale(1.8); opacity:0; }
        }
        @keyframes about-glow-border {
          0%,100% { box-shadow: 0 0 20px rgba(59,130,246,0.2), 0 0 60px rgba(59,130,246,0.05); }
          50%      { box-shadow: 0 0 35px rgba(59,130,246,0.45), 0 0 80px rgba(59,130,246,0.15); }
        }
        @keyframes about-orb-drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-20px) scale(1.05); }
          66%      { transform: translate(-20px,15px) scale(0.97); }
        }
        @keyframes about-role-in {
          from { opacity:0; transform: translateY(14px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes about-role-out {
          from { opacity:1; transform: translateY(0); }
          to   { opacity:0; transform: translateY(-14px); }
        }
        .about-float-a { animation: about-float-a 4s ease-in-out infinite; }
        .about-float-b { animation: about-float-b 5s ease-in-out infinite; }
        .about-float-c { animation: about-float-c 3.5s ease-in-out infinite; }
        .about-marquee     { animation: about-marquee     28s linear infinite; }
        .about-marquee-rev { animation: about-marquee-rev 22s linear infinite; }
        .about-glow-border { animation: about-glow-border 3s ease-in-out infinite; }
        .about-orb { animation: about-orb-drift 12s ease-in-out infinite; }
      `}</style>

      {/* ── Background orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div
          className="about-orb absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }}
        />
        <div
          className="about-orb absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", animationDelay: "4s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-widest uppercase">
              About Me
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-2 leading-tight">
              Who AM I              
            </h2>
          </div>
        </ScrollReveal>

        {/* ── Main grid: content left | photo right ── */}
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center mb-20">

          {/* Left: bio + contact */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-6">

              {/* Availability badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/5 text-green-400 text-xs font-mono font-medium">
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                    style={{ animation: "about-ping-soft 1.5s ease-in-out infinite" }}
                  />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Available for new projects
              </div>

              {/* Animated role */}
              <div className="h-8 overflow-hidden">
                <p
                  className="font-mono text-blue-400 text-base font-medium"
                  style={{
                    animation: roleVisible
                      ? "about-role-in 0.4s ease forwards"
                      : "about-role-out 0.4s ease forwards",
                  }}
                >
                  {"{ "}{ROLES[roleIdx]}{" }"}
                </p>
              </div>

              <p className="text-muted-foreground leading-relaxed text-lg max-w-xl">
                {summary}
              </p>

              {/* Contact */}
              <div className="space-y-3 pt-2">
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-blue-400 transition-colors group w-fit"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </span>
                  {personalInfo.email}
                </a>
                <a
                  href={`tel:${personalInfo.phone}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-blue-400 transition-colors group w-fit"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                    <Phone className="w-4 h-4 text-blue-400" />
                  </span>
                  {personalInfo.phone}
                </a>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </span>
                  {personalInfo.location}
                </div>
              </div>

              {/* Code snippet decoration */}
              <div className="mt-4 p-4 rounded-xl border border-border bg-muted/30 font-mono text-xs text-muted-foreground leading-relaxed max-w-sm">
                <span className="text-blue-400">const</span>{" "}
                <span className="text-foreground">developer</span>{" "}
                <span className="text-blue-400">=</span>{" "}
                <span className="text-orange-400">{"{"}</span>
                <br />
                {"  "}<span className="text-green-400">passion</span>:{" "}
                <span className="text-yellow-400">"building great things"</span>,
                <br />
                {"  "}<span className="text-green-400">available</span>:{" "}
                <span className="text-blue-300">true</span>,
                <br />
                {"  "}<span className="text-green-400">location</span>:{" "}
                <span className="text-yellow-400">"{personalInfo.location}"</span>
                <br />
                <span className="text-orange-400">{"}"}</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Photo + floating chips */}
          <ScrollReveal delay={0.2}>
            <div className="relative flex justify-center lg:justify-end">
              {/* Outer padding for chip overflow */}
              <div className="relative p-8">

                {/* Floating chip — top left */}
                <div
                  className="about-float-b absolute top-2 left-0 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border border-blue-500/30 text-xs font-semibold text-foreground shadow-lg whitespace-nowrap"
                  style={{ animationDelay: "0.5s" }}
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  8+ Years
                </div>

                {/* Floating chip — top right */}
                <div
                  className="about-float-a absolute top-0 right-0 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border border-purple-500/30 text-xs font-semibold text-foreground shadow-lg whitespace-nowrap"
                  style={{ animationDelay: "0.7s" }}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Multiple Projects
                </div>

                {/* Floating chip — bottom left */}
                <div
                  className="about-float-c absolute bottom-2 left-0 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border border-green-500/30 text-xs font-semibold text-foreground shadow-lg whitespace-nowrap"
                  style={{ animationDelay: "0s" }}
                >
                  <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: "about-ping-soft 1.5s ease-in-out infinite" }} />
                  Open to Work
                </div>

                {/* Floating chip — bottom right */}
                <div
                  className="about-float-b absolute bottom-0 right-0 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border border-orange-500/30 text-xs font-semibold text-foreground shadow-lg whitespace-nowrap"
                  style={{ animationDelay: "1.5s" }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Full Stack
                </div>

                {/* Photo wrapper */}
                <div className="relative group about-glow-border rounded-2xl">
                  {/* Glow ring */}
                  <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500/50 to-blue-400/20 opacity-60 blur-sm group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute -inset-[1px] rounded-2xl border border-blue-500/30" />

                  {/* Photo */}
                  <img
                    src={personalInfo.photo}
                    alt={personalInfo.name}
                    className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl object-cover object-top shadow-2xl"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-6 gap-2">
                    <a
                      href={personalInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-blue-500/40 hover:border-blue-400/60 transition-all duration-200 w-40 justify-center"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                    <a
                      href={personalInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-blue-500/40 hover:border-blue-400/60 transition-all duration-200 w-40 justify-center"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  </div>

                  {/* Inner shine */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ── Animated stats row ── */}
        <ScrollReveal delay={0.1}>
          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
            {STATS.map((s, i) => (
              <StatCard key={s.label} stat={s} started={statsStarted} delay={i * 100} />
            ))}
          </div>
        </ScrollReveal>

        {/* ── Tech stack marquee ── */}
        <ScrollReveal delay={0.15}>
          <div className="mb-20 space-y-3 overflow-hidden">
            <p className="font-mono text-blue-400 text-xs font-medium tracking-widest uppercase mb-4">
              Tech Stack
            </p>

            {/* Row 1 — left */}
            <div className="relative flex overflow-hidden">
              <div className="about-marquee flex gap-3 w-max">
                {TECH_ROW_1.map((t, i) => (
                  <span
                    key={i}
                    className="flex-shrink-0 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-sm text-muted-foreground hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all cursor-default whitespace-nowrap"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Row 2 — right (reverse) */}
            <div className="relative flex overflow-hidden">
              <div className="about-marquee-rev flex gap-3 w-max">
                {TECH_ROW_2.map((t, i) => (
                  <span
                    key={i}
                    className="flex-shrink-0 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-sm text-muted-foreground hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all cursor-default whitespace-nowrap"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Highlight cards ── */}
        <ScrollReveal delay={0.2}>
          <div className="grid sm:grid-cols-2 gap-4">
            {HIGHLIGHTS.map((card) => (
              <div
                key={card.title}
                className="glass-card rounded-xl p-5 flex items-start gap-4 hover:border-blue-500/20 transition-all duration-200 group"
              >
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
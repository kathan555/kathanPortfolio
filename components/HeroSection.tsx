"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Briefcase } from "lucide-react";
import { personalInfo } from "@/lib/data";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } },
};

const stats = [
  { value: 8,  suffix: "+", label: "Years Exp." },
  { value: 6,  suffix: "+", label: "Key Projects" },
  { value: 3,  suffix: "",  label: "Domains" },
  { value: 10, suffix: "+", label: "Technologies" },
];

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 pb-10 overflow-hidden">
      {/* Background orbs */}
      <div className="hero-orb w-[600px] h-[600px] bg-blue-500/8  -top-40 -left-40" />
      <div className="hero-orb w-[400px] h-[400px] bg-teal-500/6  bottom-20 right-20" />
      <div className="hero-orb w-[300px] h-[300px] bg-purple-500/5 top-1/3 right-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl">
          {/* Status badge */}
          <motion.div variants={item} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/5 text-teal-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Available for senior roles &amp; consulting
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1 variants={item} className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4 leading-[0.95]">
            <span className="text-foreground">Kathan</span>
            <br />
            <span className="gradient-text">N. Patel</span>
          </motion.h1>

          {/* Title */}
          <motion.div variants={item} className="flex items-center gap-3 mb-6">
            <Briefcase className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-mono text-blue-400 text-lg font-medium">
              Technical Lead · Full Stack .NET Developer
            </span>
          </motion.div>

          {/* Meta */}
          <motion.div variants={item} className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />Ahmedabad, India</span>
            <span className="w-px h-4 bg-border" />
            <span className="text-blue-400 font-medium">8+ Years Experience</span>
            <span className="w-px h-4 bg-border" />
            <span>.NET · Blazor · WPF</span>
          </motion.div>

          {/* Summary */}
          <motion.p variants={item} className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-10">
            Results-driven Technical Lead building{" "}
            <span className="text-foreground font-medium">scalable full-stack applications</span>{" "}
            across fintech, healthcare, and e-commerce. Expert in{" "}
            <span className="text-blue-400">.NET Core</span>,{" "}
            <span className="text-teal-400">Blazor</span>, and{" "}
            <span className="text-blue-400">WPF</span> — from architecture to production.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap gap-4 mb-12">
            <Link href="/contact" className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Get In Touch
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="/Kathan_Patel_Resume.pdf" download className="group inline-flex items-center gap-2 px-6 py-3 border border-blue-500/40 text-blue-400 font-medium rounded-xl hover:bg-blue-500/10 hover:border-blue-500/60 transition-all hover:-translate-y-0.5">
              Download Resume
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>
          </motion.div>

          {/* Social */}
          <motion.div variants={item} className="flex items-center gap-3">
            {[
              { href: personalInfo.github,              icon: <Github   className="w-5 h-5" />, label: "GitHub" },
              { href: personalInfo.linkedin,            icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn" },
              { href: `mailto:${personalInfo.email}`,   icon: <Mail     className="w-5 h-5" />, label: "Email" },
            ].map(({ href, icon, label }) => (
              <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground transition-all">
                {icon}
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Animated stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-4 text-center hover:border-blue-500/20 transition-all group"
            >
              <div className="font-display text-3xl font-extrabold gradient-text leading-tight">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} duration={1800} />
              </div>
              <div className="text-xs text-muted-foreground mt-1.5 font-medium group-hover:text-foreground transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-foreground font-mono">scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-blue-400/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}

"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Mail, MapPin, Briefcase, Sparkles } from "lucide-react";
import { personalInfo } from "@/lib/data";
import { NeuralBackground } from "@/components/NeuralBackground";
import { HeroCommandBar } from "@/components/HeroCommandBar";
import { DecodeText } from "@/components/DecodeText";

const TILT_MAX = 14;
const SPRING = { stiffness: 280, damping: 22, mass: 0.6 };

/** Stagger slot for the hero's .fx-rise entrance (see globals.css). */
const rise = (step: number): React.CSSProperties => ({ animationDelay: `${step * 70}ms` });

function PortraitFrame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale   = useMotionValue(1);
  const shineX  = useMotionValue(-120);

  const springRotateX = useSpring(rotateX, SPRING);
  const springRotateY = useSpring(rotateY, SPRING);
  const springScale   = useSpring(scale, { ...SPRING, stiffness: 420, damping: 18 });
  const springShineX  = useSpring(shineX, { stiffness: 120, damping: 24 });

  const setTiltFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width - 0.5;
    const py = (clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * TILT_MAX);
    rotateX.set(-py * TILT_MAX);
  }, [rotateX, rotateY]);

  const resetTilt = useCallback(() => {
    isHovering.current = false;
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, scale]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    isHovering.current = true;
    setTiltFromPointer(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => resetTilt();

  const handleClick = () => {
    scale.set(0.94);
    window.setTimeout(() => scale.set(1.03), 90);
    window.setTimeout(() => {
      if (!isHovering.current) scale.set(1);
    }, 220);

    shineX.set(-120);
    window.setTimeout(() => shineX.set(120), 16);

    rotateY.set(rotateY.get() + (Math.random() > 0.5 ? 5 : -5));
    rotateX.set(rotateX.get() + (Math.random() > 0.5 ? 4 : -4));
    window.setTimeout(() => {
      if (!isHovering.current) {
        rotateX.set(0);
        rotateY.set(0);
      }
    }, 280);
  };

  return (
    <div
      className="relative w-[min(100%,280px)] sm:w-[300px]"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={frameRef}
        role="img"
        aria-label={`${personalInfo.name} — interactive portrait`}
        tabIndex={0}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: springScale,
          transformStyle: "preserve-3d",
        }}
        className="relative cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
      >
        {/* Depth shadow */}
        <div
          aria-hidden
          className="absolute -inset-3 rounded-[1.65rem] bg-blue-500/12 blur-2xl"
          style={{ transform: "translateZ(-36px)" }}
        />

        {/* Shield */}
        <div
          className="absolute -inset-4 sm:-inset-5 rounded-[1.75rem] bg-background/92 dark:bg-background/88 backdrop-blur-md border border-border/50 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.35)]"
          style={{ transform: "translateZ(-20px)" }}
          aria-hidden
        />

        {/* Outer frame — the holo ring orbits its edge */}
        <div
          className="fx-holo fx-holo-live relative rounded-2xl p-[5px] bg-gradient-to-br from-blue-500/25 via-border/80 to-rose-500/20 shadow-lg"
          style={{
            transform: "translateZ(0px)",
            "--fx-holo-width": "1.5px",
            "--fx-holo-speed": "6s",
          } as React.CSSProperties}
        >
          <div className="rounded-[11px] p-3 sm:p-3.5 bg-muted/30 dark:bg-muted/20 border border-border/60">
            <div
              className="relative overflow-hidden rounded-lg ring-1 ring-border bg-background"
              style={{ transform: "translateZ(24px)" }}
            >
              <div style={{ transform: "translateZ(18px) scale(1.04)" }}>
                <Image
                  src={personalInfo.photo}
                  alt={personalInfo.name}
                  width={300}
                  height={380}
                  priority
                  draggable={false}
                  className="w-full aspect-[4/5] object-cover object-top pointer-events-none"
                />
              </div>

              <motion.div
                aria-hidden
                className="absolute inset-y-0 w-[45%] bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none mix-blend-overlay"
                style={{ x: springShineX, z: 28 }}
              />

              {/* Periodic scanner sweep */}
              <div aria-hidden className="fx-scan" />
            </div>
          </div>
        </div>

        {/* Corner brackets */}
        {(
          [
            "top-5 left-5 border-t-2 border-l-2 rounded-tl-md",
            "top-5 right-5 border-t-2 border-r-2 rounded-tr-md",
            "bottom-14 left-5 border-b-2 border-l-2 rounded-bl-md",
            "bottom-14 right-5 border-b-2 border-r-2 rounded-br-md",
          ] as const
        ).map((cn) => (
          <span
            key={cn}
            className={`pointer-events-none absolute z-10 w-7 h-7 sm:w-8 sm:h-8 border-blue-400/50 ${cn}`}
            style={{ transform: "translateZ(36px)" }}
            aria-hidden
          />
        ))}
      </motion.div>

      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap pointer-events-none">
        {/* Availability stays emerald, not the rose accent — a red "Open to
            Work" pill reads as unavailable at a glance. */}
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background border border-emerald-500/35 text-emerald-500 text-xs font-semibold shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Open to Work
        </span>
      </div>

      
      <p className="mt-5 text-center text-[11px] text-muted-foreground/70 font-mono hidden sm:block pointer-events-none">
        
      </p>
    </div>
  );
}

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 pb-10 overflow-hidden">
      {/* ── Immersive AI backdrop ─────────────────────────────────────────── */}
      {/* Aurora sheet */}
      {/* --hero-wash-* are theme-scoped: the dark-tuned alphas here were washing
          out to nothing against the near-white light background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 animate-aurora motion-reduce:animate-none"
        style={{
          background:
            "radial-gradient(60% 55% at 15% 20%, var(--hero-wash-1) 0%, transparent 60%), radial-gradient(55% 55% at 85% 30%, var(--hero-wash-2) 0%, transparent 60%), radial-gradient(60% 60% at 50% 100%, var(--hero-wash-1) 0%, transparent 65%)",
          backgroundSize: "200% 200%",
        }}
      />
      {/* Neural network canvas */}
      <NeuralBackground className="opacity-90" />
      {/* Sweeping light beams */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 left-0 h-[150%] w-40 animate-beam bg-gradient-to-r from-transparent via-blue-400/10 to-transparent motion-reduce:hidden" />
        <div className="absolute -top-1/4 left-1/3 h-[150%] w-40 animate-beam-delayed bg-gradient-to-r from-transparent via-rose-400/10 to-transparent motion-reduce:hidden" />
      </div>
      {/* Grid fade at the very bottom for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
      />
      {/* Perspective grid floor receding toward the horizon. After the fade
          on purpose — beneath it, the fade would erase it; it masks itself. */}
      <div aria-hidden className="fx-horizon">
        <div className="fx-horizon-plane" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 xl:gap-20 items-center">

          {/* Entrance is CSS (.fx-rise), not framer-motion variants: those
              server-rendered this whole column at opacity:0 until hydration. */}
          <div className="max-w-2xl">

            <div className="fx-rise mb-6 flex flex-wrap items-center gap-3" style={rise(0)}>
              <span className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full border border-emerald-500/40 bg-emerald-500/8 text-emerald-500 text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {personalInfo.availableForWork
                  ? `Available for Contract · ${personalInfo.availableFrom}`
                  : "Currently Engaged · Open to Discussions"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-medium">
                🌏 Remote-friendly
              </span>
              {/* The one solid-yellow element above the fold. Yellow is only
                  ever a fill here — dark text on yellow-400 is 11.4:1, whereas
                  yellow text on this background would be 1.5:1. */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400 text-slate-900 text-xs font-bold shadow-sm shadow-yellow-400/40">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Native
              </span>
            </div>

            {/* Name and role are one H1, so the page's main heading reads
                "Kathan N. Patel — Freelance AI & .NET Developer" rather than a
                bare name. The role line used to be a separate H2, which left
                the searched-for phrase out of the H1 entirely. The sr-only dash
                keeps the two parts from running together as one word when the
                heading is read as text. Looks identical to the old H1 + H2. */}
            <h1 className="fx-rise mb-4" style={rise(1)}>
              <span className="block font-display text-6xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[0.95] mb-4">
                <span className="text-foreground fx-text-sheen">Kathan N. Patel</span>
              </span>
              <span className="sr-only"> — </span>
              <span className="flex items-center gap-3">
                <Briefcase aria-hidden className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="font-mono text-blue-400 text-lg font-medium">
                  <DecodeText
                    trigger="mount"
                    delay={100}
                    duration={1100}
                    text="Freelance AI & .NET Developer"
                  />
                </span>
              </span>
            </h1>

            <div className="fx-rise flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8" style={rise(2)}>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Ahmedabad, India
              </span>
              <span className="w-px h-4 bg-border" />
              <span className="text-blue-400 font-semibold">8+ Years Experience</span>
              <span className="w-px h-4 bg-border hidden sm:block" />
              <span className="hidden sm:inline">WPF · Blazor · ASP.NET Core · .NET 9</span>
            </div>

            <p className="fx-rise text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-10" style={rise(3)}>
              I build <span className="text-foreground font-semibold">production-grade applications with AI built in</span> —
              Blazor, WPF and ASP.NET Core for teams in legal tech, healthcare, and
              enterprise | available to start{" "}
              <span className="text-emerald-500 font-semibold">{personalInfo.availableFrom.toLowerCase()}</span>.
            </p>

            {/* ── AI command bar — the interactive hero centrepiece ── */}
            <div className="fx-rise mb-8" style={rise(4)}>
              <HeroCommandBar />
            </div>

            <div className="fx-rise mb-10" style={rise(5)}>
              <Link
                href="/contact"
                className="fx-sheen group relative overflow-hidden inline-flex items-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/45 hover:-translate-y-0.5"
              >
                Get In Touch
              </Link>
            </div>

            <div className="fx-rise flex items-center gap-3" style={rise(6)}>
              {[
                { href: personalInfo.github,            icon: <Github   className="w-5 h-5" />, label: "GitHub" },
                { href: personalInfo.linkedin,          icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn" },
                { href: `mailto:${personalInfo.email}`, icon: <Mail     className="w-5 h-5" />, label: "Email" },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground transition-all"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* The portrait is the LCP element on desktop, so it gets the same
              JS-free entrance rather than waiting on hydration to appear. */}
          <div className="fx-rise flex justify-center lg:justify-end pb-6" style={rise(3)}>
            <PortraitFrame />
          </div>
        </div>
      </div>

      
    </section>
  );
}

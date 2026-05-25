"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Mail, MapPin, Briefcase } from "lucide-react";
import { personalInfo } from "@/lib/data";

const TILT_MAX = 14;
const SPRING = { stiffness: 280, damping: 22, mass: 0.6 };

const container = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.11, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.65, ease: [0.25, 0.4, 0.25, 1] } },
};

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

        {/* Outer frame */}
        <div
          className="relative rounded-2xl p-[5px] bg-gradient-to-br from-blue-500/25 via-border/80 to-teal-500/20 shadow-lg"
          style={{ transform: "translateZ(0px)" }}
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
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background border border-teal-500/35 text-teal-400 text-xs font-semibold shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          Open to Work
        </span>
      </div>

      <p className="sr-only">Hover or click the portrait for a 3D effect</p>
      <p className="mt-5 text-center text-[11px] text-muted-foreground/70 font-mono hidden sm:block pointer-events-none">
        Hover · Click for 3D
      </p>
    </div>
  );
}

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 pb-10 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 xl:gap-20 items-center">

          <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">

            <motion.div variants={item} className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full border border-teal-500/40 bg-teal-500/8 text-teal-400 text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                {personalInfo.availableForWork
                  ? `Available for Contract · From $25/hr · ${personalInfo.availableFrom}`
                  : "Currently Engaged · Open to Discussions"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-medium">
                🌏 Remote-friendly
              </span>
            </motion.div>

            <motion.h1 variants={item} className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 leading-[0.95]">
              <span className="text-foreground">Kathan</span>
              <br />
              <span className="gradient-text">N. Patel</span>
            </motion.h1>

            <motion.h2 variants={item} className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="font-mono text-blue-400 text-lg font-medium">
                Blazor & WPF Specialist · .NET Contract Developer
              </span>
            </motion.h2>

            <motion.div variants={item} className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                Ahmedabad, India
              </span>
              <span className="w-px h-4 bg-border" />
              <span className="text-blue-400 font-semibold">8+ Years Experience</span>
              <span className="w-px h-4 bg-border hidden sm:block" />
              <span className="hidden sm:inline">WPF · Blazor · ASP.NET Core · .NET 9</span>
            </motion.div>

            <motion.p variants={item} className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-10">
              I build <span className="text-foreground font-semibold">production-grade Blazor and WPF applications</span> for
              teams in legal tech, healthcare, and enterprise — available to start{" "}
              <span className="text-teal-400 font-semibold">{personalInfo.availableFrom.toLowerCase()}</span>.
            </motion.p>

            <motion.div variants={item} className="mb-10">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/45 hover:-translate-y-0.5"
              >
                Get In Touch
              </Link>
            </motion.div>

            <motion.div variants={item} className="flex items-center gap-3">
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
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.75, ease: [0.25, 0.4, 0.25, 1] }}
            className="flex justify-center lg:justify-end pb-6"
          >
            <PortraitFrame />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
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

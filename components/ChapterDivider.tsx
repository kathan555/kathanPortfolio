"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Code2,
  Briefcase,
  FolderOpen,
  GraduationCap,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type ChapterIcon = "code" | "briefcase" | "folder" | "graduation";

interface ChapterDividerProps {
  number: string;       // e.g. "01"
  title:  string;       // e.g. "Technical Skills"
  icon:   ChapterIcon;
}

/* ─── Icon map (kept inside the client component — no serialisation issue) */
const ICONS: Record<ChapterIcon, React.ReactNode> = {
  code:       <Code2         className="w-4 h-4" />,
  briefcase:  <Briefcase     className="w-4 h-4" />,
  folder:     <FolderOpen    className="w-4 h-4" />,
  graduation: <GraduationCap className="w-4 h-4" />,
};

/* ─── Component ─────────────────────────────────────────────────────────── */
export function ChapterDivider({ number, title, icon }: ChapterDividerProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      className="relative py-14 overflow-hidden select-none"
      aria-hidden
    >
      {/* ── Ghost number in the background ── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.08, y: 16 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 1.1, ease: [0.25, 0.4, 0.25, 1] }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      >
        <span
          className="font-display font-black leading-none"
          style={{
            /* Responsive from ~8rem to ~18rem */
            fontSize: "clamp(7rem, 22vw, 18rem)",
            /* Faint gradient — dark mode friendly, light mode friendly */
            background:
              "linear-gradient(180deg, hsl(217 91% 60% / 0.07) 0%, transparent 80%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {number}
        </span>
      </motion.div>

      {/* ── Horizontal rule + badge ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">

          {/* Left line — draws left→right */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.95, ease: [0.25, 0.4, 0.25, 1], delay: 0.1 }}
            className="flex-1 h-px origin-left"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, hsl(217 91% 60% / 0.22) 100%)",
            }}
          />

          {/* Centre badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.45,
              delay: 0.38,
              type: "spring",
              stiffness: 220,
              damping: 18,
            }}
            className="
              flex items-center gap-2.5
              px-4 py-2 rounded-xl
              border border-blue-500/20 bg-blue-500/[0.05]
              backdrop-blur-sm
              whitespace-nowrap
            "
          >
            {/* Number */}
            <span className="font-mono text-[10px] text-blue-400/60 tracking-[0.3em] uppercase">
              {number}
            </span>

            {/* Separator */}
            <span className="w-px h-3.5 bg-blue-500/25 shrink-0" />

            {/* Icon */}
            <span className="text-blue-400/65 flex items-center shrink-0">
              {ICONS[icon]}
            </span>

            {/* Title */}
            <span className="font-display text-sm font-semibold text-foreground/70 tracking-wide">
              {title}
            </span>
          </motion.div>

          {/* Right line — draws right→left */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.95, ease: [0.25, 0.4, 0.25, 1], delay: 0.1 }}
            className="flex-1 h-px origin-right"
            style={{
              background:
                "linear-gradient(270deg, transparent 0%, hsl(217 91% 60% / 0.22) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
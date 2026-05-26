"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Code2, Briefcase, FolderOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Sections manifest ─────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "section-hero", label: "Home",       num: "",   icon: Home          },
  { id: "skills",       label: "Skills",     num: "01", icon: Code2         },
  { id: "experience",   label: "Experience", num: "02", icon: Briefcase     },
  { id: "projects",     label: "Projects",   num: "03", icon: FolderOpen    },
  { id: "education",    label: "Education",  num: "04", icon: GraduationCap },
] as const;

/* ─── Component ─────────────────────────────────────────────────────────── */
export function SectionProgress() {
  const [active,    setActive]    = useState<string>("section-hero");
  const [scrollPct, setScrollPct] = useState(0);
  const [visible,   setVisible]   = useState(false);

  useEffect(() => {
    /* ── Show card only after user scrolls past the hero ── */
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? window.scrollY / h : 0;
      setScrollPct(pct);
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ── Section highlighting via IntersectionObserver ── */
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return (
    <>
      {/* ════════════════════════════════════════════════
          Floating "On this page" card  (xl+, fade in)
          ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="section-card"
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{    opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "fixed right-6 top-1/2 -translate-y-1/2 z-40",
              "hidden xl:block",
              /* Glass card — re-uses the project's own CSS utility */
              "glass-card rounded-2xl",
              "w-[132px] overflow-hidden",
              /* Extra shadow for contrast */
              "shadow-2xl shadow-black/30",
            )}
            role="navigation"
            aria-label="Page sections"
          >
            {/* ── Header with scroll progress bar ── */}
            <div className="px-2.5 pt-2.5 pb-2 border-b border-blue-500/10">
              <p className="text-[9px] font-mono text-muted-foreground/60 tracking-[0.2em] uppercase mb-1.5">
                On this page
              </p>
              <div className="h-0.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-teal-400"
                  style={{ scaleX: scrollPct, transformOrigin: "left", width: "100%" }}
                />
              </div>
            </div>

            {/* ── Section rows ── */}
            <div className="p-1 flex flex-col gap-0.5">
              {SECTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() =>
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
                    }
                    className={cn(
                      "relative w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left",
                      "transition-all duration-200 cursor-pointer group",
                      isActive
                        ? "bg-blue-500/12 text-blue-400"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    {/* Left active accent bar */}
                    {isActive && (
                      <motion.div
                        layoutId="active-bar"
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-blue-400"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <span
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                        isActive
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-white/5 text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      <Icon className="w-3 h-3" />
                    </span>

                    {/* Label */}
                    <span
                      className={cn(
                        "text-[11px] font-medium leading-none truncate flex-1",
                        isActive ? "text-blue-400" : "",
                      )}
                    >
                      {label}
                    </span>

                    {/* Active dot */}
                    {isActive && (
                      <motion.div
                        layoutId="active-dot"
                        className="w-1 h-1 rounded-full bg-blue-400 shrink-0"
                        style={{ boxShadow: "0 0 5px rgba(96,165,250,0.7)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
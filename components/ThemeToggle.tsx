"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

/* View Transitions API — typed locally because the DOM lib in this TS
   version doesn't ship it yet. */
type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  /* The new theme expands as a circle from the button. The class is flipped
     by hand inside the transition callback — next-themes applies it in an
     effect, which would land after the "new" snapshot is taken. setTheme
     still runs so its state and localStorage stay the source of truth. */
  function toggle(e: MouseEvent<HTMLButtonElement>) {
    const next = isDark ? "light" : "dark";
    const doc  = document as ViewTransitionDocument;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reduce) {
      setTheme(next);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const root = document.documentElement;
    root.classList.add("fx-theme-reveal");

    const transition = doc.startViewTransition(() => {
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      setTheme(next);
    });

    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});

    transition.finished.finally(() => root.classList.remove("fx-theme-reveal"));
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative w-9 h-9 flex items-center justify-center rounded-lg border overflow-hidden transition-all duration-200",
        "border-border hover:border-blue-500/40 hover:bg-blue-500/10 hover:shadow-[0_0_18px_var(--fx-glow)]",
        "text-muted-foreground hover:text-blue-400",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0,   scale: 1,   opacity: 1 }}
          exit={{    rotate: 90,  scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin progress bar at the very top of the page.
 *
 * How it works:
 * 1. A document-level click listener intercepts any <a> click that looks
 *    like an internal Next.js navigation and immediately starts the bar.
 * 2. When usePathname() reports the new route, the bar completes to 100%
 *    and then fades out.
 *
 * This gives visual feedback within one animation frame of the click —
 * eliminating the "nothing is happening" 1-3 second gap.
 */
export function NavigationProgress() {
  const pathname               = usePathname();
  const prevPathname           = useRef(pathname);
  const [visible,  setVisible] = useState(false);
  const [width,    setWidth]   = useState(0);
  const [opacity,  setOpacity] = useState(1);
  const timers                 = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearAllTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function addTimer(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }

  // ── Start the bar (called on link click) ──────────────────────────────────
  function startProgress() {
    clearAllTimers();
    setVisible(true);
    setOpacity(1);
    setWidth(0);

    // Jump to 20% immediately, then slowly creep toward 90%
    requestAnimationFrame(() => {
      setWidth(20);
      addTimer(() => setWidth(45), 200);
      addTimer(() => setWidth(65), 600);
      addTimer(() => setWidth(78), 1200);
      addTimer(() => setWidth(88), 2000);
      addTimer(() => setWidth(92), 3000);
    });
  }

  // ── Complete the bar (called when pathname changes) ───────────────────────
  function completeProgress() {
    clearAllTimers();
    setWidth(100);
    addTimer(() => setOpacity(0), 200);
    addTimer(() => {
      setVisible(false);
      setWidth(0);
      setOpacity(1);
    }, 500);
  }

  // ── Listen for link clicks ────────────────────────────────────────────────
  useEffect(() => {
    function isInternalHref(href: string | null): boolean {
      if (!href) return false;
      if (href.startsWith("http") || href.startsWith("//")) return false;
      if (href.startsWith("mailto:") || href.startsWith("tel:"))  return false;
      if (href === "#" || href.startsWith("#"))                    return false;
      return true;
    }

    function handleClick(e: MouseEvent) {
      // Walk up the DOM to find the nearest <a>
      let el = e.target as HTMLElement | null;
      while (el && el.tagName !== "A") el = el.parentElement;

      if (!el || el.tagName !== "A") return;

      const anchor = el as HTMLAnchorElement;
      const href   = anchor.getAttribute("href");

      if (!isInternalHref(href)) return;
      if (href === pathname)      return;  // same page — no navigation
      if (anchor.target === "_blank") return;

      startProgress();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── Detect route change → complete the bar ────────────────────────────────
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      completeProgress();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[200] pointer-events-none"
      style={{ opacity, transition: "opacity 250ms ease" }}
    >
      {/* Main bar */}
      <div
        className="h-[2.5px] bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400"
        style={{
          width:      `${width}%`,
          transition: width === 100
            ? "width 200ms ease-out"
            : "width 400ms cubic-bezier(0.1, 0.4, 0.3, 1)",
          boxShadow:  "0 0 8px hsl(217 91% 60% / 0.6), 0 0 20px hsl(217 91% 60% / 0.3)",
        }}
      />
      {/* Leading glow dot */}
      <div
        className="absolute top-0 h-[2.5px] w-20 bg-gradient-to-l from-white/0 to-white/30"
        style={{
          right:      `${100 - width}%`,
          transition: "right 400ms cubic-bezier(0.1, 0.4, 0.3, 1)",
        }}
      />
    </div>
  );
}

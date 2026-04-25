"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fixes the browser's native scroll restoration behaviour.
 *
 * By default browsers remember and restore the scroll position when you
 * refresh a page. This component switches that to "manual" so Next.js /
 * the app controls scrolling — and then immediately jumps to the top on
 * every page mount, including hard refreshes.
 *
 * Add once inside ThemeProvider in app/layout.tsx — it covers every route.
 */
export function ScrollRestorer() {
  const pathname = usePathname();

  // Run once on mount: tell the browser WE control scroll, not it.
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // Every time the route changes (including first load / refresh) → top.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null; // renders nothing
}

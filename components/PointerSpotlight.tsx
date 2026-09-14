"use client";

import { useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   PointerSpotlight
   One delegated pointer listener for the whole app. It finds the nearest
   `.fx-spotlight` / `.project-card` under the cursor and writes the cursor
   position to that element's --mx / --my, which the radial glow in
   globals.css reads. One listener instead of one per card, rAF-throttled so
   a fast mouse costs at most one style write per frame.

   Skipped entirely on touch / coarse pointers, where there is no hover.
   ───────────────────────────────────────────────────────────────────────── */

const SELECTOR = ".fx-spotlight, .project-card";

export function PointerSpotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let last: PointerEvent | null = null;

    const apply = () => {
      raf = 0;
      if (!last) return;
      const target = (last.target as Element | null)?.closest?.<HTMLElement>(SELECTOR);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${last.clientX - rect.left}px`);
      target.style.setProperty("--my", `${last.clientY - rect.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}

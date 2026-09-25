/* ─────────────────────────────────────────────────────────────────────────
   ScrollReveal / StaggerChildren
   These used to fade, rise and un-blur their content the first time it
   scrolled into view. The effect ran once per page load, so it only ever
   showed on the first pass down a page — where it read as content still
   loading, and the animated `filter: blur()` re-rasterised whole sections
   (glass cards included) on every frame, which is what made scrolling lag.

   Both are now plain wrappers so the ~60 call sites keep working unchanged.
   `delay`, `direction` and `once` are still accepted and ignored.
   ───────────────────────────────────────────────────────────────────────── */

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
}

export function ScrollReveal({ children, className = "" }: ScrollRevealProps) {
  return <div className={className}>{children}</div>;
}

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerChildren({ children, className = "" }: StaggerChildrenProps) {
  return <div className={className}>{children}</div>;
}

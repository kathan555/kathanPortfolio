"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────
   DecodeText
   "Decrypts" a short label: characters cycle through random glyphs and lock
   in left to right. Meant for monospace eyebrows and labels, where every
   glyph is the same width, so the scramble never shifts the layout.

   • The server renders the final text, so crawlers and no-JS visitors see
     the real label, and there is no hydration mismatch.
   • Screen readers get the final text once via a visually-hidden copy; the
     animated copy is aria-hidden so they never hear the noise.
   • Reduced motion: the text simply renders as-is.
   ───────────────────────────────────────────────────────────────────────── */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

/** Only letters and digits scramble — spaces and punctuation stay put so the
 *  word shapes remain readable while decoding. */
const SCRAMBLES = /[a-z0-9]/i;

interface DecodeTextProps {
  text:      string;
  /** "inView" decodes when scrolled into view; "mount" decodes on load. */
  trigger?:  "inView" | "mount";
  /** Delay before decoding starts, in ms. */
  delay?:    number;
  /** Time to lock in every character, in ms. */
  duration?: number;
}

export function DecodeText({
  text,
  trigger  = "inView",
  delay    = 0,
  duration = 900,
}: DecodeTextProps) {
  const ref     = useRef<HTMLSpanElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-40px" });
  const reduce  = useReducedMotion();
  const [display, setDisplay] = useState(text);

  const active = trigger === "mount" || inView;

  useEffect(() => {
    if (!active || reduce) return;

    let raf   = 0;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const locked   = Math.floor(progress * text.length);

      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += i < locked || !SCRAMBLES.test(ch)
          ? ch
          : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);

      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      setDisplay(text);
    };
  }, [active, reduce, text, delay, duration]);

  return (
    <>
      <span className="sr-only">{text}</span>
      {/* fontWeight: inherit — globals.css resets bare <span> weights to 400,
          which would otherwise override the parent label's font-medium. */}
      <span ref={ref} aria-hidden style={{ fontWeight: "inherit" }}>
        {display}
      </span>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────
   DecodeText
   "Decrypts" a short label: characters cycle through random glyphs and lock
   in left to right. Meant for monospace eyebrows and labels, where every
   glyph is the same width, so the scramble never shifts the layout.

   • The real text is the only text in the HTML. The scramble is an aria-hidden
     overlay that exists only while decoding, drawn over the real text (made
     transparent, not removed, so it stays in the accessibility tree). An
     earlier version kept a visually-hidden copy beside the animated one, so
     every label — including the homepage H1 — appeared twice to crawlers.
   • The server renders the final text, so there is no hydration mismatch.
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
  /** The scrambled overlay while decoding; null at rest. */
  const [scramble, setScramble] = useState<string | null>(null);

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
      if (progress < 1) {
        setScramble(out);
        raf = requestAnimationFrame(tick);
      } else {
        setScramble(null);
      }
    };

    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      setScramble(null);
    };
  }, [active, reduce, text, delay, duration]);

  /* fontWeight: inherit on every span — globals.css resets bare <span> weights
     to 400, which would otherwise override the parent label's font-medium.
     inline-block gives the overlay a box to fill; glyphs are monospace, so the
     scramble wraps exactly like the real text underneath it. */
  return (
    <span ref={ref} className="relative inline-block" style={{ fontWeight: "inherit" }}>
      <span style={{ fontWeight: "inherit", color: scramble === null ? undefined : "transparent" }}>
        {text}
      </span>
      {scramble !== null && (
        <span aria-hidden className="absolute inset-0" style={{ fontWeight: "inherit" }}>
          {scramble}
        </span>
      )}
    </span>
  );
}

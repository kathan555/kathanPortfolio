"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2000,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();
    const startVal = 0;

    function easeOutExpo(t: number): number {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(startVal + (target - startVal) * easedProgress);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}

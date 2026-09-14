"use client";

import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   NeuralBackground
   A lightweight animated "neural network" — drifting nodes with links drawn
   between near neighbours, plus links to the cursor. Rendered on a <canvas>
   pinned behind the hero content.

   • Signal pulses: a few glowing packets travel along live links at any one
     time, so the network reads as "thinking" rather than just drifting.
   • Theme-aware: reads the `.dark` class on <html> and recolours live.
   • Perf: capped node count, pauses when the tab is hidden or the hero is
     scrolled out of view, and honours `prefers-reduced-motion` (draws one
     static frame instead of animating).
   ───────────────────────────────────────────────────────────────────────── */

type Node = { x: number; y: number; vx: number; vy: number };
/** A pulse travelling from node `a` to node `b`; `t` runs 0 → 1. */
type Packet = { a: number; b: number; t: number; speed: number };

const MAX_PACKETS = 7;
/** Per-link, per-frame chance of launching a packet. With ~200 live links this
 *  launches a few per second, and MAX_PACKETS caps it. */
const SPAWN_CHANCE = 0.0006;

export function NeuralBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let raf = 0;
    let running = true;

    const mouse = { x: -9999, y: -9999, active: false };

    const isDark = () => document.documentElement.classList.contains("dark");

    /** Node count scales with area but is hard-capped for perf. */
    function nodeCount() {
      const target = Math.round((width * height) / 16000);
      return Math.max(28, Math.min(reduceMotion ? 34 : 78, target));
    }

    function seed() {
      nodes = Array.from({ length: nodeCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
      // Packets index into `nodes`, so a reseed invalidates all of them.
      packets = [];
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    const LINK_DIST = 130;
    const MOUSE_DIST = 180;

    /** `spawn` is false for one-off redraws (theme change, reduced motion) so
     *  packets only launch while the loop is actually running. */
    function draw(spawn = false) {
      const dark = isDark();
      // Palette — blue → teal. Lighter theme needs stronger alpha to read on white.
      const nodeColor = dark ? "96, 165, 250" : "37, 99, 235";
      const linkColor = dark ? "45, 212, 191" : "20, 130, 160";
      // Packets use the rose accent so they separate from the blue/teal mesh.
      const packetColor = dark ? "251, 113, 133" : "200, 30, 74";
      const nodeAlpha = dark ? 0.9 : 0.55;
      const linkBase = dark ? 0.55 : 0.4;

      ctx!.clearRect(0, 0, width, height);

      // Links between nearby nodes.
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * linkBase;
            ctx!.strokeStyle = `rgba(${linkColor}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();

            if (spawn && packets.length < MAX_PACKETS && Math.random() < SPAWN_CHANCE) {
              const forward = Math.random() < 0.5;
              packets.push({
                a: forward ? i : j,
                b: forward ? j : i,
                t: 0,
                speed: 0.011 + Math.random() * 0.009,
              });
            }
          }
        }

        // Link to cursor for interactivity.
        if (mouse.active) {
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_DIST) {
            const alpha = (1 - dist / MOUSE_DIST) * (dark ? 0.7 : 0.5);
            ctx!.strokeStyle = `rgba(${nodeColor}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
          }
        }
      }

      // Nodes — the ones near the cursor swell slightly, as if activated.
      for (const n of nodes) {
        let r = 1.6;
        if (mouse.active) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < MOUSE_DIST) r += (1 - d / MOUSE_DIST) * 1.6;
        }
        ctx!.fillStyle = `rgba(${nodeColor}, ${nodeAlpha})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Packets — a lit segment of the link plus a haloed head. A packet dies
      // when it arrives, or early if its two nodes drift out of link range.
      for (let k = packets.length - 1; k >= 0; k--) {
        const p = packets[k];
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b || p.t >= 1 || Math.hypot(a.x - b.x, a.y - b.y) > LINK_DIST) {
          packets.splice(k, 1);
          continue;
        }
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const fade = Math.sin(Math.PI * p.t); // ease in and out along the link

        ctx!.strokeStyle = `rgba(${packetColor}, ${0.35 * fade})`;
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(x, y);
        ctx!.stroke();

        ctx!.fillStyle = `rgba(${packetColor}, ${0.16 * fade})`;
        ctx!.beginPath();
        ctx!.arc(x, y, 6, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(${packetColor}, ${0.95 * fade})`;
        ctx!.beginPath();
        ctx!.arc(x, y, 2, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function step() {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      for (const p of packets) p.t += p.speed;
      draw(true);
      if (running) raf = requestAnimationFrame(step);
    }

    function start() {
      if (raf) return;
      running = true;
      // Always paint one frame immediately so the network is visible even if
      // requestAnimationFrame is throttled (background/undisplayed tab) or the
      // user prefers reduced motion. Only then kick off the animation loop.
      draw();
      if (!reduceMotion) raf = requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    // ── Wiring ──
    resize();
    start();

    const onResize = () => resize();
    const onVisibility = () => (document.hidden ? stop() : start());
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => (mouse.active = false);

    // Pause when the hero scrolls off-screen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(canvas);

    // Recolour instantly on theme toggle. Redraw unconditionally so the palette
    // updates even when the animation loop is paused (reduced-motion, or an
    // undisplayed tab where requestAnimationFrame is throttled).
    const themeObserver = new MutationObserver(() => draw());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      stop();
      io.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

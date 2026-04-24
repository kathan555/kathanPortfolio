"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulseOffset: number; // each particle pulses at a different phase
}

interface Hexagon {
  x: number;
  y: number;
  size: number;
  vy: number;
  opacity: number;
  rotationSpeed: number;
  rotation: number;
}

function getThemeColors(isDark: boolean) {
  return isDark
    ? {
        particle:    "96, 165, 250",   // blue-400
        line:        "96, 165, 250",
        hex:         "45, 212, 191",   // teal-400
        glow:        "59, 130, 246",   // blue-500
        particleMax: 0.9,
        lineMax:     0.22,
        hexMax:      0.06,
      }
    : {
        particle:    "37, 99, 235",    // blue-600
        line:        "37, 99, 235",
        hex:         "13, 148, 136",   // teal-600
        glow:        "59, 130, 246",
        particleMax: 0.55,
        lineMax:     0.12,
        hexMax:      0.04,
      };
}

export function AnimatedBackground() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const animRef      = useRef<number>(0);
  const particles    = useRef<Particle[]>([]);
  const hexagons     = useRef<Hexagon[]>([]);
  const mouse        = useRef({ x: -9999, y: -9999 });
  const timeRef      = useRef(0);
  const { resolvedTheme } = useTheme();
  const themeRef     = useRef(resolvedTheme);

  // Keep theme ref in sync without restarting the loop
  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Init ──────────────────────────────────────────────────────────────────
    function resize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      initHexagons();
    }

    function initParticles() {
      const w = canvas!.width;
      const h = canvas!.height;
      // Density: 1 particle per ~12000px²  (max 80)
      const count = Math.min(80, Math.floor((w * h) / 12000));
      particles.current = Array.from({ length: count }, () => ({
        x:            Math.random() * w,
        y:            Math.random() * h,
        vx:           (Math.random() - 0.5) * 0.35,
        vy:           (Math.random() - 0.5) * 0.35,
        size:         Math.random() * 1.8 + 0.6,
        pulseOffset:  Math.random() * Math.PI * 2,
      }));
    }

    function initHexagons() {
      const w = canvas!.width;
      const h = canvas!.height;
      hexagons.current = Array.from({ length: 7 }, (_, i) => ({
        x:             w * (0.08 + (i / 6) * 0.84),
        y:             Math.random() * h,
        size:          40 + Math.random() * 60,
        vy:            0.12 + Math.random() * 0.18,
        opacity:       0.03 + Math.random() * 0.04,
        rotationSpeed: (Math.random() - 0.5) * 0.003,
        rotation:      Math.random() * Math.PI * 2,
      }));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function drawHex(
      x: number, y: number, r: number,
      rotation: number, opacity: number, color: string
    ) {
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(rotation);
      ctx!.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = r * Math.cos(angle);
        const py = r * Math.sin(angle);
        if (i === 0) ctx!.moveTo(px, py);
        else          ctx!.lineTo(px, py);
      }
      ctx!.closePath();
      ctx!.strokeStyle = `rgba(${color}, ${opacity})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // Inner ring
      ctx!.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = (r * 0.55) * Math.cos(angle);
        const py = (r * 0.55) * Math.sin(angle);
        if (i === 0) ctx!.moveTo(px, py);
        else          ctx!.lineTo(px, py);
      }
      ctx!.closePath();
      ctx!.strokeStyle = `rgba(${color}, ${opacity * 0.5})`;
      ctx!.lineWidth = 0.5;
      ctx!.stroke();
      ctx!.restore();
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    function animate() {
      animRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      const w  = canvas!.width;
      const h  = canvas!.height;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const isDark = themeRef.current !== "light";
      const col = getThemeColors(isDark);

      ctx!.clearRect(0, 0, w, h);

      // ── 1. Floating hexagons ────────────────────────────────────────────────
      for (const hex of hexagons.current) {
        hex.y        -= hex.vy;
        hex.rotation += hex.rotationSpeed;
        if (hex.y + hex.size < 0) {
          hex.y    = h + hex.size;
          hex.x    = w * (0.05 + Math.random() * 0.9);
          hex.size = 40 + Math.random() * 60;
        }
        drawHex(hex.x, hex.y, hex.size, hex.rotation, hex.opacity * col.hexMax / 0.06, col.hex);
      }

      // ── 2. Update particles ─────────────────────────────────────────────────
      const ps = particles.current;
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        // Wrap
        if (p.x < -5)    p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5)    p.y = h + 5;
        if (p.y > h + 5) p.y = -5;

        // Gentle mouse repulsion
        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0.1) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 0.8;
          p.y += (dy / dist) * force * 0.8;
        }

        // Pulse size
        const pulse = 1 + Math.sin(t * 1.5 + p.pulseOffset) * 0.35;
        const drawR = p.size * pulse;

        // Glow halo
        const glowR = drawR * 5;
        const grad  = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grad.addColorStop(0, `rgba(${col.glow}, 0.18)`);
        grad.addColorStop(1, `rgba(${col.glow}, 0)`);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();

        // Core dot
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, drawR, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${col.particle}, ${col.particleMax})`;
        ctx!.fill();
      }

      // ── 3. Connection lines ─────────────────────────────────────────────────
      const maxDist = 155;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx   = ps[i].x - ps[j].x;
          const dy   = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * col.lineMax;
            ctx!.beginPath();
            ctx!.moveTo(ps[i].x, ps[i].y);
            ctx!.lineTo(ps[j].x, ps[j].y);
            ctx!.strokeStyle = `rgba(${col.line}, ${alpha})`;
            ctx!.lineWidth   = 0.6;
            ctx!.stroke();
          }
        }
      }

      // ── 4. Subtle scanning line (dark mode only) ────────────────────────────
      if (isDark) {
        const scanY = ((t * 40) % (h + 80)) - 40;
        const scanGrad = ctx!.createLinearGradient(0, scanY - 60, 0, scanY + 60);
        scanGrad.addColorStop(0,   "rgba(96, 165, 250, 0)");
        scanGrad.addColorStop(0.5, "rgba(96, 165, 250, 0.025)");
        scanGrad.addColorStop(1,   "rgba(96, 165, 250, 0)");
        ctx!.fillStyle = scanGrad;
        ctx!.fillRect(0, scanY - 60, w, 120);
      }
    }

    function onMouseMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
    }
    function onMouseLeave() {
      mouse.current = { x: -9999, y: -9999 };
    }

    window.addEventListener("resize",     resize);
    window.addEventListener("mousemove",  onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize",     resize);
      window.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []); // only run once — themeRef handles live updates

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

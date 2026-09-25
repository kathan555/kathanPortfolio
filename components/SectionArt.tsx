import { useId } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   SectionArt
   Decorative SVG backdrops for page sections — a neural net, circuit traces,
   orbital rings, a honeycomb mesh and flowing contour lines.

   • Built from the site's own vocabulary, so the art reads as part of it:
     the hero's neural net and glowing packets, the blueprint grid, the HUD
     corner brackets round the portrait, and the blue → purple → rose holo
     ring that orbits cards and divider badges.

   • On-palette by construction: every stroke and fill resolves through the
     theme tokens (--c-blue-*, --c-purple-*, --c-rose-*), so the art uses only
     the brand colours and re-tints itself when the theme flips. This is why
     these are inline components rather than files in /public — an <img> SVG
     cannot see the page's CSS variables.
   • Server component, zero JS. Motion is CSS-only (see "Section art" in
     globals.css) and switched off under prefers-reduced-motion.
   • No SVG filters. Anything animated repaints the whole layer each frame,
     and a blur filter would be re-run with it — glows are layered strokes
     and radial gradients instead.
   • Gradients use userSpaceOnUse: an objectBoundingBox gradient collapses to
     nothing on a perfectly horizontal or vertical trace (zero-height bbox).

   Place inside a `relative` parent (`isolate` too if the parent has its own
   background, as `.section-band` does). The layer sits at z-index -1, under
   all content. By default it covers the parent; `at` instead drops a
   fixed-height band at that offset, for long single-container pages such as
   /hire, where one parent-sized layer would never go off screen and so
   could never be skipped.
   ───────────────────────────────────────────────────────────────────────── */

type Variant = "neural" | "circuit" | "orbit" | "hex" | "waves";
type Side = "left" | "right";

const BLUE   = "rgb(var(--c-blue-500))";
const BLUE_L = "rgb(var(--c-blue-400))";
const PURPLE = "rgb(var(--c-purple-400))";
const ROSE   = "rgb(var(--c-rose-500))";
const ROSE_L = "rgb(var(--c-rose-400))";

export function SectionArt({
  variant,
  side = "right",
  at,
  className = "",
}: {
  variant: Variant;
  side?: Side;
  /** CSS `top` for a standalone band, e.g. "35%". */
  at?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const Art = ART[variant];
  return (
    <div
      aria-hidden
      className={`art-layer ${className}`}
      style={at ? { top: at, bottom: "auto", height: "min(1000px, 100%)" } : undefined}
    >
      <svg
        className={`art art--${variant} art--${side}`}
        viewBox={variant === "waves" ? "0 0 800 480" : "0 0 600 600"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <Art id={id} />
      </svg>
    </div>
  );
}

/* Shared blue → purple → rose stroke, laid across the whole canvas. */
function BrandGradient({ id, x2 = 600, y2 = 600 }: { id: string; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={x2} y2={y2}>
      <stop offset="0%"   style={{ stopColor: BLUE }} />
      <stop offset="55%"  style={{ stopColor: PURPLE }} />
      <stop offset="100%" style={{ stopColor: ROSE }} />
    </linearGradient>
  );
}

function Glow({ id, color }: { id: string; color: string }) {
  return (
    <radialGradient id={id}>
      <stop offset="0%"   style={{ stopColor: color, stopOpacity: 0.55 }} />
      <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
    </radialGradient>
  );
}

/* Blueprint dot grid — the texture of the site's ambient grid, spotlit by the
   layer's radial mask. */
function Dots({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern id={`${id}-dots`} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="1" style={{ fill: BLUE }} />
        </pattern>
      </defs>
      <rect width="600" height="600" fill={`url(#${id}-dots)`} opacity="0.28" />
    </>
  );
}

/* HUD corner brackets framing the focal point, like the ones round the hero
   portrait. Kept well inside the canvas: the radial mask erases corners. */
function Brackets({ x, y, w, h, len = 16 }: { x: number; y: number; w: number; h: number; len?: number }) {
  const r = x + w, b = y + h;
  return (
    <path
      d={`M${x} ${y + len} V${y} H${x + len} M${r - len} ${y} H${r} V${y + len} M${r} ${b - len} V${b} H${r - len} M${x + len} ${b} H${x} V${b - len}`}
      strokeWidth="1.5"
      strokeLinecap="round"
      style={{ stroke: BLUE_L }}
      opacity="0.85"
    />
  );
}

/* A packet riding a path: a bright core over a wide faint halo, both driven
   by the same dash animation so they travel as one glowing pulse. */
function Packet({ d, color, delay, long = false }: { d: string; color: string; delay: number; long?: boolean }) {
  const cls = `art-flow${long ? " art-flow--long" : ""}`;
  const style = { stroke: color, animationDelay: `${delay}s` };
  return (
    <g strokeLinecap="round">
      <path d={d} className={cls} strokeWidth="8" opacity="0.18" style={style} />
      <path d={d} className={cls} strokeWidth="2.25" style={style} />
    </g>
  );
}

/* ── Neural: a small feed-forward net with lit inference paths ──
   The hero's NeuralBackground redrawn as a diagram: every link faint, the
   active routes bright, packets running input → output. */
const NET_X = [120, 240, 360, 480];
const NET_LAYERS: number[][] = [
  [220, 300, 380],
  [156, 228, 300, 372, 444],
  [156, 228, 300, 372, 444],
  [260, 340],
];
const netNode = (l: number, n: number): [number, number] => [NET_X[l], NET_LAYERS[l][n]];
const NET_LINKS = NET_LAYERS.slice(0, -1).flatMap((ys, l) =>
  ys.flatMap((_, a) => NET_LAYERS[l + 1].map((__, b) => {
    const [x1, y1] = netNode(l, a);
    const [x2, y2] = netNode(l + 1, b);
    return `M${x1} ${y1} L${x2} ${y2}`;
  }))
).join(" ");
/* Node index per layer along each lit route. */
const NET_ROUTES = [
  { nodes: [1, 1, 3, 0], color: BLUE_L },
  { nodes: [0, 3, 1, 1], color: ROSE_L },
  { nodes: [2, 2, 2, 0], color: PURPLE },
].map((r) => ({
  ...r,
  d: r.nodes.map((n, l) => `${l ? "L" : "M"}${netNode(l, n).join(" ")}`).join(" "),
}));
const NET_LIT = new Set(NET_ROUTES.flatMap((r) => r.nodes.map((n, l) => `${l}-${n}`)));

function Neural({ id }: { id: string }) {
  const last = NET_LAYERS.length - 1;
  return (
    <>
      <defs>
        <BrandGradient id={`${id}-g`} x2={600} y2={0} />
        <Glow id={`${id}-out`} color={ROSE} />
        <Glow id={`${id}-in`} color={BLUE} />
      </defs>
      <Dots id={id} />

      <circle cx="480" cy="300" r="120" fill={`url(#${id}-out)`} opacity="0.55" />
      <circle cx="120" cy="300" r="110" fill={`url(#${id}-in)`} opacity="0.5" />

      <path d={NET_LINKS} stroke={`url(#${id}-g)`} strokeWidth="0.9" opacity="0.3" />
      <g strokeWidth="1.6" strokeLinejoin="round" opacity="0.85">
        {NET_ROUTES.map((r) => <path key={r.d} d={r.d} style={{ stroke: r.color }} />)}
      </g>
      {NET_ROUTES.map((r, i) => (
        <Packet key={r.d} d={r.d} color={r.color} delay={i * -2.3} />
      ))}

      {NET_LAYERS.map((ys, l) =>
        ys.map((y, n) => {
          const lit = NET_LIT.has(`${l}-${n}`);
          const out = l === last;
          return (
            <circle
              key={`${l}-${n}`}
              cx={NET_X[l]}
              cy={y}
              r={out ? 10 : lit ? 7.5 : 6}
              strokeWidth="1.5"
              className={out ? "art-pulse" : undefined}
              style={{
                fill: lit ? (out ? ROSE : BLUE) : "hsl(var(--background))",
                stroke: out ? ROSE : BLUE,
                animationDelay: out && n ? "-2s" : undefined,
              }}
            />
          );
        })
      )}

      <Brackets x={452} y={232} w={56} h={136} />
    </>
  );
}

/* ── Circuit: PCB traces feeding a chip, with packets running the lines ── */
const TRACES = [
  "M600 80 H420 L380 120 V260 L340 300 H232",
  "M600 140 H460 L440 160 V340 L400 380 H300 L260 420 V520",
  "M600 220 H500 V300 L470 330 H380",
  "M600 400 H520 L480 440 V600",
  "M600 470 H440 L400 510 H160",
  "M520 0 V60 L480 100 H300 L260 140 V218",
  "M232 270 H300 L330 240 V180",
];
const PADS: [number, number][] = [
  [380, 330], [260, 520], [160, 510], [330, 180], [480, 600],
];
const VIAS: [number, number][] = [
  [420, 80], [440, 160], [500, 220], [520, 400], [440, 470], [480, 100], [400, 380],
];

function Circuit({ id }: { id: string }) {
  return (
    <>
      <defs>
        <BrandGradient id={`${id}-g`} x2={0} y2={600} />
        <Glow id={`${id}-glow`} color={BLUE} />
      </defs>

      <Dots id={id} />
      <circle cx="176" cy="300" r="150" fill={`url(#${id}-glow)`} opacity="0.5" />

      <g stroke={`url(#${id}-g)`} strokeWidth="1.25" strokeLinejoin="round" opacity="0.8">
        {TRACES.map((d) => <path key={d} d={d} />)}
      </g>

      {/* Packets: short dashes of the same paths, slid along by dashoffset. */}
      {TRACES.slice(0, 5).map((d, i) => (
        <Packet key={d} d={d} color={i % 2 ? ROSE_L : BLUE_L} delay={i * -1.7} />
      ))}

      {/* The chip */}
      <g>
        <rect x="120" y="244" width="112" height="112" rx="14"
          style={{ fill: BLUE, fillOpacity: 0.06, stroke: BLUE }} strokeWidth="1.25" />
        <rect x="146" y="270" width="60" height="60" rx="8"
          style={{ stroke: PURPLE }} strokeOpacity="0.7" strokeDasharray="3 5" />
        <g style={{ stroke: BLUE }} strokeWidth="1.25" opacity="0.7">
          {[262, 284, 306, 328].map((y) => <path key={`l${y}`} d={`M120 ${y} H104`} />)}
          {[142, 164, 186, 208].map((x) => <path key={`t${x}`} d={`M${x} 244 V228 M${x} 356 V372`} />)}
        </g>
        {/* Counter-flipped in CSS when the art is mirrored, so it never
            reads backwards. */}
        <text
          x="176" y="308" textAnchor="middle" className="art-text"
          style={{ fill: BLUE, fontFamily: "var(--font-jetbrains-mono)", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}
        >
          AI
        </text>
        <circle cx="216" cy="260" r="4" className="art-pulse" style={{ fill: ROSE }} />
      </g>
      <Brackets x={92} y={216} w={168} h={168} />

      <g strokeWidth="1.25">
        {PADS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5"
            style={{ fill: "hsl(var(--background))", stroke: ROSE }} />
        ))}
        {VIAS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" style={{ fill: BLUE }} />
        ))}
      </g>
    </>
  );
}

/* ── Orbit: tilted rings around a glowing core, with circling satellites ── */
function Orbit({ id }: { id: string }) {
  return (
    <>
      <defs>
        <BrandGradient id={`${id}-g`} />
        <Glow id={`${id}-core`} color={BLUE} />
        <Glow id={`${id}-rose`} color={ROSE} />
      </defs>

      <Dots id={id} />
      <circle cx="300" cy="300" r="170" fill={`url(#${id}-core)`} />

      <g stroke={`url(#${id}-g)`} strokeWidth="1.1">
        <circle cx="300" cy="300" r="46" opacity="0.9" />
        <circle cx="300" cy="300" r="110" strokeDasharray="2 9" strokeLinecap="round" opacity="0.8" />
        <circle cx="300" cy="300" r="180" opacity="0.55" />
        <circle cx="300" cy="300" r="262" strokeDasharray="1 14" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="300" cy="300" rx="272" ry="92" transform="rotate(-24 300 300)" opacity="0.6" />
        <ellipse cx="300" cy="300" rx="228" ry="70" transform="rotate(38 300 300)" opacity="0.45" />
      </g>

      {/* Holo arc: the conic ring from .fx-holo, as a gradient arc sweeping
          the r=180 orbit (about a quarter of its 1131 circumference). */}
      <g className="art-spin" style={{ animationDuration: "14s" }} stroke={`url(#${id}-g)`} strokeLinecap="round">
        <circle cx="300" cy="300" r="180" strokeWidth="9" strokeDasharray="280 851" opacity="0.14" />
        <circle cx="300" cy="300" r="180" strokeWidth="2.5" strokeDasharray="280 851" />
      </g>

      <circle cx="300" cy="300" r="9" className="art-pulse" style={{ fill: BLUE }} />
      <Brackets x={240} y={240} w={120} h={120} len={14} />

      {/* Satellites — each group spins around the canvas centre. */}
      <g className="art-spin" style={{ animationDuration: "48s" }}>
        <circle cx="480" cy="300" r="26" fill={`url(#${id}-rose)`} />
        <circle cx="480" cy="300" r="5.5" style={{ fill: ROSE }} />
      </g>
      <g className="art-spin art-spin--rev" style={{ animationDuration: "32s" }}>
        <circle cx="300" cy="190" r="4.5" style={{ fill: BLUE_L }} />
      </g>
      <g className="art-spin" style={{ animationDuration: "90s" }}>
        <circle cx="38" cy="300" r="4" style={{ fill: PURPLE }} />
        <circle cx="562" cy="300" r="3" style={{ fill: BLUE }} />
      </g>
    </>
  );
}

/* ── Hex: honeycomb mesh with a few lit cells ── */
const HEX_R = 34;
const HEX_H = Math.sqrt(3) * HEX_R;
const hexCentre = (col: number, row: number): [number, number] => [
  40 + col * 1.5 * HEX_R,
  30 + row * HEX_H + (col % 2 ? HEX_H / 2 : 0),
];
const hexPath = (cx: number, cy: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k;
    return `${k ? "L" : "M"}${(cx + HEX_R * Math.cos(a)).toFixed(1)} ${(cy + HEX_R * Math.sin(a)).toFixed(1)}`;
  }).join(" ") + " Z";

const HEX_GRID = Array.from({ length: 11 }, (_, col) =>
  Array.from({ length: 10 }, (_, row) => hexPath(...hexCentre(col, row))).join(" ")
).join(" ");

const HEX_LIT: { cell: [number, number]; color: string; pulse?: boolean }[] = [
  { cell: [5, 4], color: BLUE, pulse: true },
  { cell: [6, 4], color: PURPLE },
  { cell: [4, 5], color: BLUE },
  { cell: [7, 6], color: ROSE, pulse: true },
  { cell: [3, 2], color: PURPLE },
  { cell: [8, 2], color: BLUE },
  { cell: [5, 7], color: ROSE },
];

function Hex({ id }: { id: string }) {
  return (
    <>
      <defs>
        <BrandGradient id={`${id}-g`} />
      </defs>

      <path d={HEX_GRID} stroke={`url(#${id}-g)`} strokeWidth="1" opacity="0.45" />

      {HEX_LIT.map(({ cell, color, pulse }) => {
        const [cx, cy] = hexCentre(...cell);
        return (
          <g key={cell.join("-")} className={pulse ? "art-pulse" : undefined}>
            <path d={hexPath(cx, cy)} strokeWidth="1.5"
              style={{ fill: color, fillOpacity: 0.12, stroke: color }} />
            <circle cx={cx} cy={cy} r="3.5" style={{ fill: color }} />
          </g>
        );
      })}

      {/* Links between lit cells */}
      <path
        d={[[3, 2], [5, 4], [6, 4], [8, 2], [6, 4], [7, 6], [5, 7], [4, 5], [5, 4]]
          .map((c, i) => `${i ? "L" : "M"}${hexCentre(c[0], c[1]).join(" ")}`)
          .join(" ")}
        strokeWidth="1.25"
        strokeDasharray="4 6"
        className="art-march"
        style={{ stroke: BLUE_L }}
      />
      <Brackets x={236} y={206} w={180} h={180} />
    </>
  );
}

/* ── Waves: stacked contour lines drifting across the canvas ── */
const WAVE_PATHS = Array.from({ length: 16 }, (_, i) => {
  let d = "";
  for (let x = 0; x <= 800; x += 10) {
    const y =
      70 + i * 22 +
      34 * Math.sin(x / 150 + i * 0.32) +
      14 * Math.sin(x / 62 - i * 0.5);
    d += `${x ? "L" : "M"}${x} ${y.toFixed(1)} `;
  }
  return d.trim();
});

function Waves({ id }: { id: string }) {
  return (
    <>
      <defs>
        <BrandGradient id={`${id}-g`} x2={800} y2={0} />
      </defs>
      <g className="art-drift" stroke={`url(#${id}-g)`} strokeWidth="1.1">
        {WAVE_PATHS.map((d, i) => (
          <path key={i} d={d} opacity={(0.25 + 0.6 * Math.sin((Math.PI * (i + 1)) / 17)).toFixed(2)} />
        ))}
      </g>
      {[3, 8, 12].map((i, n) => (
        <Packet key={i} d={WAVE_PATHS[i]} color={n === 1 ? ROSE_L : BLUE_L} delay={n * -4} long />
      ))}
    </>
  );
}

const ART: Record<Variant, (p: { id: string }) => React.ReactElement> = {
  neural: Neural,
  circuit: Circuit,
  orbit: Orbit,
  hex: Hex,
  waves: Waves,
};

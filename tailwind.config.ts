import type { Config } from "tailwindcss";

/* ── Theme-aware accent scales ────────────────────────────────────────────────
   The whole design was authored in dark mode: ~290 usages of blue-400 /
   teal-400 / purple-300 and friends, which sit at 7–11:1 on the dark
   background but collapse to 1.8–2.5:1 on white — and light is the default
   theme. Rather than rewrite every call site, the scales themselves resolve
   through CSS variables that swap per theme (see app/globals.css).

   Channels are stored as raw RGB triplets ("59 130 246") rather than HSL so the
   dark values are byte-identical to Tailwind's defaults — no rounding drift —
   while `<alpha-value>` keeps every existing /10, /20, /25 modifier working.

   Only shades actually used in the codebase are declared. Adding a new shade
   means adding it here AND in both blocks of globals.css. */
const themed = (name: string, shades: number[]) =>
  Object.fromEntries(
    shades.map((s) => [s, `rgb(var(--c-${name}-${s}) / <alpha-value>)`])
  );

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Task 1: Font size scale bumped +1–2px across all sizes ──
      fontSize: {
        xs:   ["0.875rem",   { lineHeight: "1.375rem" }], // 14px
        sm:   ["1rem",       { lineHeight: "1.625rem" }], // 16px
        base: ["1.1875rem",  { lineHeight: "1.875rem" }], // 19px
        lg:   ["1.3125rem",  { lineHeight: "2rem"     }], // 21px
        xl:   ["1.4375rem",  { lineHeight: "2rem"     }], // 23px
        "2xl":["1.5625rem",  { lineHeight: "2rem"     }], // 25px  (was 24)
        "3xl":["1.9375rem",  { lineHeight: "2.25rem"  }], // 31px  (was 30)
        "4xl":["2.25rem",    { lineHeight: "2.5rem"   }], // 36px  (unchanged)
        "5xl":["3rem",       { lineHeight: "1"        }],
        "6xl":["3.75rem",    { lineHeight: "1"        }],
        "7xl":["4.5rem",     { lineHeight: "1"        }],
        "8xl":["6rem",       { lineHeight: "1"        }],
        "9xl":["8rem",       { lineHeight: "1"        }],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary:    { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:  { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        accent:     { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        muted:      { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        card:       { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        border: "hsl(var(--border))",
        ring:   "hsl(var(--ring))",

        // Accent scales — resolved per theme, see comment at top of file.
        blue:    themed("blue",    [50, 100, 200, 300, 400, 500, 600]),
        rose:    themed("rose",    [300, 400, 500]),
        // Highlight only — bright in BOTH themes, always paired with dark text.
        // Never use as text on a light surface: yellow-400 on white is 1.49:1.
        yellow:  themed("yellow",  [300, 400, 500]),
        purple:  themed("purple",  [300, 400, 500]),
        green:   themed("green",   [300, 400, 500]),
        orange:  themed("orange",  [300, 400, 500]),
        emerald: themed("emerald", [400, 500, 600]),
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body:    ["var(--font-lato)", "sans-serif"],
        mono:    ["var(--font-jetbrains-mono)", "monospace"],
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        "border-flow":    "gradient-shift 5s ease infinite",
        "pulse-slow":     "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float:            "float 6s ease-in-out infinite",
        shine:            "shine 3.2s ease-in-out infinite",
        "glow-pulse":     "glow-pulse 3.2s ease-in-out infinite",
        // ── AI-immersive additions ──
        "spin-slow":      "spin-slow 14s linear infinite",
        "caret-blink":    "caret-blink 1.1s step-end infinite",
        aurora:           "aurora 16s ease infinite",
        beam:             "beam 7s ease-in-out infinite",
        "beam-delayed":   "beam 7s ease-in-out 3.5s infinite",
      },
      keyframes: {
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "caret-blink": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0" },
        },
        // Aurora sheet — slow hue/position drift behind the hero.
        aurora: {
          "0%, 100%": { backgroundPosition: "0% 50%",   opacity: "0.7" },
          "50%":       { backgroundPosition: "100% 50%", opacity: "1"   },
        },
        // Diagonal light beam sweeping across the hero.
        beam: {
          "0%":        { transform: "translateX(-120%) skewX(-18deg)", opacity: "0" },
          "20%, 40%":  { opacity: "0.5" },
          "60%, 100%": { transform: "translateX(220%) skewX(-18deg)",  opacity: "0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-10px)" },
        },
        // Light sweep across a card; idles off-screen for most of the cycle.
        shine: {
          "0%":        { transform: "translateX(0) skewX(-20deg)" },
          "45%, 100%": { transform: "translateX(600%) skewX(-20deg)" },
        },
        // Breathing halo, timed with `shine` so the card pulses as it flashes.
        "glow-pulse": {
          "0%, 100%": { opacity: "0.35", transform: "scale(0.96)" },
          "50%":       { opacity: "0.85", transform: "scale(1.04)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

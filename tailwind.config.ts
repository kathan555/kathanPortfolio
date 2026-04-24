import type { Config } from "tailwindcss";

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
        xs:   ["0.8125rem",  { lineHeight: "1.25rem"  }], // 13px  (was 12)
        sm:   ["0.9375rem",  { lineHeight: "1.5rem"   }], // 15px  (was 14)
        base: ["1.0625rem",  { lineHeight: "1.75rem"  }], // 17px  (was 16)
        lg:   ["1.1875rem",  { lineHeight: "1.875rem" }], // 19px  (was 18)
        xl:   ["1.3125rem",  { lineHeight: "1.875rem" }], // 21px  (was 20)
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
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body:    ["var(--font-dm-sans)", "sans-serif"],
        mono:    ["var(--font-jetbrains-mono)", "monospace"],
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        "pulse-slow":     "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float:            "float 6s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

/* ─────────────────────────────────────────────────────────────────────────
   Legacy Code X-ray — the pieces both sides need: limits, enums and the
   report shape. Split out of lib/legacy-xray.ts so the /legacy-code-xray
   client component can import them without bundling the prompt, schema and
   Gemini client into the browser.
   ───────────────────────────────────────────────────────────────────────── */

/** The runtime every plan targets. Bump when a new LTS ships (.NET 10 LTS:
 *  Nov 2025; .NET 8 and 9 both reach end of support in Nov 2026). */
export const TARGET_RUNTIME = ".NET 10 (LTS)";

export const XRAY_LIMITS = { minChars: 40, maxChars: 20_000, maxContextChars: 600 };

export const XRAY_LANGUAGES = ["auto", "csharp", "vb", "aspx", "razor", "xaml", "config", "sql"] as const;
export type XrayLanguage = (typeof XRAY_LANGUAGES)[number];

export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export const CATEGORIES = ["blocker", "security", "data-access", "performance", "maintainability", "testing"] as const;
export const SIZES = ["S", "M", "L", "XL"] as const;

export type Severity = (typeof SEVERITIES)[number];

export type XrayReport = {
  isDotNet: boolean;
  summary: string;
  detected: { framework: string; language: string; confidence: "high" | "medium" | "low"; signals: string[] };
  risks: { title: string; severity: Severity; category: (typeof CATEGORIES)[number]; detail: string; evidence: string }[];
  target: { stack: string; rationale: string };
  phases: { name: string; size: (typeof SIZES)[number]; steps: string[] }[];
  quickWins: string[];
  aiOpportunities: string[];
};

/** Public MCP endpoint, shown on /hire and /legacy-code-xray. */
export const MCP_ENDPOINT = "https://kathanpatel.vercel.app/mcp";

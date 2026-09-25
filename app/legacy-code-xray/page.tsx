import { Metadata } from "next";
import Link from "next/link";
import {
  Ban, ShieldAlert, Database, Gauge, Wrench, FlaskConical,
} from "lucide-react";
import XrayClient from "@/components/XrayClient";
import { ConnectYourAI } from "@/components/ConnectYourAI";
import { SectionArt } from "@/components/SectionArt";
import { TARGET_RUNTIME } from "@/lib/legacy-xray-shared";
import { jsonLd } from "@/lib/utils";

const PAGE_URL = "https://kathanpatel.vercel.app/legacy-code-xray";
const TITLE = "Free Legacy .NET Code X-ray — Instant Modernization Report";
const DESCRIPTION =
  `Paste legacy .NET code (Web Forms, WinForms, WCF, VB.NET) and get a free AI modernization report: migration blockers, security risks, the right target on ${TARGET_RUNTIME}, and a phased plan.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "legacy .NET code analysis",
    ".NET migration assessment tool",
    ".NET Framework to .NET 10 migration",
    "Web Forms to Blazor migration",
    "WinForms to .NET 10",
    "WCF to CoreWCF migration",
    "free .NET modernization tool",
    "legacy code modernization",
    "MCP server",
    "Kathan N. Patel",
  ],
  authors: [{ name: "Kathan N. Patel" }],
  creator: "Kathan N. Patel",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Kathan N. Patel",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://kathanpatel.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Free Legacy .NET Code X-ray — Kathan N. Patel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://kathanpatel.vercel.app/og-image.png"],
  },
};

// ─── What the X-ray looks for — mirrors the report's risk categories ─────────

const CHECKS = [
  {
    icon: <Ban className="w-5 h-5" />,
    title: "Migration blockers",
    desc: "APIs with no direct equivalent on modern .NET: System.Web, WCF server, Remoting, AppDomains, BinaryFormatter, 32-bit-only data providers.",
  },
  {
    icon: <ShieldAlert className="w-5 h-5" />,
    title: "Security",
    desc: "SQL built by string concatenation, hard-coded credentials, unsafe deserialization, and trust in unvalidated request data.",
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Data access",
    desc: "Raw ADO.NET, DataSets, Jet/OLE DB and EF6 patterns, and what each maps to on EF Core or modern ADO.NET.",
  },
  {
    icon: <Gauge className="w-5 h-5" />,
    title: "Performance",
    desc: "ViewState bloat, synchronous I/O on request threads, Response.End, and caching that won't survive a move to the cloud.",
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    title: "Maintainability",
    desc: "Business logic trapped in event handlers and code-behind, static state, and tight coupling that makes a phased migration harder.",
  },
  {
    icon: <FlaskConical className="w-5 h-5" />,
    title: "Testability",
    desc: "Code that can't be put under test before it's moved: the safety net a no-downtime migration depends on.",
  },
];

// ─── FAQ — single source for the visible section and FAQPage schema ─────────

const FAQS = [
  {
    q: "What does the Legacy Code X-ray do?",
    a: `It reads a legacy .NET file and returns a modernization report: the framework and era it detects, a severity-ranked risk map with the exact code that triggered each risk, the best target on ${TARGET_RUNTIME}, a three-to-five phase migration plan with relative effort sizes, quick wins, and AI features the modernized app could offer.`,
  },
  {
    q: "Is my code stored?",
    a: "No. The code is never stored or logged by this site. It is sent to Google's Gemini API for the analysis itself, and likely secrets such as passwords, API keys, tokens and private keys are redacted before it leaves the server. Redaction is best effort, so don't paste credentials or code you aren't allowed to share.",
  },
  {
    q: "Which code works best?",
    a: "One representative file: a Web Forms page with its code-behind, a WinForms form, a WCF service contract or implementation, a data-access class, or a web.config section. C#, VB.NET, ASPX, Razor, XAML, config and SQL are all supported, up to 20,000 characters.",
  },
  {
    q: `Why ${TARGET_RUNTIME}?`,
    a: ".NET 10 is the current long-term support release, supported until November 2028. .NET 8 and .NET 9 both reach end of support in November 2026, so a migration starting today should land on .NET 10.",
  },
  {
    q: "Can my AI assistant run the X-ray?",
    a: "Yes. This site runs a public MCP server at kathanpatel.vercel.app/mcp. Add it to Claude, Claude Code, Cursor or VS Code and your assistant can X-ray files straight from your repository. No account or API key is needed.",
  },
  {
    q: "How accurate is it?",
    a: "It is an automated first pass over one file, not a code review. It is good at spotting blockers and risky patterns and at proposing a sensible target, but it can't see your architecture, deployment or data. Treat it as the agenda for a proper assessment.",
  },
  {
    q: "Can you do the migration?",
    a: "Yes. I'm a freelance AI & .NET developer with 8+ years of experience modernizing WinForms, Web Forms and .NET Framework applications to Blazor and ASP.NET Core without breaking what already works. Book a free 30-minute call from the report, or see the hire page.",
  },
];

// ─── Structured data ──────────────────────────────────────────────────────────

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${PAGE_URL}#webapp`,
  name: "Legacy .NET Code X-ray",
  url: PAGE_URL,
  description: DESCRIPTION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@id": "https://kathanpatel.vercel.app/#person" },
  featureList: [
    "Framework and era detection with evidence",
    "Severity-ranked risk map citing the triggering code",
    `Recommended target on ${TARGET_RUNTIME}`,
    "Phased migration plan with relative effort sizes",
    "Automatic redaction of likely secrets",
    "Callable by AI assistants over MCP",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://kathanpatel.vercel.app" },
    { "@type": "ListItem", position: 2, name: "Legacy Code X-ray", item: PAGE_URL },
  ],
};

export default function LegacyCodeXrayPage() {
  return (
    <div className="relative min-h-screen pt-28 pb-20">
      <SectionArt variant="circuit" side="right" at="0%" className="art-layer--edge" />
      <SectionArt variant="neural"  side="left"  at="58%" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero — static, server-rendered ── */}
        <div className="mb-10 text-center fx-rise">
          <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 font-mono tracking-wide">
            ✦ FREE · NO SIGN-UP · MCP-READY
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-3 mb-5 text-balance">
            Legacy .NET <span className="gradient-text">Code X-ray</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Paste a Web Forms page, a WinForms form or a WCF service and see what&apos;s really inside:
            migration blockers, security risks, the right target on {TARGET_RUNTIME}, and a phased plan
            to get there.
          </p>
        </div>

        {/* ── Interactive tool — client-side ── */}
        <XrayClient />

        {/* ── What it checks ── */}
        <section className="mt-24">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-3">
            What the X-ray Looks For
          </h2>
          <p className="text-muted-foreground text-sm text-center max-w-2xl mx-auto mb-10">
            Every finding cites the line, type or member that triggered it, so you can check the
            reasoning instead of trusting a score.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHECKS.map(({ icon, title, desc }) => (
              <div key={title} className="glass-card fx-spotlight relative rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── For AI agents ── */}
        <section id="connect-your-ai" className="mt-24 scroll-mt-28">
          <div className="text-center mb-10">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              For AI agents
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">
              Run the X-ray From Your AI Assistant
            </h2>
          </div>
          <ConnectYourAI />
        </section>

        {/* ── FAQ ── */}
        <section className="mt-24 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">
            Legacy Code X-ray FAQ
          </h2>
          <div className="flex flex-col gap-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-base font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Planning a bigger modernization?{" "}
            <Link href="/hire" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              See how I work
            </Link>{" "}
            or{" "}
            <Link href="/free-project-cost-estimator" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              estimate the project cost
            </Link>.
          </p>
        </section>

      </div>
    </div>
  );
}

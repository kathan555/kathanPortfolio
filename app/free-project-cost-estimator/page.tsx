import { Metadata } from 'next';
import Link from 'next/link';
import EstimatorClient from '@/components/EstimatorClient';
import { fmtUSD } from '@/lib/utils';

const PAGE_URL = "https://kathanpatel.vercel.app/free-project-cost-estimator";

export const metadata: Metadata = {
  title: "Free AI Software Project Cost Estimator — .NET & Web Apps",
  description:
    "Free AI-powered software project cost estimator. Describe your project in one step, get an instant budget range with a phase-by-phase breakdown. No sign-up.",
  keywords: [
    "free software project cost estimator",
    "AI project cost calculator",
    "software development cost calculator",
    "how much does software development cost",
    ".NET development cost estimator",
    "Blazor development cost",
    "web app development cost estimator",
    "custom software development pricing",
    "free project estimation tool",
    "Kathan N. Patel",
  ],
  authors: [{ name: "Kathan N. Patel" }],
  creator: "Kathan N. Patel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Free AI Software Project Cost Estimator — .NET & Web Apps",
    description:
      "Instant AI-powered budget estimate for your .NET, Blazor, or web project. Describe your project once, get a full cost breakdown in seconds. Free, no sign-up.",
    url: PAGE_URL,
    siteName: "Kathan N. Patel",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://kathanpatel.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Free AI Software Project Cost Estimator — Kathan N. Patel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Software Project Cost Estimator — .NET & Web Apps",
    description:
      "Instant AI-powered budget estimate for your .NET, Blazor, or web project. One description, full cost breakdown in seconds. Free, no sign-up.",
    images: ["https://kathanpatel.vercel.app/og-image.png"],
  },
};

// ─── FAQ content — single source for the visible section and FAQPage schema ──

const FAQS = [
  {
    q: "How much does custom software development cost?",
    a: "It depends on scope and complexity. As a rough guide with a solo senior contractor: small internal tools run $3,000–$10,000, mid-size web applications $10,000–$40,000, and multi-module enterprise systems $50,000 and up. This estimator gives you a range tailored to your specific project instead of a generic bracket.",
  },
  {
    q: "How accurate is an AI-generated cost estimate?",
    a: "It is a planning-stage ballpark, not a binding quote. The estimate is grounded in real contractor rate tiers ($35–85/hr) and a six-phase delivery methodology, so the range is realistic for scoping and budgeting. A precise quote always follows a scope conversation.",
  },
  {
    q: "Is this project cost estimator really free?",
    a: "Yes — completely free, no sign-up and no credit card. You describe your project in a single step, see the full breakdown on screen, and receive the same estimate as a PDF in your inbox.",
  },
  {
    q: "How much does .NET or Blazor development cost?",
    a: "Solo senior .NET contractor rates typically range from $35/hr for standard work to $85/hr for specialist work such as legal-tech or AI integrations. A typical Blazor Server business application lands between $8,000 and $30,000 depending on modules, integrations, and timeline.",
  },
  {
    q: "What information do I need to provide?",
    a: "Just one description in your own words — what you want built, the features or problem to solve, and anything you already know about timeline or team. Optionally add your preferred tech stack and any budget you have in mind. One step, about a minute — no technical knowledge required.",
  },
  {
    q: "Does the estimate include design, testing, and deployment?",
    a: "Yes. Every estimate is broken into six phases: Discovery & Planning, UI/UX Design, Core Development, Integrations & APIs, Testing & QA, and Deployment & Handover — each with its own hours, rate, and cost.",
  },
  {
    q: "Why do I get a cost range instead of a single price?",
    a: "The low end is the exact sum of all phase costs. The high end adds a 20% contingency for scope creep and revisions — the most common reason real projects exceed their initial budget.",
  },
  {
    q: "Can I hire you to build the project after estimating?",
    a: "Yes. I am a freelance .NET Technical Lead with 8+ years of experience in Blazor, ASP.NET Core, and WPF, available for remote contract work with clients in the US, UK, UAE, Australia, and worldwide. Use the estimate as a starting point and book a call from the results screen.",
  },
];

// ─── Sample estimate — costs are hours × rate; range high = total + 20% ──────

const SAMPLE_ROWS = [
  { phase: "Discovery & Planning",  hours: 12, rate: 45, cost: 540 },
  { phase: "UI/UX Design",          hours: 24, rate: 45, cost: 1080 },
  { phase: "Core Development",      hours: 90, rate: 55, cost: 4950 },
  { phase: "Integrations & APIs",   hours: 30, rate: 65, cost: 1950 },
  { phase: "Testing & QA",          hours: 24, rate: 45, cost: 1080 },
  { phase: "Deployment & Handover", hours: 10, rate: 45, cost: 450 },
];
const SAMPLE_TOTAL = SAMPLE_ROWS.reduce((s, r) => s + r.cost, 0);
const SAMPLE_HIGH  = Math.round(SAMPLE_TOTAL * 1.2);

// ─── Structured data ──────────────────────────────────────────────────────────

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${PAGE_URL}#webapp`,
  name: "Free AI Project Cost Estimator",
  url: PAGE_URL,
  description:
    "Free AI-powered software project cost estimator. Describe your project in one step and get an instant budget range with a phase-by-phase breakdown, risks, and a recommended tech stack.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@id": "https://kathanpatel.vercel.app/#person" },
  featureList: [
    "AI-generated project cost range",
    "Six-phase cost breakdown with hours and rates",
    "Project-specific risk analysis",
    "Recommended technology stack",
    "PDF estimate delivered by email",
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
    { "@type": "ListItem", position: 2, name: "Free Project Cost Estimator", item: PAGE_URL },
  ],
};

export default function EstimatorPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero — static, server-rendered ── */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 font-mono tracking-wide">
            ✦ FREE AI-POWERED
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 mb-4">
            Free AI Project Cost Estimator
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4 max-w-3xl mx-auto">
            Describe your project in one step and get an instant,
            AI-generated budget range — with a phase-by-phase cost breakdown,
            project risks, and a recommended tech stack. Free, no sign-up.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-3xl mx-auto">
            This free software development cost calculator is tuned for .NET,
            Blazor Server, ASP.NET Core, WPF, and modern web projects — including
            AI integrations. Estimates are based on real solo-contractor rates,
            so the numbers reflect what a project actually costs to build.
          </p>
        </div>

        {/* ── Interactive tool — client-side ── */}
        <EstimatorClient />

        {/* ── How it works ── */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">
            How the Cost Estimator Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Describe your project",
                desc: "Write everything in one go — what you're building, key features, timeline, plus an optional tech stack and budget. Plain English is fine; the AI works out the rest.",
              },
              {
                step: "2",
                title: "AI builds your estimate",
                desc: "The estimate is generated against real contractor rate tiers and a six-phase delivery methodology, so every number is grounded — not guessed.",
              },
              {
                step: "3",
                title: "Get the full breakdown",
                desc: "See your cost range, phase-by-phase breakdown, risks, and recommended stack on screen — and receive the same estimate as a PDF by email.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-card rounded-2xl p-6">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-sm font-bold mb-4">
                  {step}
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Methodology ── */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-4">
            How the Estimate Is Calculated
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed text-center mb-8 max-w-2xl mx-auto">
            Unlike generic calculators that multiply a single hourly rate by a
            guess, every estimate here follows the same methodology I use to
            quote real client projects.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display text-base font-semibold text-foreground mb-3">
                Real contractor rate tiers
              </h3>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                <li><span className="text-foreground font-medium">$35–45/hr</span> — standard tasks: CRUD modules, forms, reports</li>
                <li><span className="text-foreground font-medium">$45–65/hr</span> — complex and architecture work: multi-tenancy, real-time features</li>
                <li><span className="text-foreground font-medium">$65–85/hr</span> — specialist work: legal-tech integrations, AI features</li>
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display text-base font-semibold text-foreground mb-3">
                Six delivery phases
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every project is split into Discovery &amp; Planning, UI/UX
                Design, Core Development, Integrations &amp; APIs, Testing &amp;
                QA, and Deployment &amp; Handover. Each phase gets its own hours
                and rate, and the phase cost is exactly hours × rate — so you can
                see where the money goes.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 sm:col-span-2">
              <h3 className="font-display text-base font-semibold text-foreground mb-3">
                A range, not a fantasy number
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The low end of your estimate is the exact sum of all phase costs.
                The high end adds a 20% contingency for scope creep and revisions —
                the most common reason software projects run over budget. If a
                phase doesn&apos;t apply to your project, it&apos;s zeroed out
                rather than padded.
              </p>
            </div>
          </div>
        </section>

        {/* ── Sample estimate ── */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-4">
            Sample Estimate: Blazor Booking Web App
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed text-center mb-8 max-w-2xl mx-auto">
            A typical output for a Blazor Server appointment-booking app with
            authentication, Stripe payments, and automated email reminders.
          </p>
          <div className="glass-card rounded-2xl p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2.5 pr-4 font-medium">Phase</th>
                  <th className="py-2.5 pr-4 font-medium text-right">Hours</th>
                  <th className="py-2.5 pr-4 font-medium text-right">Rate</th>
                  <th className="py-2.5 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_ROWS.map((row) => (
                  <tr key={row.phase} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 text-foreground">{row.phase}</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground tabular-nums">{row.hours}</td>
                    <td className="py-2.5 pr-4 text-right text-muted-foreground tabular-nums">${row.rate}/hr</td>
                    <td className="py-2.5 text-right text-foreground tabular-nums">{fmtUSD(row.cost)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 pr-4 font-semibold text-foreground" colSpan={3}>
                    Estimated range (incl. 20% contingency)
                  </td>
                  <td className="py-3 text-right font-semibold text-blue-400 tabular-nums whitespace-nowrap">
                    {fmtUSD(SAMPLE_TOTAL)} – {fmtUSD(SAMPLE_HIGH)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">
            Software Project Cost FAQ
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
            Ready for a precise quote instead of an estimate?{" "}
            <Link href="/hire" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              See how to hire me
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              book a call
            </Link>.
          </p>
        </section>

      </div>
    </div>
  );
}

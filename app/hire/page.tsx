import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, CheckCircle, Calendar, Clock,
  MessageSquare, Rocket, DollarSign, Info,
  Shield, Zap, AlertCircle, X,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { services, process, personalInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hire Me — Freelance .NET Developer | Rates & Pricing",
  description:
    "Hire Kathan N. Patel for freelance .NET development. Transparent hourly rates ($35–$85/hr), project minimums, engagement models, and everything included — no surprises.",
};

// ── Why Me ───────────────────────────────────────────────────────────────────
const whyMe = [
  { icon: "⚡", title: "Fast Onboarding",   desc: "I start contributing on day one — no lengthy ramp-up or hand-holding required." },
  { icon: "🎯", title: "Outcome-Focused",   desc: "I measure success by what ships and what it saves you — not hours logged." },
  { icon: "🌍", title: "Remote-Ready",      desc: "Async-first, timezone-flexible, and experienced working with distributed teams." },
  { icon: "🔒", title: "No Lock-in",        desc: "Clean, documented handover at the end of every engagement. You always own your code." },
  { icon: "📅", title: "Weekly Demos",      desc: "You see working software every sprint — no black boxes or month-long silences." },
  { icon: "🛠️", title: "Full-Stack Depth",  desc: "From database schema to UI — I handle the whole vertical, not just one layer." },
];

// ── Hourly rate tiers ─────────────────────────────────────────────────────────
const hourlyTiers = [
  {
    range:    "$20–$25 / hr",
    label:    "Standard",
    color:    "border-blue-500/25 bg-blue-500/5",
    badgeCol: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    best:     "Ongoing retainers, maintenance, bug fixes, feature additions on existing codebases",
    tasks:    ["Blazor / ASP.NET Core maintenance", "WPF updates & enhancements", "API additions & fixes", "Code review & refactoring"],
  },
  {
    range:    "$23–$27 / hr",
    label:    "Complex",
    color:    "border-blue-500/40 bg-blue-500/8 shadow-lg shadow-blue-500/8",
    badgeCol: "bg-blue-500/20 border-blue-500/40 text-blue-400",
    badge:    "Most Projects",
    best:     "New modules, API integrations, Blazor web apps, WPF desktop tools, MVP builds",
    tasks:    ["New Blazor web applications", "WPF desktop development", "Third-party API integrations", "Full-stack module builds"],
  },
  {
    range:    "$30–$35 / hr",
    label:    "Specialist",
    color:    "border-teal-500/25 bg-teal-500/5",
    badgeCol: "bg-teal-500/15 border-teal-500/30 text-teal-400",
    best:     "AI integrations, architecture design, legacy migrations, technical leadership, urgent timelines",
    tasks:    ["AI / Semantic Kernel integration", ".NET legacy migration", "System architecture design", "Fractional Tech Lead / CTO"],
  },
];

// ── Project engagement models ─────────────────────────────────────────────────
const engagements = [
  {
    label:    "Short Sprint",
    duration: "2–4 weeks",
    price:    "from $2,500",
    best:     "Bug fixes, feature additions, API integrations, small builds",
    highlight: false,
  },
  {
    label:    "Fixed-Price Project",
    duration: "1–3 months",
    price:    "from $8,000",
    best:     "MVP builds, module rewrites, Blazor migrations, API projects",
    highlight: true,
    badge:    "Most Common",
  },
  {
    label:    "Monthly Retainer",
    duration: "Ongoing",
    price:    "from $3,500 / mo",
    best:     "Continued development, new features, tech lead support",
    highlight: false,
  },
];

// ── What's included ───────────────────────────────────────────────────────────
const included = [
  "Weekly progress demos (working software, not slides)",
  "Full source code ownership — you keep everything on final payment",
  "Git repository with clean, documented commit history",
  "30-day post-launch support for bugs & questions",
  "NDA signing on request",
  "Invoice in USD, GBP, or AED",
];

const notIncluded = [
  "Third-party API costs (Supabase, Azure, AWS, etc.)",
  "UI/UX design (I can recommend trusted designers)",
  "Ongoing hosting / infrastructure management",
  "Scope additions after the agreed spec — quoted separately",
];

// ── Payment terms ─────────────────────────────────────────────────────────────
const paymentTerms = [
  { icon: "🔐", label: "Fixed Projects",   desc: "50% upfront, 50% on final delivery. Milestone payments available for projects > $15,000." },
  { icon: "📆", label: "Retainers",        desc: "Invoiced monthly in advance. Cancel anytime with 14 days notice." },
  { icon: "💳", label: "Payment Methods",  desc: "Bank transfer (SWIFT/SEPA), PayPal, Wise, or Razorpay (India)." },
  { icon: "💱", label: "Currencies",       desc: "USD (preferred), GBP, AED, EUR, or INR. Invoices issued in your preferred currency." },
];

// ── Region notes ──────────────────────────────────────────────────────────────
const regions = [
  { flag: "🇺🇸🇬🇧", label: "USA & UK",       note: "Rates are 40–60% below US/UK market rates for equivalent senior-level .NET expertise. Most clients save $30–$50/hr compared to local hires." },
  { flag: "🇦🇪🇸🇦", label: "UAE & Gulf",      note: "Experienced working in Gulf timezone (IST +1.5–2.5 hrs from UAE/Saudi). NDA and Arabic invoice available on request." },
  { flag: "🌏",     label: "Rest of World",   note: "All rates quoted in USD. Timezone overlap of at least 4 hours maintained for any client timezone." },
];

export default function HirePage() {
  const mailtoLink = `mailto:${personalInfo.email}?subject=Freelance%20Inquiry%20%E2%80%94%20Let%E2%80%99s%20Work%20Together&body=Hi%20Kathan%2C%0A%0AI%E2%80%99m%20interested%20in%20hiring%20you%20for%20a%20project.%0A%0AProject%20details%3A%0A-%20Type%3A%20%0A-%20Timeline%3A%20%0A-%20Budget%3A%20%0A-%20Description%3A%20%0A%0ALooking%20forward%20to%20connecting!`;

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <ScrollReveal>
          <div className="mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/40 bg-teal-500/8 text-teal-400 text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              {personalInfo.availableForWork
                ? `Available — ${personalInfo.availableFrom}`
                : "Currently Engaged · Open to Discussions"}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mt-2 mb-5 leading-tight">
              Let&apos;s Build Something{" "}
              <span className="gradient-text">Together</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
              I&apos;m a freelance .NET Technical Lead with 8+ years of experience. I work with startups and
              growing businesses to build Blazor web apps, WPF desktop tools, and production-grade APIs —
              on time, within budget, and with clean code you can maintain.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={mailtoLink}
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-xl shadow-blue-500/25 hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4" />
                Start a Conversation
              </a>
              <Link
                href="/estimator"
                className="group inline-flex items-center gap-2 px-7 py-3.5 border border-blue-500/40 text-blue-400 font-medium rounded-xl hover:bg-blue-500/10 hover:border-blue-500/60 transition-all hover:-translate-y-0.5"
              >
                Estimate My Project Cost
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── RATES & PRICING ── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="mb-4">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Rates & Pricing
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 mb-2">
              Transparent Pricing — No Surprises
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-8">
              I publish my rates because clients who know what to expect make better partners.
              All prices are in <span className="text-blue-400 font-semibold">USD</span> unless agreed otherwise.
            </p>
          </div>
        </ScrollReveal>

        {/* Hourly rate tiers */}
        <ScrollReveal delay={0.05}>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <h3 className="font-display font-bold text-foreground">Hourly Rate Tiers</h3>
              <span className="text-xs text-muted-foreground">(for time & materials work)</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-5 mb-4">
              {hourlyTiers.map((tier) => (
                <div
                  key={tier.label}
                  className={`glass-card rounded-2xl p-6 flex flex-col gap-4 border transition-all duration-300 hover:scale-[1.01] ${tier.color}`}
                >
                  {/* Badge row */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold ${tier.badgeCol}`}>
                      {tier.label}
                    </span>
                    {tier.badge && (
                      <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  {/* Rate */}
                  <div className="font-display text-2xl font-extrabold gradient-text leading-tight">
                    {tier.range}
                  </div>

                  {/* Best for */}
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    <span className="text-foreground font-semibold">Best for: </span>
                    {tier.best}
                  </p>

                  {/* Task list */}
                  <ul className="flex flex-col gap-1.5">
                    {tier.tasks.map((t) => (
                      <li key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-muted-foreground max-w-2xl">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Hourly rates apply to T&M (time and materials) contracts. For fixed-price projects, I quote a total
                based on scope — often more cost-effective for well-defined work.
                <span className="text-blue-400 font-medium"> Minimum engagement: 20 hours.</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Project engagement models */}
        <ScrollReveal delay={0.08}>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="font-display font-bold text-foreground">Project Engagement Models</h3>
              <span className="text-xs text-muted-foreground">(fixed-price options)</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-5 mb-4">
              {engagements.map((eng, i) => (
                <div
                  key={i}
                  className={`glass-card rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:border-blue-500/30 ${eng.highlight ? "border-blue-500/30 shadow-lg shadow-blue-500/8" : ""}`}
                >
                  {eng.badge && (
                    <span className="inline-flex self-start px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                      {eng.badge}
                    </span>
                  )}
                  <h4 className="font-display text-lg font-bold text-foreground">{eng.label}</h4>
                  <div className="font-display text-2xl font-extrabold gradient-text">{eng.price}</div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0" />
                    {eng.duration}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-3">
                    <span className="text-foreground font-medium">Best for: </span>
                    {eng.best}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* What's included / not included */}
        <ScrollReveal delay={0.1}>
          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {/* Included */}
            <div className="glass-card rounded-2xl p-6 border-teal-500/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                </div>
                <h3 className="font-display font-bold text-foreground">Always Included</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Not included */}
            <div className="glass-card rounded-2xl p-6 border-orange-500/15">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="font-display font-bold text-foreground">Not Included</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* Payment terms */}
        <ScrollReveal delay={0.12}>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-blue-400" />
              <h3 className="font-display font-bold text-foreground">Payment Terms</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {paymentTerms.map((pt) => (
                <div
                  key={pt.label}
                  className="glass-card rounded-xl p-5 flex items-start gap-3 hover:border-blue-500/20 transition-all"
                >
                  <span className="text-2xl shrink-0">{pt.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1">{pt.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Region-specific notes */}
        <ScrollReveal delay={0.14}>
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-4 h-4 text-blue-400" />
              <h3 className="font-display font-bold text-foreground">Notes by Region</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {regions.map((r) => (
                <div
                  key={r.label}
                  className="glass-card rounded-xl p-5 flex flex-col gap-2 hover:border-blue-500/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{r.flag}</span>
                    <span className="font-display font-semibold text-sm text-foreground">{r.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.note}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── SERVICES ── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
            Services
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 mb-8">
            What I Build
          </h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {services.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.07}>
              <div className="glass-card rounded-2xl p-6 h-full hover:border-blue-500/20 transition-all duration-300 group flex flex-col gap-4">
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-blue-400 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border/60">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ── Why Me ── */}
        <ScrollReveal>
          <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
            Why Hire Me
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 mb-8">
            What You Get
          </h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {whyMe.map((w, i) => (
            <ScrollReveal key={w.title} delay={i * 0.06}>
              <div className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:border-blue-500/20 transition-all">
                <span className="text-2xl shrink-0">{w.icon}</span>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{w.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ── Process ── */}
        <ScrollReveal>
          <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
            Process
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 mb-8">
            How We Work Together
          </h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {process.map((p, i) => (
            <ScrollReveal key={p.step} delay={i * 0.08}>
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 hover:border-blue-500/20 transition-all relative">
                {i < process.length - 1 && (
                  <div className="hidden lg:block absolute top-9 -right-2.5 w-5 h-px bg-blue-500/30 z-10" />
                )}
                <span className="font-display text-3xl font-extrabold gradient-text leading-none">
                  {p.step}
                </span>
                <h3 className="font-display font-bold text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ── Final CTA ── */}
        <ScrollReveal>
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 pointer-events-none" />
            <div className="relative">
              <Rocket className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-3">
                Ready to Start?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Send me a quick message with your project idea. I respond within 24 hours and
                will set up a free 30-minute discovery call — no obligation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href={mailtoLink}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-xl transition-all shadow-xl shadow-blue-500/25 hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-5 h-5" />
                  Email Me Now
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 font-semibold text-lg rounded-xl transition-all hover:-translate-y-0.5"
                >
                  <Calendar className="w-5 h-5" />
                  Use Contact Form
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                {personalInfo.email} · {personalInfo.phone} · Ahmedabad, India (Remote 🌍)
              </p>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}

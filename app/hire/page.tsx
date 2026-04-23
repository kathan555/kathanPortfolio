import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Calendar, Clock, MessageSquare, Rocket } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { services, process, personalInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hire Me — Freelance .NET Developer",
  description:
    "Hire Kathan N. Patel for freelance or contract .NET development — Blazor, WPF, ASP.NET Core, API integrations. Remote-friendly. Available now.",
};

const whyMe = [
  { icon: "⚡", title: "Fast Onboarding", desc: "I start contributing on day one — no lengthy ramp-up or hand-holding required." },
  { icon: "🎯", title: "Outcome-Focused", desc: "I measure success by what ships and what it saves you — not hours logged." },
  { icon: "🌍", title: "Remote-Ready", desc: "Async-first, timezone-flexible, and experienced working with distributed teams." },
  { icon: "🔒", title: "No Lock-in", desc: "Clean, documented handover at the end of every engagement. You always own your code." },
  { icon: "📅", title: "Weekly Demos", desc: "You see working software every sprint — no black boxes or month-long silences." },
  { icon: "🛠️", title: "Full-Stack Depth", desc: "From database schema to UI — I handle the whole vertical, not just one layer." },
];

const projectTypes = [
  { label: "Short Sprint",  duration: "2–4 weeks",   price: "from $2,500",  best: "Bug fixes, feature additions, integrations" },
  { label: "Fixed Project", duration: "1–3 months",  price: "from $8,000",  best: "MVP builds, module rewrites, API projects" },
  { label: "Ongoing Retainer", duration: "Monthly",  price: "from $3,500/mo", best: "Continued dev, new features, tech lead support" },
];

export default function HirePage() {
  const mailtoLink = `mailto:${personalInfo.email}?subject=Freelance%20Inquiry%20—%20Let's%20Work%20Together&body=Hi%20Kathan%2C%0A%0AI'm%20interested%20in%20hiring%20you%20for%20a%20project.%0A%0AProject%20details%3A%0A-%20Type%3A%20%0A-%20Timeline%3A%20%0A-%20Budget%3A%20%0A-%20Description%3A%20%0A%0ALooking%20forward%20to%20connecting!`;

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <ScrollReveal>
          <div className="mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/40 bg-teal-500/8 text-teal-400 text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              {personalInfo.availableForWork ? `Available — ${personalInfo.availableFrom}` : "Currently Engaged · Open to Discussions"}
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

        {/* ── Pricing tiers ── */}
        <ScrollReveal delay={0.1}>
          <div className="mb-20">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Pricing
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 mb-6">
              Engagement Models
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {projectTypes.map((pt, i) => (
                <div
                  key={i}
                  className={`glass-card rounded-2xl p-6 flex flex-col gap-3 hover:border-blue-500/25 transition-all duration-300 ${i === 1 ? "border-blue-500/25 shadow-lg shadow-blue-500/5" : ""}`}
                >
                  {i === 1 && (
                    <span className="inline-flex self-start px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                      Most Common
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold text-foreground">{pt.label}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-2xl font-extrabold gradient-text">{pt.price}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0" />
                    {pt.duration}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-3">
                    <span className="text-foreground font-medium">Best for: </span>
                    {pt.best}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              All engagements include weekly demos, clean code handover, and 30-day post-launch support.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Services grid ── */}
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
                {/* Connector line (desktop) */}
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
          <div className="glass-card rounded-2xl p-10 sm:p-14 text-center relative overflow-hidden border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 pointer-events-none" />
            <div className="relative">
              <Rocket className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-3">
                Ready to Start?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Send me a quick message with your project idea. I respond within 24 hours and
                will set up a free 30-minute discovery call.
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
                {personalInfo.email} · {personalInfo.phone} · Ahmedabad, India (Remote-friendly 🌍)
              </p>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}

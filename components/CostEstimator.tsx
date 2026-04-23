"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Calculator,
  RefreshCw,
  ArrowRight,
  Info,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/AnimatedCounter";

// ─── Types ────────────────────────────────────────────────────────────────────
type Option = { id: string; label: string; desc?: string; cost: number };
type Step   = { id: string; question: string; subtitle?: string; icon: string; options: Option[] };

// ─── Steps ───────────────────────────────────────────────────────────────────
// Costs are additive (USD)
const steps: Step[] = [
  {
    id: "type",
    question: "What type of project?",
    subtitle: "Choose the closest match to your project.",
    icon: "🏗️",
    options: [
      { id: "web",         label: "Web Application",     desc: "Browser-based SaaS, portal, admin dashboard",      cost: 1_800  },
      { id: "desktop",     label: "Desktop App",          desc: "WPF / WinForms / .NET Windows client",              cost: 1_500  },
      { id: "api",         label: "API / Backend Only",   desc: "REST or gRPC services, microservices",              cost: 1_100  },
      { id: "mobile",      label: "Mobile App",           desc: "iOS / Android / .NET MAUI cross-platform",          cost: 2_400  },
      { id: "ecomm",       label: "E-Commerce Platform",  desc: "Product catalogue, checkout, payment gateway",      cost: 3_000  },
      { id: "enterprise",  label: "Enterprise System",    desc: "ERP, CRM, multi-module, large integrations",        cost: 5_400  },
    ],
  },
  {
    id: "complexity",
    question: "How complex is it?",
    subtitle: "Consider modules, integrations, business logic, and edge cases.",
    icon: "⚙️",
    options: [
      { id: "simple",      label: "Simple",     desc: "CRUD, 1–3 modules, minimal custom logic",            cost: 0      },
      { id: "medium",      label: "Medium",     desc: "5–8 modules, auth, some 3rd-party integrations",     cost: 1_800  },
      { id: "complex",     label: "Complex",    desc: "10+ modules, real-time features, many APIs",         cost: 4_800  },
      { id: "enterprise",  label: "Enterprise", desc: "Multi-tenant, BI dashboards, advanced security",     cost: 10_800 },
    ],
  },
  {
    id: "stack",
    question: "What's the primary tech stack?",
    subtitle: "This affects tooling, developer rates, and delivery speed.",
    icon: "🛠️",
    options: [
      { id: "dotnet",    label: ".NET / Blazor",          desc: "ASP.NET Core, Blazor Server / WASM",               cost: 0      },
      { id: "react_net", label: "React + .NET API",       desc: "Next.js / React frontend + .NET backend API",      cost: 600    },
      { id: "wpf",       label: "WPF Desktop",            desc: "XAML-based, high-performance Windows UI",          cost: 0      },
      { id: "cloud",     label: "Full-Stack Cloud",       desc: "Multi-service, cloud-native, containerised",       cost: 2_400  },
      { id: "mixed",     label: "Other / To Be Decided",  desc: "Hybrid, greenfield, or TBD tech stack",            cost: 960    },
    ],
  },
  {
    id: "team",
    question: "What team size do you need?",
    subtitle: "Larger teams mean faster delivery but higher overhead.",
    icon: "👥",
    options: [
      { id: "solo",   label: "Solo Developer",  desc: "1 developer for the full scope",                    cost: 0       },
      { id: "small",  label: "Small Team",      desc: "2–3 developers",                                    cost: 2_400   },
      { id: "medium", label: "Medium Team",     desc: "4–6 developers",                                    cost: 6_000   },
      { id: "large",  label: "Large Team",      desc: "7+ devs + QA engineers + project manager",          cost: 14_400  },
    ],
  },
  {
    id: "scope",
    question: "What's the feature scope?",
    subtitle: "Beyond the core — what else needs to be built?",
    icon: "📋",
    options: [
      { id: "basic",    label: "Basic (MVP)",   desc: "Core features only, launch-ready MVP",              cost: 0      },
      { id: "standard", label: "Standard",      desc: "Full features, auth, notifications, roles/RBAC",    cost: 1_200  },
      { id: "advanced", label: "Advanced",      desc: "Analytics, reporting, AI/ML features",              cost: 3_600  },
      { id: "custom",   label: "Fully Custom",  desc: "Bespoke algorithms, compliance, specialist domain", cost: 7_200  },
    ],
  },
  {
    id: "cicd",
    question: "What CI/CD & deployment setup?",
    subtitle: "Infrastructure and automation complexity matters.",
    icon: "🚀",
    options: [
      { id: "none",     label: "None / Manual",   desc: "FTP upload or manual deployment",                cost: 0      },
      { id: "basic",    label: "Basic",           desc: "Single environment, simple pipeline",            cost: 360    },
      { id: "standard", label: "Standard",        desc: "Dev / Staging / Prod, automated tests, alerts",  cost: 960    },
      { id: "advanced", label: "Advanced DevOps", desc: "Docker, Kubernetes, IaC, monitoring & logging",  cost: 2_400  },
    ],
  },
  {
    id: "timeline",
    question: "What's your timeline?",
    subtitle: "Rush projects require more parallel effort and carry a premium.",
    icon: "⏱️",
    options: [
      { id: "asap",      label: "ASAP / Rush",  desc: "Fastest delivery, all hands on deck",              cost: 2_400  },
      { id: "1-3mo",     label: "1–3 Months",   desc: "Short, focused sprint",                            cost: 600    },
      { id: "3-6mo",     label: "3–6 Months",   desc: "Standard project delivery window",                 cost: 0      },
      { id: "6-12mo",    label: "6–12 Months",  desc: "Larger roadmap with phased delivery",              cost: 0      },
      { id: "flexible",  label: "Flexible",      desc: "No hard deadline — best quality over speed",      cost: 0      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcEstimate(selections: Record<string, string>): { low: number; high: number } {
  let total = 0;
  steps.forEach((step) => {
    const opt = step.options.find((o) => o.id === selections[step.id]);
    if (opt) total += opt.cost;
  });
  // +20% overhead (PM, QA, unforeseen scope)
  total = Math.round(total * 1.2);
  return {
    low:  Math.round(total * 0.85),
    high: Math.round(total * 1.25),
  };
}

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString("en-US")}`;
}

// For AnimatedCounter — pass the short numeric value
function shortVal(n: number): number {
  if (n >= 1_000_000) return parseFloat((n / 1_000_000).toFixed(2));
  if (n >= 1_000)     return parseFloat((n / 1_000).toFixed(1));
  return n;
}
function shortSuffix(n: number): string {
  if (n >= 1_000_000) return "M";
  if (n >= 1_000)     return "K";
  return "";
}

// Build a mailto link with all details prefilled
function buildMailto(
  selections: Record<string, string>,
  low: number,
  high: number,
  email: string
): string {
  const lines = steps.map((s) => {
    const opt = s.options.find((o) => o.id === selections[s.id]);
    return `• ${s.question.replace("?", "")} → ${opt?.label ?? "—"}`;
  });

  const body = [
    "Hi Kathan,",
    "",
    "I used the Cost Estimator on your portfolio and would like to discuss my project.",
    "",
    "=== My Project Details ===",
    ...lines,
    "",
    `=== Estimated Range ===`,
    `${formatUSD(low)} – ${formatUSD(high)} (USD)`,
    "",
    "Please let me know your availability to discuss further.",
    "",
    "Thanks,",
    "[Your Name]",
  ].join("\n");

  const subject = encodeURIComponent("Project Inquiry — Cost Estimate from Portfolio");
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${subject}&body=${encodedBody}`;
}

const CONTACT_EMAIL = "patel.kathan555@gmail.com";

// ─── Component ────────────────────────────────────────────────────────────────
export function CostEstimator() {
  const [current,    setCurrent]    = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [done,       setDone]       = useState(false);

  const step    = steps[current];
  const chosen  = step ? selections[step.id] : undefined;
  const progress = (current / steps.length) * 100;

  function select(optId: string) {
    setSelections((prev) => ({ ...prev, [step.id]: optId }));
  }

  function next() {
    if (!chosen) return;
    if (current < steps.length - 1) setCurrent((c) => c + 1);
    else setDone(true);
  }

  function back() {
    if (done) { setDone(false); return; }
    setCurrent((c) => Math.max(0, c - 1));
  }

  function reset() {
    setCurrent(0);
    setSelections({});
    setDone(false);
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (done) {
    const { low, high } = calcEstimate(selections);
    const mailtoLink    = buildMailto(selections, low, high, CONTACT_EMAIL);

    const summary = steps.map((s) => ({
      icon:    s.icon,
      label:   s.id.charAt(0).toUpperCase() + s.id.slice(1),
      answer:  s.options.find((o) => o.id === selections[s.id])?.label ?? "—",
    }));

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Result card */}
        <div className="glass-card rounded-2xl p-8 sm:p-10 border-teal-500/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 pointer-events-none" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-5">
              <Calculator className="w-7 h-7 text-teal-400" />
            </div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
              Estimated Project Cost (USD)
            </p>

            {/* Animated range */}
            <div className="font-display text-4xl sm:text-5xl font-extrabold gradient-text mb-1 leading-tight">
              $<AnimatedCounter target={shortVal(low)}  suffix={shortSuffix(low)}  duration={1400} />
              {" – "}
              $<AnimatedCounter target={shortVal(high)} suffix={shortSuffix(high)} duration={1700} />
            </div>

            <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
              Indicative range in US Dollars. Final cost depends on detailed scoping, specific
              requirements, and sprint planning.
            </p>
          </div>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Includes a 20% overhead for project management, code review, QA, and unexpected scope.
            Enterprise / compliance-heavy projects may add 15–30% more.
          </p>
        </div>

        {/* Selection summary */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            Your Answers
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {summary.map(({ icon, label, answer }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/60 text-sm"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span>{icon}</span>
                  <span className="truncate">{label}</span>
                </span>
                <span className="font-semibold text-foreground shrink-0 text-xs">{answer}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-blue-500/40 text-muted-foreground hover:text-foreground rounded-xl transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Start Over
          </button>

          {/* Pre-filled mailto — all selections in body */}
          <a
            href={mailtoLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-teal-500/40 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 rounded-xl transition-all text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Email Me This Estimate
          </a>

          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-blue-500/25"
          >
            Discuss This Estimate
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    );
  }

  // ── Wizard screen ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 font-mono">
          <span>Step {current + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center gap-1 mt-3">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i < current   ? "bg-teal-400 flex-1"  :
                i === current ? "bg-blue-400 flex-[2]" :
                                "bg-muted flex-1"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40  }}
          animate={{ opacity: 1, x: 0   }}
          exit={{   opacity: 0, x: -40  }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{step.icon}</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              {step.question}
            </h2>
          </div>
          {step.subtitle && (
            <p className="text-sm text-muted-foreground ml-10 mb-6">{step.subtitle}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            {step.options.map((opt) => {
              const isChosen = chosen === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => select(opt.id)}
                  className={cn(
                    "text-left p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                    isChosen
                      ? "border-blue-500/60 bg-blue-500/6 shadow-lg shadow-blue-500/10"
                      : "border-border hover:border-blue-500/30 hover:bg-blue-500/3"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("font-display font-semibold transition-colors", isChosen ? "text-blue-400" : "text-foreground")}>
                      {opt.label}
                    </span>
                    {isChosen && (
                      <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                  {opt.desc && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.desc}</p>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={back}
          disabled={current === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-blue-500/40 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={next}
          disabled={!chosen}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
            chosen
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {current === steps.length - 1 ? (
            <><Calculator className="w-4 h-4" /> Get My Estimate</>
          ) : (
            <>Next <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { CostEstimator } from "@/components/CostEstimator";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Calculator, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Project Cost Estimator",
  description:
    "Estimate your .NET / web / desktop project cost in seconds — based on type, complexity, stack, team, scope, and timeline.",
};

const highlights = [
  "7 targeted questions",
  "Instant ballpark range",
  "No sign-up required",
  "Covers .NET, Blazor, WPF, React, cloud & more",
];

export default function EstimatorPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-12">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Free Tool
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-2 mb-4 leading-tight">
              Project Cost{" "}
              <span className="gradient-text">Estimator</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl leading-relaxed mb-6">
              Answer 7 quick questions about your project and get an instant ballpark cost
              estimate — no email, no sign-up required.
            </p>
            <div className="flex flex-wrap gap-3">
              {highlights.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                  {h}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Estimator card */}
        <ScrollReveal delay={0.1}>
          <div className="glass-card rounded-2xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground">Cost Estimator</h2>
                <p className="text-xs text-muted-foreground">Estimates in US Dollars (USD)</p>
              </div>
            </div>
            <CostEstimator />
          </div>
        </ScrollReveal>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
          Estimates are indicative and in US Dollars (USD). They include a 20% overhead for PM,
          QA, and unforeseen scope. For an accurate quote,{" "}
          <a href="/contact" className="text-blue-400 hover:underline">
            get in touch
          </a>
          .
        </p>
      </div>
    </div>
  );
}

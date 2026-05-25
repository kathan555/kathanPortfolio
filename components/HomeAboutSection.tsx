"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { summary } from "@/lib/data";

const TECH_ROW_1 = [
  "Next.js", "React", "TypeScript", "Tailwind CSS",
  ".NET 9", "C#", "Blazor", "ASP.NET Core", "WPF",
  "Next.js", "React", "TypeScript", "Tailwind CSS",
  ".NET 9", "C#", "Blazor", "ASP.NET Core", "WPF",
];
const TECH_ROW_2 = [
  "MS-SQL", "PostgreSQL", "Hangfire", "OAuth 2.0", "JWT",
  "REST APIs", "SignalR", "Git", "Telerik", "Syncfusion",
  "MS-SQL", "PostgreSQL", "Hangfire", "OAuth 2.0", "JWT",
  "REST APIs", "SignalR", "Git", "Telerik", "Syncfusion",
];

const HIGHLIGHTS = [
  {
    icon: "🚀",
    title: "Technical Leadership",
    desc: "Lead sprints, align client goals, and drive cross-functional teams to deliver on time.",
  },
  {
    icon: "🏗️",
    title: "Architecture & Design",
    desc: "Translate complex business requirements into scalable, maintainable system architectures.",
  },
  {
    icon: "💡",
    title: "Full Stack Expertise",
    desc: "End-to-end proficiency from WPF desktop apps to Blazor web platforms and RESTful APIs.",
  },
  {
    icon: "🤝",
    title: "Mentorship",
    desc: "Guide junior developers in best practices, code quality, and technical problem-solving.",
  },
];

export function HomeAboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <style>{`
        @keyframes home-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes home-marquee-rev {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .home-marquee     { animation: home-marquee     28s linear infinite; }
        .home-marquee-rev { animation: home-marquee-rev 22s linear infinite; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 max-w-3xl">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-widest uppercase">
              About Me
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2 mb-4 leading-tight">
              Building reliable software for real businesses
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {summary}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-16 space-y-3 overflow-hidden">
            <p className="font-mono text-blue-400 text-xs font-medium tracking-widest uppercase mb-4">
              Tech Stack
            </p>
            <div className="relative flex overflow-hidden">
              <div className="home-marquee flex gap-3 w-max">
                {TECH_ROW_1.map((t, i) => (
                  <span
                    key={i}
                    className="flex-shrink-0 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-sm text-muted-foreground whitespace-nowrap"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative flex overflow-hidden">
              <div className="home-marquee-rev flex gap-3 w-max">
                {TECH_ROW_2.map((t, i) => (
                  <span
                    key={i}
                    className="flex-shrink-0 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-sm text-muted-foreground whitespace-nowrap"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid sm:grid-cols-2 gap-4">
            {HIGHLIGHTS.map((card) => (
              <div
                key={card.title}
                className="glass-card rounded-xl p-5 flex items-start gap-4 hover:border-blue-500/20 transition-all duration-200 group"
              >
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

import { ScrollReveal } from "@/components/ScrollReveal";
import { experiences } from "@/lib/data";
import { Briefcase, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExperienceSection() {
  return (
    <section id="experience" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              03. Experience
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
              Career Journey
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-blue-500/60 via-teal-500/40 to-transparent hidden md:block" />

          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <ScrollReveal key={exp.id} delay={i * 0.1}>
                <div className="relative flex gap-6 md:gap-8">
                  {/* Timeline dot */}
                  <div className="hidden md:flex flex-col items-center shrink-0">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl border-2 flex items-center justify-center z-10 mt-1 transition-all",
                        exp.type === "current"
                          ? "bg-blue-500/20 border-blue-500/60 text-blue-400 shadow-lg shadow-blue-500/20"
                          : "bg-card border-border text-muted-foreground"
                      )}
                    >
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={cn(
                      "glass-card rounded-2xl p-6 flex-1 transition-all duration-300 hover:border-blue-500/20",
                      exp.type === "current" && "border-blue-500/20 shadow-lg shadow-blue-500/5"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                      <div>
                        {exp.type === "current" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-medium mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                            Current Role
                          </span>
                        )}
                        <h3 className="font-display text-xl font-bold text-foreground leading-tight">
                          {exp.role}
                        </h3>
                        <p className="text-blue-400 font-semibold mt-1">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl border border-border whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono">{exp.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-2.5">
                      {exp.achievements.map((ach, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70 mt-2 shrink-0" />
                          {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { ScrollReveal } from "@/components/ScrollReveal";
import { projects } from "@/lib/data";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const domainColors: Record<string, string> = {
  blue:   "bg-blue-500/10 border-blue-500/25 text-blue-400",
  teal:   "bg-teal-500/10 border-teal-500/25 text-teal-400",
  purple: "bg-purple-500/10 border-purple-500/25 text-purple-400",
  orange: "bg-orange-500/10 border-orange-500/25 text-orange-400",
  green:  "bg-green-500/10 border-green-500/25 text-green-400",
};

const dotColors: Record<string, string> = {
  blue:   "bg-blue-400",
  teal:   "bg-teal-400",
  purple: "bg-purple-400",
  orange: "bg-orange-400",
  green:  "bg-green-400",
};

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              04. Projects
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
              Key Work
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Production applications across legal tech, fintech, healthcare, and e-commerce.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 0.07}>
              <div className="project-card glass-card rounded-2xl p-6 h-full flex flex-col border-blue-500/10">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0",
                      domainColors[project.domainColor] ?? domainColors.blue
                    )}
                  >
                    {project.domain}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono whitespace-nowrap">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {project.period}
                  </span>
                </div>

                {/* Title block */}
                <h3 className="font-display text-xl font-bold text-foreground mb-0.5">
                  {project.title}
                </h3>
                <p className="text-sm text-blue-400 font-medium mb-3">{project.subtitle}</p>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {project.highlights.map((h, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                          dotColors[project.domainColor] ?? dotColors.blue
                        )}
                      />
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/60">
                  {project.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 5 && (
                    <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground">
                      +{project.tags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

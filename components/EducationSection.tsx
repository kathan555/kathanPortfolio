import { ScrollReveal } from "@/components/ScrollReveal";
import { education } from "@/lib/data";
import { GraduationCap, Calendar, MapPin } from "lucide-react";

export function EducationSection() {
  return (
    <section id="education" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              05. Education
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
              Academic Background
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-2xl">
          {education.map((edu, i) => (
            <ScrollReveal key={i} delay={0.1}>
              <div className="glass-card rounded-2xl p-8 flex flex-col sm:flex-row items-start gap-6 hover:border-blue-500/20 transition-all duration-300">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-8 h-8 text-blue-400" />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground mb-1.5">
                    {edu.degree}
                  </h3>
                  <p className="text-blue-400 font-semibold mb-3">{edu.institution}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {edu.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span className="font-mono">{edu.period}</span>
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

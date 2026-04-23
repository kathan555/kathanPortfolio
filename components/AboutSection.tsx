import { ScrollReveal } from "@/components/ScrollReveal";
import { personalInfo, summary } from "@/lib/data";
import { Mail, Phone, MapPin, Github, Linkedin, ExternalLink } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal>
          <div className="mb-14">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              01. About Me
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
              Who I Am
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Summary */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-5">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {summary}
              </p>

              <div className="pt-4 space-y-3">
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-blue-400 transition-colors group"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-500/40">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </span>
                  {personalInfo.email}
                </a>
                <a
                  href={`tel:${personalInfo.phone}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-blue-400 transition-colors group"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-500/40">
                    <Phone className="w-4 h-4 text-blue-400" />
                  </span>
                  {personalInfo.phone}
                </a>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </span>
                  {personalInfo.location}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-blue-500/40 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 text-sm transition-all"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-blue-500/40 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 text-sm transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <a
                  href={personalInfo.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-blue-500/40 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Portfolio
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Highlights grid */}
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 gap-4">
              {[
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
              ].map((card) => (
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
      </div>
    </section>
  );
}

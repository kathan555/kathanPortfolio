import { HeroSection }       from "@/components/HeroSection";
import { HomeAboutSection }   from "@/components/HomeAboutSection";
import { SkillsSection }      from "@/components/SkillsSection";
import { ExperienceSection }  from "@/components/ExperienceSection";
import { ProjectsSection }    from "@/components/ProjectsSection";
import { EducationSection }   from "@/components/EducationSection";
import { SectionProgress }    from "@/components/SectionProgress";
import { ChapterDivider }     from "@/components/ChapterDivider";
import { ScrollReveal }       from "@/components/ScrollReveal";
import Link                   from "next/link";
import { ArrowRight, Calculator } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Home Page
   Structure:  Hero + About → Skills → Experience → Projects → Education → CTA
   Navigation: SectionProgress (fixed right rail + top progress bar)
   ───────────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      {/* ── Fixed UI: scroll-progress bar + section dot rail ─────────────── */}
      <SectionProgress />

      {/* ══════════════════════════════════════════════════════════════════
          HERO  +  ABOUT
          id="section-hero" is the anchor the SectionProgress observes.
          ══════════════════════════════════════════════════════════════════ */}
      <div id="section-hero">
        <HeroSection />
        <HomeAboutSection />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          01 — SKILLS
          SkillsSection renders its own <section id="skills"> internally.
          ══════════════════════════════════════════════════════════════════ */}
      <ChapterDivider number="01" title="Technical Skills" icon="code" />
      <SkillsSection />

      {/* ══════════════════════════════════════════════════════════════════
          02 — EXPERIENCE
          ExperienceSection renders its own <section id="experience"> internally.
          ══════════════════════════════════════════════════════════════════ */}
      <ChapterDivider number="02" title="Career Journey" icon="briefcase" />
      <ExperienceSection />

      {/* ══════════════════════════════════════════════════════════════════
          03 — PROJECTS
          ProjectsSection renders its own <section id="projects"> internally.
          ══════════════════════════════════════════════════════════════════ */}
      <ChapterDivider number="03" title="Key Work" icon="folder" />
      <ProjectsSection />

      {/* ══════════════════════════════════════════════════════════════════
          04 — EDUCATION
          EducationSection renders its own <section id="education"> internally.
          ══════════════════════════════════════════════════════════════════ */}
      <ChapterDivider number="04" title="Academic Background" icon="graduation" />
      <EducationSection />

      {/* ══════════════════════════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <span className="font-mono text-blue-400 text-xs tracking-[0.3em] uppercase">
              Ready to build?
            </span>

            <h2 className="font-display text-4xl sm:text-5xl font-bold mt-3 mb-5">
              Need a{" "}
              <span className="gradient-text">.NET Expert?</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Available for freelance and contract work — Blazor, WPF, ASP.NET
              Core, and more. Let&apos;s talk about your project.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/hire"
                prefetch={true}
                className="
                  group inline-flex items-center gap-2
                  px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white
                  font-semibold text-lg rounded-xl
                  transition-all shadow-xl shadow-blue-500/25 hover:-translate-y-0.5
                "
              >
                Hire Me
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/estimator"
                className="
                  inline-flex items-center gap-2
                  px-8 py-4 border border-blue-500/40 text-blue-400
                  hover:bg-blue-500/10 font-semibold text-lg rounded-xl
                  transition-all hover:-translate-y-0.5
                "
              >
                <Calculator className="w-5 h-5" />
                Estimate Project Cost
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
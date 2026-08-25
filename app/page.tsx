import { HeroSection }       from "@/components/HeroSection";
import { HomeAboutSection }   from "@/components/HomeAboutSection";
import { SkillsSection }      from "@/components/SkillsSection";
import { ExperienceSection }  from "@/components/ExperienceSection";
import { ProjectsSection }    from "@/components/ProjectsSection";
import { SelfBuiltSection }   from "@/components/SelfBuiltSection";
import { AIWorkflowSection }  from "@/components/AIWorkflowSection";
import { HomeAIAssistant }    from "@/components/HomeAIAssistant";
import { EducationSection }   from "@/components/EducationSection";
import { SectionProgress }    from "@/components/SectionProgress";
import { ChapterDivider }     from "@/components/ChapterDivider";
import { ScrollReveal }       from "@/components/ScrollReveal";
import Link                   from "next/link";
import { ArrowRight, Calculator } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Home Page
   Structure:  Hero + About → Skills → How I Build → Experience → Projects
               → Independent Builds → Education → CTA
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
          SECTION RHYTHM
          Alternating chapters are wrapped in `.section-band` (tinted surface,
          soft-faded edges) plus `.section-glow` (slow aurora wash). Without it
          all seven sections were transparent `py-24` blocks, so the page
          scrolled as one undifferentiated column and read like a document.
          Each divider is wrapped WITH its section so the chapter header and
          its content band together as one unit.
          ══════════════════════════════════════════════════════════════════ */}

      {/* ── LIVE AI ASSISTANT (banded) ──
          HomeAIAssistant renders its own <section id="ai">. Placed high so the
          "AI-enabled" impression lands immediately, and the hero command bar
          feeds questions into it. */}
      <div className="section-band section-glow">
        <HomeAIAssistant />
      </div>

      {/* ── 01 — SKILLS (plain) ── */}
      <ChapterDivider number="01" title="Technical Skills" icon="code" />
      <SkillsSection />

      {/* ── 02 — HOW I BUILD (banded) ──
          The AI-assisted delivery method. Placed straight after Skills because
          "which tools" and "how they are actually used" are one question for a
          buyer, and because everything below (per-project AI notes, the solo
          builds) reads as evidence for the claims made here. */}
      <div className="section-band section-glow">
        <ChapterDivider number="02" title="How I Build" icon="workflow" />
        <AIWorkflowSection />
      </div>

      {/* ── 03 — EXPERIENCE (plain) ── */}
      <ChapterDivider number="03" title="Career Journey" icon="briefcase" />
      <ExperienceSection />

      {/* ── 04 — PROJECTS (banded) ── */}
      <div className="section-band section-glow">
        <ChapterDivider number="04" title="Key Work" icon="folder" />
        <ProjectsSection />
      </div>

      {/* ── 05 — INDEPENDENT BUILDS (plain) ──
          Solo, self-shipped products — the counterpart to client "Key Work". */}
      <ChapterDivider number="05" title="Independent Builds" icon="sparkles" />
      <SelfBuiltSection />

      {/* ── 06 — EDUCATION (banded) ── */}
      <div className="section-band section-glow">
        <ChapterDivider number="06" title="Academic Background" icon="graduation" />
        <EducationSection />
      </div>

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

            {/* Deliberately not ".NET Expert" — that framing filters out every
                project that isn't already a .NET project. */}
            <h2 className="font-display text-4xl sm:text-5xl font-bold mt-3 mb-5">
              Need an{" "}
              <span className="gradient-text">AI Expert Developer?</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Available for freelance and contract work — AI integration, web and
              desktop applications, and legacy modernisation. Bring me the problem,
              not the tech stack.
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
                href="/free-project-cost-estimator"
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
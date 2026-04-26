import { HeroSection } from "@/components/HeroSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import Link from "next/link";
import {
  ArrowRight, Briefcase, Code2, FolderOpen, GraduationCap,
  Github, PenLine, Calculator, Handshake, Brain,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { experiences, projects, skills } from "@/lib/data";

const sections = [
  { icon: <Handshake  className="w-6 h-6 text-teal-400" />,   title: "Hire Me",         desc: "Services, pricing models, process, and how to get started on your project.",                     href: "/hire",       color: "teal"   },
  { icon: <Briefcase  className="w-6 h-6 text-blue-400" />,   title: "About Me",        desc: "8+ years of .NET development, tech leadership, and cross-domain expertise.",                      href: "/about",      color: "blue"   },
  { icon: <Code2      className="w-6 h-6 text-blue-400" />,   title: "Skills",          desc: "C#, Blazor, WPF, ASP.NET Core, React, MS-SQL and a full toolkit of productivity libraries.",     href: "/skills",     color: "blue"   },
  { icon: <Briefcase  className="w-6 h-6 text-purple-400" />, title: "Experience",      desc: "Technical Lead at Digip Technologies. Formerly at Parkar Digital.",                              href: "/experience", color: "purple" },
  { icon: <FolderOpen className="w-6 h-6 text-orange-400" />, title: "Projects",        desc: "Legal automation, fintech trading platforms, healthcare records, e-commerce.",                    href: "/projects",   color: "orange" },
  { icon: <Github     className="w-6 h-6 text-green-400" />,  title: "GitHub Showcase", desc: "Live open-source repositories pulled straight from GitHub.",                                      href: "/github",     color: "green"  },
  { icon: <PenLine    className="w-6 h-6 text-pink-400" />,   title: "Blog",            desc: "Thoughts on .NET, architecture, leadership, and software engineering.",                           href: "/blog",       color: "pink"   },
  { icon: <Calculator className="w-6 h-6 text-yellow-400" />, title: "Cost Estimator",  desc: "Estimate your project cost in 7 questions — no sign-up required.",                               href: "/estimator",  color: "yellow" },
  { icon: <Brain        className="w-6 h-6 text-indigo-400" />, title: "AI Integration", desc: "How to add Azure OpenAI & Semantic Kernel to .NET apps — architecture, C# code, and a live demo.", href: "/ai-integration", color: "indigo" },
  { icon: <GraduationCap className="w-6 h-6 text-blue-400" />, title: "Education",    desc: "B.Sc. Computer Science, Silver Oak College of Engineering & Technology (2013–2017).",              href: "/education",  color: "blue"   },
];

const colorMap: Record<string, string> = {
  blue:   "border-blue-500/20   hover:border-blue-500/40   hover:bg-blue-500/5",
  teal:   "border-teal-500/20   hover:border-teal-500/40   hover:bg-teal-500/5",
  purple: "border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5",
  orange: "border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5",
  green:  "border-green-500/20  hover:border-green-500/40  hover:bg-green-500/5",
  pink:   "border-pink-500/20   hover:border-pink-500/40   hover:bg-pink-500/5",
  yellow: "border-yellow-500/20 hover:border-yellow-500/40 hover:bg-yellow-500/5",
  indigo: "border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/5",
};

export default function Home() {
  return (
    <>
      <HeroSection />

      {/* Quick-navigation grid */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
                Explore
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
                What You&apos;ll Find Here
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sections.map((s, i) => (
              <ScrollReveal key={s.href} delay={i * 0.05}>
                <Link
                  href={s.href}
                  prefetch={true}
                  className={`group glass-card rounded-2xl p-6 flex flex-col h-full border transition-all duration-300 ${colorMap[s.color] ?? colorMap.blue}`}
                >
                  <div className="mb-4">{s.icon}</div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-blue-400 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
                  <div className="flex items-center gap-1 text-xs text-blue-400 mt-4 font-medium opacity-0 group-hover:opacity-100 group-hover:translate-x-1 translate-x-0 transition-all">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-10 border-y border-blue-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm text-muted-foreground">
            {[
              { v: experiences.length,                               l: "Work Experiences" },
              { v: projects.length,                                  l: "Key Projects" },
              { v: skills.reduce((a, s) => a + s.items.length, 0),  l: "Technologies" },
              { v: 8,                                                l: "Years in .NET" },
            ].map(({ v, l }) => (
              <span key={l} className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl gradient-text">{v}+</span>
                <span>{l}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Final CTA */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5">
            Need a{" "}
            <span className="gradient-text">.NET Expert?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Available for freelance and contract work — Blazor, WPF, ASP.NET Core, and more.
            Let&apos;s talk about your project.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/hire"
              prefetch={true}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-xl transition-all shadow-xl shadow-blue-500/25 hover:-translate-y-0.5"
            >
              Hire Me
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/estimator"
              className="inline-flex items-center gap-2 px-8 py-4 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 font-semibold text-lg rounded-xl transition-all hover:-translate-y-0.5"
            >
              <Calculator className="w-5 h-5" />
              Estimate Project Cost
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

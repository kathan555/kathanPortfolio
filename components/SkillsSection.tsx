"use client";

import { ScrollReveal, StaggerChildren, staggerItem } from "@/components/ScrollReveal";
import { skills } from "@/lib/data";
import { Code2, Layers, Database, Monitor, Wrench } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  code: <Code2 className="w-5 h-5" />,
  layers: <Layers className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  monitor: <Monitor className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
};

function SkillBadge({ skill }: { skill: string }) {
  return (
    <motion.span
      variants={staggerItem}
      className="skill-badge inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/8 border border-blue-500/15 text-blue-300 hover:bg-blue-500/15 hover:border-blue-500/30 cursor-default"
    >
      {skill}
    </motion.span>
  );
}

export function SkillsSection() {
  return (
    <section id="skills" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/2 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              02. Skills
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
              Technical Arsenal
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              8+ years across the full .NET ecosystem — from desktop to cloud.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((category, i) => (
            <ScrollReveal key={category.category} delay={i * 0.08}>
              <div className="glass-card rounded-2xl p-6 h-full hover:border-blue-500/20 transition-all duration-300 group">
                {/* Category header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    {iconMap[category.icon]}
                  </div>
                  <h3 className="font-display font-semibold text-foreground">
                    {category.category}
                  </h3>
                </div>

                {/* Skills */}
                <StaggerChildren className="flex flex-wrap gap-2">
                  {category.items.map((skill) => (
                    <SkillBadge key={skill} skill={skill} />
                  ))}
                </StaggerChildren>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

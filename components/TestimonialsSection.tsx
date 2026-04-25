"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";
import { testimonials } from "@/lib/data";

function TestimonialCard({
  quote, name, role, initials, delay,
}: {
  quote: string; name: string; role: string; initials: string; delay: number;
}) {
  const ref     = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className="glass-card rounded-2xl p-7 flex flex-col gap-5 hover:border-blue-500/20 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Subtle gradient shimmer on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      {/* Quote icon */}
      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
        <Quote className="w-4 h-4 text-blue-400" />
      </div>

      {/* Quote text */}
      <p className="text-muted-foreground text-sm leading-relaxed flex-1 italic">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-border/60">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-teal-500/30 border border-blue-500/20 flex items-center justify-center shrink-0">
          <span className="font-display font-bold text-xs text-blue-400">{initials}</span>
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section id="testimonials" className="py-24 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
            Social Proof
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2 mb-3">
            What Clients Say
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Feedback from managers, colleagues, and stakeholders I&apos;ve worked with.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.id}
              quote={t.quote}
              name={t.name}
              role={t.role}
              initials={t.initials}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* Placeholder note — remove once you have real testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 max-w-2xl"
        >
          <span className="text-amber-400 text-lg shrink-0">💡</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-amber-400 font-semibold">Action required:</span>{" "}
            Replace the placeholder testimonials in{" "}
            <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">lib/data.ts</code>{" "}
            → <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">testimonials</code>{" "}
            with real quotes from colleagues, managers, or clients. Then delete this notice.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

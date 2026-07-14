import Link from "next/link";
import { HeartHandshake, ArrowRight, Code2, Rocket, Users } from "lucide-react";

/* ── Left-edge "hire / refer me" poster ──
   Skyscraper promo pinned to the left margin, vertically centred in the
   viewport. Shows on wide screens (≥1440px); the blog page reserves matching
   left padding at the same breakpoint so the article is never covered.

   Positioning: the outer column is absolute and spans the full height of the
   page container, and the card inside is sticky. That keeps the card centred
   while scrolling (same look as a fixed element) but hard-bounds it to the
   page — it can never travel over the footer.

   Copy: blog readers arrive as one of three people — a developer, a
   founder/investor, or someone non-technical — and each needs a different ask,
   so all three get their own line instead of a single pitch that only lands
   for one of them. */

const ASKS = [
  {
    icon: Code2,
    label: "Developer?",
    body: "Pass my name to your lead when the team needs help with software development.",
  },
  {
    icon: Rocket,
    label: "Founder / Investor?",
    body: "I can own the tech for your product, end to end. Let's chat about your project.",
  },
  {
    icon: Users,
    label: "Non-technical?",
    body: "One intro to someone in your circle is a huge help.",
  },
];

export function HireMePoster() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-4 z-40 hidden w-52 min-[1440px]:block">
      {/* Centred in the space *below* the fixed 80px navbar, not in the raw
          viewport — on shorter laptop screens the taller card would otherwise
          tuck its top edge under the bar. */}
      <div className="pointer-events-auto sticky top-[calc(50%+2.5rem)] -translate-y-1/2">
        <div className="relative">
          {/* Breathing halo behind the card — the eye-catch at rest */}
          <div className="pointer-events-none absolute -inset-2 animate-glow-pulse rounded-3xl bg-gradient-to-b from-blue-500/40 via-teal-500/25 to-transparent blur-xl motion-reduce:animate-none" />

          {/* Animated gradient border frame */}
          <div className="relative rounded-2xl bg-[linear-gradient(120deg,theme(colors.blue.500),theme(colors.teal.400),theme(colors.blue.600),theme(colors.teal.400),theme(colors.blue.500))] bg-[length:300%_300%] p-px shadow-xl shadow-blue-500/20 animate-border-flow motion-reduce:animate-none">
            <Link
              href="/hire"
              aria-label="Hire me, or refer me to someone in your circle"
              className="group relative flex min-h-[540px] w-full flex-col items-center overflow-hidden rounded-[15px] bg-card/95 p-5 text-center no-underline backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Ambient glow + top accent */}
              <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-teal-400" />

              {/* Flash — a light sweep across the card to catch the eye */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[15px]">
                <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:animate-none dark:via-white/15" />
              </div>

              {/* Availability indicator */}
              <span
                className="absolute right-3 top-3 flex h-2.5 w-2.5"
                title="Currently open to freelance work"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              <div className="relative flex w-full flex-1 flex-col items-center gap-3">
                {/* Badge */}
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                  Open to work
                </span>

                {/* Icon tile */}
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg shadow-blue-500/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/60">
                  <HeartHandshake className="h-7 w-7 text-white" strokeWidth={1.75} />
                </div>

                {/* Headline */}
                <h3 className="px-1 font-display text-[19px] font-bold leading-snug text-foreground">
                  Hire me — or just{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                    refer me
                  </span>
                  .
                </h3>

                {/* Sub */}
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Whoever you are, there&apos;s a way to help:
                </p>

                {/* Three asks — one per reader type */}
                <div className="flex w-full flex-col gap-1.5">
                  {ASKS.map(({ icon: Icon, label, body }) => (
                    <div
                      key={label}
                      className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-left transition-colors group-hover:border-blue-500/30"
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span className="text-[12px] leading-snug text-muted-foreground">
                        <span className="font-semibold text-foreground">{label}</span>{" "}
                        {body}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stack */}
                <div className="mt-auto w-full pt-1">
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
                    I build with
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {["Blazor", ".NET", "WPF"].map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <span className="relative mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-blue-500/30 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/40">
                Hire or refer me
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

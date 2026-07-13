import Link from "next/link";
import { Github, ArrowRight, Star } from "lucide-react";
import { getRepos, langColors } from "@/lib/github";

/* ── Fixed left-edge promo poster ──
   Skyscraper-style promo pinned to the left margin, vertically centred.
   Shows on wide screens (≥1440px); the blog page reserves matching left
   padding at the same breakpoint so the article is never covered.

   Pulls live stats from GitHub (repo count, total stars, top languages) so a
   developer sees real, current work at a glance — far more convincing than
   static copy. Degrades gracefully to fallback languages if the API is
   rate-limited. The whole poster links to the showcase. */
const FALLBACK_LANGS = ["C#", "TypeScript", "Blazor"];

export async function GithubAdPoster() {
  const repos = await getRepos();
  const repoCount = repos.length;
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  // Most-used languages across the public repos.
  const counts = new Map<string, number>();
  for (const r of repos) {
    if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }
  const topLangs = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);

  const langs = topLangs.length > 0 ? topLangs : FALLBACK_LANGS;
  const hasStats = repoCount > 0;

  return (
    <div className="hidden min-[1440px]:block fixed left-5 top-1/2 -translate-y-1/2 z-40 w-44">
      {/* Gradient border frame */}
      <div className="rounded-2xl p-px bg-gradient-to-b from-blue-500/60 via-teal-500/30 to-transparent shadow-xl shadow-blue-500/10">
        <Link
          href="/github"
          aria-label="Explore my open-source projects on GitHub"
          className="group relative flex flex-col items-center text-center min-h-[470px] w-full rounded-[15px] bg-card/95 backdrop-blur-xl p-5 overflow-hidden no-underline transition-transform duration-300 hover:-translate-y-1"
        >
          {/* Ambient glow + top accent */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-teal-400" />

          {/* Live indicator */}
          <span
            className="absolute right-3 top-3 flex h-2 w-2"
            title="Synced live from GitHub"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>

          <div className="relative flex w-full flex-1 flex-col items-center gap-3">
            {/* Badge */}
            <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-blue-500 dark:text-blue-400">
              Open Source
            </span>

            {/* Icon tile */}
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg shadow-blue-500/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/60">
              <Github className="h-7 w-7 text-white" strokeWidth={1.75} />
            </div>

            {/* Headline */}
            <h3 className="px-1 font-display text-[15px] font-bold leading-snug text-foreground">
              Explore my{" "}
              <span className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                GitHub
              </span>{" "}
              projects
            </h3>

            {/* Sub */}
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Real production code — see how I build.
            </p>

            {/* Live stats */}
            {hasStats && (
              <div className="grid w-full grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-muted/40 py-1.5">
                  <div className="font-display text-base font-bold leading-none text-foreground">
                    {repoCount}
                  </div>
                  <div className="mt-1 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                    Repos
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 py-1.5">
                  <div className="flex items-center justify-center gap-0.5 font-display text-base font-bold leading-none text-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {totalStars}
                  </div>
                  <div className="mt-1 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                    Stars
                  </div>
                </div>
              </div>
            )}

            {/* Top languages */}
            <div className="mt-auto w-full pt-1">
              <div className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.15em] text-muted-foreground/70">
                Built with
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {langs.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: langColors[lang] ?? "#8b949e" }}
                    />
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <span className="relative mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2.5 text-[11px] font-semibold text-white shadow-md shadow-blue-500/30 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/40">
            Browse the code
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

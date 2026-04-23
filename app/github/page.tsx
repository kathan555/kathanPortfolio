import type { Metadata } from "next";
import { Github, Star, GitFork, ExternalLink, Code2, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "GitHub Showcase",
  description: "Live showcase of Kathan Patel's open-source GitHub repositories.",
};

// ─────────────────────────────────────────────────────────────────────────────
// 👇 ADD repo names here (exact, case-sensitive) to hide them from the showcase
// ─────────────────────────────────────────────────────────────────────────────
const HIDDEN_REPOS: string[] = [
  "kathanPortfolio",
  "kathan",
  // "forked-repo-i-dont-want-shown",
];
// ─────────────────────────────────────────────────────────────────────────────

type Repo = {
  id:                number;
  name:              string;
  description:       string | null;
  html_url:          string;
  homepage:          string | null;
  stargazers_count:  number;
  forks_count:       number;
  language:          string | null;
  topics:            string[];
  updated_at:        string;
  fork:              boolean;
};

const langColors: Record<string, string> = {
  "C#":        "#178600",
  TypeScript:  "#3178c6",
  JavaScript:  "#f7df1e",
  Python:      "#3572A5",
  HTML:        "#e34c26",
  CSS:         "#563d7c",
  Go:          "#00ADD8",
  Rust:        "#dea584",
  Java:        "#b07219",
  Kotlin:      "#A97BFF",
};

async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(
      "https://api.github.com/users/kathan555/repos?sort=updated&per_page=50&type=owner",
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 3600 }, // ISR — re-fetch every hour
      }
    );
    if (!res.ok) return [];
    const data: Repo[] = await res.json();

    return data.filter(
      (r) =>
        !r.fork &&                          // exclude forks
        !HIDDEN_REPOS.includes(r.name)      // exclude manually hidden repos
    );
  } catch {
    return [];
  }
}

export default async function GithubPage() {
  const repos = await getRepos();

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <ScrollReveal>
          <div className="mb-14">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Open Source
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-2 mb-4">
              GitHub <span className="gradient-text">Showcase</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Real repositories, pulled live from GitHub.
              {repos.length > 0 && (
                <span className="text-blue-400 ml-1 font-medium">
                  {repos.length} public repo{repos.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            <a
              href="https://github.com/kathan555"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all text-sm font-medium"
            >
              <Github className="w-4 h-4" />
              View full profile on GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </ScrollReveal>

        {/* Empty / error state */}
        {repos.length === 0 ? (
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-14 text-center max-w-md mx-auto">
              <Github className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">
                Couldn&apos;t load repositories
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                GitHub API may be rate-limited. Try refreshing in a minute, or view the
                profile directly.
              </p>
              <a
                href="https://github.com/kathan555"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm hover:bg-blue-500/20 transition-all"
              >
                Open GitHub Profile
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {repos.map((repo, i) => (
              <ScrollReveal key={repo.id} delay={i * 0.05}>
                <div className="project-card glass-card rounded-2xl p-6 h-full flex flex-col border-blue-500/10 group">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <h3 className="font-display font-bold text-foreground group-hover:text-blue-400 transition-colors truncate text-base">
                        {repo.name}
                      </h3>
                    </div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${repo.name} on GitHub`}
                      className="text-muted-foreground hover:text-blue-400 transition-colors shrink-0 p-1 -m-1 rounded-lg hover:bg-blue-500/10"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                    {repo.description || "No description provided."}
                  </p>

                  {/* Topics */}
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {repo.topics.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-blue-500/8 border border-blue-500/15 text-xs text-blue-300 font-mono"
                        >
                          {t}
                        </span>
                      ))}
                      {repo.topics.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground">
                          +{repo.topics.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Homepage link */}
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:underline mb-3"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {repo.homepage.replace(/^https?:\/\//, "")}
                    </a>
                  )}

                  {/* Footer meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/60">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: langColors[repo.language] ?? "#8b949e" }}
                        />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      {repo.forks_count}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />
                      {new Date(repo.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        year:  "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

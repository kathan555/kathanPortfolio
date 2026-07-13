// ─── Shared GitHub repo fetching ─────────────────────────────────────────────
// Single source of truth for the GitHub showcase (app/github). Keeping the
// username, repo type, and hidden list here means any future surface that
// lists repos can reuse them instead of re-declaring and drifting apart.

const GITHUB_USER = "kathan555";

// ─────────────────────────────────────────────────────────────────────────────
// 👇 ADD repo names here (exact, case-sensitive) to hide them everywhere
// ─────────────────────────────────────────────────────────────────────────────
export const HIDDEN_REPOS: string[] = [
  "kathanPortfolio",
  "kathan",
  // "forked-repo-i-dont-want-shown",
];
// ─────────────────────────────────────────────────────────────────────────────

export type Repo = {
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

export const langColors: Record<string, string> = {
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

export async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=50&type=owner`,
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

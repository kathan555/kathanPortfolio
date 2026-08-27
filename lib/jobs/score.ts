import { generate, extractJson } from "@/lib/gemini";
import { MATCH_PROFILE } from "./profile";
import type { ApplyMethod, Engagement, Judgement, NormalizedJob, ScoredJob } from "./types";

/* One batched call scores the whole shortlist. Doing it per-job would be
   ~30 round trips, which neither the free-tier quota nor the 60-second
   function budget can absorb. */

/* Measured: a 30-job batch has come back in 11s, 13s and 21.9s on different
   runs. That last one sat 79ms inside the old 22s limit, which is not margin —
   it is luck. Widened, and the per-job excerpt trimmed below, since prompt size
   is what drives the latency.

   Worst case still fits the 60s Hobby ceiling: boards and web search run in
   parallel (~20s, bounded by the web-search timeout), then 28s here, then ~5s
   of database and mail. */
const SCORE_TIMEOUT_MS = 28_000;

const ENGAGEMENTS: Engagement[] = ["contract", "freelance", "fulltime", "unknown"];
const APPLY_METHODS: ApplyMethod[] = ["form", "email", "thread-reply", "unknown"];

function buildPrompt(jobs: NormalizedJob[]): string {
  const listing = jobs
    .map((j, i) =>
      [
        `### JOB ${i}`,
        `Title: ${j.title}`,
        j.company ? `Company: ${j.company}` : null,
        j.location ? `Location: ${j.location}` : null,
        j.compensation ? `Compensation: ${j.compensation}` : null,
        `Source: ${j.source}`,
        `Description: ${j.descriptionExcerpt.slice(0, 500)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  return `You are screening job postings for one specific contractor. Score how well each posting fits him.

CONTRACTOR PROFILE
${MATCH_PROFILE}

SCORING GUIDE (0-100)
- 85-100: core stack (.NET/Blazor/WPF/ASP.NET Core) AND explicitly contract/freelance AND remote-friendly to his time zone.
- 70-84: strong stack match, remote, but engagement type unclear or full-time.
- 50-69: partial stack match, or contract work in an adjacent stack he can genuinely do.
- 25-49: tangential — he could stretch to it but it is not his offer.
- 0-24: wrong stack, wrong role, or a constraint he cannot meet.

Apply a hard penalty for anything he is disqualified from: required US/UK work authorisation, security clearance, relocation, on-site or hybrid attendance, or "no C2C / no third party" wording. Put the specific disqualifier in red_flags.

Be strict. A generic "software engineer" posting with no .NET signal is not a match, however senior it sounds. It is far more useful to return five honest 80s than thirty inflated 60s.

POSTINGS
${listing}

Return ONLY a JSON array, one object per posting you scored, using the posting's index:
[{"i":0,"score":82,"reason":"one sentence, max 25 words, naming the concrete reason","matched_skills":["Blazor",".NET 9"],"red_flags":["hybrid, 2 days on-site in Austin"],"engagement":"contract","apply_method":"form","apply_email":null}]

Rules:
- "engagement" is one of: contract, freelance, fulltime, unknown.
- "apply_method" is one of: form, email, thread-reply, unknown.
- Set "apply_email" only when the posting text actually contains an address to apply to, otherwise null.
- red_flags is [] when there are none. Never invent one.
- Include every posting index. Output nothing but the JSON array.`;
}

type RawJudgement = {
  i?: unknown;
  score?: unknown;
  reason?: unknown;
  matched_skills?: unknown;
  red_flags?: unknown;
  engagement?: unknown;
  apply_method?: unknown;
  apply_email?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Model output is untrusted input. Same discipline as validateEstimate() in
   app/api/estimate/route.ts — check the shape, coerce what is salvageable,
   drop what is not, and never let a malformed entry throw. */
function parseJudgements(raw: unknown, count: number): Map<number, Judgement> {
  const out = new Map<number, Judgement>();
  if (!Array.isArray(raw)) return out;

  for (const entry of raw as RawJudgement[]) {
    if (!entry || typeof entry !== "object") continue;

    const i = Number(entry.i);
    if (!Number.isInteger(i) || i < 0 || i >= count || out.has(i)) continue;

    const score = Number(entry.score);
    if (!Number.isFinite(score)) continue;

    const strings = (v: unknown): string[] =>
      Array.isArray(v)
        ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
            .map((x) => x.trim().slice(0, 160))
            .slice(0, 6)
        : [];

    const engagement = ENGAGEMENTS.includes(entry.engagement as Engagement)
      ? (entry.engagement as Engagement)
      : "unknown";

    const applyMethod = APPLY_METHODS.includes(entry.apply_method as ApplyMethod)
      ? (entry.apply_method as ApplyMethod)
      : "unknown";

    const applyEmail =
      typeof entry.apply_email === "string" && EMAIL_RE.test(entry.apply_email.trim())
        ? entry.apply_email.trim()
        : null;

    out.set(i, {
      score: Math.max(0, Math.min(100, Math.round(score))),
      reason: typeof entry.reason === "string" ? entry.reason.trim().slice(0, 300) : "",
      matchedSkills: strings(entry.matched_skills),
      redFlags: strings(entry.red_flags),
      engagement,
      applyMethod,
      applyEmail,
    });
  }

  return out;
}

/**
 * Scores the shortlist. If the model is unavailable or returns nothing usable,
 * every job falls back to its heuristic score so the run still produces a
 * ranked digest — degraded, not failed.
 */
export async function scoreJobs(jobs: NormalizedJob[]): Promise<{
  scored: ScoredJob[];
  note: string | null;
}> {
  if (jobs.length === 0) return { scored: [], note: null };

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), SCORE_TIMEOUT_MS);

  let judgements = new Map<number, Judgement>();
  let note: string | null = null;

  try {
    const { text } = await generate({
      label: "job-radar/score",
      contents: [{ role: "user", parts: [{ text: buildPrompt(jobs) }] }],
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.2,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      },
      signal: ctl.signal,
    });

    judgements = parseJudgements(extractJson(text), jobs.length);
    if (judgements.size === 0) {
      note = "Gemini scoring returned nothing usable — ranked by keyword match instead.";
    }
  } finally {
    clearTimeout(timer);
  }

  const scored = jobs.map((job, i) => {
    const j = judgements.get(i);
    if (j) {
      return {
        ...job,
        ...j,
        /* The model can spot an apply address inside freeform text (HN posts
           especially) that the source never gave us as a field. */
        applyEmail: j.applyEmail ?? job.applyEmail ?? null,
        applyMethod: j.applyMethod !== "unknown" ? j.applyMethod : (job.applyMethod ?? "unknown"),
      };
    }

    /* Unscored: keep it, but cap the heuristic at 60 so an unreviewed posting
       can never outrank one the model actually endorsed. */
    return {
      ...job,
      score: Math.min(60, job.heuristicScore),
      reason: "Keyword match only — not scored by the model.",
      matchedSkills: [],
      redFlags: [],
      engagement: "unknown" as const,
      applyMethod: job.applyMethod ?? ("unknown" as const),
      applyEmail: job.applyEmail ?? null,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return { scored, note };
}

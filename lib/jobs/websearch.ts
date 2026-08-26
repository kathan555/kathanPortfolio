import { generate, extractJson } from "@/lib/gemini";
import { personalInfo } from "@/lib/data";
import type { RawJob } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Gemini grounded web-search sweep.

   This exists to catch what the job boards miss — agency posts, company career
   pages, niche .NET contract listings. Two constraints shaped how it works:

   1. Grounding cannot be combined with responseMimeType "application/json";
      the API rejects that pairing. So the call returns prose and we pull a
      fenced JSON block out of it with extractJson().

   2. Grounded citations frequently come back as vertexaisearch redirect URLs,
      and a model asked for job links will sometimes produce a plausible URL
      for a posting that has expired or never existed.

   Because of (2) everything from here is stored with url_verified = false and
   shown in a separate, clearly labelled block. These are leads to check, not
   verified postings — presenting them as equal to board results would be the
   dishonest move.
   ───────────────────────────────────────────────────────────────────────── */

const WEBSEARCH_TIMEOUT_MS = 20_000;
const MAX_RESULTS = 8;

const PROMPT = `Search the web for CURRENT, OPEN contract and freelance software development openings that match this contractor:

- Senior .NET / Blazor / ASP.NET Core / WPF / C# developer and technical lead, ${personalInfo.yearsExp} years experience
- Works remotely from ${personalInfo.location} (IST), overlapping US, UK, Europe, Gulf and Australia hours
- Wants contract, freelance, C2C or W2 engagements — not permanent on-site roles
- Also does AI integration (Azure OpenAI, Google Gemini, Semantic Kernel, RAG) and legal-tech integrations (Clio, Lawmatics, Zoom, Box)

Search for postings published within the last 14 days. Look at company career pages, contract job boards, and staffing sites.

Return ONLY a fenced JSON code block, no commentary before or after:

\`\`\`json
[{"title":"Senior Blazor Developer (6-month contract)","company":"Acme Ltd","location":"Remote (UK)","url":"https://…the actual posting page…","apply_url":"https://…","engagement":"contract","compensation":"£450/day","summary":"one sentence on what the role involves"}]
\`\`\`

Critical rules:
- Only include postings you actually found in the search results. If you found none, return [].
- "url" must be the real posting page you saw. Never construct, guess, or complete a URL.
- Do not include a posting whose page you did not actually see in the results.
- Maximum ${MAX_RESULTS} results, best matches first.
- Omit permanent full-time roles that require relocation or on-site attendance.`;

type WebResult = {
  title?: unknown;
  company?: unknown;
  location?: unknown;
  url?: unknown;
  apply_url?: unknown;
  engagement?: unknown;
  compensation?: unknown;
  summary?: unknown;
};

const s = (v: unknown, max = 300): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

function isUsableUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (u.hostname === "example.com") return false;
    return true;
  } catch {
    return false;
  }
}

const isRedirectWrapper = (u: string) => u.includes("grounding-api-redirect");

const CHECK_TIMEOUT_MS = 6_000;

/* Measured behaviour, worth writing down because it drove this whole file:
   across runs the model returns grounding redirect wrappers, direct posting
   URLs, or fabricated ones — and it is not consistent about which. In one
   sample of three direct URLs, one 404'd, one was rate-limited and one was
   live; in another run two "different" Upwork jobs shared an identical job id.

   So each URL gets one round trip. Redirect wrappers are unwrapped while they
   are still fresh (they expire within minutes, which is why this has to happen
   inside the run rather than at read time), and anything that answers a
   definitive 404/410 is dropped. A 403 or 429 is kept: most job boards block
   bots, so that says nothing about whether the posting exists. */
async function resolveAndCheck(url: string): Promise<string | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), CHECK_TIMEOUT_MS);

  try {
    let target = url;

    if (isRedirectWrapper(url)) {
      const res = await fetch(url, {
        redirect: "manual",
        signal: ctl.signal,
        headers: { "User-Agent": BROWSER_UA },
      });
      res.body?.cancel();
      const location = res.headers.get("location");
      if (!location || !isUsableUrl(location)) return null;
      target = location;
    }

    const res = await fetch(target, {
      redirect: "follow",
      signal: ctl.signal,
      headers: { "User-Agent": BROWSER_UA },
    });
    res.body?.cancel();

    if (res.status === 404 || res.status === 410) return null;
    return res.url || target;
  } catch {
    /* A timeout or network error is not evidence the posting is gone — keep the
       URL unless it was a wrapper we never managed to unwrap. */
    return isRedirectWrapper(url) ? null : url;
  } finally {
    clearTimeout(timer);
  }
}

/* These are job boards being probed for liveness, not APIs being consumed, so
   a normal browser UA is what they expect. */
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

/**
 * Runs the grounded sweep. Never throws — on any failure it returns an empty
 * list plus a note for the run summary, and the pipeline carries on with the
 * board results alone.
 */
export async function searchWeb(): Promise<{ jobs: RawJob[]; note: string | null }> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), WEBSEARCH_TIMEOUT_MS);

  try {
    const { text } = await generate({
      label: "job-radar/websearch",
      contents: [{ role: "user", parts: [{ text: PROMPT }] }],
      /* No responseMimeType here — see the note at the top of this file. */
      generationConfig: {
        maxOutputTokens: 2500,
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 0 },
      },
      tools: [{ google_search: {} }],
      signal: ctl.signal,
    });

    if (!text) return { jobs: [], note: "Web search returned no response." };

    const parsed = extractJson<WebResult[]>(text);
    if (!Array.isArray(parsed)) {
      return { jobs: [], note: "Web search response was not parseable JSON." };
    }

    const usable = parsed
      .slice(0, MAX_RESULTS)
      .map((r) => ({ r, title: s(r.title, 250) }))
      .filter((x): x is { r: WebResult; title: string } => Boolean(x.title) && isUsableUrl(x.r.url));

    /* All in parallel — one round trip each, capped at CHECK_TIMEOUT_MS, so the
       whole verification costs about one request's worth of wall clock. */
    const resolved = await Promise.all(
      usable.map(({ r }) => resolveAndCheck(r.url as string)),
    );

    const jobs: RawJob[] = [];
    for (let i = 0; i < usable.length; i++) {
      const url = resolved[i];
      if (!url) continue;

      const { r, title } = usable[i];
      jobs.push({
        source: "web-search",
        externalId: null,
        title,
        company: s(r.company, 150),
        location: s(r.location, 150),
        isRemote: /remote|anywhere|worldwide/i.test(String(r.location ?? "")),
        compensation: s(r.compensation, 100),
        url,
        /* apply_url gets no round trip of its own; fall back to the checked URL
           unless the model gave a plain, non-wrapper link. */
        applyUrl: isUsableUrl(r.apply_url) && !isRedirectWrapper(r.apply_url) ? r.apply_url : url,
        applyMethod: "form",
        description: [s(r.engagement, 40), s(r.summary, 600)].filter(Boolean).join(" · "),
        postedAt: null,
        /* Always false. Even a URL that answered 200 came from a model rather
           than a job feed, and the title and company attached to it are not
           checked by anything. */
        urlVerified: false,
      });
    }

    const dropped = parsed.length - jobs.length;
    const note =
      dropped > 0
        ? `Web search: dropped ${dropped} of ${parsed.length} result(s) — dead link or unusable URL.`
        : null;
    return { jobs, note };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("job-radar: web search failed —", msg);
    return { jobs: [], note: `Web search failed: ${msg}` };
  } finally {
    clearTimeout(timer);
  }
}

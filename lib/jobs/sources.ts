import type { RawJob } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Job-board fetchers.

   Every source here is free and needs no signup, and — critically — every one
   returns a canonical posting URL, which is the whole point: a match is
   useless without a link to apply through.

   Upwork, LinkedIn and Indeed are deliberately absent. None expose a usable
   public API any more, and scraping them is both brittle and against their
   terms. If coverage proves thin, the clean addition is Adzuna (free tier,
   real contract/temporary filter) — it just needs an app-ID signup.

   Each fetcher owns its own timeout and every failure is non-fatal: a board
   that is down or has changed its shape costs us that board's results, never
   the run.
   ───────────────────────────────────────────────────────────────────────── */

const SOURCE_TIMEOUT_MS = 8_000;

/* Several of these boards (RemoteOK especially) return 403 to a request with
   no User-Agent. Identify the scanner honestly rather than spoofing a browser. */
const UA = "KathanPatelJobRadar/1.0 (+https://kathanpatel.vercel.app)";

async function fetchWithTimeout(url: string, accept: string): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), SOURCE_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { "User-Agent": UA, Accept: accept },
      signal: ctl.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetchWithTimeout(url, "application/json");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function getText(url: string): Promise<string> {
  const res = await fetchWithTimeout(url, "application/rss+xml, application/xml, text/xml");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : typeof v === "number" ? String(v) : null;

/* ── RemoteOK ──────────────────────────────────────────────────────────── */
/* The first array element is a legal/attribution notice rather than a job; it
   has no `position`, so the filter below drops it without special-casing. */
async function remoteok(): Promise<RawJob[]> {
  const rows = await getJson<Array<Record<string, unknown>>>("https://remoteok.com/api");
  return rows
    .filter((r) => r && (r.position || r.title) && r.url)
    .map((r) => ({
      source: "remoteok",
      externalId: str(r.id),
      title: str(r.position) ?? str(r.title) ?? "",
      company: str(r.company),
      location: str(r.location) ?? "Remote",
      isRemote: true,
      compensation:
        r.salary_min && r.salary_max ? `$${r.salary_min}–$${r.salary_max}` : str(r.salary_min),
      url: String(r.url),
      applyUrl: str(r.apply_url) ?? String(r.url),
      applyMethod: "form" as const,
      description: [str(r.description), Array.isArray(r.tags) ? r.tags.join(", ") : null]
        .filter(Boolean)
        .join(" · "),
      postedAt: str(r.date),
    }));
}

/* ── Remotive ──────────────────────────────────────────────────────────── */
/* Deliberately called with no query parameters. Remotive's API still responds
   200 but now ignores `category`, `search` and `limit` alike — every variant
   returns the same ~18 mixed-category jobs, and their /categories endpoint
   returns nothing. Passing filters that do nothing would just misrepresent what
   this fetcher gets. Low yield, but free, and the prefilter sorts it out. */
async function remotive(): Promise<RawJob[]> {
  const data = await getJson<{ jobs?: Array<Record<string, unknown>> }>(
    "https://remotive.com/api/remote-jobs",
  );
  return (data.jobs ?? []).map((j) => ({
    source: "remotive",
    externalId: str(j.id),
    title: str(j.title) ?? "",
    company: str(j.company_name),
    location: str(j.candidate_required_location) ?? "Remote",
    isRemote: true,
    compensation: str(j.salary),
    url: String(j.url),
    applyUrl: String(j.url),
    applyMethod: "form" as const,
    /* job_type carries "contract" / "freelance" here, so it belongs in the text
       that the prefilter and the model both read. */
    description: [str(j.job_type), str(j.description)].filter(Boolean).join(" · "),
    postedAt: str(j.publication_date),
  }));
}

/* ── We Work Remotely (RSS) ────────────────────────────────────────────── */
/* A regex reader rather than an XML parser: there is no XML dependency in this
   project, and this feed is a flat <item> list with no nesting to get wrong. */
function rssItems(xml: string): Array<Record<string, string>> {
  const items: Array<Record<string, string>> = [];

  const tag = (block: string, name: string) => {
    const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
    if (!m) return "";
    return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
  };

  for (const m of xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)) {
    const block = m[1];
    items.push({
      title: tag(block, "title"),
      link: tag(block, "link"),
      description: tag(block, "description"),
      pubDate: tag(block, "pubDate"),
      region: tag(block, "region"),
      type: tag(block, "type"),
      company: tag(block, "company"),
    });
  }
  return items;
}

async function weworkremotely(): Promise<RawJob[]> {
  const xml = await getText("https://weworkremotely.com/categories/remote-programming-jobs.rss");
  return rssItems(xml)
    .filter((i) => i.link)
    .map((i) => {
      /* WWR titles are "Company: Position", so split to get both columns —
         falling back to the whole string when the colon is missing rather than
         losing the title. */
      const [maybeCompany, ...rest] = i.title.split(":");
      const hasCompany = rest.length > 0;
      return {
        source: "weworkremotely",
        externalId: i.link.split("/").filter(Boolean).pop() ?? null,
        title: (hasCompany ? rest.join(":") : i.title).trim(),
        company: i.company || (hasCompany ? maybeCompany.trim() : null),
        location: i.region || "Remote",
        isRemote: true,
        compensation: null,
        url: i.link,
        applyUrl: i.link,
        applyMethod: "form" as const,
        description: [i.type, i.description].filter(Boolean).join(" · "),
        postedAt: i.pubDate || null,
      };
    });
}

/* ── Arbeitnow ─────────────────────────────────────────────────────────── */
async function arbeitnow(): Promise<RawJob[]> {
  const data = await getJson<{ data?: Array<Record<string, unknown>> }>(
    "https://www.arbeitnow.com/api/job-board-api",
  );
  return (data.data ?? []).map((j) => ({
    source: "arbeitnow",
    externalId: str(j.slug),
    title: str(j.title) ?? "",
    company: str(j.company_name),
    location: str(j.location),
    isRemote: Boolean(j.remote),
    compensation: null,
    url: String(j.url),
    applyUrl: String(j.url),
    applyMethod: "form" as const,
    description: [
      Array.isArray(j.job_types) ? j.job_types.join(", ") : null,
      Array.isArray(j.tags) ? j.tags.join(", ") : null,
      str(j.description),
    ]
      .filter(Boolean)
      .join(" · "),
    postedAt:
      typeof j.created_at === "number" ? new Date(j.created_at * 1000).toISOString() : null,
  }));
}

/* ── Himalayas ─────────────────────────────────────────────────────────── */
/* Returns 20 jobs and no more — `limit` and `offset` are both ignored — so the
   parameters are left off rather than implying a page size we don't get. */
async function himalayas(): Promise<RawJob[]> {
  const data = await getJson<{ jobs?: Array<Record<string, unknown>> }>(
    "https://himalayas.app/jobs/api",
  );
  return (data.jobs ?? [])
    .filter((j) => j.applicationLink || j.guid)
    .map((j) => {
      const link = str(j.applicationLink) ?? str(j.guid)!;
      return {
        source: "himalayas",
        externalId: str(j.guid),
        title: str(j.title) ?? "",
        company: str(j.companyName),
        location: Array.isArray(j.locationRestrictions)
          ? j.locationRestrictions.join(", ") || "Worldwide"
          : "Worldwide",
        isRemote: true,
        compensation: j.minSalary && j.maxSalary ? `$${j.minSalary}–$${j.maxSalary}` : null,
        url: link,
        applyUrl: link,
        applyMethod: "form" as const,
        description: [
          Array.isArray(j.categories) ? j.categories.join(", ") : null,
          str(j.description),
        ]
          .filter(Boolean)
          .join(" · "),
        postedAt:
          typeof j.pubDate === "number"
            ? new Date(j.pubDate * 1000).toISOString()
            : str(j.pubDate),
      };
    });
}

/* ── Jobicy ────────────────────────────────────────────────────────────── */
async function jobicy(): Promise<RawJob[]> {
  const data = await getJson<{ jobs?: Array<Record<string, unknown>> }>(
    "https://jobicy.com/api/v2/remote-jobs?count=50&industry=engineering",
  );
  return (data.jobs ?? []).map((j) => ({
    source: "jobicy",
    externalId: str(j.id),
    title: str(j.jobTitle) ?? "",
    company: str(j.companyName),
    location: str(j.jobGeo) ?? "Remote",
    isRemote: true,
    compensation:
      j.annualSalaryMin && j.annualSalaryMax
        ? `${str(j.salaryCurrency) ?? "$"}${j.annualSalaryMin}–${j.annualSalaryMax}`
        : null,
    url: String(j.url),
    applyUrl: String(j.url),
    applyMethod: "form" as const,
    description: [
      Array.isArray(j.jobType) ? j.jobType.join(", ") : str(j.jobType),
      str(j.jobExcerpt),
      str(j.jobDescription),
    ]
      .filter(Boolean)
      .join(" · "),
    postedAt: str(j.pubDate),
  }));
}

/* ── Hacker News "Who is hiring?" ──────────────────────────────────────── */
/* Two calls: find the current thread (posted monthly by the `whoishiring`
   account — filtering on that author is what stops us matching the thousands
   of people merely discussing it), then pull its comments.

   These comments are freeform prose, so there is no structured apply field.
   The reference URL is the comment permalink, and extracting the apply route
   from the body is left to the scoring pass, which reads the text anyway. */
async function hackernews(): Promise<RawJob[]> {
  /* search_by_date, not search: the relevance-ranked endpoint happily returns a
     2020 thread as the top hit. This one is newest-first, and the whoishiring
     account posts three threads a month — "Who is hiring?", "Who wants to be
     hired?" and "Freelancer? Seeking freelancer?" — so the title still has to
     be matched to pick the right one. */
  const search = await getJson<{ hits?: Array<{ objectID: string; title?: string }> }>(
    "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&hitsPerPage=20",
  );
  const story = search.hits?.find((h) => /who is hiring/i.test(h.title ?? ""));
  if (!story) return [];

  const comments = await getJson<{
    hits?: Array<{ objectID: string; comment_text?: string; created_at?: string }>;
  }>(`https://hn.algolia.com/api/v1/search?tags=comment,story_${story.objectID}&hitsPerPage=200`);

  return (comments.hits ?? [])
    .filter((c) => c.comment_text && c.comment_text.length > 80)
    .map((c) => {
      const text = decodeEntities(c.comment_text!);
      /* The first line of a Who-Is-Hiring post is conventionally
         "Company | Role | Location | Remote | Contract", which makes a
         serviceable title. */
      const firstLine = text.split("\n").find((l) => l.trim().length > 0) ?? "";
      const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/);
      return {
        source: "hackernews",
        externalId: c.objectID,
        title: firstLine.trim().slice(0, 180) || "HN Who is hiring post",
        company: firstLine.split("|")[0]?.trim().slice(0, 100) || null,
        location: null,
        isRemote: /remote/i.test(text),
        compensation: null,
        url: `https://news.ycombinator.com/item?id=${c.objectID}`,
        applyUrl: null,
        applyMethod: "thread-reply" as const,
        applyEmail: emailMatch?.[0] ?? null,
        description: text,
        postedAt: c.created_at ?? null,
      };
    });
}

/* HN comment_text arrives HTML-escaped with <p> separators. */
function decodeEntities(html: string): string {
  return html
    .replace(/<p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

const SOURCES: Record<string, () => Promise<RawJob[]>> = {
  remoteok,
  remotive,
  weworkremotely,
  arbeitnow,
  himalayas,
  jobicy,
  hackernews,
};

/**
 * Runs every source concurrently. Returns whatever succeeded plus a per-source
 * tally (a count, or the error string) for the run summary — so a board that
 * silently starts returning nothing is visible in the digest instead of just
 * quietly shrinking the results.
 */
export async function fetchAllSources(): Promise<{
  jobs: RawJob[];
  tally: Record<string, number | string>;
}> {
  const names = Object.keys(SOURCES);
  const results = await Promise.allSettled(names.map((n) => SOURCES[n]()));

  const jobs: RawJob[] = [];
  const tally: Record<string, number | string> = {};

  results.forEach((r, i) => {
    const name = names[i];
    if (r.status === "fulfilled") {
      const valid = r.value.filter((j) => j.url && j.title);
      jobs.push(...valid);
      tally[name] = valid.length;
    } else {
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
      tally[name] = `error: ${msg}`;
      console.error(`job-radar: source ${name} failed —`, msg);
    }
  });

  return { jobs, tally };
}

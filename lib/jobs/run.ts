import { fetchAllSources } from "./sources";
import { searchWeb } from "./websearch";
import { prepare } from "./normalize";
import { scoreJobs } from "./score";
import { getKnownFingerprints, insertJobs, markEmailed } from "./store";
import { sendDigest, sendFailureNotice } from "./email";
import { dashboardToken } from "./auth";
import type { ScanSummary } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   The scan, end to end.

   Time budget matters here: Vercel Hobby caps a function at 60 seconds, so
   every stage carries its own timeout and the worst case has to stay under it.
   Boards and the web search run concurrently (~16s worst case, bounded by the
   slower of the two), scoring is capped at 22s, and the database and mail
   round trips take a few seconds more. That leaves headroom.

   Called from the cron route and from the dashboard's "Scan now" action.
   ───────────────────────────────────────────────────────────────────────── */

/** How many postings reach the model. Chosen to fit the scoring timeout. */
const SCORE_LIMIT = 30;

/** Below this the posting is stored but kept out of the digest. */
const DIGEST_THRESHOLD = 45;

export async function runJobScan(): Promise<ScanSummary> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const notes: string[] = [];

  const summary: ScanSummary = {
    ok: false,
    startedAt,
    durationMs: 0,
    sources: {},
    fetched: 0,
    afterDedupe: 0,
    passedPrefilter: 0,
    scored: 0,
    inserted: 0,
    emailed: 0,
    emailSent: false,
    notes,
  };

  try {
    /* Fingerprints first: the fetches are the slow part, and there is no point
       starting them if the database is unreachable — without the known set we
       would re-report every posting as new. */
    const known = await getKnownFingerprints();

    const [boards, web] = await Promise.all([fetchAllSources(), searchWeb()]);
    if (web.note) notes.push(web.note);

    const raw = [...boards.jobs, ...web.jobs];
    summary.sources = { ...boards.tally, "web-search": web.jobs.length };
    summary.fetched = raw.length;

    const { candidates, afterDedupe } = prepare(raw, known, SCORE_LIMIT);
    summary.afterDedupe = afterDedupe;
    summary.passedPrefilter = candidates.length;

    if (candidates.length === 0) {
      summary.durationMs = Date.now() - t0;
      summary.emailSent = await sendDigest([], summary, dashboardUrl());
      summary.ok = true;
      return summary;
    }

    const { scored, note } = await scoreJobs(candidates);
    if (note) notes.push(note);
    summary.scored = scored.length;

    const inserted = await insertJobs(scored);
    summary.inserted = inserted.length;

    /* Everything is stored — the dashboard shows the long tail — but only the
       rows worth acting on go in the mail, so the digest stays readable. */
    const digestRows = inserted
      .filter((r) => (r.score ?? 0) >= DIGEST_THRESHOLD)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    summary.emailed = digestRows.length;
    summary.durationMs = Date.now() - t0;
    summary.emailSent = await sendDigest(digestRows, summary, dashboardUrl());

    /* Mark only what was actually reported. If the mail failed, these stay
       unmarked so tomorrow's run picks them up again. */
    if (summary.emailSent && digestRows.length > 0) {
      await markEmailed(digestRows.map((r) => r.id));
    }

    summary.ok = true;
    return summary;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("job-radar: scan failed —", msg);
    notes.push(`Scan failed: ${msg}`);
    summary.durationMs = Date.now() - t0;

    /* Tell someone. The characteristic way a daily cron dies is silently — it
       stops producing results and nothing announces it, so the first sign is
       noticing weeks later that no digest has arrived. An explicit failure
       notice is the difference between a broken job and an invisible one. */
    summary.emailSent = await sendFailureNotice(summary, msg);
    return summary;
  }
}

/* The digest links straight into the dashboard, token included — it is a
   private page and the mail already goes to the one person allowed to see it. */
function dashboardUrl(): string | null {
  const token = dashboardToken();
  if (!token) return null;

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://kathanpatel.vercel.app");

  return `${base}/opportunities?k=${encodeURIComponent(token)}`;
}

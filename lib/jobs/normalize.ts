import { createHash } from "node:crypto";
import type { NormalizedJob, RawJob } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Normalise → dedupe → prefilter.

   The boards between them return several hundred postings a day and Gemini can
   realistically score about thirty inside the Hobby plan's 60-second function
   budget. So a cheap deterministic pass runs first and picks the shortlist.

   That ordering has a second benefit worth keeping: the heuristic score is
   computed without the model, so if Gemini is down or out of quota the digest
   still goes out ranked, just without the written reasoning.
   ───────────────────────────────────────────────────────────────────────── */

/* Hard requirement — a posting with none of these is not this profile's work.

   The `.net` alternative carries a lookbehind for a reason: without it, every
   We Work Remotely posting matched, because each one embeds a logo hosted on
   `we-work-remotely.imgix.net`. Any `foo.net` domain would do the same. The
   lookbehind requires `.net` to start a token, so "imgix.net" is rejected while
   " .NET", ".NET 9" and "(.NET)" still match; "ASP.NET" is caught by its own
   alternative below. */
const CORE_STACK =
  /(?<![a-z0-9-])\.net\b|\b(dotnet|c#|csharp|blazor|asp\.?net|wpf|xaml|entity framework|ef core|razor pages?|winforms|sql server|t-sql)\b/i;

/** Adjacent stack, only counts when the posting also reads as contract work. */
const ADJACENT_STACK = /\b(next\.?js|react|typescript|full[\s-]?stack|node\.?js|azure)\b/i;

const CONTRACT_SIGNAL =
  /\b(contract|contractor|contracting|freelance|freelancer|c2c|corp[\s-]?to[\s-]?corp|w2|1099|fractional|short[\s-]?term|interim|consultant|consulting|\d+[\s-]?month|part[\s-]?time)\b/i;

/* Postings that are definitely someone else's job. Checked against the title
   only — a .NET role that merely mentions "our Rails service" shouldn't be
   thrown away. */
const HARD_NEGATIVE_TITLE =
  /\b(rails|ruby|golang|\bgo\b|php|laravel|django|android|ios|swift|kotlin|salesforce|sap|recruiter|sales|account executive|marketing|designer|intern|unpaid|equity[\s-]only)\b/i;

/* Specialisms from lib/data.ts that make a posting an unusually strong match. */
const SPECIALISM =
  /\b(clio|lawmatics|hangfire|abp\.?io|syncfusion|devexpress|sci ?chart|telerik|legal ?tech|multi[\s-]?tenant|oauth ?2|semantic kernel|azure openai|rag\b|legacy migration|modernis|moderniz)\b/i;

const REMOTE_SIGNAL = /\b(remote|worldwide|anywhere|distributed|work from home|wfh)\b/i;

/* Location constraints that would exclude someone contracting from India. */
const LOCATION_BLOCKER =
  /\b(us citizen|u\.s\. citizen|green card|security clearance|must be (?:located|based) in|on[\s-]?site only|hybrid|no c2c|no third[\s-]?part|w2 only|must reside)\b/i;

const TIMEZONE_FRIENDLY = /\b(emea|apac|europe|uk|india|ist\b|any time ?zone|async)\b/i;

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;|&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripTags(s: string): string {
  return s
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
}

/**
 * Strips HTML and collapses whitespace so the model reads text, not markup.
 *
 * Runs strip → decode → strip. The second pass is the one that matters: RSS
 * feeds carry entity-escaped HTML inside CDATA, so decoding turns `&lt;img
 * src="…imgix.net/…"&gt;` back into a real tag that the first pass never saw.
 * Leaving that markup in the text is not cosmetic — those logo URLs were
 * matching the .NET keyword filter on every single posting.
 */
export function toPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return stripTags(decodeEntities(stripTags(html)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* Identity is the source plus its own id where one exists, and the URL
   otherwise. Using the URL alone would re-add the same posting when two boards
   syndicate it, but that is the right trade: the two listings genuinely have
   different apply routes, and collapsing them would hide one. */
function fingerprintOf(job: RawJob): string {
  const basis = job.externalId
    ? `${job.source}:${job.externalId}`
    : `${job.source}:${job.url.split("?")[0].toLowerCase()}`;
  return createHash("sha256").update(basis).digest("hex").slice(0, 32);
}

/* Ceiling for a posting with no core-stack signal. Everything below is tuned so
   that an adjacent-stack match can never outrank a .NET one: the shortlist is
   only 30 long, and the failure mode that actually costs money is a genuine
   Blazor contract being crowded out by four Shopify roles that happened to
   collect remote + senior + contract bonuses. */
const NON_CORE_CEILING = 45;

/**
 * Deterministic relevance score. Roughly: does this use the stack, is it
 * contract-shaped, and can someone in IST actually take it.
 */
function heuristicScore(title: string, body: string, job: RawJob): number {
  const haystack = `${title}\n${body}`;

  const hasCore = CORE_STACK.test(haystack);
  const hasContract = CONTRACT_SIGNAL.test(haystack);

  if (!hasCore && !(ADJACENT_STACK.test(haystack) && hasContract)) {
    return 0; // neither the core stack nor contract-shaped adjacent work
  }

  let score = hasCore ? 50 : 15;
  if (hasCore && CORE_STACK.test(title)) score += 20; // in the title means it's the actual role

  if (hasContract) score += 20;
  if (SPECIALISM.test(haystack)) score += 15;
  if (job.isRemote || REMOTE_SIGNAL.test(haystack)) score += 10;
  if (TIMEZONE_FRIENDLY.test(haystack)) score += 5;
  if (/\b(lead|senior|architect|principal|staff)\b/i.test(title)) score += 8;

  if (LOCATION_BLOCKER.test(haystack)) score -= 30;
  if (HARD_NEGATIVE_TITLE.test(title)) score -= 60;

  return hasCore ? score : Math.min(score, NON_CORE_CEILING);
}

/**
 * Normalises, drops duplicates, applies the keyword prefilter, and returns the
 * shortlist sorted best-first.
 *
 * `known` is the set of fingerprints already in the database — filtering here
 * rather than at insert time means the model never spends tokens re-scoring a
 * posting that was already reported.
 */
export function prepare(
  raw: RawJob[],
  known: Set<string>,
  limit: number,
): { candidates: NormalizedJob[]; afterDedupe: number } {
  const seen = new Set<string>();
  const deduped: NormalizedJob[] = [];

  for (const job of raw) {
    const fingerprint = fingerprintOf(job);
    if (seen.has(fingerprint) || known.has(fingerprint)) continue;
    seen.add(fingerprint);

    const title = toPlainText(job.title).slice(0, 250);
    const body = toPlainText(job.description);
    if (!title) continue;

    deduped.push({
      ...job,
      title,
      fingerprint,
      descriptionExcerpt: body.slice(0, 1200),
      heuristicScore: heuristicScore(title, body, job),
      urlVerified: job.urlVerified ?? true,
    });
  }

  const candidates = deduped
    .filter((j) => j.heuristicScore > 0)
    .sort((a, b) => b.heuristicScore - a.heuristicScore)
    .slice(0, limit);

  return { candidates, afterDedupe: deduped.length };
}

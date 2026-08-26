import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { JobLeadRow, ScoredJob } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Supabase access for job_leads.

   Unlike the three existing tables (blog_posts, contact_submissions,
   blog_leads) this one is private, so it runs with RLS enabled and NO
   policies: the anon key cannot read or write it at all, and only the
   service-role key — which bypasses RLS — can. That key must never reach a
   client bundle, which is why every caller of this module is server-side.

   Schema lives in docs/job-radar.md.
   ───────────────────────────────────────────────────────────────────────── */

let client: SupabaseClient | null = null;

/* Throws rather than returning null, deliberately. An earlier version returned
   null and let every caller degrade to a no-op, which meant an unset
   SUPABASE_SERVICE_ROLE_KEY produced a completely successful-looking run: 25
   matches found, none stored, and a cheerful "no new matches" email. A daily
   automation that reports success while doing nothing is worse than one that
   visibly breaks. */
export function requireServiceClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "job_leads storage is not configured — set SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL (see docs/job-radar.md)",
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/**
 * Fingerprints already stored, so the pipeline can drop known postings before
 * spending model tokens on them. Scoped to the last 90 days — older rows can
 * safely fall out of the dedupe window because those postings are long closed.
 */
export async function getKnownFingerprints(): Promise<Set<string>> {
  const db = requireServiceClient();

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db
    .from("job_leads")
    .select("fingerprint")
    .gte("created_at", since)
    .limit(5000);

  if (error) {
    /* Returning empty would re-report every posting as new. Better to surface
       the failure and let the caller abort than to spam the digest. */
    throw new Error(`Could not read existing fingerprints: ${error.message}`);
  }

  return new Set((data ?? []).map((r) => r.fingerprint as string));
}

/**
 * Inserts the scored jobs. `fingerprint` is UNIQUE and conflicts are ignored,
 * so a posting that slipped past the in-memory dedupe (a concurrent run, say)
 * is still only stored once. Returns the rows that were actually inserted.
 */
export async function insertJobs(jobs: ScoredJob[]): Promise<JobLeadRow[]> {
  if (jobs.length === 0) return [];
  const db = requireServiceClient();

  const rows = jobs.map((j) => ({
    fingerprint: j.fingerprint,
    source: j.source,
    external_id: j.externalId ?? null,
    title: j.title.slice(0, 300),
    company: j.company?.slice(0, 200) ?? null,
    location: j.location?.slice(0, 200) ?? null,
    is_remote: j.isRemote ?? null,
    engagement: j.engagement,
    compensation: j.compensation?.slice(0, 120) ?? null,
    url: j.url,
    apply_url: j.applyUrl ?? null,
    apply_method: j.applyMethod,
    apply_email: j.applyEmail ?? null,
    description_excerpt: j.descriptionExcerpt.slice(0, 1200),
    posted_at: toTimestamp(j.postedAt),
    score: j.score,
    score_reason: j.reason,
    matched_skills: j.matchedSkills,
    red_flags: j.redFlags,
    url_verified: j.urlVerified,
  }));

  const { data, error } = await db
    .from("job_leads")
    .upsert(rows, { onConflict: "fingerprint", ignoreDuplicates: true })
    .select();

  if (error) throw new Error(`Insert failed: ${error.message}`);
  return (data ?? []) as JobLeadRow[];
}

/** Marks rows as reported, so tomorrow's digest does not repeat them. */
export async function markEmailed(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = requireServiceClient();

  const { error } = await db
    .from("job_leads")
    .update({ emailed_at: new Date().toISOString() })
    .in("id", ids);

  if (error) console.error("job-radar: could not mark rows emailed —", error.message);
}

/** Dashboard listing: recent leads, best match first. */
export async function listJobs(opts: {
  status?: string;
  days?: number;
  limit?: number;
}): Promise<JobLeadRow[]> {
  const db = requireServiceClient();

  const since = new Date(Date.now() - (opts.days ?? 60) * 24 * 60 * 60 * 1000).toISOString();
  let query = db
    .from("job_leads")
    .select("*")
    .gte("created_at", since)
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);

  if (opts.status && opts.status !== "all") query = query.eq("status", opts.status);

  const { data, error } = await query;
  if (error) {
    console.error("job-radar: list failed —", error.message);
    return [];
  }
  return (data ?? []) as JobLeadRow[];
}

export async function setStatus(id: string, status: string): Promise<void> {
  const db = requireServiceClient();

  const { error } = await db.from("job_leads").update({ status }).eq("id", id);
  if (error) console.error("job-radar: status update failed —", error.message);
}

/* Sources hand back dates in every format going: ISO, RFC-822 from RSS, unix
   seconds as a string. Anything unparseable becomes null rather than poisoning
   the column. */
function toTimestamp(value: string | null | undefined): string | null {
  if (!value) return null;

  if (/^\d{9,11}$/.test(value)) {
    return new Date(Number(value) * 1000).toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

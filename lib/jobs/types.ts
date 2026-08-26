/* Shared shapes for the job radar pipeline.

   Flow: RawJob (whatever a source returns, already mapped) → NormalizedJob
   (cleaned, fingerprinted, heuristically pre-scored) → ScoredJob (with the
   Gemini judgement attached) → the job_leads row. */

export type ApplyMethod = "form" | "email" | "thread-reply" | "unknown";
export type Engagement = "contract" | "freelance" | "fulltime" | "unknown";

/** What a source fetcher produces. Everything optional except the essentials. */
export type RawJob = {
  source: string;
  externalId?: string | null;
  title: string;
  company?: string | null;
  location?: string | null;
  isRemote?: boolean | null;
  compensation?: string | null;
  /** Canonical posting URL — the reference link. Required; a job without one is dropped. */
  url: string;
  /** Where to actually apply, when the source distinguishes it from `url`. */
  applyUrl?: string | null;
  applyMethod?: ApplyMethod;
  applyEmail?: string | null;
  description?: string | null;
  postedAt?: string | null;
  /** false for Gemini web-search results, which are unverified by construction. */
  urlVerified?: boolean;
};

export type NormalizedJob = RawJob & {
  fingerprint: string;
  descriptionExcerpt: string;
  /** Deterministic keyword score. Survives even when Gemini is unavailable. */
  heuristicScore: number;
  urlVerified: boolean;
};

export type Judgement = {
  score: number;
  reason: string;
  matchedSkills: string[];
  redFlags: string[];
  engagement: Engagement;
  applyMethod: ApplyMethod;
  applyEmail: string | null;
};

export type ScoredJob = NormalizedJob & Judgement;

/** A job_leads row as it comes back out of Supabase (snake_case). */
export type JobLeadRow = {
  id: string;
  fingerprint: string;
  source: string;
  external_id: string | null;
  title: string;
  company: string | null;
  location: string | null;
  is_remote: boolean | null;
  engagement: string | null;
  compensation: string | null;
  url: string;
  apply_url: string | null;
  apply_method: string | null;
  apply_email: string | null;
  description_excerpt: string | null;
  posted_at: string | null;
  score: number | null;
  score_reason: string | null;
  matched_skills: string[] | null;
  red_flags: string[] | null;
  url_verified: boolean;
  status: string;
  emailed_at: string | null;
  created_at: string;
};

export type ScanSummary = {
  ok: boolean;
  startedAt: string;
  durationMs: number;
  sources: Record<string, number | string>;
  fetched: number;
  afterDedupe: number;
  passedPrefilter: number;
  scored: number;
  inserted: number;
  emailed: number;
  emailSent: boolean;
  notes: string[];
};

# Job Radar

A daily automated scan for contract and freelance openings that match the profile in
`lib/data.ts`. Runs on a Vercel cron, stores every match in Supabase, and emails a digest.

Every stored match carries a **reference URL** and an **apply route** (a link, an email address,
or an HN thread permalink) — a match without one of those is not useful, so postings missing a URL
are dropped at the source.

---

## Pipeline

```
fetch 7 boards (parallel, 8s each)  ─┐
Gemini grounded web search (20s)    ─┴─► normalize + dedupe ─► keyword prefilter ─►
     top 30 ─► one batched Gemini scoring call (22s) ─► Supabase upsert ─► email digest
```

Entry point is `runJobScan()` in `lib/jobs/run.ts`, called by both the cron route and the
dashboard's "Scan now" button.

Every stage fails non-fatally. A dead board costs that board's results; a Gemini outage costs the
written reasoning but the digest still goes out ranked by keyword score; an SMTP failure leaves the
rows unmarked so the next run re-reports them.

### Why two filter stages

The boards return several hundred postings a day, and Gemini can realistically score about thirty
inside the Hobby plan's 60-second function budget. `lib/jobs/normalize.ts` runs a cheap
deterministic pass first — core stack, contract signals, location blockers — and only the top 30
reach the model.

| File | Role |
|---|---|
| `lib/gemini.ts` | Shared Gemini client: model fallback, retry/backoff, JSON extraction |
| `lib/jobs/sources.ts` | The seven board fetchers |
| `lib/jobs/websearch.ts` | Gemini grounded web-search sweep |
| `lib/jobs/normalize.ts` | HTML strip, fingerprint, dedupe, keyword prefilter |
| `lib/jobs/profile.ts` | Match profile, derived from `lib/data.ts` |
| `lib/jobs/score.ts` | Batched scoring call + response validation |
| `lib/jobs/store.ts` | Supabase reads/writes (service role) |
| `lib/jobs/email.ts` | Digest HTML + send |
| `lib/jobs/run.ts` | Orchestration |
| `app/api/cron/job-scan/route.ts` | Cron endpoint |
| `app/opportunities/page.tsx` | Private dashboard |
| `middleware.ts` | 404s the dashboard for a bad token, before the page runs |

---

## Setup

### 1. Database

Run this in the Supabase SQL editor:

```sql
create table public.job_leads (
  id uuid primary key default gen_random_uuid(),
  fingerprint text unique not null,
  source text not null,
  external_id text,
  title text not null,
  company text,
  location text,
  is_remote boolean,
  engagement text,
  compensation text,
  url text not null,
  apply_url text,
  apply_method text,
  apply_email text,
  description_excerpt text,
  posted_at timestamptz,
  score int,
  score_reason text,
  matched_skills text[],
  red_flags text[],
  url_verified boolean not null default true,
  status text not null default 'new',
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create index job_leads_rank_idx on public.job_leads (score desc, created_at desc);
create index job_leads_status_idx on public.job_leads (status, created_at desc);

alter table public.job_leads enable row level security;
-- Intentionally NO policies. Unlike blog_posts / contact_submissions / blog_leads,
-- this table holds private data: RLS with no policies blocks the anon key
-- entirely, and only the service-role key (which bypasses RLS) can reach it.
```

### 2. Environment variables

Add to `.env.local` and to the Vercel project settings:

| Variable | Notes |
|---|---|
| `CRON_SECRET` | Vercel sends this automatically as `Authorization: Bearer …` on cron runs. Generate with `openssl rand -hex 32`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role`. **Server-only — never import into a client component.** |
| `JOB_RADAR_EMAIL` | Digest recipient. Falls back to `personalInfo.email`. |
| `JOB_RADAR_DASHBOARD_TOKEN` | Gate for `/opportunities`. Minimum 16 chars or the dashboard stays closed. |

Reused as-is: `GEMINI_API_KEY`, `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM`,
`NEXT_PUBLIC_SUPABASE_URL`.

### 3. Schedule

`vercel.json` runs `/api/cron/job-scan` at `0 4 * * *` UTC — 09:30 IST, so the digest is waiting at
the start of the working day.

Vercel Hobby allows **two** cron jobs, each invoked roughly **once a day**, with a **60s** function
ceiling. The second slot is free. On Pro, raise the frequency in `vercel.json` and the timeouts in
`lib/jobs/run.ts`.

---

## Running it manually

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/job-scan
```

Returns a summary: per-source counts, how many survived each stage, how many were new, whether the
digest sent. A source that starts silently returning nothing shows up here as `0` rather than
quietly shrinking the results.

The dashboard's **Scan now** button calls the same function.

### It fails loudly, on purpose

A misconfigured database used to produce a completely successful-looking run — matches found, none
stored, and a cheerful "no new matches" email. `requireServiceClient()` now throws instead, so:

- the endpoint answers **HTTP 500** with `ok: false` and the reason in `notes`, which is what makes
  Vercel mark the cron run as failed;
- a **"Job radar — scan FAILED"** email goes out, because the characteristic way a daily cron dies
  is silently;
- the dashboard shows the setup error rather than an empty list.

A quiet day and a broken job should never look alike.

### Dashboard access

`middleware.ts` gates `/opportunities` on the `k` query parameter and rewrites a bad token to a
real 404 — byte-identical to the response any unknown URL gets. This exists because `notFound()`
alone protects the *content* but still answers 200, which tells a prober the path exists. The
page's own check and the per-action checks both remain as inner layers.

---

## Sources

All free, no signup, all return a canonical posting URL.

| Source | Endpoint |
|---|---|
| RemoteOK | `remoteok.com/api` — 403s without a `User-Agent`; first array element is a legal notice |
| Remotive | `remotive.com/api/remote-jobs` — query params are ignored, see below |
| We Work Remotely | `weworkremotely.com/categories/remote-programming-jobs.rss` |
| Arbeitnow | `arbeitnow.com/api/job-board-api` |
| Himalayas | `himalayas.app/jobs/api` — capped at 20 rows, see below |
| Jobicy | `jobicy.com/api/v2/remote-jobs` |
| Hacker News | Algolia `search_by_date` + `author_whoishiring`, current `Who is hiring?` thread |

Two of these are lower-yield than they look, and the code says so at the call site:
**Remotive** now ignores `category`, `search` and `limit` alike — every variant returns the same
~18 mixed-category jobs — and **Himalayas** returns 20 rows regardless of `limit`. Both are still
worth keeping (free, and the prefilter sorts them out), but do not expect volume from them.

**Upwork, LinkedIn and Indeed are deliberately excluded.** None expose a usable public API, and
scraping them is brittle and against their terms. If coverage proves thin, the clean addition is
the [Adzuna API](https://developer.adzuna.com) — free tier, ~250 calls/day, a real
contract/temporary filter, and good US/UK/AU coverage. It needs a free app-ID signup.

### Adding a source

Write a fetcher in `lib/jobs/sources.ts` returning `RawJob[]`, then register it in the `SOURCES`
map. It must set `url` (the reference link) and should set `applyUrl` / `applyMethod` when the
source distinguishes them. Throwing is fine — `fetchAllSources` catches per-source.

---

## Web-search results are marked unverified

`lib/jobs/websearch.ts` asks Gemini, with Google Search grounding, for postings the boards missed.
Two things constrain it:

1. Grounding **cannot** be combined with `responseMimeType: "application/json"` — the API rejects
   that pairing. The call returns prose and `extractJson()` pulls the fenced block out.
2. Grounded citations often come back as `vertexaisearch.cloud.google.com` redirect URLs, and a
   model asked for job links will sometimes produce a plausible URL for a posting that has expired
   or never existed.

Measured across runs, the model returns redirect wrappers, direct posting URLs, or fabricated ones
— inconsistently. In one sample of three direct URLs, one 404'd, one was rate-limited and one was
live; in another run, two "different" Upwork jobs came back sharing an identical job id.

So each URL gets exactly one round trip inside the run: redirect wrappers are unwrapped while still
fresh (they expire within minutes — resolving them later returns 404), and anything answering a
definitive 404/410 is dropped. A 403 or 429 is kept, because most job boards block bots and that
says nothing about whether the posting exists.

Everything that survives is still stored with `url_verified = false` and rendered in a separate,
clearly labelled block in both the digest and the dashboard. They are leads to check, not verified
postings — the URL may resolve, but the title and company attached to it were written by a model
and are checked by nothing.

---

## Tuning the match

- **Keywords** — `CORE_STACK`, `CONTRACT_SIGNAL`, `SPECIALISM`, `LOCATION_BLOCKER` in
  `lib/jobs/normalize.ts`.
- **What counts as a good fit** — the scoring guide in `lib/jobs/score.ts`.
- **The profile itself** — don't edit it here. It is derived from `lib/data.ts` in
  `lib/jobs/profile.ts`, for the same reason `app/llms.txt/route.ts` derives its copy: a second
  hand-maintained copy of the CV drifts.
- **Digest threshold** — `DIGEST_THRESHOLD` in `lib/jobs/run.ts` (default 45). Everything scored is
  stored; only rows at or above this go in the email.

---

## Measured timing

From a real run against all sources:

| Stage | Time |
|---|---|
| Boards + web search + link checks (all parallel) | ~12s |
| Gemini scoring (30 postings, one call) | ~11–15s |
| Supabase upsert + email | ~3s |
| **Total** | **~26–30s** of the 60s ceiling |

A representative run: 551 postings fetched across 7 boards + 5 web-search leads, 549 new after
dedupe, 25 through the prefilter, 25 scored. Headroom is deliberate — the Hobby ceiling is hard,
and a timeout loses the whole run.

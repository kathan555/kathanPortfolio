import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isDashboardToken } from "@/lib/jobs/auth";
import { listJobs } from "@/lib/jobs/store";
import type { JobLeadRow } from "@/lib/jobs/types";
import { updateStatus, scanNow } from "./actions";

/* Private page: never indexed, never in the sitemap, and it must not be cached
   — the token is in the query string and the content is per-run. */
export const metadata: Metadata = {
  title: "Opportunities",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const STATUSES = ["all", "new", "saved", "applied", "dismissed"] as const;

function scoreClass(score: number): string {
  if (score >= 80) return "bg-green-400/15 text-green-500 border-green-400/30";
  if (score >= 60) return "bg-blue-400/15 text-blue-500 border-blue-400/30";
  return "bg-muted text-muted-foreground border-border";
}

function StatusButton({
  id,
  token,
  status,
  label,
  active,
}: {
  id: string;
  token: string;
  status: string;
  label: string;
  active: boolean;
}) {
  return (
    <form action={updateStatus} className="inline">
      <input type="hidden" name="k" value={token} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`rounded-md border px-2 py-1 text-xs transition-colors ${
          active
            ? "border-blue-400/40 bg-blue-400/15 text-blue-500"
            : "border-border text-muted-foreground hover:text-foreground hover:border-blue-400/40"
        }`}
      >
        {label}
      </button>
    </form>
  );
}

function ApplyLink({ job }: { job: JobLeadRow }) {
  if (job.apply_method === "email" && job.apply_email) {
    return (
      <a
        href={`mailto:${job.apply_email}?subject=${encodeURIComponent(`Application — ${job.title}`)}`}
        className="font-medium text-emerald-500 hover:underline"
      >
        Email {job.apply_email}
      </a>
    );
  }
  if (job.apply_method === "thread-reply") {
    return (
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-emerald-500 hover:underline"
      >
        Reply in thread →
      </a>
    );
  }
  return (
    <a
      href={job.apply_url || job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-emerald-500 hover:underline"
    >
      Apply →
    </a>
  );
}

function JobCard({ job, token }: { job: JobLeadRow; token: string }) {
  const meta = [job.company, job.location, job.engagement, job.compensation].filter(
    (v): v is string => Boolean(v) && v !== "unknown",
  );

  return (
    <li
      className={`rounded-xl border border-border bg-card p-4 transition-opacity ${
        job.status === "dismissed" ? "opacity-45" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`shrink-0 rounded-md border px-2 py-1 font-mono text-xs font-semibold ${scoreClass(
            job.score ?? 0,
          )}`}
        >
          {job.score ?? 0}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-foreground">{job.title}</h3>

          {meta.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{meta.join(" · ")}</p>
          )}

          {job.score_reason && (
            <p className="mt-2 text-xs leading-relaxed text-foreground/80">{job.score_reason}</p>
          )}

          {job.matched_skills && job.matched_skills.length > 0 && (
            <p className="mt-2 text-xs text-emerald-500">
              Matches: {job.matched_skills.join(", ")}
            </p>
          )}

          {job.red_flags && job.red_flags.length > 0 && (
            <p className="mt-1 text-xs text-rose-400">Watch out: {job.red_flags.join("; ")}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View posting
            </a>
            <ApplyLink job={job} />
            <span className="text-muted-foreground">via {job.source}</span>
            {!job.url_verified && (
              <span className="rounded border border-orange-400/40 bg-orange-400/10 px-1.5 py-0.5 text-orange-400">
                unverified
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(["saved", "applied", "dismissed"] as const).map((s) => (
              <StatusButton
                key={s}
                id={job.id}
                token={token}
                status={job.status === s ? "new" : s}
                label={job.status === s ? `✓ ${s}` : s}
                active={job.status === s}
              />
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string; status?: string }>;
}) {
  const params = await searchParams;
  const token = params.k ?? "";

  /* middleware.ts already answers a bad token with a real 404 before this runs.
     This is the inner layer — it keeps the page safe on its own if the matcher
     is ever changed or middleware stops running for this path. */
  if (!isDashboardToken(token)) notFound();

  const status = STATUSES.includes(params.status as (typeof STATUSES)[number])
    ? params.status!
    : "new";

  /* listJobs throws when SUPABASE_SERVICE_ROLE_KEY is missing or the table has
     not been created. Show that plainly — an empty list would read as "no leads
     yet" and quietly hide a setup problem. */
  let jobs: JobLeadRow[] = [];
  let configError: string | null = null;
  try {
    jobs = await listJobs({ status, days: 60 });
  } catch (e) {
    configError = e instanceof Error ? e.message : String(e);
  }

  const verified = jobs.filter((j) => j.url_verified);
  const unverified = jobs.filter((j) => !j.url_verified);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Opportunities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {jobs.length} {status === "all" ? "" : status} {jobs.length === 1 ? "lead" : "leads"} from
            the last 60 days
          </p>
        </div>

        <form action={scanNow}>
          <input type="hidden" name="k" value={token} />
          <button
            type="submit"
            className="rounded-lg border border-blue-400/40 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-400/20"
          >
            Scan now
          </button>
        </form>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <a
            key={s}
            href={`/opportunities?k=${encodeURIComponent(token)}&status=${s}`}
            className={`rounded-md border px-3 py-1.5 text-xs capitalize transition-colors ${
              s === status
                ? "border-blue-400/40 bg-blue-400/15 text-blue-500"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </a>
        ))}
      </nav>

      {configError ? (
        <div className="mt-10 rounded-xl border border-rose-400/40 bg-rose-400/10 p-6">
          <h2 className="text-sm font-semibold text-rose-400">Storage is not set up</h2>
          <p className="mt-2 font-mono text-xs leading-relaxed text-foreground/80">{configError}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Create the <code>job_leads</code> table and set{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> — see <code>docs/job-radar.md</code>.
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <p className="mt-10 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Nothing here yet. Hit <strong className="text-foreground">Scan now</strong> to run the
          radar, or wait for the daily cron.
        </p>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {verified.map((job) => (
              <JobCard key={job.id} job={job} token={token} />
            ))}
          </ul>

          {unverified.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold text-foreground">From web search</h2>
              <p className="mt-1 text-xs text-orange-400">
                Gemini found these by searching rather than from a job-board feed. Confirm the
                posting is still open before applying.
              </p>
              <ul className="mt-4 space-y-3">
                {unverified.map((job) => (
                  <JobCard key={job.id} job={job} token={token} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}

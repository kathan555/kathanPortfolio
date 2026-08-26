import nodemailer from "nodemailer";
import { personalInfo } from "@/lib/data";
import type { JobLeadRow, ScanSummary } from "./types";

/* Transporter built the same way as app/api/estimate/send-email/route.ts —
   same SMTP credentials, same per-request construction. */
function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const esc = (v: string | null | undefined): string =>
  (v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function applyLink(job: JobLeadRow): string {
  if (job.apply_method === "email" && job.apply_email) {
    return `<a href="mailto:${esc(job.apply_email)}?subject=${encodeURIComponent(
      `Application — ${job.title}`,
    )}" style="color:#0a7;font-weight:600;text-decoration:none">Email ${esc(job.apply_email)}</a>`;
  }
  if (job.apply_method === "thread-reply") {
    return `<a href="${esc(job.url)}" style="color:#0a7;font-weight:600;text-decoration:none">Reply in thread &rarr;</a>`;
  }
  const href = job.apply_url || job.url;
  return `<a href="${esc(href)}" style="color:#0a7;font-weight:600;text-decoration:none">Apply &rarr;</a>`;
}

function jobCard(job: JobLeadRow): string {
  const meta = [job.company, job.location, job.engagement, job.compensation]
    .filter((v): v is string => Boolean(v) && v !== "unknown")
    .map(esc)
    .join(" &middot; ");

  const skills = job.matched_skills?.length
    ? `<div style="margin-top:6px;font-size:12px;color:#0a7">Matches: ${job.matched_skills.map(esc).join(", ")}</div>`
    : "";

  const flags = job.red_flags?.length
    ? `<div style="margin-top:6px;font-size:12px;color:#c33">Watch out: ${job.red_flags.map(esc).join("; ")}</div>`
    : "";

  return `
  <tr><td style="padding:14px 0;border-bottom:1px solid #e6e6e6">
    <div style="font-size:15px;font-weight:700;color:#111">
      <span style="display:inline-block;min-width:34px;color:#666;font-weight:600">${job.score ?? 0}</span>
      ${esc(job.title)}
    </div>
    ${meta ? `<div style="margin-top:4px;font-size:13px;color:#555">${meta}</div>` : ""}
    ${job.score_reason ? `<div style="margin-top:6px;font-size:13px;color:#333">${esc(job.score_reason)}</div>` : ""}
    ${skills}
    ${flags}
    <div style="margin-top:9px;font-size:13px">
      <a href="${esc(job.url)}" style="color:#0645ad;text-decoration:none">View posting</a>
      <span style="color:#bbb"> &nbsp;|&nbsp; </span>
      ${applyLink(job)}
      <span style="color:#999;font-size:11px"> &nbsp; via ${esc(job.source)}</span>
    </div>
  </td></tr>`;
}

function section(title: string, note: string | null, jobs: JobLeadRow[]): string {
  if (jobs.length === 0) return "";
  return `
  <h2 style="margin:26px 0 0;font-size:15px;color:#111">${title} <span style="color:#888;font-weight:400">(${jobs.length})</span></h2>
  ${note ? `<div style="margin:4px 0 0;font-size:12px;color:#a60">${note}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    ${jobs.map(jobCard).join("")}
  </table>`;
}

export function buildDigestHtml(jobs: JobLeadRow[], summary: ScanSummary, dashboardUrl: string | null): string {
  /* Board results and web-search results are separated deliberately. The
     latter are unverified by construction — see lib/jobs/websearch.ts — and
     mixing them in would imply a confidence they do not have. */
  const verified = jobs.filter((j) => j.url_verified);
  const unverified = jobs.filter((j) => !j.url_verified);

  const strong = verified.filter((j) => (j.score ?? 0) >= 80);
  const good = verified.filter((j) => (j.score ?? 0) >= 60 && (j.score ?? 0) < 80);
  const rest = verified.filter((j) => (j.score ?? 0) < 60);

  const body =
    jobs.length === 0
      ? `<p style="font-size:14px;color:#555">No new matches today. Scanned ${summary.fetched} postings across ${
          Object.keys(summary.sources).length
        } sources; ${summary.passedPrefilter} passed the keyword filter and none were new.</p>`
      : [
          section("&#128293; Strong matches", null, strong),
          section("&#9989; Worth a look", null, good),
          section("Lower confidence", null, rest),
          section(
            "&#128269; From web search",
            "Unverified — Gemini found these by searching, so confirm the posting is still open before applying.",
            unverified,
          ),
        ].join("");

  const sourceLines = Object.entries(summary.sources)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" &middot; ");

  const notes = summary.notes.length
    ? `<div style="margin-top:6px;color:#a60">${summary.notes.map(esc).join("<br/>")}</div>`
    : "";

  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:680px;margin:0 auto;padding:8px">
  <h1 style="margin:0;font-size:19px;color:#111">Job radar &mdash; ${jobs.length} new ${
    jobs.length === 1 ? "match" : "matches"
  }</h1>
  <div style="margin-top:4px;font-size:12px;color:#888">${new Date(summary.startedAt).toUTCString()}</div>
  ${body}
  ${
    dashboardUrl
      ? `<p style="margin-top:26px;font-size:13px"><a href="${esc(dashboardUrl)}" style="color:#0645ad">Open the dashboard &rarr;</a></p>`
      : ""
  }
  <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e6e6e6;font-size:11px;color:#999">
    ${summary.fetched} fetched &middot; ${summary.afterDedupe} new &middot; ${summary.passedPrefilter} passed filter &middot; ${
      summary.scored
    } scored &middot; ${summary.durationMs}ms<br/>
    ${esc(sourceLines)}
    ${notes}
  </div>
</div>`;
}

/**
 * Sends the digest. Returns whether it went out — a mail failure is logged and
 * reported in the summary, never thrown: the rows are already stored, and
 * losing the whole run over an SMTP hiccup would be the worse outcome.
 */
export async function sendDigest(
  jobs: JobLeadRow[],
  summary: ScanSummary,
  dashboardUrl: string | null,
): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const to = process.env.JOB_RADAR_EMAIL ?? personalInfo.email;

  if (!transporter || !from) {
    console.error("job-radar: SMTP is not configured — skipping digest");
    return false;
  }

  const top = jobs[0];
  const subject =
    jobs.length === 0
      ? "Job radar — no new matches"
      : `Job radar — ${jobs.length} new ${jobs.length === 1 ? "match" : "matches"}${
          top ? ` (top: ${top.title.slice(0, 60)})` : ""
        }`;

  try {
    await transporter.sendMail({
      from: `"Job Radar" <${from}>`,
      to,
      subject,
      html: buildDigestHtml(jobs, summary, dashboardUrl),
    });
    return true;
  } catch (e) {
    console.error("job-radar: digest send failed —", e instanceof Error ? e.message : e);
    return false;
  }
}

/**
 * Alert for a run that blew up. Kept separate from the digest so a failing scan
 * can never be mistaken for a quiet one — same inbox, unmistakably different
 * subject line.
 */
export async function sendFailureNotice(summary: ScanSummary, error: string): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const to = process.env.JOB_RADAR_EMAIL ?? personalInfo.email;

  if (!transporter || !from) {
    console.error("job-radar: SMTP is not configured — cannot send failure notice");
    return false;
  }

  const sourceLines = Object.entries(summary.sources)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" &middot; ");

  try {
    await transporter.sendMail({
      from: `"Job Radar" <${from}>`,
      to,
      subject: "Job radar — scan FAILED",
      html: `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;padding:8px">
  <h1 style="margin:0;font-size:18px;color:#c33">Job radar scan failed</h1>
  <div style="margin-top:4px;font-size:12px;color:#888">${new Date(summary.startedAt).toUTCString()}</div>
  <pre style="margin-top:14px;padding:12px;background:#faf0f0;border:1px solid #eccfcf;border-radius:6px;font-size:13px;white-space:pre-wrap;color:#900">${esc(
    error,
  )}</pre>
  <p style="font-size:13px;color:#555">No leads were stored for this run. The next scheduled run will retry.</p>
  <div style="margin-top:18px;padding-top:10px;border-top:1px solid #e6e6e6;font-size:11px;color:#999">
    Got as far as: ${summary.fetched} fetched &middot; ${summary.passedPrefilter} passed filter &middot; ${
      summary.scored
    } scored &middot; ${summary.durationMs}ms<br/>${esc(sourceLines)}
  </div>
</div>`,
    });
    return true;
  } catch (e) {
    console.error("job-radar: failure notice send failed —", e instanceof Error ? e.message : e);
    return false;
  }
}

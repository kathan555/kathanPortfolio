import { createHash, timingSafeEqual } from "node:crypto";

/* ─────────────────────────────────────────────────────────────────────────
   Dashboard access for /opportunities.

   The token is DERIVED from CRON_SECRET rather than being its own environment
   variable, so production needs two secrets instead of four. It is a one-way
   hash, which matters: this value travels in a URL query string, and URLs leak
   into browser history, referrer headers and access logs. Using CRON_SECRET
   directly would spill the cron credential into all of those; a hash of it
   spills nothing.

   Consequence worth knowing: rotating CRON_SECRET also changes the dashboard
   URL. Print the current one with `npm run job-radar:url`.
   ───────────────────────────────────────────────────────────────────────── */

const SALT = ":job-radar-dashboard";

/** Node-side derivation. The Edge equivalent lives in middleware.ts — the two
    must stay in step, so change them together. */
export function dashboardToken(): string | null {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return null;

  return createHash("sha256").update(secret + SALT).digest("hex").slice(0, 32);
}

/**
 * Checked on the page render AND again inside every server action — an action
 * is its own HTTP endpoint, and having rendered the page once is not
 * authorisation to mutate through it.
 */
export function isDashboardToken(provided: string | null | undefined): boolean {
  const expected = dashboardToken();

  /* No CRON_SECRET configured means the dashboard is closed, not open. */
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

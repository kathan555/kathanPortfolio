import { timingSafeEqual } from "node:crypto";

/**
 * Gate for the /opportunities dashboard.
 *
 * The page holds private lead data, so this is checked on the page render AND
 * again inside every server action — an action is its own HTTP endpoint, and
 * having rendered the page once is not authorisation to mutate through it.
 */
export function isDashboardToken(provided: string | null | undefined): boolean {
  const expected = process.env.JOB_RADAR_DASHBOARD_TOKEN;

  /* No token configured means the dashboard is closed, not open to everyone. */
  if (!expected || expected.length < 16) return false;
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

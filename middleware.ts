import { NextResponse, type NextRequest } from "next/server";

/* ─────────────────────────────────────────────────────────────────────────
   Gate for the private /opportunities dashboard.

   The page itself calls notFound() on a bad token, and that does protect the
   content — nothing from the dashboard renders. But it answers 200 with the
   not-found body, in dev and in production alike, while a genuinely missing
   route answers 404. That difference tells an unauthenticated prober that
   /opportunities exists.

   Middleware runs before the page and can set the status properly, so a bad
   token gets the same 404 as any other unknown path. The check in the page and
   the checks in the server actions both stay: this is the outer layer, not a
   replacement for them.

   Scoped by the matcher below to this one path, so it costs nothing elsewhere.
   ───────────────────────────────────────────────────────────────────────── */

/* Constant-time compare. node:crypto's timingSafeEqual is not available in the
   Edge runtime that middleware runs on, so this is the hand-rolled equivalent. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function middleware(req: NextRequest) {
  /* GET only. Server actions POST back to this same URL and carry the token in
     the form body rather than the query string, and they each re-check it
     themselves — see app/opportunities/actions.ts. */
  if (req.method !== "GET") return NextResponse.next();

  const expected = process.env.JOB_RADAR_DASHBOARD_TOKEN;
  const provided = req.nextUrl.searchParams.get("k");

  /* No token configured means the dashboard is closed, not open to everyone. */
  if (!expected || expected.length < 16 || !provided || !safeEqual(provided, expected)) {
    /* Rewrite to a path with no route rather than returning a bare 404. Next
       then serves the same app/not-found.tsx body it serves for any unknown
       URL, so the response is byte-identical to one — an empty 404 would still
       stand out from the styled page every other bad path gets. */
    return NextResponse.rewrite(new URL("/_opportunities-gate-404", req.url), {
      status: 404,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/opportunities",
};

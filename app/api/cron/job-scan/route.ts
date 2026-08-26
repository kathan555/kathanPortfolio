import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runJobScan } from "@/lib/jobs/run";

/* Vercel Hobby allows one cron invocation a day and caps the function at 60
   seconds; the schedule lives in vercel.json. Every stage inside runJobScan()
   has its own timeout so the whole run stays inside this ceiling. */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/* Vercel sends `Authorization: Bearer $CRON_SECRET` on cron invocations when
   CRON_SECRET is set in the project's environment. Without that check the
   route is a public button that burns Gemini quota and sends mail. */
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    /* 404 rather than 401 — an unauthenticated caller learns nothing about
       whether this endpoint exists. */
    return new NextResponse("Not found", { status: 404 });
  }

  const summary = await runJobScan();
  return NextResponse.json(summary, { status: summary.ok ? 200 : 500 });
}

import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTransporter, fromEmail as resolveFrom, fromHeader, OWNER_EMAIL } from "@/lib/mailer";
import { isRateLimited, callerIp } from "@/lib/rate-limit";
import { verifyReport, type XrayReport } from "@/lib/legacy-xray";
import { buildXrayPdf, xrayLeadEmailHtml, xrayReportEmailHtml, type XrayLead } from "@/lib/legacy-xray-mail";

/* ─────────────────────────────────────────────────────────────────────────
   Emails a Legacy Code X-ray report to the visitor and turns the request
   into a lead.

   This sends mail from Kathan's address to an address the caller types, so:
   • the report must carry a valid, unexpired signature from /api/xray —
     nothing the browser invents can be mailed (see signReport);
   • the PDF is built here from that verified report, never accepted from
     the client;
   • the name is length-capped and link-stripped, since it lands in the
     greeting;
   • it is rate-limited like the estimator's mail route, counted only for
     requests that pass validation and would actually send.
   The report goes out; the submitted code was never here to send.
   ───────────────────────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT = 3;
const RATE_WINDOW = 10 * 60_000; // 10 minutes

const field = (v: unknown, max: number) =>
  typeof v === "string"
    ? v.replace(/\b(?:https?:\/\/|www\.)\S+/gi, "").replace(/\s+/g, " ").trim().slice(0, max)
    : "";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const lead: XrayLead = {
    name: field(body.name, 80),
    email: field(body.email, 200).toLowerCase(),
    company: field(body.company, 120) || undefined,
    wantsCall: body.wantsCall === true,
  };
  if (!lead.name) return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (!EMAIL_RE.test(lead.email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const report = body.report as XrayReport;
  const redactions = typeof body.redactions === "number" ? body.redactions : -1;
  const verdict = report && typeof report === "object" && typeof body.token === "string"
    ? verifyReport(report, redactions, body.token)
    : "invalid";
  if (verdict === "expired") {
    return NextResponse.json({ error: "This report is more than two hours old. Run the X-ray again to email it." }, { status: 400 });
  }
  if (verdict !== "ok") {
    return NextResponse.json({ error: "This report can't be emailed. Run the X-ray again." }, { status: 400 });
  }

  // Counted only once a request would actually send: a typo in the email
  // field shouldn't use up a visitor's allowance.
  if (isRateLimited("xray-email", callerIp(req.headers), RATE_LIMIT, RATE_WINDOW)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  const transporter = getTransporter();
  const from = resolveFrom();
  if (!transporter || !from) {
    return NextResponse.json({ error: "Email is not available right now. Use Copy as Markdown instead." }, { status: 503 });
  }

  // ── To the visitor: the full report, HTML plus a forwardable PDF ──
  let pdf: Buffer | null = null;
  try {
    pdf = buildXrayPdf(report, redactions);
  } catch {
    console.error("xray-email: PDF build failed; sending HTML only");
  }

  try {
    await transporter.sendMail({
      from: fromHeader(from),
      to: lead.email,
      replyTo: OWNER_EMAIL,
      subject: `Your Legacy Code X-ray: ${report.detected.framework}`,
      html: xrayReportEmailHtml(report, redactions, lead),
      attachments: pdf
        ? [{ filename: "legacy-code-xray.pdf", content: pdf, contentType: "application/pdf" }]
        : [],
    });
  } catch {
    // Not the error itself: SMTP errors can echo the message, report included.
    console.error("xray-email: send to visitor failed");
    return NextResponse.json({ error: "Couldn't send the email. Please try again." }, { status: 502 });
  }

  // The visitor has their report. The rest is for Kathan, so it runs after the
  // response: a second SMTP round-trip to Gmail took the whole request to ~30s
  // when the visitor had to wait for it. Both halves are best effort.
  after(async () => {
    const notify = async () => {
      try {
        await transporter.sendMail({
          from: fromHeader(from),
          to: OWNER_EMAIL,
          replyTo: lead.email,
          subject: `X-ray lead: ${lead.name} (${report.detected.framework})${lead.wantsCall ? " wants a call" : ""}`,
          html: xrayLeadEmailHtml(report, lead),
        });
      } catch {
        console.error("xray-email: owner notification failed");
      }
    };

    // Lead record, alongside the blog leads.
    const record = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) return;
      const { error } = await createClient(supabaseUrl, supabaseKey).from("blog_leads").insert({
        name: lead.name,
        email: lead.email,
        company: lead.company ?? null,
        message: `${lead.wantsCall ? "Requested a call" : "Emailed report"}: ${report.detected.framework}`,
        source: "xray_report",
      });
      if (error) console.error("xray-email: lead insert failed:", error.message);
    };

    await Promise.all([notify(), record()]);
  });

  return NextResponse.json({ success: true });
}

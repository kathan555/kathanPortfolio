import { NextRequest, NextResponse } from "next/server";
import { getTransporter, fromEmail as resolveFrom, fromHeader, OWNER_EMAIL, SITE_URL } from "@/lib/mailer";
import { isRateLimited, callerIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// This endpoint sends mail from the owner's own address to a caller-supplied
// recipient, so it needs the same throttle as the estimator that feeds it —
// otherwise it is an open relay for anyone who finds the route.
const RATE_LIMIT  = 5;
const RATE_WINDOW = 60_000;   // 1 minute

export async function POST(req: NextRequest) {
  if (isRateLimited('send-email', callerIp(req.headers), RATE_LIMIT, RATE_WINDOW)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  const transporter = getTransporter();
  const fromEmail   = resolveFrom();

  if (!transporter || !fromEmail) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { clientEmail, pdfBase64 } = body as {
    clientEmail?: string;
    pdfBase64?: string;
  };

  if (!clientEmail?.trim() || !EMAIL_RE.test(clientEmail.trim())) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  if (!pdfBase64 || pdfBase64.length < 100) {
    return NextResponse.json({ error: "Invalid PDF attachment." }, { status: 400 });
  }

  if (pdfBase64.length > 6_000_000) {
    return NextResponse.json({ error: "PDF file is too large." }, { status: 400 });
  }

  const to = clientEmail.trim().toLowerCase();

  try {
    await transporter.sendMail({
      from: fromHeader(fromEmail),
      to,
      bcc: OWNER_EMAIL,
      subject: "Your Project Cost Estimate — Kathan Patel",
      html: `
        <p>Hi,</p>
        <p>Thank you for using the project cost estimator on my portfolio. Your AI-generated estimate is attached as a PDF.</p>
        <p>If you'd like a precise quote tailored to your requirements, reply to this email or <a href="${SITE_URL}/contact">book a call</a>.</p>
        <p>Best regards,<br/>Kathan N. Patel<br/>Blazor & WPF Specialist</p>
      `,
      attachments: [
        {
          filename: "project-estimate.pdf",
          content: Buffer.from(pdfBase64, "base64"),
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to send email";
    console.error("Send estimate email error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

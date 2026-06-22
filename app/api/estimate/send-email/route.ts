import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { personalInfo } from "@/lib/data";
import { verifyEstimateToken } from "@/lib/estimate-token";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Rate limiter ──────────────────────────────────────────────────────────────
// In-memory, resets on cold start — mirrors /api/estimate. Stricter limit here
// because each request sends a real email from our SMTP account.
const RATE_LIMIT = 3; // emails per window per IP
const RATE_WINDOW = 60_000; // 1 minute
const MAP_PRUNE_SIZE = 10_000;

const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });

    if (rateMap.size > MAP_PRUNE_SIZE) {
      for (const [key, val] of rateMap) {
        if (now > val.resetAt) rateMap.delete(key);
      }
    }
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ─── PDF validation ────────────────────────────────────────────────────────────
// The client sends a base64 PDF. Decode it and confirm it is actually a PDF
// (magic bytes) within a sane size, so the endpoint can't be used to relay
// arbitrary attachments.
const PDF_MIN_BYTES = 100;
const PDF_MAX_BYTES = 5_000_000; // ~5 MB

function decodeValidPdf(pdfBase64: unknown): Buffer | null {
  if (typeof pdfBase64 !== "string" || pdfBase64.length < PDF_MIN_BYTES) return null;

  let buf: Buffer;
  try {
    buf = Buffer.from(pdfBase64, "base64");
  } catch {
    return null;
  }

  if (buf.length < PDF_MIN_BYTES || buf.length > PDF_MAX_BYTES) return null;

  // PDF files begin with "%PDF-"
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") return null;

  return buf;
}

// ─── SMTP ──────────────────────────────────────────────────────────────────────
function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  // Split x-forwarded-for — take first IP only to prevent header-spoofing bypass
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { clientEmail, pdfBase64, token } = body as {
    clientEmail?: string;
    pdfBase64?: string;
    token?: string;
  };

  // Authorize first: bind to a real estimate flow by requiring a valid, unexpired
  // token issued by /api/estimate. Unauthorized callers never reach config/SMTP.
  if (!verifyEstimateToken(token)) {
    return NextResponse.json(
      { error: "This estimate link has expired. Please regenerate your estimate." },
      { status: 403 },
    );
  }

  if (!clientEmail?.trim() || !EMAIL_RE.test(clientEmail.trim())) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const pdf = decodeValidPdf(pdfBase64);
  if (!pdf) {
    return NextResponse.json({ error: "Invalid PDF attachment." }, { status: 400 });
  }

  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  if (!transporter || !fromEmail) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    );
  }

  const to = clientEmail.trim().toLowerCase();

  try {
    await transporter.sendMail({
      from: `"Kathan N. Patel" <${fromEmail}>`,
      to,
      bcc: personalInfo.email,
      subject: "Your Project Cost Estimate — Kathan Patel",
      html: `
        <p>Hi,</p>
        <p>Thank you for using the project cost estimator on my portfolio. Your AI-generated estimate is attached as a PDF.</p>
        <p>If you'd like a precise quote tailored to your requirements, reply to this email or <a href="https://kathanpatel.vercel.app/contact">book a call</a>.</p>
        <p>Best regards,<br/>Kathan N. Patel<br/>Blazor & WPF Specialist</p>
      `,
      attachments: [
        {
          filename: "project-estimate.pdf",
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    // Log the real error server-side; never expose SMTP internals to the client.
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Send estimate email error:", msg);
    return NextResponse.json(
      { error: "We couldn't send the email right now. Please try again shortly." },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { personalInfo } from "@/lib/data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM ?? process.env.SMTP_USER;

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

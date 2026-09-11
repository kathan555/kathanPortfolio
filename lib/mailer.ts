import nodemailer from 'nodemailer';
import { personalInfo } from './data';
import {
  RATE_STANDARD,
  MONTHLY_RATE,
  HOURS_PER_MONTH,
  MONTHLY_EFFECTIVE_HOURLY,
} from './estimator-rates';

// ─── Shared mail transport ────────────────────────────────────────────────────
// Both estimator mail paths go through here so SMTP config, the From identity,
// and HTML escaping live in exactly one place.

export const SITE_URL   = 'https://kathanpatel.vercel.app';
export const OWNER_EMAIL = personalInfo.email;

export function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);

  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth:   { user, pass },
  });
}

export const fromEmail = (): string | undefined =>
  process.env.SMTP_FROM ?? process.env.SMTP_USER;

export const fromHeader = (from: string): string => `"${personalInfo.name}" <${from}>`;

// Anything interpolated into an email body is escaped. Visitor-supplied text
// never reaches these templates, but the AI's output does, and mail clients
// render HTML — so escaping is the default rather than a judgement call.
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, char => HTML_ESCAPES[char]);

// ─── Follow-up email for briefs too thin to estimate ──────────────────────────

interface QuestionsEmail {
  understanding: string;
  questions:     string[];
}

/**
 * Built server-side from the model's own output — the browser never posts this
 * content back, so no caller can have arbitrary HTML sent from the owner's
 * address. Rates are included because the visitor submitted an email expecting
 * a number, and these are the two figures any eventual quote is built from.
 */
export function questionsEmailHtml({ understanding, questions }: QuestionsEmail): string {
  const items = questions
    .map(q => `<li style="margin-bottom:8px;">${escapeHtml(q)}</li>`)
    .join('');

  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;line-height:1.6;">
      <p>Hi,</p>

      <p>
        Thanks for using the project cost estimator on my portfolio. I read your brief
        carefully, but it doesn't yet pin down the things that actually drive the cost —
        so rather than send you a confident-looking number with nothing behind it,
        here is where I got to and what I still need.
      </p>

      <h3 style="font-size:15px;margin:24px 0 8px;">What I understood so far</h3>
      <p style="margin-top:0;">${escapeHtml(understanding)}</p>

      <h3 style="font-size:15px;margin:24px 0 8px;">What would let me give you a real number</h3>
      <p style="margin-top:0;">
        Each of these measurably changes the estimate. Reply to this email with
        whatever you can answer — even partial answers narrow the range a lot.
      </p>
      <ol style="padding-left:20px;margin-top:8px;">${items}</ol>

      <h3 style="font-size:15px;margin:24px 0 8px;">How I bill, for your consideration</h3>
      <p style="margin-top:0;">
        Whatever the final scope turns out to be, it is priced from one of these two:
      </p>
      <ul style="padding-left:20px;margin-top:8px;">
        <li style="margin-bottom:8px;">
          <strong>$${RATE_STANDARD}/hour</strong> — billed against logged hours.
          Best for smaller or open-ended work.
        </li>
        <li>
          <strong>$${MONTHLY_RATE.toLocaleString('en-US')}/month</strong> —
          ${HOURS_PER_MONTH} hours of dedicated capacity, which works out to
          $${MONTHLY_EFFECTIVE_HOURLY}/hour. Best once a project runs beyond a few weeks.
        </li>
      </ul>
      <p style="color:#475569;font-size:13px;">
        Specialist work — AI/LLM integration, real-time or multi-tenant architecture,
        payment and compliance integrations — is quoted higher, and I will say so
        up front if your project needs it.
      </p>

      <p style="margin-top:24px;">
        Reply here with more detail and I'll send a full breakdown, or
        <a href="${SITE_URL}/contact" style="color:#2563eb;">book a free 30-minute call</a>
        and we can scope it together — usually faster than writing it all down.
      </p>

      <p style="margin-top:24px;">
        Best regards,<br/>
        ${escapeHtml(personalInfo.name)}<br/>
        Blazor &amp; WPF Specialist
      </p>
    </div>
  `;
}

import jsPDF from "jspdf";
import { personalInfo } from "@/lib/data";
import { escapeHtml, SITE_URL } from "@/lib/mailer";
import type { Severity, XrayReport } from "@/lib/legacy-xray-shared";

/* ─────────────────────────────────────────────────────────────────────────
   Legacy Code X-ray — email + PDF
   Everything here renders a report that /api/xray/email has already verified
   against its signature, so the content is known to be the engine's own.
   It is still escaped: the engine's strings started life as model output.

   Two audiences, two levels of detail:
   • the visitor gets the full report, evidence lines included (quoted from
     their own code, secrets already redacted);
   • Kathan gets the lead plus a summary of the findings. Never the code.

   Colours are the light-theme values of the site's accent tokens, as hex:
   mail clients and jsPDF cannot resolve CSS variables.
   ───────────────────────────────────────────────────────────────────────── */

const INK = "#0f172a";
const MUTED = "#475569";
const BORDER = "#e2e8f0";
const BLUE = "#135ed8";

const SEVERITY: Record<Severity, { label: string; hex: string; rgb: [number, number, number] }> = {
  critical: { label: "Critical", hex: "#be123c", rgb: [190, 18, 60] },
  high:     { label: "High",     hex: "#b8520a", rgb: [184, 82, 10] },
  medium:   { label: "Medium",   hex: "#0a5adb", rgb: [10, 90, 219] },
  low:      { label: "Low",      hex: "#0b7a55", rgb: [11, 122, 85] },
};

export type XrayLead = { name: string; email: string; company?: string; wantsCall: boolean };

// ── Visitor email ────────────────────────────────────────────────────────────
const list = (items: string[]) =>
  `<ul style="padding-left:20px;margin:8px 0 0;">${items
    .map((i) => `<li style="margin-bottom:6px;">${escapeHtml(i)}</li>`)
    .join("")}</ul>`;

const h2 = (text: string) =>
  `<h2 style="font-size:16px;margin:28px 0 8px;color:${INK};">${escapeHtml(text)}</h2>`;

export function xrayReportEmailHtml(report: XrayReport, redactions: number, lead: XrayLead): string {
  const { detected, target } = report;

  const risks = report.risks.map((r) => {
    const sev = SEVERITY[r.severity];
    return `
      <div style="border:1px solid ${BORDER};border-left:4px solid ${sev.hex};border-radius:8px;padding:12px 14px;margin-bottom:10px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${sev.hex};">
          ${sev.label} · ${escapeHtml(r.category)}
        </p>
        <p style="margin:0 0 4px;font-weight:600;">${escapeHtml(r.title)}</p>
        <p style="margin:0;color:${MUTED};font-size:14px;">${escapeHtml(r.detail)}</p>
        ${r.evidence ? `<p style="margin:8px 0 0;font-family:Consolas,Menlo,monospace;font-size:12px;background:#f1f5f9;border-radius:6px;padding:6px 8px;color:${INK};word-break:break-word;">${escapeHtml(r.evidence)}</p>` : ""}
      </div>`;
  }).join("");

  const phases = report.phases.map((p, i) => `
      <p style="margin:14px 0 4px;font-weight:600;">Phase ${i + 1}: ${escapeHtml(p.name)}
        <span style="font-family:Consolas,Menlo,monospace;font-size:12px;color:#7d25d0;border:1px solid #d8c4f0;border-radius:4px;padding:1px 5px;margin-left:4px;">${p.size}</span>
      </p>
      ${list(p.steps)}`).join("");

  const callLine = lead.wantsCall
    ? `<p>You asked for a call about this. <a href="${personalInfo.calendarBookingUrl}" style="color:${BLUE};">Pick a time that suits you</a>, or reply with a few times that work.</p>`
    : `<p>If you'd like to talk it through, <a href="${personalInfo.calendarBookingUrl}" style="color:${BLUE};">book a free 30-minute call</a> or just reply to this email.</p>`;

  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};line-height:1.6;max-width:640px;">
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>Here is your Legacy Code X-ray. The same report is attached as a PDF, so it's easy to forward to your team.</p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 16px;margin:20px 0;">
        <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${BLUE};font-family:Consolas,Menlo,monospace;">Detected</p>
        <p style="margin:4px 0 0;font-size:18px;font-weight:700;">${escapeHtml(detected.framework)}</p>
        <p style="margin:2px 0 0;color:${MUTED};font-size:14px;">${escapeHtml(detected.language)} · ${detected.confidence} confidence</p>
      </div>

      <p>${escapeHtml(report.summary)}</p>
      ${redactions ? `<p style="color:#0b7a55;font-size:13px;">${redactions} likely secret${redactions > 1 ? "s were" : " was"} redacted before analysis.</p>` : ""}

      ${report.risks.length ? h2("Risk map") + risks : ""}
      ${target.stack ? h2("Recommended target") + `<p style="margin:0;"><strong>${escapeHtml(target.stack)}</strong>. ${escapeHtml(target.rationale)}</p>` : ""}
      ${report.phases.length ? h2("Migration plan") + `<p style="margin:0;color:${MUTED};font-size:13px;">Sizes are relative effort (S to XL), not a quote.</p>` + phases : ""}
      ${report.quickWins.length ? h2("Quick wins") + list(report.quickWins) : ""}
      ${report.aiOpportunities.length ? h2("AI features it could offer") + list(report.aiOpportunities) : ""}

      <div style="border-top:1px solid ${BORDER};margin-top:32px;padding-top:16px;">
        ${callLine}
        <p style="color:${MUTED};font-size:13px;">
          This is an automated first pass over one file, not a code review. Your code was not stored.
        </p>
        <p>Best regards,<br/>${escapeHtml(personalInfo.name)}<br/>Freelance AI &amp; .NET Developer</p>
      </div>
    </div>
  `;
}

// ── Lead notification (to Kathan) ────────────────────────────────────────────
export function xrayLeadEmailHtml(report: XrayReport, lead: XrayLead): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 10px;color:${MUTED};font-size:13px;width:130px;vertical-align:top;">${label}</td>
      <td style="padding:6px 10px;font-size:13px;">${value}</td>
    </tr>`;

  const risks = report.risks
    .map((r) => `<span style="color:${SEVERITY[r.severity].hex};font-weight:700;">${SEVERITY[r.severity].label}</span> ${escapeHtml(r.title)}`)
    .join("<br/>");

  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};line-height:1.5;">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${BLUE};font-family:Consolas,Menlo,monospace;">Legacy Code X-ray lead</p>
      <h1 style="margin:0 0 16px;font-size:20px;">${escapeHtml(lead.name)}${lead.wantsCall ? " wants a call" : " emailed their report"}</h1>
      <table style="border-collapse:collapse;border:1px solid ${BORDER};border-radius:8px;">
        ${row("Email", `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>`)}
        ${lead.company ? row("Company", escapeHtml(lead.company)) : ""}
        ${row("Wants a call", lead.wantsCall ? "<strong>Yes</strong>" : "No")}
        ${row("Detected", `${escapeHtml(report.detected.framework)} · ${escapeHtml(report.detected.language)}`)}
        ${report.target.stack ? row("Target", escapeHtml(report.target.stack)) : ""}
        ${risks ? row("Risks", risks) : ""}
      </table>
      <p style="color:${MUTED};font-size:12px;margin-top:16px;">
        Summary only: the visitor's code and the evidence lines are not included. Reply to this email to reach them directly.
      </p>
    </div>
  `;
}

// ── PDF ──────────────────────────────────────────────────────────────────────
// jsPDF's built-in Helvetica only covers Latin-1, so typographic characters the
// model likes are mapped to plain equivalents and anything else is dropped.
const PDF_CHARS: Record<string, string> = {
  "→": "->", "←": "<-", "–": "-", "—": "-", "‘": "'", "’": "'", "“": '"', "”": '"',
  "…": "...", "•": "-", "≥": ">=", "≤": "<=", "×": "x", " ": " ",
};
const pdfText = (s: string) =>
  s.replace(/[→←–—‘’“”…•≥≤× ]/g, (c) => PDF_CHARS[c]).replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");

type RGB = [number, number, number];
const C: Record<string, RGB> = {
  ink: [15, 23, 42], muted: [71, 85, 105], blue: [19, 94, 216], border: [226, 232, 240],
  headerBg: [30, 58, 138], white: [255, 255, 255], soft: [241, 245, 249], purple: [125, 37, 208],
};

export function buildXrayPdf(report: XrayReport, redactions: number): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const ML = 18;
  const W = PW - ML * 2;
  let y = 0;

  const font = (style: "normal" | "bold" = "normal", size = 10, color: RGB = C.ink) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const lineH = (size: number) => size * 0.42;
  const ensure = (h: number) => {
    if (y + h > PH - 18) { doc.addPage(); y = 18; }
  };
  const para = (text: string, size = 10, color: RGB = C.ink, style: "normal" | "bold" = "normal", indent = 0) => {
    font(style, size, color);
    const lines = doc.splitTextToSize(pdfText(text), W - indent) as string[];
    for (const line of lines) {
      ensure(lineH(size) + 1);
      doc.text(line, ML + indent, y);
      y += lineH(size) + 1;
    }
  };
  const heading = (text: string) => {
    ensure(14);
    y += 5;
    font("bold", 13, C.ink);
    doc.text(pdfText(text), ML, y);
    y += 2;
    doc.setDrawColor(...C.border);
    doc.line(ML, y, ML + W, y);
    y += 5;
  };
  const bullets = (items: string[]) => {
    for (const item of items) {
      font("normal", 10, C.blue);
      ensure(6);
      doc.text("-", ML + 1, y);
      para(item, 10, C.ink, "normal", 5);
      y += 0.5;
    }
  };

  // Header band
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, PW, 34, "F");
  font("bold", 20, C.white);
  doc.text("Legacy Code X-ray", ML, 16);
  font("normal", 10, [191, 219, 254]);
  doc.text(pdfText(`${personalInfo.name} · Freelance AI & .NET Developer`), ML, 24);
  doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), PW - ML, 24, { align: "right" });
  y = 46;

  // Detected
  font("bold", 9, C.blue);
  doc.text("DETECTED", ML, y);
  y += 6;
  para(report.detected.framework, 15, C.ink, "bold");
  para(`${report.detected.language} · ${report.detected.confidence} confidence`, 10, C.muted);
  y += 3;
  para(report.summary, 10.5);
  if (redactions) {
    y += 1;
    para(`${redactions} likely secret${redactions > 1 ? "s were" : " was"} redacted before analysis.`, 9, [11, 122, 85]);
  }

  if (report.isDotNet) {
    if (report.risks.length) {
      heading("Risk map");
      for (const r of report.risks) {
        const sev = SEVERITY[r.severity];
        // Measure the whole card first and start it on a fresh page if it
        // won't fit, so it (and its severity bar) never splits across pages.
        font("bold", 10.5);
        const titleLines = (doc.splitTextToSize(pdfText(r.title), W - 4) as string[]).length;
        font("normal", 9.5);
        const detailLines = (doc.splitTextToSize(pdfText(r.detail), W - 4) as string[]).length;
        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);
        const evLines = r.evidence ? (doc.splitTextToSize(pdfText(r.evidence), W - 10) as string[]).length : 0;
        ensure(5 + titleLines * (lineH(10.5) + 1) + detailLines * (lineH(9.5) + 1) + (evLines ? evLines * 4 + 3 : 0) + 4);
        const top = y - 4;
        font("bold", 8, sev.rgb);
        doc.text(`${sev.label.toUpperCase()} · ${r.category.toUpperCase()}`, ML + 4, y);
        y += 5;
        para(r.title, 10.5, C.ink, "bold", 4);
        para(r.detail, 9.5, C.muted, "normal", 4);
        if (r.evidence) {
          doc.setFont("courier", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(...C.ink);
          const ev = doc.splitTextToSize(pdfText(r.evidence), W - 10) as string[];
          ensure(ev.length * 4 + 3);
          doc.setFillColor(...C.soft);
          doc.rect(ML + 4, y - 3, W - 4, ev.length * 4 + 2, "F");
          ev.forEach((line) => { doc.text(line, ML + 6, y); y += 4; });
        }
        // Severity bar down the left edge of the finding
        doc.setFillColor(...sev.rgb);
        doc.rect(ML, top, 1.2, y - top, "F");
        y += 4;
      }
    }

    if (report.target.stack) {
      heading("Recommended target");
      para(report.target.stack, 11.5, C.blue, "bold");
      para(report.target.rationale, 10, C.ink);
    }

    if (report.phases.length) {
      heading("Migration plan");
      para("Sizes are relative effort (S to XL), not a quote.", 9, C.muted);
      report.phases.forEach((p, i) => {
        y += 2;
        ensure(10);
        para(`Phase ${i + 1}: ${p.name}  [${p.size}]`, 11, C.ink, "bold");
        bullets(p.steps);
      });
    }

    if (report.quickWins.length) { heading("Quick wins"); bullets(report.quickWins); }
    if (report.aiOpportunities.length) { heading("AI features it could offer"); bullets(report.aiOpportunities); }
  }

  // Closing CTA
  heading("Next step");
  para("This X-ray reads one file. A free 30-minute call covers the whole system and what a safe, phased migration would look like.", 10);
  y += 2;
  // Clickable, so a forwarded copy still leads somewhere.
  const link = (label: string, url: string, style: "normal" | "bold" = "normal") => {
    ensure(6);
    font(style, 10, C.blue);
    doc.textWithLink(label, ML, y, { url });
    y += lineH(10) + 2;
  };
  link(`Book a free call: ${personalInfo.calendarBookingUrl}`, personalInfo.calendarBookingUrl, "bold");
  link(`Hire page: ${SITE_URL}/hire`, `${SITE_URL}/hire`);
  link(`Email: ${personalInfo.email}`, `mailto:${personalInfo.email}`);

  // Footer on every page, same line as the estimator's PDFs
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...C.border);
    doc.line(ML, PH - 11, PW - ML, PH - 11);
    font("normal", 7.5, C.muted);
    doc.text("Automated first pass - generated by kathanpatel.vercel.app/legacy-code-xray", PW / 2, PH - 7, { align: "center" });
    doc.text(`${p} / ${pages}`, PW - ML, PH - 7, { align: "right" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}

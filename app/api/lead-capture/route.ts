import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ── Simple email regex ── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, message, post_title, post_slug } = body as Record<
      string,
      string | null | undefined
    >;

    /* ── Validation ── */
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email?.trim() || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    /* ── Supabase insert ── */
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey)
        return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
        );

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error: dbError } = await supabase.from("blog_leads").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      message: message?.trim() || null,
      post_title: post_title ?? null,
      post_slug: post_slug ?? null,
      source: "blog_popup",
      // created_at is handled by Supabase default (now())
    });

    if (dbError) {
      console.error("[lead-capture] Supabase insert error:", dbError);
      return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
    }

    /* ── Optional: Resend email notification ──
       Set RESEND_API_KEY and NOTIFICATION_EMAIL in your .env.local
       to get an instant ping whenever someone fills in the form.
    ── */
    if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Blog Leads <leads@kathanpatel.vercel.app>",
            to: [process.env.NOTIFICATION_EMAIL],
            subject: `🎯 New blog lead — ${name.trim()}`,
            html: buildEmailHtml({ name, email, phone, company, message, post_title, post_slug }),
          }),
        });
      } catch (emailErr) {
        // Email failure is non-fatal — lead is already saved to Supabase
        console.error("[lead-capture] Resend notification failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lead-capture] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── Email HTML builder ── */
function buildEmailHtml(data: Record<string, string | null | undefined>): string {
  const row = (label: string, value: string | null | undefined) =>
    value
      ? `<tr>
          <td style="padding:8px 12px;font-weight:600;color:#94a3b8;width:120px;font-size:13px;">${label}</td>
          <td style="padding:8px 12px;color:#f1f5f9;font-size:13px;">${value}</td>
        </tr>`
      : "";

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f172a;font-family:system-ui,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <div style="height:3px;background:linear-gradient(90deg,#3b82f6,#60a5fa);"></div>
        <div style="padding:28px 32px;">
          <p style="margin:0 0 4px;color:#60a5fa;font-size:12px;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;">
            Blog Lead Capture
          </p>
          <h1 style="margin:0 0 20px;color:#f1f5f9;font-size:22px;font-weight:700;">
            New reader reached out
          </h1>
          <table style="width:100%;border-collapse:collapse;background:#0f172a;border-radius:10px;overflow:hidden;">
            ${row("Name", data.name)}
            ${row("Email", data.email)}
            ${row("Phone", data.phone)}
            ${row("Company", data.company)}
            ${row("Message", data.message)}
            ${row("Post", data.post_title)}
            ${row("Slug", data.post_slug)}
          </table>
          <div style="margin-top:24px;">
            <a href="mailto:${data.email}"
               style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
              Reply to ${data.name}
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

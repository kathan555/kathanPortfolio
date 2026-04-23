import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ── Turnstile server-side verification ── */
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // skip verification if not configured

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, turnstileToken } = body as {
      name?:            string;
      email?:           string;
      phone?:           string;
      message?:         string;
      turnstileToken?:  string;
    };

    /* ── Validation ── */
    if (!name?.trim() || !email?.trim() || !message?.trim())
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });

    if (message.trim().length < 10)
      return NextResponse.json(
        { error: "Message is too short (minimum 10 characters)." },
        { status: 400 }
      );

    /* ── Turnstile check ── */
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken)
        return NextResponse.json(
          { error: "Security check required. Please complete the CAPTCHA." },
          { status: 400 }
        );

      const ip = (
        req.headers.get("cf-connecting-ip") ??
        req.headers.get("x-forwarded-for") ??
        "127.0.0.1"
      );

      const valid = await verifyTurnstile(turnstileToken, ip);
      if (!valid)
        return NextResponse.json(
          { error: "Security check failed. Please refresh and try again." },
          { status: 403 }
        );
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
    const { error: insertError } = await supabase.from("contact_submissions").insert([
      {
        name:    name.trim(),
        email:   email.trim().toLowerCase(),
        phone:   phone?.trim() || null,
        message: message.trim(),
      },
    ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError.message);
      throw new Error(insertError.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Contact API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

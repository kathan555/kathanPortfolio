"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Mail,
  Phone,
  User,
  Building2,
  Send,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

/* ── Constants ── */
const STORAGE_KEY = "kp_lead_popup";
const TRIGGER_DELAY_MS = 90_000; // 1.5 minute

interface LeadForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

interface Props {
  postTitle: string;
  postSlug: string;
}

export function LeadCapturePopup({ postTitle, postSlug }: Props) {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<LeadForm>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  /* ── Timer + localStorage gate ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { status, ts } = JSON.parse(raw) as { status: string; ts: number };
        // Never show again after a successful submit
        if (status === "submitted") return;
        // Respect a 7-day dismissal cooldown
        if (status === "dismissed") {
          const daysSince = (Date.now() - ts) / (1000 * 60 * 60 * 24);
          if (daysSince < 7) return;
        }
      }
    } catch {
      // ignore malformed localStorage values
    }

    const timer = setTimeout(() => setVisible(true), TRIGGER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  /* ── Dismiss handler ── */
  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ status: "dismissed", ts: Date.now() })
      );
    } catch {
      // ignore
    }
  }, []);

  /* ── Submit handler ── */
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          message: form.message.trim() || null,
          post_title: postTitle,
          post_slug: postSlug,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }

      setSubmitted(true);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ status: "submitted", ts: Date.now() })
        );
      } catch {
        // ignore
      }
      // Auto-close after celebrating
      setTimeout(() => setVisible(false), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit, please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Field helper ── */
  const field = (key: keyof LeadForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (!visible) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      style={{ animation: "kp-fade-in 0.25s ease both" }}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
        style={{
          background: "hsl(var(--card) / 0.95)",
          backdropFilter: "blur(24px)",
          animation: "kp-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Top accent stripe */}
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0" />

        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {submitted ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Got it, thanks!
              </h3>
              <p className="text-sm text-muted-foreground">
                I'll reach out personally, looking forward to connecting.
              </p>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {/* Header */}
              <div className="mb-5 pr-6">
                <p className="text-xs font-mono text-blue-400 tracking-widest uppercase mb-1">
                  👋 Stay in touch
                </p>
                <h3 className="font-display text-xl font-bold text-foreground leading-snug">
                  Enjoying this post?
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Drop your details and I'll personally reach out whether
                  you're building something in .NET, need a consultant, or just
                  want to nerd out about the stack.
                </p>
              </div>

              {/* Fields */}
              <div className="space-y-2.5">
                {/* Name */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Your name *"
                    value={form.name}
                    onChange={(e) => field("name", e.target.value)}
                    autoComplete="name"
                    className="w-full pl-8 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500/50 focus:bg-background/80 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Email address *"
                    value={form.email}
                    onChange={(e) => field("email", e.target.value)}
                    autoComplete="email"
                    className="w-full pl-8 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500/50 focus:bg-background/80 transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="Phone / WhatsApp (optional)"
                    value={form.phone}
                    onChange={(e) => field("phone", e.target.value)}
                    autoComplete="tel"
                    className="w-full pl-8 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500/50 focus:bg-background/80 transition-all"
                  />
                </div>

                {/* Company */}
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Company / Project (optional)"
                    value={form.company}
                    onChange={(e) => field("company", e.target.value)}
                    autoComplete="organization"
                    className="w-full pl-8 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500/50 focus:bg-background/80 transition-all"
                  />
                </div>

                {/* Message */}
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <textarea
                    rows={2}
                    placeholder="What are you building? (optional)"
                    value={form.message}
                    onChange={(e) => field("message", e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-blue-500/50 focus:bg-background/80 transition-all resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-400 px-1">{error}</p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !form.name.trim() || !form.email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send my details
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground/50 pt-0.5">
                  No spam, ever. Just a genuine conversation.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes kp-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes kp-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
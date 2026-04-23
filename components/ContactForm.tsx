"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Send, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type FormData = { name: string; email: string; phone: string; message: string };
const initial: FormData = { name: "", email: "", phone: "", message: "" };

export function ContactForm() {
  const [form,    setForm]    = useState<FormData>(initial);
  const [loading, setLoading] = useState(false);
  const [token,   setToken]   = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleToken = useCallback((t: string) => setToken(t), []);
  const handleError = useCallback(() => {
    toast.error("Security check failed. Please try again.");
    setToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (SITE_KEY && !token) {
      toast.error("Please complete the security check first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, turnstileToken: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      toast.success("Message sent! I'll get back to you soon. 🎉");
      setForm(initial);
      setToken(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = cn(
    "w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm",
    "text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10",
    "transition-all duration-200"
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
            Name <span className="text-blue-400">*</span>
          </label>
          <input id="name" name="name" type="text" required autoComplete="name"
            placeholder="Your full name" value={form.name} onChange={handleChange} className={inputBase} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
            Email <span className="text-blue-400">*</span>
          </label>
          <input id="email" name="email" type="email" required autoComplete="email"
            placeholder="your@email.com" value={form.email} onChange={handleChange} className={inputBase} />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-2">
          Phone <span className="text-muted-foreground/50 text-xs font-normal">(optional)</span>
        </label>
        <input id="phone" name="phone" type="tel" autoComplete="tel"
          placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} className={inputBase} />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-2">
          Message <span className="text-blue-400">*</span>
        </label>
        <textarea id="message" name="message" required rows={6}
          placeholder="Tell me about the project or opportunity…"
          value={form.message} onChange={handleChange}
          className={cn(inputBase, "resize-none")} />
      </div>

      {/* Security widget */}
      {SITE_KEY ? (
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            Human verification — powered by Cloudflare Turnstile
          </div>
          <TurnstileWidget
            siteKey={SITE_KEY}
            onToken={handleToken}
            onError={handleError}
            theme="auto"
          />
        </div>
      ) : (
        <div className="flex items-start gap-2.5 text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Add <code className="font-mono text-amber-300">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> and{" "}
            <code className="font-mono text-amber-300">TURNSTILE_SECRET_KEY</code> to your{" "}
            <code className="font-mono text-amber-300">.env.local</code> to enable bot protection.
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (!!SITE_KEY && !token)}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 px-6 py-3.5",
          "bg-blue-500 hover:bg-blue-600 active:scale-[0.99]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "text-white font-semibold rounded-xl",
          "transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
        )}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
        ) : (
          <>Send Message <Send className="w-4 h-4" /></>
        )}
      </button>
    </form>
  );
}

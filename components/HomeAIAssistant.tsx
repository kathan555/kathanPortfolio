"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Bot, User, Sparkles, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────────────────
   HomeAIAssistant
   The homepage's live AI feature. A real chat (via /api/home-ai) whose system
   prompt knows Kathan's experience, skills, and projects. Doubles as proof to
   prospective clients that Kathan ships working AI features.

   It also listens for the `home-ai-ask` CustomEvent dispatched by the hero
   command bar, so a question typed up top is answered down here.
   ───────────────────────────────────────────────────────────────────────── */

type Message = {
  id:      string;
  role:    "user" | "assistant";
  content: string;
  error?:  boolean;
};

const STARTERS = [
  "What has Kathan built on his own?",
  "Is he available for contract work?",
  "Can he add AI to my .NET app?",
  "Does he build WPF desktop apps?",
];

export function HomeAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const listRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Keep the newest message in view — but scroll the chat's OWN container only,
  // never the page. (scrollIntoView would scroll the window too, jumping the
  // whole page down to this section on mount.) Skip entirely while empty.
  useEffect(() => {
    if (messages.length === 0) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loadingRef.current) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };

    // Capture history *before* appending the new user message.
    let history: { role: "user" | "assistant"; content: string }[] = [];
    setMessages((prev) => {
      history = prev.map((m) => ({ role: m.role, content: m.content }));
      return [...prev, userMsg];
    });
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/home-ai", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: trimmed, history }),
      });
      const data = await res.json() as { reply?: string; error?: string };

      setMessages((prev) => [
        ...prev,
        {
          id:      crypto.randomUUID(),
          role:    "assistant",
          content: res.ok ? (data.reply ?? "") : (data.error ?? "Something went wrong."),
          error:   !res.ok,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "Network error — please try again.", error: true },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, []);

  // Answer questions typed into the hero command bar.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail.trim()) send(detail);
    };
    window.addEventListener("home-ai-ask", handler as EventListener);
    return () => window.removeEventListener("home-ai-ask", handler as EventListener);
  }, [send]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <section id="ai" className="relative py-24 overflow-hidden">
      {/* Ambient AI glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[520px] w-[820px] max-w-full rounded-full bg-blue-500/[0.07] blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">

          {/* ── Left: pitch ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/[0.07] text-blue-400 text-xs font-mono font-semibold uppercase tracking-[0.18em]">
              <Sparkles className="w-3.5 h-3.5" />
              Live AI · on this page
            </span>

            <h2 className="font-display text-4xl sm:text-5xl font-bold mt-5 mb-4 leading-[1.05]">
              Ask my AI.{" "}
              <span className="gradient-text">It knows my work.</span>
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-6">
              This isn&apos;t a scripted chatbot — it&apos;s a real AI assistant wired to a
              live model, primed with my actual experience, skills, and projects.
              Ask about what I&apos;ve built, my stack, or availability and get a
              straight answer. It&apos;s also a working sample of the kind of AI feature I
              can drop into <span className="text-foreground font-semibold">your</span> Blazor or ASP.NET Core app.
            </p>

            <div className="flex flex-col gap-2.5 mb-8">
              {[
                "Primed with my real portfolio — no hallucinated projects",
                "The same pattern I build into client .NET apps",
                "Streaming answers over a rate-limited API route",
              ].map((line) => (
                <div key={line} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  {line}
                </div>
              ))}
            </div>

            <Link
              href="/ai-integration"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              See how I build AI into .NET apps
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* ── Right: the live chat card ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            {/* Breathing halo */}
            <div className="pointer-events-none absolute -inset-2 rounded-[1.75rem] bg-gradient-to-b from-blue-500/40 via-rose-500/20 to-transparent blur-2xl animate-glow-pulse motion-reduce:animate-none" />

            {/* Animated gradient border frame */}
            <div className="relative rounded-3xl bg-[linear-gradient(120deg,theme(colors.blue.500),theme(colors.rose.400),theme(colors.blue.600),theme(colors.rose.400),theme(colors.blue.500))] bg-[length:300%_300%] p-px shadow-2xl shadow-blue-500/20 animate-border-flow motion-reduce:animate-none">
              <div className="rounded-[23px] bg-card/95 backdrop-blur-xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 bg-blue-500/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-tight">Kathan&apos;s AI Assistant</p>
                      <p className="text-xs text-rose-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse inline-block" />
                        Online · knows my full portfolio
                      </p>
                    </div>
                  </div>
                  {messages.length > 0 && (
                    <button
                      onClick={() => setMessages([])}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/60"
                      title="Clear conversation"
                      aria-label="Clear conversation"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-5 py-6">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-lg" />
                        <div className="relative w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Sparkles className="w-7 h-7 text-blue-400" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground mb-1 text-sm">Ask me anything about Kathan</p>
                        <p className="text-xs text-muted-foreground max-w-xs">His work, stack, availability — or how he&apos;d add AI to your app.</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 w-full">
                        {STARTERS.map((s) => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="text-left text-xs px-3 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-300 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4 text-blue-400" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3 sm:px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words",
                            msg.role === "user"
                              ? "bg-blue-500 text-white rounded-tr-sm"
                              : msg.error
                              ? "bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm"
                              : "bg-muted/60 border border-border/60 text-foreground rounded-tl-sm"
                          )}
                        >
                          {msg.content}
                        </div>
                        {msg.role === "user" && (
                          <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="bg-muted/60 border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-blue-400"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-border/60 p-3 bg-card/60">
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask about my work, stack, or availability…"
                      maxLength={500}
                      className="flex-1 bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none min-h-[42px] max-h-[120px]"
                      style={{ overflow: "hidden" }}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = "auto";
                        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                      }}
                    />
                    <button
                      onClick={() => send(input)}
                      disabled={!input.trim() || loading}
                      aria-label="Send message"
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                        input.trim() && !loading
                          ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/25"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-2 px-1">
                    Live AI · rate-limited · your messages aren&apos;t stored
                  </p>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

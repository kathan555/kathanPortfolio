"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id:      string;
  role:    "user" | "assistant";
  content: string;
  error?:  boolean;
};

const STARTERS = [
  "How do I add AI chat to a Blazor app?",
  "What is Semantic Kernel?",
  "Azure OpenAI vs OpenAI — which should I use?",
  "How much does AI integration cost to build?",
];

export function AIDemoWidget() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input,    setInput]      = useState("");
  const [loading,  setLoading]    = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id:      crypto.randomUUID(),
      role:    "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res  = await fetch("/api/ai-demo", {
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
        {
          id:      crypto.randomUUID(),
          role:    "assistant",
          content: "Network error — please try again.",
          error:   true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden border-blue-500/20 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 bg-blue-500/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground leading-tight">AI Integration Assistant</p>
            <p className="text-xs text-teal-400 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block" />
              Live demo — powered by Claude AI
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/60"
            title="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[280px] max-h-[380px]">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 py-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-blue-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1 text-sm">Ask me anything about AI + .NET</p>
              <p className="text-xs text-muted-foreground">This demo shows how AI chat can be embedded in any Blazor or ASP.NET Core app</p>
            </div>
            {/* Starter prompts */}
            <div className="flex flex-col gap-2 w-full">
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

        {/* Message bubbles */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
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
                  "max-w-[85%] rounded-2xl px-3 sm:px-4 py-3 text-sm leading-relaxed break-words",
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

        {/* Loading bubble */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
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

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/60 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about AI integration in .NET…"
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
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
              input.trim() && !loading
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send   className="w-4 h-4" />
            }
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-2 px-1 hidden sm:block">
          Press Enter to send · Shift+Enter for new line · Max 500 chars
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sparkles, CornerDownLeft } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   HeroCommandBar
   A prominent "AI command bar" in the hero. Submitting a question scrolls to
   the live assistant (#ai) and dispatches a `home-ai-ask` event that the
   HomeAIAssistant listens for — so the hero and the assistant feel like one
   continuous AI surface.
   ───────────────────────────────────────────────────────────────────────── */

const SUGGESTIONS = [
  "What has Kathan built?",
  "Is he available?",
  "Can he add AI to my app?",
];

function ask(question: string) {
  const q = question.trim();
  if (!q) return;
  document.getElementById("ai")?.scrollIntoView({ behavior: "smooth" });
  // Let the scroll begin, then hand the question to the assistant.
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent("home-ai-ask", { detail: q }));
  }, 450);
}

export function HeroCommandBar() {
  const [value, setValue] = useState("");

  function submit() {
    ask(value);
    setValue("");
  }

  return (
    <div className="w-full max-w-xl">
      {/* Command bar */}
      <div className="group relative">
        {/* Glow */}
        <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/40 via-teal-400/30 to-blue-500/40 opacity-60 blur-md transition-opacity duration-300 group-focus-within:opacity-100" />

        <div className="relative flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-card/80 backdrop-blur-xl px-3 py-2 shadow-lg shadow-blue-500/10">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-md shadow-blue-500/30">
            <Sparkles className="h-4.5 w-4.5" strokeWidth={2} />
          </span>

          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            maxLength={500}
            aria-label="Ask Kathan's AI assistant"
            placeholder="Ask my AI anything about my work…"
            className="min-w-0 flex-1 bg-transparent px-1 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          <button
            onClick={submit}
            disabled={!value.trim()}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ask AI
            <CornerDownLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Suggestion chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-blue-500/40 hover:text-blue-400"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

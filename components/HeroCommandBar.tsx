"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
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

const DEFAULT_PLACEHOLDER = "Ask my AI anything about my work…";

/* Prompts typed out in the empty bar, like a model composing a query. */
const TYPED_PROMPTS = [
  DEFAULT_PLACEHOLDER,
  "Can you add RAG search to a .NET app?",
  "What did you ship in legal tech?",
  "How fast can you start?",
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

/** Types, holds, and deletes each prompt in turn. Paused while `paused` is
 *  true (the visitor is focused or typing), and static under reduced motion. */
function useTypedPlaceholder(paused: boolean) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(DEFAULT_PLACEHOLDER);

  useEffect(() => {
    if (paused || reduce) {
      setText(DEFAULT_PLACEHOLDER);
      return;
    }

    let prompt = 0;
    let chars  = TYPED_PROMPTS[0].length;
    let deleting = true;
    let timer: number;

    const step = () => {
      const target = TYPED_PROMPTS[prompt];
      if (deleting) {
        chars--;
        if (chars <= 0) {
          deleting = false;
          prompt = (prompt + 1) % TYPED_PROMPTS.length;
        }
        setText(TYPED_PROMPTS[prompt].slice(0, Math.max(chars, 0)));
        timer = window.setTimeout(step, chars <= 0 ? 350 : 22);
      } else {
        chars++;
        setText(target.slice(0, chars));
        const done = chars >= target.length;
        if (done) deleting = true;
        timer = window.setTimeout(step, done ? 2600 : 48 + Math.random() * 40);
      }
    };

    // Hold the default prompt first, then start cycling.
    timer = window.setTimeout(step, 3200);
    return () => window.clearTimeout(timer);
  }, [paused, reduce]);

  return text;
}

export function HeroCommandBar() {
  const [value, setValue]     = useState("");
  const [focused, setFocused] = useState(false);
  const placeholder = useTypedPlaceholder(focused || value.length > 0);

  function submit() {
    ask(value);
    setValue("");
  }

  return (
    <div className="w-full max-w-xl">
      {/* Command bar */}
      <div className="group relative">
        {/* Glow */}
        <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/40 via-rose-400/30 to-blue-500/40 opacity-60 blur-md transition-opacity duration-300 group-focus-within:opacity-100" />

        <div
          className="fx-holo fx-holo-live relative flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-card/80 backdrop-blur-xl px-3 py-2 shadow-lg shadow-blue-500/10"
          style={{ "--fx-holo-width": "1.5px" } as React.CSSProperties}
        >
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-rose-500 text-white shadow-md shadow-blue-500/30">
            {/* Radar ping — signals the assistant is live */}
            <span aria-hidden className="absolute inset-0 rounded-xl bg-blue-500/40 animate-ping motion-reduce:hidden" style={{ animationDuration: "2.4s" }} />
            <Sparkles className="relative h-4.5 w-4.5" strokeWidth={2} />
          </span>

          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            maxLength={500}
            aria-label="Ask Kathan's AI assistant"
            placeholder={placeholder}
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
            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-blue-500/40 hover:text-blue-400 hover:shadow-[0_0_14px_var(--fx-glow)]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

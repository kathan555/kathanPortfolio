"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/* Copy-to-clipboard with a short "Copied" confirmation. `label` renders a
   text button; without it, an icon-only button (give it an `aria-label`). */
export function CopyButton({
  text,
  label,
  className,
  "aria-label": ariaLabel,
}: {
  text: string;
  label?: string;
  className?: string;
  "aria-label"?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* Clipboard blocked (insecure context or permissions) — the text is
         still visible and selectable, so failing quietly is fine. */
    }
  };

  const Icon = copied ? Check : Copy;
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={ariaLabel ?? label ?? "Copy"}
      className={cn(
        "inline-flex items-center gap-1.5 shrink-0 rounded-lg border transition-colors",
        copied
          ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
          : "border-border text-muted-foreground hover:text-foreground hover:border-blue-500/40 bg-background/60",
        label ? "px-3 py-1.5 text-xs font-semibold" : "p-2",
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label && <span>{copied ? "Copied" : label}</span>}
      <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
    </button>
  );
}

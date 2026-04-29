"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  title: string;
  url:   string;
  tags?: string[];
}

// ── Platform definitions — always-on brand colours ────────────────────────────
const platforms = (encodedUrl: string, encodedTitle: string, hashtags: string, title: string, url: string) => [
  {
    name:   "LinkedIn",
    label:  "Share",
    bg:     "bg-[#0077B5]",
    shadow: "shadow-[#0077B5]/40",
    ring:   "hover:ring-[#0077B5]/50",
    href:   `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name:   "Twitter / X",
    label:  "Tweet",
    bg:     "bg-[#14171A]",
    shadow: "shadow-[#14171A]/40",
    ring:   "hover:ring-white/20",
    href:   `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${hashtags ? `&hashtags=${hashtags}` : ""}`,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name:   "WhatsApp",
    label:  "Send",
    bg:     "bg-[#25D366]",
    shadow: "shadow-[#25D366]/40",
    ring:   "hover:ring-[#25D366]/50",
    href:   `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${url}`)}`,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name:   "Facebook",
    label:  "Share",
    bg:     "bg-[#1877F2]",
    shadow: "shadow-[#1877F2]/40",
    ring:   "hover:ring-[#1877F2]/50",
    href:   `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export function ShareButtons({ title, url, tags = [] }: ShareButtonsProps) {
  const [copied,   setCopied]   = useState(false);
  const [clicked,  setClicked]  = useState<string | null>(null);

  const encodedUrl   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const hashtags     = tags.slice(0, 3).map((t) => t.replace(/\s+/g, "")).join(",");

  const buttons = platforms(encodedUrl, encodedTitle, hashtags, title, url);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    }
  }

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function handlePlatformClick(name: string) {
    setClicked(name);
    setTimeout(() => setClicked(null), 1200);
  }

  return (
    <div className="my-12">
      {/* ── Card ── */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-purple-500/8 to-teal-500/15" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="absolute inset-0 border border-blue-500/20 rounded-2xl" />

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-base leading-tight">
                Found this useful?
              </p>
              <p className="text-sm text-muted-foreground leading-tight">
                Share it with your network — it helps others find this too.
              </p>
            </div>
          </div>

          {/* ── Platform buttons ── */}
          <div className="flex flex-wrap gap-3 mb-5">
            {buttons.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${p.name}`}
                onClick={() => handlePlatformClick(p.name)}
                className={cn(
                  "relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
                  "text-white text-sm font-semibold",
                  "shadow-md transition-all duration-200",
                  "hover:scale-105 hover:-translate-y-0.5 active:scale-95",
                  "ring-2 ring-transparent hover:ring-offset-1",
                  "hover:ring-offset-background",
                  p.bg, p.shadow, p.ring
                )}
              >
                {p.icon}
                <span>{p.label}</span>

                {/* Clicked flash */}
                <AnimatePresence>
                  {clicked === p.name && (
                    <motion.span
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.8 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 rounded-xl bg-white"
                    />
                  )}
                </AnimatePresence>
              </a>
            ))}

            {/* Mobile native share */}
            {isMobile && (
              <button
                onClick={nativeShare}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold shadow-md shadow-purple-500/30 hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                <Share2 className="w-5 h-5" />
                More options
              </button>
            )}
          </div>

          {/* ── Copy link row ── */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-background/60 border border-border/60">
            {/* URL display */}
            <p className="flex-1 text-xs text-muted-foreground font-mono px-2 truncate">
              {url}
            </p>

            {/* Copy button */}
            <button
              onClick={copyLink}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                copied
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/30"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:scale-105 active:scale-95"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{   opacity: 0, y:  6 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{   opacity: 0, y:  6 }}
                    className="flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    Copy link
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

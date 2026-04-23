"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200",
        "border-border hover:border-blue-500/40 hover:bg-blue-500/10",
        "text-muted-foreground hover:text-blue-400",
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
}

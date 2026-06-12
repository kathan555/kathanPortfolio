import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Single USD formatter for the estimator UI, sample tables, and PDF —
// locale is pinned so output never varies with the visitor's browser locale
export const fmtUSD = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

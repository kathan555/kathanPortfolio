import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Single USD formatter for the estimator UI, sample tables, and PDF —
// locale is pinned so output never varies with the visitor's browser locale
/** Serialise structured data for a <script type="application/ld+json">.
 *  JSON.stringify leaves "<" alone, so a string containing "</script>" — a blog
 *  title from the CMS, say — would close the tag early and spill the rest into
 *  the page. "<" is the same character to any JSON parser. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export const fmtUSD =(n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

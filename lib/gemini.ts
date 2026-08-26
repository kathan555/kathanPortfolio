/* ─────────────────────────────────────────────────────────────────────────
   Shared Gemini client.

   The retry/fallback loop below is lifted from app/api/home-ai/route.ts, where
   it was written against this specific API key's behaviour. The comment there
   is worth repeating: gemini-2.5-flash works on this key but throws transient
   503 "high demand" spikes, so it is retried with backoff before falling back
   to the gemini-flash-latest alias. Other flash variants are deliberately
   excluded — 2.0-flash has quota 0 on this key and flash-lite 404s.

   Two things this generalises over the three hand-rolled copies in the API
   routes: the key travels in the x-goog-api-key header (not the query string,
   which lands in URL-level logs), and a caller-supplied AbortSignal can cap
   total wall-clock — which matters on Vercel Hobby, where the whole function
   has 60 seconds.
   ───────────────────────────────────────────────────────────────────────── */

const ATTEMPTS: { model: string; tries: number }[] = [
  { model: "gemini-2.5-flash",    tries: 3 },
  { model: "gemini-flash-latest", tries: 2 },
];
const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type GeminiContent = { role: string; parts: { text: string }[] };

export type GenerationConfig = {
  maxOutputTokens?: number;
  temperature?: number;
  responseMimeType?: string;
  /* gemini-2.5-flash "thinks" by default and those tokens eat into
     maxOutputTokens, truncating the visible answer. Every caller here should
     pass thinkingBudget: 0 unless it genuinely wants reasoning tokens. */
  thinkingConfig?: { thinkingBudget: number };
};

export type GeminiOptions = {
  contents: GeminiContent[];
  generationConfig?: GenerationConfig;
  /* Grounding: [{ google_search: {} }]. Note that Gemini rejects this in
     combination with responseMimeType: "application/json" — a grounded call
     has to return prose and be parsed. */
  tools?: unknown[];
  signal?: AbortSignal;
  /** Prefix for console lines, so failures are attributable in Vercel logs. */
  label?: string;
};

export type GeminiResult = {
  text: string | null;
  /** Grounding metadata, present only on google_search calls. */
  groundingUris: string[];
};

export async function generate(opts: GeminiOptions): Promise<GeminiResult> {
  const key = process.env.GEMINI_API_KEY;
  const label = opts.label ?? "gemini";

  if (!key) {
    console.error(`${label}: GEMINI_API_KEY is not set`);
    return { text: null, groundingUris: [] };
  }

  const body = JSON.stringify({
    contents: opts.contents,
    ...(opts.tools ? { tools: opts.tools } : {}),
    generationConfig: {
      thinkingConfig: { thinkingBudget: 0 },
      ...opts.generationConfig,
    },
  });

  for (const { model, tries } of ATTEMPTS) {
    for (let attempt = 0; attempt < tries; attempt++) {
      if (opts.signal?.aborted) {
        console.error(`${label}: aborted before ${model} attempt ${attempt + 1}`);
        return { text: null, groundingUris: [] };
      }

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": key },
            body,
            signal: opts.signal,
          },
        );

        if (res.ok) {
          const data = (await res.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
              groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string } }> };
            }>;
          };
          const candidate = data.candidates?.[0];
          const text = candidate?.content?.parts
            ?.map((p) => p.text ?? "")
            .join("")
            .trim();
          const groundingUris =
            candidate?.groundingMetadata?.groundingChunks
              ?.map((c) => c.web?.uri)
              .filter((u): u is string => Boolean(u)) ?? [];

          if (text) return { text, groundingUris };
          break; // empty reply — move to the next model
        }

        const err = await res.text().catch(() => "");
        console.error(`${label}: ${model} error ${res.status} — ${err.slice(0, 300)}`);
        if (!RETRYABLE.has(res.status)) break; // non-transient (e.g. 404) — next model
        await sleep(500 * (attempt + 1)); // linear backoff: 0.5s, 1s, 1.5s…
      } catch (e) {
        /* An AbortError means our own deadline fired — stop, don't burn the
           remaining retries on a budget we've already blown. */
        if (e instanceof Error && e.name === "AbortError") {
          console.error(`${label}: ${model} timed out`);
          return { text: null, groundingUris: [] };
        }
        console.error(`${label}: ${model} fetch failed —`, e);
        await sleep(500 * (attempt + 1));
      }
    }
  }

  return { text: null, groundingUris: [] };
}

/**
 * Pulls a JSON value out of a model response that may be wrapped in prose or a
 * ```json fence. Needed for grounded calls, which cannot use JSON mode.
 * Returns null rather than throwing — a malformed response degrades the run,
 * it never fails it.
 */
export function extractJson<T = unknown>(text: string | null): T | null {
  if (!text) return null;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidates = [fenced?.[1], text];

  for (const raw of candidates) {
    if (!raw) continue;
    const trimmed = raw.trim();
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      /* Fall back to the outermost bracketed span — models like to append a
         closing remark after the JSON. */
      const start = trimmed.search(/[[{]/);
      const end = Math.max(trimmed.lastIndexOf("]"), trimmed.lastIndexOf("}"));
      if (start !== -1 && end > start) {
        try {
          return JSON.parse(trimmed.slice(start, end + 1)) as T;
        } catch {
          /* try the next candidate */
        }
      }
    }
  }

  return null;
}

import { NextRequest, NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, string>;

// ─── Constants ────────────────────────────────────────────────────────────────

const RATE_LIMIT       = 5;
const RATE_WINDOW      = 60_000;    // 1 minute
const MAP_PRUNE_SIZE   = 10_000;    // prune expired entries when map exceeds this
const DESC_MAX_LENGTH  = 800;       // mirrors client-side maxLength
const TOTAL_MAX_LENGTH = 5_000;

// Fix 6: whitelist — rejects any value not in this list before it reaches the prompt
const ALLOWED_USER_TYPES = ['technical', 'non-technical'] as const;

// ─── Rate limiter ─────────────────────────────────────────────────────────────
// In-memory, resets on cold start — acceptable for a portfolio estimator tool.
// Not shared across Vercel serverless instances by design.

const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });

    // Fix 9: prune expired entries to prevent unbounded memory growth
    if (rateMap.size > MAP_PRUNE_SIZE) {
      for (const [key, val] of rateMap) {
        if (now > val.resetAt) rateMap.delete(key);
      }
    }
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ─── Input validation ────────────────────────────────────────────────────────

function validateAnswers(answers: unknown): answers is Answers {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return false;

  const a = answers as Record<string, unknown>;

  // Fix 6: whitelist userType — blocks prompt injection via this field
  if (
    typeof a.userType !== 'string' ||
    !ALLOWED_USER_TYPES.includes(a.userType as (typeof ALLOWED_USER_TYPES)[number])
  ) return false;

  // Fix 7: per-field description cap — mirrors DESC_MAX on the client
  if (typeof a.description !== 'string' || a.description.trim().length < 10) return false;
  if (a.description.trim().length > DESC_MAX_LENGTH) return false;

  // Total payload cap — blocks unusually large requests
  const totalLength = Object.values(a)
    .filter((v): v is string => typeof v === 'string')
    .reduce((sum, v) => sum + v.length, 0);

  if (totalLength > TOTAL_MAX_LENGTH) return false;

  return true;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(answers: Answers): string {
  const details   = Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join('\n');
  const isNonTech = answers.userType === 'non-technical';

  // Fix 3: rates now correctly reflect /hire page tiers ($35–$85/hr)
  // Fix 3: overhead is 20% (was 25% in the old prompt, contradicting the FIX 2 comment)
  return `You are a senior .NET contractor with 10+ years of experience estimating solo development projects. Generate a well-reasoned and realistic cost estimate based on the project details below.

PROJECT DETAILS:
${details}

ESTIMATION GUIDELINES:
- All monetary values in USD.
- Hourly rates: Standard tasks ($35–45/hr), Complex/architecture work ($45–65/hr), Specialist work such as legal tech integrations or AI features ($65–85/hr).
- Each phase: cost MUST equal hours × rate exactly. No rounding.
- range_low MUST equal the exact sum of all breakdown[].cost values.
- range_high = range_low + 20% overhead for scope creep and revisions.
- Set hours: 0 and cost: 0 for any phase not applicable to this project type.
- risks: exactly 3 items, each specific to THIS project — no generic placeholder text.
- summary: exactly 2–3 sentences.${isNonTech ? ' Use zero technical jargon — plain business language only.' : ''}
- recommended_stack: comma-separated technologies only, one line.

OUTPUT:
Return ONLY a valid JSON object. No markdown fences, no preamble, no trailing text.

{
  "range_low": number,
  "range_high": number,
  "summary": "string",
  "breakdown": [
    { "phase": "Discovery & Planning",  "hours": number, "rate": number, "cost": number },
    { "phase": "UI/UX Design",          "hours": number, "rate": number, "cost": number },
    { "phase": "Core Development",      "hours": number, "rate": number, "cost": number },
    { "phase": "Integrations & APIs",   "hours": number, "rate": number, "cost": number },
    { "phase": "Testing & QA",          "hours": number, "rate": number, "cost": number },
    { "phase": "Deployment & Handover", "hours": number, "rate": number, "cost": number }
  ],
  "risks": ["string", "string", "string"],
  "recommended_stack": "string"
}`;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  // Fix 5: split x-forwarded-for — take first IP only to prevent header-spoofing bypass
  const ip = req.headers.get('cf-connecting-ip')
           ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim()
           ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Estimator service is not configured.' },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!validateAnswers(body)) {
    return NextResponse.json(
      { error: 'Incomplete project details. Please answer all questions.' },
      { status: 400 },
    );
  }

  const answers = body;

  // Fix 1+2: build prompt once — used only in the fetch body, never logged
  const prompt = buildPrompt(answers);

  // Fix 8: API key in x-goog-api-key header — keeps it out of URL-level server logs
  const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 25_000);

  let geminiRes: Response;
  try {
    geminiRes = await fetch(geminiUrl, {
      method:  'POST',
      signal:  controller.signal,
      headers: {
        'Content-Type':   'application/json',
        'x-goog-api-key': apiKey,             // Fix 8
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:      0.2,
          maxOutputTokens:  7_000,
          responseMimeType: 'application/json', // Gemini JSON mode — returns clean JSON without fences
        },
      }),
    });
  } catch (e: unknown) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === 'AbortError') {
      return NextResponse.json(
        { error: 'The AI took too long to respond. Please try again.' },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: 'Network error reaching AI service. Please try again.' },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!geminiRes.ok) {
    // Fix 11: log internally, return a sanitised message — never expose Gemini internals
    const err = await geminiRes.json().catch(() => ({}));
    console.error('[/api/estimate] Gemini error — status:', geminiRes.status, '| message:', (err as any).error?.message);
    return NextResponse.json(
      { error: 'AI service is temporarily unavailable. Please try again.' },
      { status: 502 },
    );
  }

  const data = await geminiRes.json();
  const raw  = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '') as string;

  // responseMimeType: 'application/json' means Gemini returns clean JSON with no fences.
  // Bracket-slicing below is a safety-net for unexpected edge-case responses only.
  const firstBracket = raw.indexOf('{');
  const lastBracket  = raw.lastIndexOf('}');

  if (firstBracket === -1 || lastBracket === -1) {
    console.error('[/api/estimate] No JSON object found in response');
    return NextResponse.json(
      { error: 'AI did not return a valid estimate. Please try again.' },
      { status: 500 },
    );
  }

  const jsonStr = raw.slice(firstBracket, lastBracket + 1);

  try {
    const result = JSON.parse(jsonStr);
    return NextResponse.json(result);
  } catch {
    console.error('[/api/estimate] JSON parse failed');
    return NextResponse.json(
      { error: 'Failed to parse AI response. Please try again.' },
      { status: 500 },
    );
  }
}
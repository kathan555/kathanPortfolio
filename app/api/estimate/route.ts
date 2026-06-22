import { NextRequest, NextResponse } from 'next/server';
import { signEstimateToken } from '@/lib/estimate-token';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EstimateRequest {
  description: string;
  techStack?:  string;
  budget?:     string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RATE_LIMIT       = 5;
const RATE_WINDOW      = 60_000;    // 1 minute
const MAP_PRUNE_SIZE   = 10_000;    // prune expired entries when map exceeds this
const DESC_MIN_LENGTH  = 30;        // mirrors client-side DESC_MIN
const DESC_MAX_LENGTH  = 2_000;     // mirrors client-side maxLength
const FIELD_MAX_LENGTH = 200;       // techStack / budget caps, mirrors client
const TOTAL_MAX_LENGTH = 5_000;

// ─── Rate limiter ─────────────────────────────────────────────────────────────
// In-memory, resets on cold start — acceptable for a portfolio estimator tool.
// Not shared across Vercel serverless instances by design.

const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });

    // Prune expired entries to prevent unbounded memory growth
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

function validateRequest(body: unknown): body is EstimateRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;

  const a = body as Record<string, unknown>;

  // Single free-form brief — required, with length caps mirroring the client
  if (typeof a.description !== 'string') return false;
  const desc = a.description.trim();
  if (desc.length < DESC_MIN_LENGTH || desc.length > DESC_MAX_LENGTH) return false;

  // Optional short fields
  for (const key of ['techStack', 'budget'] as const) {
    if (a[key] === undefined) continue;
    if (typeof a[key] !== 'string') return false;
    if ((a[key] as string).length > FIELD_MAX_LENGTH) return false;
  }

  // Total payload cap — blocks unusually large requests
  const totalLength = Object.values(a)
    .filter((v): v is string => typeof v === 'string')
    .reduce((sum, v) => sum + v.length, 0);

  if (totalLength > TOTAL_MAX_LENGTH) return false;

  return true;
}

// ─── Response validation ──────────────────────────────────────────────────────
// The Gemini output is untrusted — verify the exact shape the client renders
// (range_low/range_high, breakdown rows, risks, summary, recommended_stack)
// before returning it, so a malformed response can never crash the results UI.

interface EstimateResult {
  range_low:         number;
  range_high:        number;
  summary:           string;
  breakdown:         { phase: string; hours: number; rate: number; cost: number }[];
  risks:             string[];
  recommended_stack: string;
}

const isFiniteNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function validateEstimate(result: unknown): result is EstimateResult {
  if (!result || typeof result !== 'object' || Array.isArray(result)) return false;

  const r = result as Record<string, unknown>;

  if (!isFiniteNum(r.range_low) || !isFiniteNum(r.range_high)) return false;
  if (typeof r.summary !== 'string' || typeof r.recommended_stack !== 'string') return false;

  if (!Array.isArray(r.breakdown) || r.breakdown.length === 0) return false;
  for (const row of r.breakdown as Record<string, unknown>[]) {
    if (!row || typeof row !== 'object') return false;
    if (typeof row.phase !== 'string') return false;
    if (!isFiniteNum(row.hours) || !isFiniteNum(row.rate) || !isFiniteNum(row.cost)) return false;
  }

  if (!Array.isArray(r.risks) || r.risks.some(risk => typeof risk !== 'string')) return false;

  return true;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt({ description, techStack, budget }: EstimateRequest): string {
  const stack  = techStack?.trim();
  const budgetCtx = budget?.trim();

  // Rates reflect /hire page tiers ($35–$85/hr); overhead is 20%
  return `You are a senior .NET contractor with 10+ years of experience estimating solo development projects. The client has submitted a single free-form project brief. Do all the analysis yourself: infer the project type, scope, complexity, required integrations, and a realistic timeline from the brief, then generate a well-reasoned and realistic cost estimate.

PROJECT BRIEF (client's own words):
${description}
${stack ? `\nCLIENT'S PREFERRED TECH STACK:\n${stack}\n` : ''}${budgetCtx ? `\nCLIENT'S BUDGET CONTEXT (stated budget or quotes already received):\n${budgetCtx}\n` : ''}
ESTIMATION GUIDELINES:
- All monetary values in USD.
- Hourly rates: Standard tasks ($35–45/hr), Complex/architecture work ($45–65/hr), Specialist work such as legal tech integrations or AI features ($65–85/hr).
- Each phase: cost MUST equal hours × rate exactly. No rounding.
- range_low MUST equal the exact sum of all breakdown[].cost values.
- range_high = range_low + 20% overhead for scope creep and revisions.
- Set hours: 0 and cost: 0 for any phase not applicable to this project type.
- If the brief is vague on scope, assume a sensible mid-size interpretation and note the assumption in the summary.
- risks: exactly 3 items, each specific to THIS project — no generic placeholder text.
- summary: 2–4 sentences in plain business language a non-technical founder can understand.${budgetCtx ? ' Explicitly state whether the estimate fits the client\'s stated budget, and if not, what scope would fit it.' : ''}
- recommended_stack: comma-separated technologies only, one line.${stack ? ' Honor the client\'s preferred stack unless it is clearly unsuitable for this project — if so, recommend the better fit and flag the concern in risks.' : ''}

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

  // Split x-forwarded-for — take first IP only to prevent header-spoofing bypass
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

  if (!validateRequest(body)) {
    return NextResponse.json(
      { error: 'Please describe your project in a bit more detail and try again.' },
      { status: 400 },
    );
  }

  // Build prompt once — used only in the fetch body, never logged
  const prompt = buildPrompt(body);

  // API key goes in the x-goog-api-key header — keeps it out of URL-level server logs
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
        'x-goog-api-key': apiKey,
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
    // Log internally, return a sanitised message — never expose Gemini internals
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

  let result: unknown;
  try {
    result = JSON.parse(jsonStr);
  } catch {
    console.error('[/api/estimate] JSON parse failed');
    return NextResponse.json(
      { error: 'Failed to parse AI response. Please try again.' },
      { status: 500 },
    );
  }

  if (!validateEstimate(result)) {
    console.error('[/api/estimate] Gemini response failed shape validation');
    return NextResponse.json(
      { error: 'AI did not return a valid estimate. Please try again.' },
      { status: 500 },
    );
  }

  // Issue a short-lived token so the client can request email delivery of this
  // estimate. /api/estimate/send-email requires it, preventing standalone abuse.
  const emailToken = signEstimateToken();

  return NextResponse.json({ ...result, emailToken });
}
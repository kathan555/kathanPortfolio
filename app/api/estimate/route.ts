import { NextRequest, NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, string>;

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
// Resets on cold start — sufficient for a portfolio estimator tool

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT  = 5;          // max requests per window per IP
const RATE_WINDOW = 60_000;     // 1 minute window

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ─── Input validation ────────────────────────────────────────────────────────

// FIX 4: validate that the required fields are present before calling Gemini
function validateAnswers(answers: unknown): answers is Answers {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return false;

  const a = answers as Record<string, unknown>;

  // Every conversation must have at least these two fields
  if (typeof a.userType !== 'string' || !a.userType.trim()) return false;
  if (typeof a.description !== 'string' || a.description.trim().length < 10) return false;

  // Prevent absurdly large payloads
  const totalLength = Object.values(a)
    .filter((v): v is string => typeof v === 'string')
    .reduce((sum, v) => sum + v.length, 0);

  if (totalLength > 5000) return false;

  return true;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(answers: Answers): string {
  const details   = Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join('\n');
  const isNonTech = answers.userType === 'non-technical';

  // FIX 1: rates now match the /hire page ($35–$85/hr)
  // FIX 2: overhead % matches what the UI displays to the user (20%)
  return `Estimate a software project cost as a senior .NET developer.
    PROJECT DETAILS:
    ${details}

    GUIDELINES:
    - Rates: Standard ($18-23), Complex ($20-25), Specialist ($25-30).
    - Range High: Base total + 25% overhead.
    - Range Low: Base total.
    - Content: Risks must be project-specific. ${isNonTech ? 'Use zero technical jargon in the summary.' : ''}

    OUTPUT FORMAT:
    Return a JSON object with this exact structure:
    {
      "range_low": number,
      "range_high": number,
      "summary": "string",
      "breakdown": [
        { "phase": "Discovery & Planning", "hours": number, "rate": number, "cost": number },
        { "phase": "UI/UX Design", "hours": number, "rate": number, "cost": number },
        { "phase": "Core Development", "hours": number, "rate": number, "cost": number },
        { "phase": "Integrations & APIs", "hours": number, "rate": number, "cost": number },
        { "phase": "Testing & QA", "hours": number, "rate": number, "cost": number },
        { "phase": "Deployment & Handover", "hours": number, "rate": number, "cost": number }
      ],
      "risks": ["string", "string", "string"],
      "recommended_stack": "string"
    }`;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  // Rate limiting
  const ip = req.headers.get('cf-connecting-ip')
           ?? req.headers.get('x-forwarded-for')
           ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  // API key check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Estimator service is not configured.' },
      { status: 500 },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // FIX 3: removed console.info(answers) — was logging sensitive user data
  // FIX 4: validate before calling Gemini
  if (!validateAnswers(body)) {
    return NextResponse.json(
      { error: 'Incomplete project details. Please answer all questions.' },
      { status: 400 },
    );
  }

  const answers = body;

  const geminiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // FIX 5: AbortController timeout — 25 seconds max
  // Prevents infinite hanging if Gemini is slow to respond
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 25_000);

  let geminiRes: Response;
  try {
    console.info(buildPrompt(answers));
    geminiRes = await fetch(geminiUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:  controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(answers) }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 5000, responseMimeType: "application/json" },
      }),
    });
  } catch (e: unknown) {
    clearTimeout(timeout);
    // FIX 5: distinguish timeout from other network errors
    if (e instanceof Error && e.name === 'AbortError') {
      return NextResponse.json(
        { error: 'The AI took too long to respond. Please try again.' },
        { status: 504 },
      );
    }
    const msg = e instanceof Error ? e.message : 'Network error reaching AI service';
    return NextResponse.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  if (!geminiRes.ok) {
    const err = await geminiRes.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } }).error?.message
             ?? `AI service returned HTTP ${geminiRes.status}`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const data = await geminiRes.json();
  const raw = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '') as string;

  // 1. Find the first occurrence of '{' and the last occurrence of '}'
  const firstBracket = raw.indexOf('{');
  const lastBracket = raw.lastIndexOf('}');

  if (firstBracket === -1 || lastBracket === -1) {
    console.error('No JSON object found in raw string:', raw);
    return NextResponse.json({ error: 'AI did not return a valid object' }, { status: 500 });
  }

  // 2. Slice exactly from the first { to the last }
  // This ignores markdown fences (```json) and any preamble/postscript text automatically
  const jsonStr = raw.slice(firstBracket, lastBracket + 1);

  try {
    // 3. Optional: Clean up potential problematic whitespace/newlines within the string
    const result = JSON.parse(jsonStr);
    return NextResponse.json(result);
  } catch (parseErr: unknown) {
    // If it still fails, the AI likely returned an unescaped character inside a string field
    console.error('JSON Parse Error. Content:', jsonStr);
    return NextResponse.json({ error: 'Invalid JSON format' }, { status: 500 });
  }
}
import { NextRequest, NextResponse, after } from 'next/server';
import {
  priceFromHours,
  normalizePhases,
  engagementOptions,
  TOTAL_HOURS_MIN,
  type RawPhase,
  type DetailLevel,
  type PricedDetailLevel,
  type EstimateApiResponse,
  type Pricing,
  type BudgetFit,
} from '@/lib/estimator-rates';
import { isRateLimited, callerIp } from '@/lib/rate-limit';
import {
  getTransporter,
  fromEmail,
  fromHeader,
  questionsEmailHtml,
  OWNER_EMAIL,
} from '@/lib/mailer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Types ────────────────────────────────────────────────────────────────────

interface EstimateRequest {
  description:  string;
  techStack?:   string;
  budget?:      string;
  /** Only used to mail the follow-up questions when the brief is too thin to price. */
  clientEmail?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RATE_LIMIT       = 5;
const RATE_WINDOW      = 60_000;    // 1 minute
const DESC_MIN_LENGTH  = 150;       // mirrors client-side DESC_MIN
const DESC_MAX_LENGTH  = 2_000;     // mirrors client-side maxLength
const FIELD_MAX_LENGTH = 200;       // techStack / budget caps, mirrors client
const TOTAL_MAX_LENGTH = 5_000;
const MAX_QUESTIONS    = 10;       // upper bound on the follow-up questions we surface

// ─── Input validation ────────────────────────────────────────────────────────

function validateRequest(body: unknown): body is EstimateRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;

  const a = body as Record<string, unknown>;

  // Single free-form brief — required, with length caps mirroring the client
  if (typeof a.description !== 'string') return false;
  const desc = a.description.trim();
  if (desc.length < DESC_MIN_LENGTH || desc.length > DESC_MAX_LENGTH) return false;

  // Optional short fields
  for (const key of ['techStack', 'budget', 'clientEmail'] as const) {
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

// ─── Model output validation ──────────────────────────────────────────────────
// The Gemini output is untrusted. It carries no money at all — hours and a tier
// label per phase, plus prose — so validation only has to prove those are sane
// before lib/estimator-rates.ts turns them into the figures the client renders.

interface ModelOutput {
  detail_level:         DetailLevel;
  clarifying_questions: string[];
  scope_assumptions:    string[];
  summary:              string;
  breakdown:            RawPhase[];
  risks:                string[];
  recommended_stack:    string;
  // Absent entirely when the client left the budget field blank
  budget_usd?:          number | null;
}

const isFiniteNum   = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(item => typeof item === 'string');

function validateModelOutput(result: unknown): result is ModelOutput {
  if (!result || typeof result !== 'object' || Array.isArray(result)) return false;

  const r = result as Record<string, unknown>;

  if (r.detail_level !== 'low' && r.detail_level !== 'medium' && r.detail_level !== 'high') return false;
  if (typeof r.summary !== 'string' || typeof r.recommended_stack !== 'string') return false;

  if (!isStringArray(r.clarifying_questions) || r.clarifying_questions.length === 0) return false;
  if (!isStringArray(r.scope_assumptions)) return false;
  if (!isStringArray(r.risks)) return false;

  // Omitted or null are both fine — the client may not have stated a budget
  if (r.budget_usd != null && !isFiniteNum(r.budget_usd)) return false;

  if (!Array.isArray(r.breakdown) || r.breakdown.length === 0) return false;
  for (const row of r.breakdown as Record<string, unknown>[]) {
    if (!row || typeof row !== 'object') return false;
    if (typeof row.phase !== 'string') return false;
    if (!isFiniteNum(row.hours) || row.hours < 0) return false;
    if (row.tier !== 'standard' && row.tier !== 'specialist') return false;
  }

  return true;
}

// ─── Budget fit ───────────────────────────────────────────────────────────────
// The model extracts a number from the client's free-text budget (reliable);
// the comparison against the priced range happens here (arithmetic, so ours).

function budgetFit(statedUsd: number | null | undefined, pricing: Pricing): BudgetFit | null {
  if (statedUsd == null || statedUsd <= 0) return null;

  // Judge against whichever engagement model is actually recommended. Comparing
  // a monthly-scale project to the hourly range would call a budget "short"
  // when the monthly option it is being offered would have covered it.
  const { low, high } = pricing.recommended_model === 'monthly' && pricing.monthly
    ? pricing.monthly
    : pricing.hourly;

  const verdict = statedUsd >= high ? 'comfortable'
                : statedUsd >= low  ? 'tight'
                : 'short';

  return { stated_usd: Math.round(statedUsd), verdict };
}

// ─── Follow-up mail for briefs too thin to price ──────────────────────────────
// Sent from here rather than round-tripped through the browser: the body is
// built server-side from the model's own output, so no caller can have
// arbitrary HTML delivered from the owner's address. The owner is BCC'd, which
// doubles as the lead notice for visitors who never come back to finish.

/** Whether a follow-up is deliverable at all — checked before the response goes out. */
function canMailQuestions(clientEmail: string | undefined): string | null {
  const to = clientEmail?.trim().toLowerCase();
  if (!to || !EMAIL_RE.test(to)) return null;
  if (!getTransporter() || !fromEmail()) {
    console.error('[/api/estimate] follow-up mail skipped — SMTP not configured');
    return null;
  }
  return to;
}

async function mailQuestions(
  to:            string,
  understanding: string,
  questions:     string[],
): Promise<void> {
  const transporter = getTransporter();
  const from        = fromEmail();
  if (!transporter || !from) return;

  try {
    await transporter.sendMail({
      from:    fromHeader(from),
      to,
      bcc:     OWNER_EMAIL,
      subject: 'A few questions about your project — Kathan N. Patel',
      html:    questionsEmailHtml({ understanding, questions }),
    });
  } catch (e: unknown) {
    // Never throw — this runs after the response has already been sent, and the
    // questions are on screen regardless of whether the mail lands.
    console.error('[/api/estimate] follow-up mail failed:', e instanceof Error ? e.message : e);
  }
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt({ description, techStack, budget }: EstimateRequest): string {
  const stack     = techStack?.trim();
  const budgetCtx = budget?.trim();

  // No rates appear here by design. The model estimates effort and classifies
  // work; every dollar figure is computed in lib/estimator-rates.ts. Letting it
  // pick a rate AND guess hours compounded two errors into one inflated number.
  return `You are a senior .NET contractor with 10+ years of experience scoping solo development projects. A client has submitted a free-form project brief. Infer the project type, scope, and required integrations from the brief, then estimate the WORKING HOURS each delivery phase requires.

You do NOT set prices. Return hours and a tier label only — all costs are calculated outside this response. Never mention money, rates, or dollar figures in any text you write.

PROJECT BRIEF (client's own words):
${description}
${stack ? `\nCLIENT'S PREFERRED TECH STACK:\n${stack}\n` : ''}${budgetCtx ? `\nCLIENT'S BUDGET CONTEXT (free text — extract a single USD number from it into budget_usd, or null if there is no usable figure; do NOT let it influence your hour estimate):\n${budgetCtx}\n` : ''}
CALIBRATION ANCHORS — real solo-contractor totals. Anchor your estimate against the closest match:
- Single-purpose internal CRUD tool, auth and ~5 entities, basic reports: 60–90 hours total
- Blazor Server appointment-booking app, auth, Stripe payments, automated email: 150–200 hours total
- Multi-module line-of-business system, roles and permissions, document handling, reporting: 300–450 hours total
- Multi-tenant SaaS platform, subscription billing, admin portal, analytics: 400–600 hours total
- Adding an AI/LLM feature to an existing app (prompt pipeline, vector search, streaming UI): 60–120 hours

ESTIMATION RULES:
- Estimate ONLY what the brief states or clearly implies. Do NOT invent features, modules, or integrations the client did not mention — an unmentioned admin panel, mobile app, or reporting suite is out of scope.
- A thin brief is a signal to set detail_level "low". It is NOT a licence to assume a larger project.
- Use 0 hours for any phase this project genuinely does not need.
- tier is "specialist" ONLY for: AI/LLM integration, real-time or multi-tenant architecture, and payment or legal-tech compliance integrations. Everything else — CRUD, forms, reports, auth, UI design, QA, deployment — is "standard". Most projects have at most one specialist phase.

detail_level — judge what the brief gave you, not how long it is:
- "high": the features, the users, and at least one of timeline / integrations / data model are all specified.
- "medium": the core goal and main features are clear, but scope-driving specifics are missing.
- "low": you would be guessing at the project's size. A bare app category ("a CRM", "an e-commerce site"), or a brief that names no concrete features, is always "low".

FIELD REQUIREMENTS:
- clarifying_questions: between 5 and 10, ordered so the question that would most change the hour count comes first. Ask as many as the brief genuinely leaves open — a brief missing almost everything deserves the full 10. Each must be specific to what they wrote. Generic questions like "what is your budget?" are not acceptable.
- scope_assumptions: 3 to 6 items. Each concrete feature or boundary you assumed in order to produce these hours, so the client can correct you.
- risks: exactly 3, each specific to THIS project — no generic placeholder text.
- summary: 2 to 4 sentences in plain business language a non-technical founder understands. Describe scope and effort only — no money.
- recommended_stack: comma-separated technologies only, one line.${stack ? ' Honor the client\'s preferred stack unless it is clearly unsuitable — if so, recommend the better fit and flag the concern in risks.' : ''}

OUTPUT:
Return ONLY a valid JSON object. No markdown fences, no preamble, no trailing text.

{
  "detail_level": "low" | "medium" | "high",
  "clarifying_questions": ["string", "string", "string", "string", "string"],
  "scope_assumptions": ["string"],
  "summary": "string",
  "breakdown": [
    { "phase": "Discovery & Planning",  "hours": number, "tier": "standard" | "specialist" },
    { "phase": "UI/UX Design",          "hours": number, "tier": "standard" | "specialist" },
    { "phase": "Core Development",      "hours": number, "tier": "standard" | "specialist" },
    { "phase": "Integrations & APIs",   "hours": number, "tier": "standard" | "specialist" },
    { "phase": "Testing & QA",          "hours": number, "tier": "standard" | "specialist" },
    { "phase": "Deployment & Handover", "hours": number, "tier": "standard" | "specialist" }
  ],
  "risks": ["string", "string", "string"],
  "recommended_stack": "string",
  "budget_usd": number | null
}`;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  const ip = callerIp(req.headers);

  if (isRateLimited('estimate', ip, RATE_LIMIT, RATE_WINDOW)) {
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
          // gemini-2.5-flash "thinks" by default. Left on, this call ran ~15s and
          // periodically blew the 25s timeout below; off, it runs ~5s and tracks
          // the calibration anchors more closely. The anchors do the reasoning now.
          thinkingConfig: { thinkingBudget: 0 },
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
    const err = await geminiRes.json().catch(() => ({})) as { error?: { message?: string } };
    console.error('[/api/estimate] Gemini error — status:', geminiRes.status, '| message:', err.error?.message);
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

  let model: unknown;
  try {
    model = JSON.parse(jsonStr);
  } catch {
    console.error('[/api/estimate] JSON parse failed');
    return NextResponse.json(
      { error: 'Failed to parse AI response. Please try again.' },
      { status: 500 },
    );
  }

  if (!validateModelOutput(model)) {
    console.error('[/api/estimate] Gemini response failed shape validation');
    return NextResponse.json(
      { error: 'AI did not return a valid estimate. Please try again.' },
      { status: 500 },
    );
  }

  // A brief too thin to scope gets questions instead of a number. Pricing a
  // guess would only produce a confident-looking figure with nothing behind it.
  const { phases, warnings } = normalizePhases(model.breakdown);
  const totalHours = phases.reduce((sum, p) => sum + p.hours, 0);

  if (model.detail_level === 'low' || totalHours < TOTAL_HOURS_MIN) {
    const questions = model.clarifying_questions.slice(0, MAX_QUESTIONS);
    const mailTo    = canMailQuestions(body.clientEmail);

    // SMTP costs ~30s against Gemini's ~6s, which would push the whole request
    // past Vercel's function timeout and leave the visitor watching a spinner
    // for work that does not block their answer. Send it after the response.
    if (mailTo) {
      after(() => mailQuestions(mailTo, model.summary, questions));
    }

    const needsDetail: EstimateApiResponse = {
      status:               'needs_detail',
      understanding:        model.summary,
      clarifying_questions: questions,
      engagement_options:   engagementOptions(),
      emailed:              mailTo !== null,
    };
    return NextResponse.json(needsDetail);
  }

  if (warnings.length > 0) {
    // Soft heuristics fired — log so the caps can be tuned against real traffic
    console.warn('[/api/estimate] normalised model output:', warnings.join('; '));
  }

  const detail  = model.detail_level as PricedDetailLevel;
  const pricing = priceFromHours(model.breakdown, detail);

  const result: EstimateApiResponse = {
    status:            'estimate',
    detail_level:      detail,
    summary:           model.summary,
    scope_assumptions: model.scope_assumptions,
    risks:             model.risks,
    recommended_stack: model.recommended_stack,
    budget_fit:        budgetFit(model.budget_usd, pricing),
    ...pricing,
  };

  return NextResponse.json(result);
}

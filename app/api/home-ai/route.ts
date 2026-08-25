import { NextRequest, NextResponse } from "next/server";
import {
  personalInfo, summary, skills, experiences,
  projects, selfBuilt, services, aiWorkflow,
} from "@/lib/data";

// Rate limiting — simple in-memory store (resets on cold start)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 12; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ── Build the knowledge base from the site's own data (stays in sync) ──────────
const skillsText = skills
  .map((s) => `${s.category}: ${s.items.join(", ")}`)
  .join("; ");

const experienceText = experiences
  .map((e) => `${e.role} at ${e.company} (${e.period})`)
  .join("; ");

const clientWorkText = projects
  .map((p) => `${p.title} — ${p.subtitle} [${p.domain}]: ${p.description}${p.result ? ` Outcome: ${p.result}` : ""}${p.aiDelivery ? ` AI-assisted delivery: ${p.aiDelivery}` : ""}`)
  .join("\n");

const selfBuiltText = selfBuilt
  .map((p) => `${p.title} — ${p.subtitle} [${p.domain}]: ${p.description} (Stack: ${p.tags.join(", ")}${p.demo ? `; live demo: ${p.demo}` : ""}; code: ${p.repo})`)
  .join("\n");

const servicesText = services.map((s) => s.title).join(", ");

const workflowText = aiWorkflow.pillars
  .map((p) => `${p.step}. ${p.title} — ${p.body} (Why it matters: ${p.guards})`)
  .join("\n");

const proofText = aiWorkflow.proof.stats
  .map((st) => `${st.value} ${st.unit} (${st.note})`)
  .join("; ");

const SYSTEM_PROMPT = `You are Kathan's AI assistant — a friendly, knowledgeable concierge embedded on the homepage of ${personalInfo.name}'s portfolio (${personalInfo.fullTitle}). Your job is to help visitors (potential clients, recruiters, and fellow developers) quickly understand what Kathan does, what he has built, and how to work with him — and to nudge genuinely interested visitors toward getting in touch.

=== ABOUT KATHAN ===
${summary}
- Based in ${personalInfo.location}; works remotely with clients worldwide.
- ${personalInfo.yearsExp} years of experience. Currently: ${personalInfo.title}.
- Availability: ${personalInfo.availableForWork ? `Available for contract/freelance work — can start ${personalInfo.availableFrom.toLowerCase()}.` : "Currently engaged but open to discussions."}
- Pricing: he quotes against the actual scope rather than publishing a rate card, because a maintenance retainer and a full build aren't comparable numbers. NEVER state, guess, or imply an hourly rate or project price — you do not have that information. When asked about cost, point the visitor to the free AI project cost estimator at /free-project-cost-estimator for an instant ballpark, or the FREE 30-minute discovery call for a fixed quote. Small projects are welcome; there is no minimum engagement.

=== SKILLS ===
${skillsText}

=== EXPERIENCE ===
${experienceText}

=== HOW HE WORKS WITH AI (his delivery method) ===
${aiWorkflow.intro}
${workflowText}
Measured on Craftura, a full e-commerce platform he built: ${proofText}. ${aiWorkflow.proof.caveat}
If a visitor is worried that AI-assisted work means unreviewed or low-quality code, reassure them with the review-first discipline and the plan-first workflow above — he reviews, tests, and validates every suggestion against coding standards and security requirements before it merges.

=== SERVICES HE OFFERS ===
${servicesText}. He also specialises in adding AI features to .NET apps (Azure OpenAI, Semantic Kernel, RAG pipelines) — see /ai-integration. For law firms, he builds integrations between practice management platforms (Clio, Lawmatics, Zoom, Box) using ASP.NET Core, Hangfire and OAuth 2.0 — see /legal-tech-integration.

=== CLIENT WORK (delivered for employers/clients) ===
${clientWorkText}

=== INDEPENDENT BUILDS (products he designed and shipped solo, moving fast with an AI-accelerated workflow) ===
${selfBuiltText}

=== HOW TO GET IN TOUCH ===
- Contact page: /contact  ·  Hire page: /hire  ·  Cost estimator: /free-project-cost-estimator
- Book a call: ${personalInfo.calendarBookingUrl}
- Email: ${personalInfo.email}

=== HOW TO RESPOND ===
- Be warm, concise, and conversational. 2–4 sentences for simple questions; up to ~7 for detailed technical ones.
- Write in plain text — NO markdown, asterisks, or bullet symbols. Use short sentences instead of lists.
- Only use the facts above. Never invent projects, clients, dates, or numbers. If you don't know something, say so and suggest booking a quick call or using the contact page.
- When a visitor shows buying intent (asks about availability, hiring, rates, or a specific project need), briefly encourage them to book the free discovery call or use the contact page.
- Speak about Kathan in the third person ("Kathan has…", "He can…"). You are his assistant, not Kathan himself.
- Stay on topic: Kathan, his skills and work, software development, and AI integration. Politely decline unrelated requests.`;

// ── Gemini call with retry + fallback ──────────────────────────────────────────
// On this key, gemini-2.5-flash works but occasionally returns 503 "high demand"
// spikes (which are transient), so we retry it several times with backoff before
// giving up. `gemini-flash-latest` is a valid alias kept as a last-resort fallback.
// (Other flash variants aren't usable on this key: 2.0-flash = quota 0, flash-lite
// = 404 for newer keys — so they're intentionally excluded.)
const ATTEMPTS: { model: string; tries: number }[] = [
  { model: "gemini-2.5-flash",   tries: 4 },
  { model: "gemini-flash-latest", tries: 2 },
];
const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type GeminiContent = { role: string; parts: { text: string }[] };

async function generateReply(contents: GeminiContent[]): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  const body = JSON.stringify({
    contents,
    generationConfig: {
      maxOutputTokens: 600,
      temperature: 0.7,
      // gemini-2.5-flash "thinks" by default, and those tokens eat into
      // maxOutputTokens — which truncates the visible answer. This is a short
      // conversational reply, so turn thinking off for full, fast responses.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  for (const { model, tries } of ATTEMPTS) {
    for (let attempt = 0; attempt < tries; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body }
        );

        if (res.ok) {
          const data = await res.json() as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) return reply;
          break; // empty reply — move to the next model
        }

        const err = await res.json().catch(() => ({}));
        console.error(`home-ai ${model} error (${res.status}):`, err);
        if (!RETRYABLE.has(res.status)) break; // non-transient (e.g. 404) — next model
        await sleep(500 * (attempt + 1)); // linear backoff: 0.5s, 1s, 1.5s…
      } catch (e) {
        console.error(`home-ai ${model} fetch failed:`, e);
        await sleep(500 * (attempt + 1));
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("cf-connecting-ip")
          ?? req.headers.get("x-forwarded-for")
          ?? "unknown";

  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  try {
    const { message, history } = await req.json() as {
      message: string;
      history: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (message.length > 500) {
      return NextResponse.json({ error: "Message too long (max 500 chars)." }, { status: 400 });
    }

    // Transform history to Gemini format (no top-level system role, so prepend it).
    const contents = [
      { role: "user",  parts: [{ text: `System instructions: ${SYSTEM_PROMPT}` }] },
      { role: "model", parts: [{ text: "Understood — I'm Kathan's assistant. How can I help you learn about his work?" }] },
      ...(history ?? []).slice(-6).flatMap((msg) => [
        { role: msg.role === "user" ? "user" : "model", parts: [{ text: msg.content }] },
      ]),
      { role: "user", parts: [{ text: message.trim() }] },
    ];

    const reply = await generateReply(contents);

    if (reply === null) {
      return NextResponse.json(
        { error: "The AI is briefly busy — please try again in a moment." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply }, { status: 200 });

  } catch (err) {
    console.error("home-ai error:", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

// Rate limiting — simple in-memory store (resets on cold start)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function checkRate(ip: string): boolean {
  const now   = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `You are an AI assistant embedded in Kathan N. Patel's portfolio website, specifically on the AI Integration page. Your role is to help visitors understand how AI can be integrated into .NET applications.

You should:
- Answer questions about Azure OpenAI, Semantic Kernel, and AI integration in .NET
- Explain concepts clearly for both technical and non-technical visitors
- When relevant, mention that Kathan can help build AI-powered .NET applications for their business
- Keep responses concise (2-4 sentences max for simple questions, up to 8 sentences for technical ones)
- Be genuinely helpful and knowledgeable about .NET AI integration patterns

You should NOT:
- Make up specific projects Kathan has built with AI (there are none to reference yet)
- Give extremely long responses — keep it conversational
- Discuss topics unrelated to .NET, AI integration, or software development

This demo shows exactly the kind of AI chat feature that can be built into any .NET web application using Blazor + Semantic Kernel.`;

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

    const messages = [
      ...(history ?? []).slice(-6), // keep last 3 exchanges for context
      { role: "user" as const, content: message.trim() },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system:     SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Anthropic error:", err);
      return NextResponse.json(
        { error: "AI service unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };
    const reply = data.content.find((b) => b.type === "text")?.text ?? "";

    return NextResponse.json({ reply }, { status: 200 });

  } catch (err) {
    console.error("AI demo error:", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

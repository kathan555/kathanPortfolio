import { NextRequest, NextResponse } from "next/server";
import {
  xrayLegacyCode, xrayInputError, checkXrayRate, type XrayLanguage,
} from "@/lib/legacy-xray";

/* Backs the /legacy-code-xray page. Same engine and rate budget as the MCP
   server at /mcp — this route only adapts it to plain JSON for the browser. */

export const maxDuration = 60; // Gemini with retries can take ~20s on a busy day

export async function POST(req: NextRequest) {
  let body: { code?: unknown; language?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const inputError = xrayInputError(body.code);
  if (inputError) return NextResponse.json({ error: inputError }, { status: 400 });

  const ip = req.headers.get("cf-connecting-ip")
          ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim()
          ?? "unknown";
  const limited = checkXrayRate(ip);
  if (limited) return NextResponse.json({ error: limited }, { status: 429 });

  try {
    const result = await xrayLegacyCode({
      code: body.code as string,
      language: body.language as XrayLanguage, // validated inside xrayLegacyCode
      context: typeof body.context === "string" ? body.context : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.reason === "input" ? 400 : 502 });
    }
    return NextResponse.json({
      report: result.report,
      markdown: result.markdown,
      redactions: result.redactions,
    });
  } catch {
    // Never log the error object: it can carry the submitted code.
    console.error("xray: unexpected failure");
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

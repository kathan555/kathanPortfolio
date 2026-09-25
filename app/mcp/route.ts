import { NextRequest, NextResponse } from "next/server";
import { personalInfo } from "@/lib/data";
import {
  xrayLegacyCode, xrayInputError, checkXrayRate, XRAY_LANGUAGES, XRAY_LIMITS, TARGET_RUNTIME, type XrayLanguage,
} from "@/lib/legacy-xray";

/* ─────────────────────────────────────────────────────────────────────────
   MCP server — https://kathanpatel.vercel.app/mcp
   Lets AI agents (Claude, ChatGPT, Cursor, anything that speaks the Model
   Context Protocol) call the Legacy Code X-ray directly instead of scraping
   the site.

   Streamable HTTP transport in its stateless form: every JSON-RPC request is
   a POST answered with plain JSON — no SSE stream, no session id — which
   fits a serverless function. Hand-rolled rather than pulling in the SDK:
   the surface is five methods, and the other AI routes call Gemini with
   plain fetch for the same reason.
   ───────────────────────────────────────────────────────────────────────── */

export const maxDuration = 60; // Gemini with retries can take ~20s on a busy day

/** Newest first. `initialize` echoes the client's version when it's listed
 *  here and otherwise offers the newest; nothing below differs between them. */
const PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

const SERVER_INFO = {
  name: "kathan-legacy-xray",
  title: "Legacy .NET Code X-ray by Kathan Patel",
  version: "1.0.0",
};

const INSTRUCTIONS = `Legacy .NET modernization analysis from ${personalInfo.name}, a freelance AI & .NET developer (${personalInfo.yearsExp} years). Call xray_legacy_code with a legacy .NET snippet (C#, VB.NET, Web Forms, WinForms, WCF, web.config) to get a modernization report. Show the report to the user as returned, including the closing contact line.`;

const XRAY_TOOL = {
  name: "xray_legacy_code",
  title: "Legacy Code X-ray",
  description:
    `Analyse a legacy .NET code snippet and return a modernization report: detected stack, risk map (blockers, security, data access), the recommended target on ${TARGET_RUNTIME}, a phased migration plan with relative sizes, quick wins, and where AI features could fit afterwards. ` +
    `Works best on one representative file: a Web Forms page with its code-behind, a WinForms form, a WCF service, a data-access class, or web.config. ` +
    `Privacy: this server does not store or log the code, but it is sent to Google's Gemini API for analysis. Likely secrets are redacted first, as a best effort only, so do not submit credentials or code the user is not allowed to share. ` +
    `Limit: ${XRAY_LIMITS.maxChars.toLocaleString("en-US")} characters.`,
  inputSchema: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: `The legacy code to analyse (${XRAY_LIMITS.minChars}–${XRAY_LIMITS.maxChars} characters).`,
        minLength: XRAY_LIMITS.minChars,
        maxLength: XRAY_LIMITS.maxChars,
      },
      language: {
        type: "string",
        enum: [...XRAY_LANGUAGES],
        description: "File type, if known. Defaults to auto-detect.",
      },
      context: {
        type: "string",
        description: "Optional: what the application does, or constraints such as 'must stay on-prem' or 'no downtime'.",
        maxLength: XRAY_LIMITS.maxContextChars,
      },
    },
    required: ["code"],
    additionalProperties: false,
  },
  annotations: {
    title: "Legacy Code X-ray",
    readOnlyHint: true,     // changes nothing, anywhere
    openWorldHint: true,    // reaches an external service (Gemini)
    idempotentHint: true,
  },
};

// ── JSON-RPC plumbing ────────────────────────────────────────────────────────
type JsonRpcId = string | number | null;
type JsonRpcMessage = { jsonrpc?: string; id?: JsonRpcId; method?: string; params?: Record<string, unknown> };

const ok = (id: JsonRpcId, result: unknown) => ({ jsonrpc: "2.0", id, result });
const fail = (id: JsonRpcId, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

const toolText = (text: string, isError = false) => ({ content: [{ type: "text", text }], ...(isError && { isError }) });

async function handle(msg: JsonRpcMessage, ip: string) {
  const id = msg.id ?? null;
  switch (msg.method) {
    case "initialize": {
      const requested = msg.params?.protocolVersion;
      const protocolVersion = PROTOCOL_VERSIONS.includes(requested as string) ? requested : PROTOCOL_VERSIONS[0];
      return ok(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: [XRAY_TOOL] });
    case "tools/call": {
      const name = msg.params?.name;
      if (name !== XRAY_TOOL.name) return fail(id, -32602, `Unknown tool: ${String(name)}`);

      const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
      if (typeof args.code !== "string") return fail(id, -32602, "Missing required argument: code (string).");

      // Rate-limit and input problems are tool errors, not protocol errors,
      // so the agent sees the message and can tell the user.
      const inputError = xrayInputError(args.code);
      if (inputError) return ok(id, toolText(inputError, true));
      const limited = checkXrayRate(ip);
      if (limited) return ok(id, toolText(limited, true));

      const result = await xrayLegacyCode({
        code: args.code,
        language: args.language as XrayLanguage, // validated inside xrayLegacyCode
        context: typeof args.context === "string" ? args.context : undefined,
      });
      return ok(id, result.ok ? toolText(result.markdown) : toolText(result.error, true));
    }
    default:
      return fail(id, -32601, `Method not found: ${String(msg.method)}`);
  }
}

// ── Transport ────────────────────────────────────────────────────────────────
/* The spec asks servers to validate Origin against DNS rebinding. Server-side
   MCP clients send no Origin at all; browsers always do, so only this site
   (and local dev) may call from a page. */
const ALLOWED_ORIGINS = new Set([
  "https://kathanpatel.vercel.app",
  "https://www.kathanpatel.vercel.app",
  "http://localhost:3000",
]);

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json(fail(null, -32000, "Origin not allowed."), { status: 403 });
  }

  const version = req.headers.get("mcp-protocol-version");
  if (version && !PROTOCOL_VERSIONS.includes(version)) {
    return NextResponse.json(fail(null, -32000, `Unsupported MCP-Protocol-Version: ${version}`), { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(fail(null, -32700, "Parse error."), { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip")
          ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim()
          ?? "unknown";

  // 2025-03-26 clients may batch; later versions send single messages.
  const batch = Array.isArray(body);
  const messages = (batch ? body : [body]) as JsonRpcMessage[];
  if (!messages.length || messages.some((m) => !m || typeof m !== "object" || m.jsonrpc !== "2.0")) {
    return NextResponse.json(fail(null, -32600, "Invalid JSON-RPC message."), { status: 400 });
  }

  // Notifications (no id) and client responses get no reply.
  const requests = messages.filter((m) => m.method && m.id !== undefined && m.id !== null);
  if (!requests.length) return new NextResponse(null, { status: 202 });

  const replies = await Promise.all(requests.map((m) => handle(m, ip)));
  return NextResponse.json(batch ? replies : replies[0]);
}

/* No server-initiated stream in stateless mode — the spec's answer is 405. */
export function GET() {
  return new NextResponse("This MCP endpoint accepts JSON-RPC over POST only.", {
    status: 405,
    headers: { Allow: "POST" },
  });
}

export function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}

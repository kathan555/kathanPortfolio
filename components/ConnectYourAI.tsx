"use client";

import { useState } from "react";
import { Bot, PlugZap, ShieldCheck, Terminal } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { MCP_ENDPOINT } from "@/lib/legacy-xray-shared";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
   ConnectYourAI
   Setup instructions for the public MCP server (/mcp), per client. Rendered
   on /hire and /legacy-code-xray; each page supplies its own section heading.

   The pitch is the IDE case: once connected, an agent can X-ray files straight
   from the visitor's repository — no pasting code into a website.
   ───────────────────────────────────────────────────────────────────────── */

const SERVER_NAME = "legacy-xray";

type Client = {
  id: string;
  label: string;
  /** Where the snippet goes, shown above it. */
  where: string;
  snippet?: string;
  steps?: string[];
};

const CLIENTS: Client[] = [
  {
    id: "claude",
    label: "Claude",
    where: "Claude on the web, desktop or mobile",
    steps: [
      "Open Settings → Connectors and add a custom connector.",
      `Name it "Legacy Code X-ray" and paste the endpoint URL above.`,
      "In a chat, paste your code and ask for a legacy X-ray.",
    ],
  },
  {
    id: "claude-code",
    label: "Claude Code",
    where: "Run once in your terminal",
    snippet: `claude mcp add --transport http ${SERVER_NAME} ${MCP_ENDPOINT}`,
  },
  {
    id: "cursor",
    label: "Cursor",
    where: "~/.cursor/mcp.json",
    snippet: JSON.stringify({ mcpServers: { [SERVER_NAME]: { url: MCP_ENDPOINT } } }, null, 2),
  },
  {
    id: "vscode",
    label: "VS Code",
    where: ".vscode/mcp.json",
    snippet: JSON.stringify({ servers: { [SERVER_NAME]: { type: "http", url: MCP_ENDPOINT } } }, null, 2),
  },
];

const EXAMPLE_PROMPT = "X-ray Orders.aspx.cs for a .NET 10 migration";

export function ConnectYourAI() {
  const [active, setActive] = useState(CLIENTS[1].id);
  const client = CLIENTS.find((c) => c.id === active) ?? CLIENTS[0];

  return (
    <div className="glass-card fx-holo relative rounded-2xl p-6 sm:p-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-10">
      {/* ── Left: the pitch ── */}
      <div className="flex flex-col gap-4">
        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center">
          <PlugZap className="w-5 h-5" />
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-snug">
          Your AI assistant can call my site directly
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This portfolio runs an <span className="text-foreground font-medium">MCP server</span>, the
          open protocol Claude, Cursor and VS Code use to plug in tools. Connect it once and your assistant
          can run the Legacy Code X-ray on files straight from your repository. No copying code into a website.
        </p>

        <div className="rounded-xl border border-border bg-background/60 p-3.5">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-blue-400" /> Then just ask
          </p>
          <p className="font-mono text-sm text-foreground">&ldquo;{EXAMPLE_PROMPT}&rdquo;</p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed flex gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            Code is never stored or logged. It&apos;s analysed by Google Gemini, with likely secrets
            redacted before it leaves the server. No account or API key needed.
          </span>
        </p>
      </div>

      {/* ── Right: endpoint + per-client setup ── */}
      <div className="flex flex-col gap-4 min-w-0">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Endpoint</p>
          <div className="flex items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/[0.05] pl-3.5 pr-1.5 py-1.5">
            <code className="font-mono text-sm text-blue-400 break-all flex-1">{MCP_ENDPOINT}</code>
            <CopyButton text={MCP_ENDPOINT} aria-label="Copy MCP endpoint URL" />
          </div>
        </div>

        <div role="tablist" aria-label="AI client" className="flex flex-wrap gap-1.5">
          {CLIENTS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              id={`mcp-tab-${c.id}`}
              aria-selected={c.id === active}
              aria-controls="mcp-panel"
              onClick={() => setActive(c.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                c.id === active
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-blue-500/40",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div id="mcp-panel" role="tabpanel" aria-labelledby={`mcp-tab-${client.id}`} className="min-w-0">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> {client.where}
          </p>
          {client.snippet && (
            <div className="relative rounded-xl border border-border bg-muted/50">
              <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-foreground p-4 pr-12 overflow-x-auto whitespace-pre">
                {client.snippet}
              </pre>
              <CopyButton text={client.snippet} aria-label={`Copy ${client.label} setup`} className="absolute top-2 right-2" />
            </div>
          )}
          {client.steps && (
            <ol className="flex flex-col gap-2.5">
              {client.steps.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

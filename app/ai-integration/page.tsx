import type { Metadata } from "next";
import Link from "next/link";
import {
  Brain, Cpu, Zap, ArrowRight, Code2,
  CheckCircle, AlertCircle, MessageSquare, Database,
  Shield, Layers,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AIDemoWidget } from "@/components/AIDemoWidget";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Integration for .NET Apps — Azure OpenAI & Semantic Kernel",
  description:
    "How to integrate Azure OpenAI and Semantic Kernel into your .NET application. Architecture patterns, C# code examples, and a live AI demo — by a freelance .NET Technical Lead.",
};

// ── Code snippets (shown as static blocks) ────────────────────────────────────
const semanticKernelSetup = `// 1. Install packages
// dotnet add package Microsoft.SemanticKernel
// dotnet add package Microsoft.SemanticKernel.Connectors.OpenAI

// 2. Program.cs — register Semantic Kernel
builder.Services.AddSingleton(sp =>
{
    var kernel = Kernel.CreateBuilder()
        .AddAzureOpenAIChatCompletion(
            deploymentName: "gpt-4o",
            endpoint:       builder.Configuration["AzureOpenAI:Endpoint"]!,
            apiKey:         builder.Configuration["AzureOpenAI:ApiKey"]!
        )
        .Build();
    return kernel;
});`;

const blazorChatService = `// ChatService.cs — injectable service for Blazor components
public class ChatService(Kernel kernel)
{
    private readonly List<ChatMessageContent> _history = [];

    public async Task<string> SendMessageAsync(string userMessage)
    {
        _history.Add(new ChatMessageContent(AuthorRole.User, userMessage));

        var chat = kernel.GetRequiredService<IChatCompletionService>();
        var settings = new OpenAIPromptExecutionSettings
        {
            MaxTokens   = 500,
            Temperature = 0.7
        };

        var response = await chat.GetChatMessageContentAsync(
            chatHistory: new ChatHistory(_history),
            executionSettings: settings,
            kernel: kernel
        );

        _history.Add(response);
        return response.Content ?? string.Empty;
    }
}`;

const blazorComponent = `@* ChatWidget.razor — drop this anywhere in your Blazor app *@
@inject ChatService Chat

<div class="chat-container">
    @foreach (var msg in _messages)
    {
        <div class="message @(msg.IsUser ? "user" : "assistant")">
            @msg.Content
        </div>
    }

    <div class="input-row">
        <input @bind="_input" @onkeydown="HandleKey"
               placeholder="Ask anything..." />
        <button @onclick="Send" disabled="@_loading">
            @(_loading ? "Thinking..." : "Send")
        </button>
    </div>
</div>

@code {
    private string _input  = "";
    private bool   _loading = false;
    private List<(string Content, bool IsUser)> _messages = [];

    private async Task Send()
    {
        if (string.IsNullOrWhiteSpace(_input)) return;
        _messages.Add((_input, true));
        var prompt = _input;
        _input   = "";
        _loading = true;
        var reply = await Chat.SendMessageAsync(prompt);
        _messages.Add((reply, false));
        _loading = false;
    }

    private async Task HandleKey(KeyboardEventArgs e)
    {
        if (e.Key == "Enter") await Send();
    }
}`;

const ragPattern = `// RAG (Retrieval-Augmented Generation) — add your own data
// 1. Store your documents as embeddings
var memory = kernel.GetRequiredService<ISemanticTextMemory>();

await memory.SaveInformationAsync(
    collection: "product-docs",
    text:       "Our return policy allows returns within 30 days...",
    id:         "policy-001"
);

// 2. Retrieve relevant context before answering
var results = memory.SearchAsync("product-docs", userQuestion, limit: 3);
var context = string.Join("\\n", await results.Select(r => r.Metadata.Text).ToListAsync());

// 3. Inject context into the prompt
var prompt = $"""
    Answer based only on this context:
    {context}

    Question: {userQuestion}
""";`;

// ── Data ─────────────────────────────────────────────────────────────────────
const useCases = [
  { icon: <MessageSquare className="w-5 h-5 text-blue-400" />,  title: "AI Customer Support Chat",  desc: "Replace FAQ pages with a chat widget that answers from your actual documentation. Blazor + Semantic Kernel + your PDF/Word knowledge base." },
  { icon: <Database       className="w-5 h-5 text-teal-400" />, title: "Smart Data Extraction",    desc: "Users upload invoices, contracts, or forms — AI extracts structured data automatically into your MS-SQL database. No manual entry." },
  { icon: <Cpu            className="w-5 h-5 text-purple-400" />, title: "Intelligent Report Generator", desc: "AI reads your database, understands context, and generates human-readable reports or summaries on demand. Works in WPF dashboards too." },
  { icon: <Shield         className="w-5 h-5 text-orange-400" />, title: "AI-Assisted Code Review", desc: "Internal developer tool: paste a C# function, get an AI review with security, performance, and style feedback — all within your .NET tooling." },
  { icon: <Zap            className="w-5 h-5 text-green-400" />,  title: "Process Automation Agent", desc: "AI that reads emails, classifies them, and triggers business workflows in your existing ASP.NET Core app — no manual routing." },
  { icon: <Layers         className="w-5 h-5 text-pink-400" />,   title: "Semantic Search",          desc: "Go beyond keyword search — let users find records, documents, or products by meaning. Embedding-based search over your existing SQL data." },
];

const stack = [
  { name: "Semantic Kernel",    role: "Orchestration layer — connects your .NET app to AI models, memory, and plugins",                     badge: "Microsoft",   color: "blue"   },
  { name: "Azure OpenAI",       role: "Enterprise AI models (GPT-4o, text-embedding-3) with data privacy, no training on your data",        badge: "Microsoft",   color: "blue"   },
  { name: "OpenAI API",         role: "Direct OpenAI access — simpler for smaller projects, no Azure setup required",                       badge: "OpenAI",      color: "teal"   },
  { name: "Qdrant / pgvector",  role: "Vector database for semantic search and RAG — stores AI embeddings alongside your SQL data",          badge: "Open Source", color: "purple" },
  { name: "Blazor Server/WASM", role: "Renders the AI chat UI in real-time — SignalR connection shows streaming tokens as they arrive",      badge: "Microsoft",   color: "blue"   },
  { name: "Hangfire",           role: "Runs AI processing jobs in the background — batch embedding, scheduled summarisation, async pipelines", badge: "Open Source", color: "orange" },
];

const colorMap: Record<string, string> = {
  blue:   "bg-blue-500/10   border-blue-500/25   text-blue-400",
  teal:   "bg-teal-500/10   border-teal-500/25   text-teal-400",
  purple: "bg-purple-500/10 border-purple-500/25 text-purple-400",
  orange: "bg-orange-500/10 border-orange-500/25 text-orange-400",
  green:  "bg-green-500/10  border-green-500/25  text-green-400",
  pink:   "bg-pink-500/10   border-pink-500/25   text-pink-400",
};

export default function AIIntegrationPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <ScrollReveal>
          <div className="mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/8 text-blue-400 text-xs font-semibold mb-5">
              <Brain className="w-3.5 h-3.5" />
              AI + .NET Integration Guide
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mt-2 mb-5 leading-tight">
              Add AI to Your{" "}
              <span className="gradient-text">.NET Application</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              AI features are no longer optional for competitive software — clients are asking for
              them in every project. This page covers the architecture, tools, and C# code patterns
              for integrating Azure OpenAI and Semantic Kernel into real Blazor and ASP.NET Core apps.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              The live demo below isn&apos;t a mockup — it&apos;s a working AI assistant running directly
              inside this portfolio, built with the exact same patterns described here.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Live Demo ── */}
        <ScrollReveal delay={0.1}>
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/30" />
              <span className="font-mono text-blue-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Live Demo
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/30" />
            </div>
            <p className="text-center text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
              This is a real AI integration — not a chatbot script. Ask it anything about .NET + AI.
              It demonstrates exactly what can be embedded in your Blazor or ASP.NET Core application.
            </p>
            <div className="max-w-2xl mx-auto">
              <AIDemoWidget />
            </div>
            <p className="text-center text-xs text-muted-foreground/60 mt-3">
              Powered by Claude AI · Rate-limited to prevent abuse · Your messages are not stored
            </p>
          </div>
        </ScrollReveal>

        {/* ── Why AI in .NET now ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              The Shift
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-5">
              Why .NET + AI is the biggest opportunity right now
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />,
                  title: "Clients are asking — every project",
                  desc: "In the last year, 'can you add AI to this?' has become the most common question in .NET project discussions. Businesses that can't answer yes are losing contracts.",
                },
                {
                  icon: <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />,
                  title: "The .NET ecosystem is AI-ready today",
                  desc: "Microsoft's Semantic Kernel SDK is production-stable, Azure OpenAI is enterprise-compliant, and Blazor's real-time model is ideal for streaming AI responses.",
                },
                {
                  icon: <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />,
                  title: "Your existing C# codebase is the advantage",
                  desc: "You don't rebuild your app. Semantic Kernel integrates as an injectable service — your business logic, database, and APIs stay exactly as they are. AI is added on top.",
                },
                {
                  icon: <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />,
                  title: "Most .NET developers aren't doing it yet",
                  desc: "This creates a clear window. Early adopters — developers who can confidently architect .NET + AI solutions — command significantly higher rates and more interesting projects.",
                },
              ].map((item) => (
                <div key={item.title} className="glass-card rounded-2xl p-6 flex items-start gap-4">
                  {item.icon}
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Architecture ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Architecture
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-3">
              How it fits into your .NET app
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              The pattern is the same regardless of whether you&apos;re building a new Blazor app or
              adding AI to an existing ASP.NET Core project.
            </p>

            {/* Architecture — responsive card flow (mobile-friendly, no SVG text issues) */}
            <p className="text-xs text-muted-foreground mb-4 font-mono uppercase tracking-wider">
              Typical .NET AI Integration Architecture
            </p>

            {/* Mobile: vertical stack. md+: horizontal flow */}
            <div className="glass-card rounded-2xl p-5 sm:p-8 mb-8">
              {/* Desktop row */}
              <div className="hidden md:flex items-center gap-2">
                {[
                  { label: "Blazor UI",       sub: "Component",        color: "border-blue-500/50   bg-blue-500/10   text-blue-400"   },
                  { label: "ChatService",      sub: "C# Injectable",    color: "border-purple-500/50 bg-purple-500/10 text-purple-400" },
                  { label: "Semantic Kernel",  sub: "Orchestrator",     color: "border-teal-500/50   bg-teal-500/10   text-teal-400"   },
                  { label: "Azure OpenAI",     sub: "GPT-4o / Embed.",  color: "border-orange-500/50 bg-orange-500/10 text-orange-400" },
                ].map((node, i, arr) => (
                  <div key={node.label} className="flex items-center gap-2 flex-1">
                    <div className={`flex-1 rounded-xl border-2 p-4 text-center ${node.color}`}>
                      <p className="font-display font-bold text-sm text-foreground">{node.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{node.sub}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="text-blue-400 font-bold text-lg shrink-0">→</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile: vertical stack with downward arrows */}
              <div className="md:hidden flex flex-col items-center gap-1">
                {[
                  { label: "Blazor UI",       sub: "Component",        color: "border-blue-500/50   bg-blue-500/10   text-blue-400"   },
                  { label: "ChatService",      sub: "C# Injectable",    color: "border-purple-500/50 bg-purple-500/10 text-purple-400" },
                  { label: "Semantic Kernel",  sub: "Orchestrator",     color: "border-teal-500/50   bg-teal-500/10   text-teal-400"   },
                  { label: "Azure OpenAI",     sub: "GPT-4o / Embed.",  color: "border-orange-500/50 bg-orange-500/10 text-orange-400" },
                ].map((node, i, arr) => (
                  <div key={node.label} className="w-full flex flex-col items-center gap-1">
                    <div className={`w-full rounded-xl border-2 p-4 text-center ${node.color}`}>
                      <p className="font-display font-bold text-sm text-foreground">{node.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{node.sub}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="text-blue-400 font-bold text-xl">↓</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Vector DB note */}
              <div className="mt-4 flex items-center gap-2 justify-center md:justify-end">
                <div className="h-px flex-1 border-t border-teal-500/20 border-dashed md:max-w-[180px]" />
                <span className="text-xs text-teal-400 border border-teal-500/30 bg-teal-500/8 rounded-lg px-3 py-1.5 whitespace-nowrap">
                  ⬆ Vector DB / Memory (optional)
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Code examples ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Code Patterns
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-8">
              Real C# implementation
            </h2>

            <div className="space-y-8">
              {[
                {
                  title: "1. Set up Semantic Kernel in Program.cs",
                  desc:  "Register Semantic Kernel as a singleton service — it becomes injectable throughout your entire Blazor or ASP.NET Core app.",
                  code:  semanticKernelSetup,
                },
                {
                  title: "2. ChatService — your AI conversation layer",
                  desc:  "An injectable C# service that manages conversation history and calls the AI model. Clean separation from your UI.",
                  code:  blazorChatService,
                },
                {
                  title: "3. Blazor component — drop-in chat UI",
                  desc:  "A Razor component that injects ChatService and handles user input. This is the same pattern used by the live demo above.",
                  code:  blazorComponent,
                },
                {
                  title: "4. RAG pattern — AI that knows your business data",
                  desc:  "Retrieval-Augmented Generation lets the AI answer from your own documents, policies, or product data — not just general knowledge.",
                  code:  ragPattern,
                },
              ].map((block) => (
                <div key={block.title} className="glass-card rounded-2xl overflow-hidden border-blue-500/10">
                  <div className="px-6 py-5 border-b border-border/60 flex items-start gap-3">
                    <Code2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-display font-bold text-foreground">{block.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{block.desc}</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                  <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono text-foreground dark:text-blue-100 leading-relaxed bg-muted/60 m-0 rounded-none overflow-x-auto">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Stack ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Tech Stack
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-8">
              The recommended toolchain
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {stack.map((s) => (
                <div key={s.name} className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:border-blue-500/20 transition-all">
                  <div className="shrink-0 mt-0.5">
                    <span className={cn("inline-flex px-2 py-0.5 rounded-md border text-xs font-mono font-medium", colorMap[s.color] ?? colorMap.blue)}>
                      {s.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-1">{s.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Use cases ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Use Cases
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-3">
              What clients are asking for
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl">
              These are the AI feature requests that come up most often in .NET project discussions right now.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {useCases.map((u, i) => (
                <ScrollReveal key={u.title} delay={i * 0.07}>
                  <div className="glass-card rounded-2xl p-6 h-full flex flex-col gap-3 hover:border-blue-500/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border flex items-center justify-center">
                      {u.icon}
                    </div>
                    <h3 className="font-display font-bold text-foreground">{u.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{u.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── CTA ── */}
        <ScrollReveal>
          <div className="glass-card rounded-2xl p-6 sm:p-10 md:p-14 text-center relative overflow-hidden border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-teal-500/5 pointer-events-none" />
            <div className="relative">
              <Brain className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-3">
                Want AI features in your .NET app?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                The architecture above is exactly how I approach AI integration projects.
                If you have an existing .NET application and want to add AI features —
                or you&apos;re building something new with AI at the core — let&apos;s talk.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-xl transition-all shadow-xl shadow-blue-500/25 hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-5 h-5" />
                  Discuss Your Project
                </Link>
                <Link
                  href="/estimator"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 font-semibold text-lg rounded-xl transition-all hover:-translate-y-0.5"
                >
                  Estimate AI Project Cost
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}


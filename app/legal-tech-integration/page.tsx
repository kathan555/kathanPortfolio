import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale, RefreshCw, Clock, ShieldCheck, Workflow, ArrowRight,
  MessageSquare, Code2, AlertTriangle, CheckCircle2, Link2,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Clio & Lawmatics Integration Developer — Law Firm Automation in .NET",
  description:
    "Custom Clio, Lawmatics, Zoom and Box integrations built in ASP.NET Core and Hangfire. OAuth 2.0, scheduled sync, idempotent writes. Built a production pipeline that removed 10+ hours of manual data entry a week. Fixed-scope quotes, remote worldwide.",
  keywords: [
    "Clio integration developer",
    "Clio API integration",
    "Lawmatics integration developer",
    "Lawmatics API integration",
    "Clio Lawmatics sync",
    "legal practice management integration",
    "law firm software automation",
    "law firm workflow automation developer",
    "Clio Manage API developer",
    "legal tech developer for hire",
    "custom legal software developer",
    "Zoom recording integration law firm",
    "Box integration legal",
    "legal data migration developer",
    ".NET legal tech consultant",
    "ASP.NET Core integration developer",
    "Hangfire background jobs developer",
    "OAuth 2.0 integration developer",
    "hire integration developer USA",
    "legal tech developer UK",
    "law firm automation consultant Australia",
    "Kathan N. Patel",
  ],
  authors: [{ name: "Kathan N. Patel" }],
  creator: "Kathan N. Patel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://kathanpatel.vercel.app/legal-tech-integration",
  },
  openGraph: {
    title: "Clio & Lawmatics Integration Developer | Kathan N. Patel",
    description:
      "Custom legal practice management integrations in .NET — Clio, Lawmatics, Zoom, Box. OAuth 2.0, scheduled sync, no duplicate records. Fixed-scope quotes.",
    url: "https://kathanpatel.vercel.app/legal-tech-integration",
    siteName: "Kathan N. Patel",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://kathanpatel.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clio & Lawmatics Integration Developer — Kathan N. Patel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clio & Lawmatics Integration Developer | Kathan N. Patel",
    description:
      "Custom legal practice management integrations in .NET — Clio, Lawmatics, Zoom, Box. Built to run unattended.",
    images: ["https://kathanpatel.vercel.app/og-image.png"],
  },
};

/* ── Code snippets ───────────────────────────────────────────────────────────
   Shown as static blocks. These are the three patterns that decide whether a
   practice-management integration survives contact with production: token
   refresh, scheduled execution, and idempotent writes. */

const oauthRefresh = `// ClioTokenStore.cs — refresh before expiry, never on 401
// Clio access tokens are short-lived; the refresh token is the asset.
// Persist it encrypted, and treat a failed refresh as an alert, not a retry.
public class ClioTokenStore(IDbContextFactory<AppDb> dbFactory, IHttpClientFactory http)
{
    private static readonly TimeSpan Skew = TimeSpan.FromMinutes(5);

    public async Task<string> GetAccessTokenAsync(int firmId, CancellationToken ct)
    {
        await using var db = await dbFactory.CreateDbContextAsync(ct);
        var creds = await db.OAuthCredentials
            .SingleAsync(c => c.FirmId == firmId && c.Provider == "clio", ct);

        if (DateTimeOffset.UtcNow < creds.ExpiresAt - Skew)
            return creds.AccessToken;

        var client = http.CreateClient("clio");
        var res = await client.PostAsync("/oauth/token", new FormUrlEncodedContent(new
            Dictionary<string, string>
            {
                ["grant_type"]    = "refresh_token",
                ["refresh_token"] = creds.RefreshToken,
                ["client_id"]     = _opts.ClientId,
                ["client_secret"] = _opts.ClientSecret,
            }), ct);

        // A dead refresh token means the firm must re-authorise — surface it,
        // don't silently swallow it into a retry loop.
        if (!res.IsSuccessStatusCode)
            throw new ReauthorisationRequiredException(firmId, "clio");

        var token = await res.Content.ReadFromJsonAsync<TokenResponse>(ct);
        creds.AccessToken  = token!.AccessToken;
        creds.RefreshToken = token.RefreshToken ?? creds.RefreshToken;
        creds.ExpiresAt    = DateTimeOffset.UtcNow.AddSeconds(token.ExpiresIn);
        await db.SaveChangesAsync(ct);

        return creds.AccessToken;
    }
}`;

const hangfireJob = `// Program.cs — one recurring job per firm, per direction.
// Separate jobs mean one firm's rate limit never stalls another's sync.
RecurringJob.AddOrUpdate<ContactSyncJob>(
    recurringJobId: $"clio-to-lawmatics-{firm.Id}",
    job:            j => j.RunAsync(firm.Id, CancellationToken.None),
    cronExpression: Cron.Hourly,
    new RecurringJobOptions { TimeZone = firm.TimeZone });

// ContactSyncJob.cs — cursor-based, so a restart resumes instead of replaying
[DisableConcurrentExecution(timeoutInSeconds: 300)]
[AutomaticRetry(Attempts = 3, DelaysInSeconds = [60, 300, 900])]
public class ContactSyncJob(ClioClient clio, LawmaticsClient lawmatics, ISyncCursor cursor)
{
    public async Task RunAsync(int firmId, CancellationToken ct)
    {
        var since = await cursor.GetAsync(firmId, "contacts", ct);
        var page  = await clio.GetContactsUpdatedSinceAsync(firmId, since, ct);

        foreach (var contact in page.Items)
        {
            await lawmatics.UpsertContactAsync(firmId, contact, ct);
            // Advance per record, not per page — a mid-page failure resumes
            // exactly where it stopped rather than reprocessing the page.
            await cursor.SetAsync(firmId, "contacts", contact.UpdatedAt, ct);
        }
    }
}`;

const idempotentUpsert = `// LawmaticsClient.cs — the rule that prevents duplicate client records.
// Never "create if search returns nothing" — two overlapping runs both search,
// both find nothing, and the firm ends up with two of every contact.
// Key on a stable external id instead.
public async Task UpsertContactAsync(int firmId, ClioContact src, CancellationToken ct)
{
    var externalKey = $"clio:{src.Id}";

    await using var db = await _dbFactory.CreateDbContextAsync(ct);
    var map = await db.ContactMappings
        .SingleOrDefaultAsync(m => m.FirmId == firmId && m.ExternalKey == externalKey, ct);

    if (map is not null)
    {
        await PatchAsync(map.LawmaticsId, src, ct);
        return;
    }

    var created = await CreateAsync(src, ct);

    // Unique index on (FirmId, ExternalKey) is what actually enforces this —
    // the check above is an optimisation, the constraint is the guarantee.
    db.ContactMappings.Add(new ContactMapping
    {
        FirmId      = firmId,
        ExternalKey = externalKey,
        LawmaticsId = created.Id,
    });
    await db.SaveChangesAsync(ct);
}`;

/* ── Content data ── */

const painPoints = [
  {
    icon: <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />,
    title: "The same client typed into three systems",
    desc: "A new matter gets entered in Lawmatics during intake, again in Clio when it becomes a matter, and again in the billing sheet. Every re-entry is a chance for the phone number to drift.",
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />,
    title: "Zoom recordings that never reach the matter file",
    desc: "The consultation happened, the recording exists, and nobody can find it six weeks later because it lives in a Zoom cloud folder instead of attached to the matter it belongs to.",
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />,
    title: "Zapier that works until it quietly doesn't",
    desc: "No-code connectors handle the happy path. They don't handle rate limits, partial failures, or a token expiring on a Friday night — and they rarely tell you they stopped.",
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />,
    title: "Reporting that requires a human with a spreadsheet",
    desc: "Intake conversion, matter aging, source attribution — the data exists across Clio and Lawmatics, but nothing joins it, so someone exports CSVs once a month.",
  },
];

const platforms = [
  { name: "Clio Manage",   role: "Matters, contacts, activities, custom fields, documents. OAuth 2.0 with refresh-token rotation and per-firm rate limits.", badge: "Practice Mgmt", color: "blue" },
  { name: "Lawmatics",     role: "Intake forms, pipelines, contacts, events. Webhook-driven where available, polled with cursors where it isn't.",          badge: "CRM / Intake",  color: "purple" },
  { name: "Zoom",          role: "Cloud recordings, transcripts, and meeting metadata pulled down and filed against the correct matter automatically.",     badge: "Meetings",      color: "teal"   },
  { name: "Box",           role: "Document storage with folder structures derived from matter data, so the file tree matches how the firm actually thinks.", badge: "Documents",     color: "orange" },
  { name: "ASP.NET Core",  role: "The service that owns the sync. Testable, observable, and deployed wherever the firm's IT policy allows.",                 badge: "Runtime",       color: "blue"   },
  { name: "Hangfire",      role: "Scheduling, retries with backoff, and a dashboard the firm can look at to confirm last night's run actually ran.",         badge: "Jobs",          color: "green"  },
];

const colorMap: Record<string, string> = {
  blue:   "bg-blue-500/10   border-blue-500/25   text-blue-400",
  teal:   "bg-rose-500/10   border-rose-500/25   text-rose-400",
  purple: "bg-purple-500/10 border-purple-500/25 text-purple-400",
  orange: "bg-orange-500/10 border-orange-500/25 text-orange-400",
  green:  "bg-green-500/10  border-green-500/25  text-green-400",
};

const flowNodes = [
  { label: "Clio",       sub: "Matters, contacts",  color: "border-blue-500/50   bg-blue-500/10   text-blue-400"   },
  { label: "Sync Engine", sub: "ASP.NET Core",      color: "border-purple-500/50 bg-purple-500/10 text-purple-400" },
  { label: "Hangfire",   sub: "Schedule + retry",   color: "border-green-500/50  bg-green-500/10  text-green-400"  },
  { label: "Lawmatics",  sub: "Intake, pipelines",  color: "border-orange-500/50 bg-orange-500/10 text-orange-400" },
];

/* Engagement shapes. Ranges are indicative starting points for scoping
   conversations, not quotes — every firm's field mapping is different, and
   the mapping is what drives the number. */
const engagements = [
  {
    icon: <Link2 className="w-5 h-5 text-blue-400" />,
    title: "Single-direction sync",
    scope: "One platform to another, one object type — for example Lawmatics intake contacts pushed into Clio as matters.",
    timeline: "2–3 weeks",
    note: "The usual starting point. Proves the integration works on real firm data before scope grows.",
  },
  {
    icon: <RefreshCw className="w-5 h-5 text-purple-400" />,
    title: "Two-way sync with conflict rules",
    scope: "Both systems can write. Requires deciding, per field, which system wins when both changed since the last run.",
    timeline: "4–8 weeks",
    note: "The conflict rules are a business decision, not a technical one — that conversation is part of the work.",
  },
  {
    icon: <Workflow className="w-5 h-5 text-rose-400" />,
    title: "Full automation pipeline",
    scope: "Multiple platforms, documents and recordings included, plus a reporting layer that joins data across systems.",
    timeline: "8–16 weeks",
    note: "This is the shape of the pipeline I built connecting Clio, Lawmatics, Zoom and Box for a firm's admin workflow.",
  },
];

const faqs = [
  {
    q: "Do you work with Clio Manage and Clio Grow both?",
    a: "Yes. They're separate APIs with different data models, and a firm running both usually has the worst duplication problem — the same person exists as a Grow lead and a Manage contact with no link between them. Reconciling those two is often the first piece of work worth doing.",
  },
  {
    q: "We already use Zapier. Why would we pay for custom work?",
    a: "If Zapier is working, keep it. Custom work earns its cost when you hit one of three walls: volume that makes per-task pricing painful, logic that Zapier can't express (conditional field mapping, deduplication against existing records, multi-step rollback), or a compliance requirement that client data cannot transit a third-party processor. Below those walls, a no-code connector is the cheaper answer and I'll tell you so.",
  },
  {
    q: "Where does client data actually go?",
    a: "Wherever your policy requires. The sync service is a standard ASP.NET Core application — it can run in your Azure tenant, your AWS account, or on-premise. It holds OAuth credentials and a mapping table; it does not need to warehouse matter content unless you specifically want a reporting store.",
  },
  {
    q: "What happens when an API changes or a token expires?",
    a: "Token refresh is handled ahead of expiry rather than reactively on a 401, and a genuinely dead refresh token raises an alert to a human instead of retrying forever. For API changes, the integration layer is isolated behind an interface per platform, so a breaking change touches one adapter rather than the whole pipeline.",
  },
  {
    q: "Can you take over an integration someone else built?",
    a: "Often, yes. The first step is a short paid review — reading the code, the job schedule, and the error history — before committing to a rebuild-or-repair recommendation. Sometimes the honest answer is that repairing costs more than rebuilding, and it's better to find that out in week one.",
  },
  {
    q: "How do you handle firms outside India?",
    a: "All of this work is remote. I've delivered on US and UK business hours with overlap for standups and weekly demos, and I work in fixed scopes with defined deliverables so timezone gaps don't turn into status anxiety.",
  },
];

export default function LegalTechIntegrationPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://kathanpatel.vercel.app/legal-tech-integration#service",
    name: "Legal Practice Management Integration Development",
    serviceType: "Custom software integration for law firms",
    description:
      "Custom integrations between Clio, Lawmatics, Zoom, Box and other legal practice management platforms, built in ASP.NET Core with Hangfire background jobs and OAuth 2.0.",
    provider: { "@id": "https://kathanpatel.vercel.app/#person" },
    areaServed: "Worldwide",
    url: "https://kathanpatel.vercel.app/legal-tech-integration",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <ScrollReveal>
          <div className="mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/8 text-blue-400 text-xs font-semibold mb-5">
              <Scale className="w-3.5 h-3.5" />
              Legal Tech Integration
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mt-2 mb-5 leading-tight">
              Stop typing the same client into{" "}
              <span className="gradient-text">three systems</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Most firms don&apos;t have a software problem — they have a{" "}
              <em>between-software</em> problem. Clio holds the matters, Lawmatics holds
              the intake, Zoom holds the calls, Box holds the documents, and a person
              holds it all together by hand.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              I build the layer that connects them: ASP.NET Core services with OAuth 2.0,
              Hangfire scheduling, and write logic designed so a retry never creates a second
              copy of your client. The most recent pipeline I built along these lines removed
              more than ten hours a week of manual data entry from a firm&apos;s admin workload.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4" />
                Describe your stack
              </Link>
              <Link
                href="/free-project-cost-estimator"
                className="inline-flex items-center gap-2 px-6 py-3 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 font-medium rounded-xl transition-all hover:-translate-y-0.5"
              >
                Estimate the cost
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* ── The problem ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              The Problem
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-3">
              What actually goes wrong
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              None of these are dramatic failures. That&apos;s what makes them expensive —
              they show up as a slow tax on admin time rather than an outage anyone escalates.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {painPoints.map((item) => (
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
              How the sync layer sits between your tools
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Neither platform becomes the other&apos;s dependency. A separate service owns
              the mapping, the schedule, and the failure handling — so either vendor can
              change without the other one breaking.
            </p>

            <p className="text-xs text-muted-foreground mb-4 font-mono uppercase tracking-wider">
              Typical Practice Management Sync Architecture
            </p>

            <div className="glass-card rounded-2xl p-5 sm:p-8 mb-8">
              {/* Desktop row */}
              <div className="hidden md:flex items-center gap-2">
                {flowNodes.map((node, i, arr) => (
                  <div key={node.label} className="flex items-center gap-2 flex-1">
                    <div className={`flex-1 rounded-xl border-2 p-4 text-center ${node.color}`}>
                      <p className="font-display font-bold text-sm text-foreground">{node.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{node.sub}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="text-blue-400 font-bold text-lg shrink-0">⇄</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile: vertical stack */}
              <div className="md:hidden flex flex-col items-center gap-1">
                {flowNodes.map((node, i, arr) => (
                  <div key={node.label} className="w-full flex flex-col items-center gap-1">
                    <div className={`w-full rounded-xl border-2 p-4 text-center ${node.color}`}>
                      <p className="font-display font-bold text-sm text-foreground">{node.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{node.sub}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="text-blue-400 font-bold text-xl">⇅</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 justify-center md:justify-end">
                <div className="h-px flex-1 border-t border-rose-500/20 border-dashed md:max-w-[180px]" />
                <span className="text-xs text-rose-400 border border-rose-500/30 bg-rose-500/8 rounded-lg px-3 py-1.5 whitespace-nowrap">
                  ⬆ Mapping table + audit log
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: <ShieldCheck className="w-5 h-5 text-rose-400" />, title: "Credentials stay yours", desc: "OAuth tokens live encrypted in your database, in your infrastructure. No third-party processor sits in the path." },
                { icon: <Clock className="w-5 h-5 text-blue-400" />,       title: "Schedules you can inspect", desc: "Hangfire's dashboard shows the last run, the next run, and every failure with its stack trace." },
                { icon: <CheckCircle2 className="w-5 h-5 text-green-400" />, title: "Safe to re-run", desc: "Every write keys off a stable external id, enforced by a unique index. Running the job twice changes nothing." },
              ].map((c) => (
                <div key={c.title} className="glass-card rounded-2xl p-5">
                  <div className="mb-3">{c.icon}</div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-1">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Code patterns ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Code Patterns
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-3">
              The three things that decide whether it survives production
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Integrations rarely fail at the API call. They fail at token expiry, at
              restart, and at the second write. Here&apos;s how each is handled.
            </p>

            <div className="space-y-8">
              {[
                {
                  title: "1. Refresh tokens before expiry, not after a 401",
                  desc:  "Reactive refresh means every token expiry costs you a failed batch. Refreshing ahead of the window costs nothing and never surprises anyone.",
                  code:  oauthRefresh,
                },
                {
                  title: "2. Scheduled jobs with cursors, so a restart resumes",
                  desc:  "Per-firm recurring jobs with per-record cursor advancement. A crash halfway through a page picks up at the next record instead of replaying the batch.",
                  code:  hangfireJob,
                },
                {
                  title: "3. Idempotent writes — the duplicate-record fix",
                  desc:  "The single most common defect in legal integrations is duplicated client records. The fix is an external-key mapping table with a unique index, not a search-before-create.",
                  code:  idempotentUpsert,
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

        {/* ── Platforms ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Platforms
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-8">
              What I&apos;ve connected
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {platforms.map((s) => (
                <div key={s.name} className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:border-blue-500/20 transition-all">
                  <div className="shrink-0 mt-0.5">
                    <span className={cn("inline-flex px-2 py-0.5 rounded-md border text-xs font-mono font-medium whitespace-nowrap", colorMap[s.color] ?? colorMap.blue)}>
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
            <p className="text-xs text-muted-foreground/70 mt-5 max-w-2xl leading-relaxed">
              Not on the list? Most practice management platforms expose a REST API with
              OAuth 2.0 — the patterns above transfer. MyCase, PracticePanther, Smokeball
              and Filevine all fit the same shape.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Engagement shapes ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              Scope &amp; Timeline
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-3">
              Three shapes this work usually takes
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              The variable that drives cost isn&apos;t the number of platforms — it&apos;s the
              number of fields that need mapping and how many of them disagree.
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              {engagements.map((e) => (
                <div key={e.title} className="glass-card rounded-2xl p-6 flex flex-col gap-3 hover:border-blue-500/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-muted/60 border border-border flex items-center justify-center">
                    {e.icon}
                  </div>
                  <h3 className="font-display font-bold text-foreground">{e.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{e.scope}</p>
                  <div className="pt-3 border-t border-border/60">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground/70 mb-1">
                      Typical duration
                    </p>
                    <p className="font-display font-bold text-blue-400">{e.timeline}</p>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed italic">{e.note}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/70 mt-5 max-w-2xl leading-relaxed">
              Durations are indicative starting points for a scoping conversation, not quotes.
              A fixed price follows a short discovery call where we walk the actual field
              mappings — that call is free and there&apos;s no obligation attached to it.
            </p>
          </div>
        </ScrollReveal>

        {/* ── FAQ ── */}
        <ScrollReveal>
          <div className="mb-16">
            <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
              FAQ
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-8">
              Questions firms actually ask
            </h2>
            <div className="space-y-4">
              {faqs.map((f) => (
                <details key={f.q} className="glass-card rounded-2xl px-6 py-5 group">
                  <summary className="font-display font-bold text-foreground cursor-pointer list-none flex items-start justify-between gap-4">
                    <span>{f.q}</span>
                    <span className="text-blue-400 shrink-0 transition-transform group-open:rotate-45 text-xl leading-none">
                      +
                    </span>
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── CTA ── */}
        <ScrollReveal>
          <div className="glass-card rounded-2xl p-6 sm:p-10 md:p-14 text-center relative overflow-hidden border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-rose-500/5 pointer-events-none" />
            <div className="relative">
              <Scale className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-3">
                Tell me what your stack looks like
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                Which platforms, which records get double-entered, and roughly how many
                hours a week it costs. That&apos;s enough for me to tell you whether this
                is a two-week fix, a two-month project, or something Zapier already solves.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-xl transition-all shadow-xl shadow-blue-500/25 hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start the conversation
                </Link>
                <Link
                  href="/blog/legal-tech-automation-clio-lawmatics-zoom-box-hangfire-dotnet"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 font-semibold text-lg rounded-xl transition-all hover:-translate-y-0.5"
                >
                  Read the build write-up
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

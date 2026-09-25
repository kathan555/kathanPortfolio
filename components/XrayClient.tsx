"use client";

import { useEffect, useRef, useState } from "react";
import {
  ScanSearch, ShieldCheck, AlertTriangle, Target, Zap, Sparkles, Calendar, ArrowRight, RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import {
  XRAY_LIMITS, XRAY_LANGUAGES,
  type XrayLanguage, type XrayReport, type Severity,
} from "@/lib/legacy-xray-shared";
import { personalInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
   XrayClient — the interactive half of /legacy-code-xray.
   Posts to /api/xray (same engine and rate budget as the MCP server) and
   renders the structured report with the site's own components.
   ───────────────────────────────────────────────────────────────────────── */

const LANGUAGE_LABELS: Record<XrayLanguage, string> = {
  auto: "Auto-detect",
  csharp: "C#",
  vb: "VB.NET",
  aspx: "Web Forms (.aspx)",
  razor: "Razor",
  xaml: "XAML",
  config: "web.config / app.config",
  sql: "SQL",
};

/* Themed accent scales only, so every badge clears contrast in both modes.
   Medium is blue rather than yellow: yellow is highlight-only on this site. */
const SEVERITY_STYLE: Record<Severity, { label: string; badge: string; bar: string }> = {
  critical: { label: "Critical", badge: "bg-rose-500/10 border-rose-500/30 text-rose-400",          bar: "bg-rose-500"    },
  high:     { label: "High",     badge: "bg-orange-500/10 border-orange-500/30 text-orange-400",    bar: "bg-orange-500"  },
  medium:   { label: "Medium",   badge: "bg-blue-500/10 border-blue-500/30 text-blue-400",          bar: "bg-blue-500"    },
  low:      { label: "Low",      badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500", bar: "bg-emerald-500" },
};

const SCAN_STEPS = ["Detecting framework", "Mapping migration blockers", "Checking data access & security", "Planning the migration"];

/* A realistic Web Forms page. The hard-coded password is deliberate: it shows
   the redaction note in the report. */
const SAMPLE_CODE = `using System;
using System.Data.SqlClient;
using System.Web.UI;

public partial class Orders : System.Web.UI.Page
{
    private const string ConnStr =
        "Data Source=PROD-SQL01;Initial Catalog=Shop;User ID=sa;Password=Sup3rSecret!;";

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            ViewState["SortDir"] = "ASC";
            BindGrid(Request.QueryString["customer"]);
        }
    }

    private void BindGrid(string customer)
    {
        using (var conn = new SqlConnection(ConnStr))
        {
            var cmd = new SqlCommand(
                "SELECT * FROM Orders WHERE Customer = '" + customer + "'", conn);
            conn.Open();
            GridOrders.DataSource = cmd.ExecuteReader();
            GridOrders.DataBind();
        }
        Session["LastCustomer"] = customer;
    }

    protected void btnExport_Click(object sender, EventArgs e)
    {
        Response.ContentType = "application/vnd.ms-excel";
        GridOrders.RenderControl(new HtmlTextWriter(Response.Output));
        Response.End();
    }
}`;

type Result = { report: XrayReport; markdown: string; redactions: number };

const INPUT_CLASS =
  "w-full bg-background border border-border focus:border-blue-500/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors disabled:opacity-60";

export default function XrayClient() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<XrayLanguage>("auto");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // Cycle the status line while the analysis runs.
  useEffect(() => {
    if (!loading) return;
    setScanStep(0);
    const t = setInterval(() => setScanStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), 2600);
    return () => clearInterval(t);
  }, [loading]);

  // Bring the report (or the scanner) into view once it replaces the form.
  useEffect(() => {
    if (result || loading) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result, loading]);

  const len = code.trim().length;
  const tooShort = len < XRAY_LIMITS.minChars;

  const run = async () => {
    if (loading || tooShort) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/xray", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, context: context.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Something went wrong. Please try again.");
      setResult(data as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Form ── */}
      {!result && !loading && (
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                <ScanSearch className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-foreground">Paste your legacy code</p>
                <p className="text-xs text-muted-foreground">One representative file works best</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setCode(SAMPLE_CODE); setLanguage("csharp"); }}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Load sample code
            </button>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="xray-code" className="sr-only">Legacy code</label>
              <textarea
                id="xray-code"
                rows={14}
                spellCheck={false}
                maxLength={XRAY_LIMITS.maxChars}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={"Paste a Web Forms page with its code-behind, a WinForms form, a WCF service,\na data-access class, or a web.config section..."}
                className="w-full bg-background border border-border focus:border-blue-500/50 rounded-xl px-4 py-3 font-mono text-xs sm:text-[13px] text-foreground placeholder:text-muted-foreground placeholder:font-body resize-y outline-none transition-colors leading-relaxed"
              />
              <div className="flex justify-between items-start mt-1 gap-3">
                <p className="text-xs text-muted-foreground/70">
                  C#, VB.NET, Web Forms, WinForms, WCF, ADO.NET, config files.
                </p>
                <p className={cn(
                  "text-xs whitespace-nowrap tabular-nums",
                  len >= XRAY_LIMITS.maxChars ? "text-rose-400" : tooShort ? "text-muted-foreground/70" : "text-emerald-500",
                )}>
                  {len.toLocaleString("en-US")} / {XRAY_LIMITS.maxChars.toLocaleString("en-US")}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-[0.8fr_1.2fr] gap-4">
              <div>
                <label htmlFor="xray-lang" className="block text-sm font-medium text-foreground mb-1.5">File type</label>
                <select
                  id="xray-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as XrayLanguage)}
                  className={INPUT_CLASS}
                >
                  {XRAY_LANGUAGES.map((l) => <option key={l} value={l}>{LANGUAGE_LABELS[l]}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="xray-context" className="block text-sm font-medium text-foreground mb-1.5">
                  Context <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  id="xray-context"
                  type="text"
                  maxLength={XRAY_LIMITS.maxContextChars}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. internal order portal, ~40 pages, must stay on-prem"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Your code is never stored or logged. It&apos;s analysed by Google Gemini, and likely secrets
                (passwords, keys, tokens) are redacted before it leaves this server. Don&apos;t paste code
                you aren&apos;t allowed to share.
              </span>
            </p>

            {error && (
              <p role="alert" className="text-sm text-rose-400 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={run}
              disabled={tooShort}
              className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-150 text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <ScanSearch className="w-4 h-4" />
              {tooShort ? `Paste at least ${XRAY_LIMITS.minChars} characters` : "Run the X-ray"}
            </button>
          </div>
        </div>
      )}

      <div ref={resultRef} className="scroll-mt-28">
        {/* ── Scanning: the submitted code under the site's scanner sweep ── */}
        {loading && (
          <div className="glass-card rounded-2xl p-6 sm:p-8" aria-live="polite">
            <div className="flex items-center gap-3 mb-5">
              <span className="relative flex w-3 h-3">
                <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-60" />
                <span className="relative w-3 h-3 rounded-full bg-blue-500" />
              </span>
              <p className="font-mono text-sm text-blue-400">{SCAN_STEPS[scanStep]}…</p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-muted/40 max-h-72">
              <pre className="font-mono text-[11px] sm:text-xs leading-relaxed text-muted-foreground p-4 whitespace-pre overflow-hidden select-none">
                {code.slice(0, 2400)}
              </pre>
              <div className="fx-scan" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Usually 10–20 seconds.</p>
          </div>
        )}

        {/* ── Report ── */}
        {result && <Report result={result} onReset={reset} />}
      </div>
    </div>
  );
}

function Report({ result, onReset }: { result: Result; onReset: () => void }) {
  const { report, markdown, redactions } = result;
  const { detected, target } = report;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <p className="font-mono text-xs text-blue-400 tracking-[0.2em] uppercase mb-2">X-ray result</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">{detected.framework}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {detected.language} · <span className="capitalize">{detected.confidence}</span> confidence
            </p>
          </div>
          <div className="flex gap-2">
            <CopyButton text={markdown} label="Copy as Markdown" />
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-blue-500/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New X-ray
            </button>
          </div>
        </div>

        {detected.signals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {detected.signals.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{report.summary}</p>

        {redactions > 0 && (
          <p className="text-xs text-emerald-500 mt-4 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            {redactions} likely secret{redactions > 1 ? "s were" : " was"} redacted before analysis.
          </p>
        )}
      </div>

      {!report.isDotNet ? (
        <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
          The X-ray is built for legacy .NET code: C#, VB.NET, Web Forms, WinForms, WCF and config files.
          Paste a .NET snippet for the full report.
        </div>
      ) : (
        <>
          {/* Risk map */}
          {report.risks.length > 0 && (
            <section className="glass-card rounded-2xl p-6 sm:p-8">
              <SectionTitle icon={<AlertTriangle className="w-4 h-4" />} title="Risk map" />
              <ul className="flex flex-col gap-3">
                {report.risks.map((risk) => {
                  const sev = SEVERITY_STYLE[risk.severity];
                  return (
                    <li key={risk.title} className="relative rounded-xl border border-border bg-background/50 p-4 pl-5 overflow-hidden">
                      <span className={cn("absolute left-0 inset-y-0 w-1", sev.bar)} aria-hidden />
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={cn("px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wide", sev.badge)}>
                          {sev.label}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">{risk.category}</span>
                      </div>
                      <p className="font-semibold text-foreground text-sm">{risk.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">{risk.detail}</p>
                      {risk.evidence && (
                        <code className="block mt-2 font-mono text-xs text-foreground/80 bg-muted/60 border border-border rounded-lg px-2.5 py-1.5 whitespace-pre-wrap break-words">
                          {risk.evidence}
                        </code>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Target */}
          {target.stack && (
            <section className="glass-card fx-holo fx-holo-live relative rounded-2xl p-6 sm:p-8 border-blue-500/25">
              <SectionTitle icon={<Target className="w-4 h-4" />} title="Recommended target" />
              <p className="font-display text-xl sm:text-2xl font-bold gradient-text leading-snug mb-2">{target.stack}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{target.rationale}</p>
            </section>
          )}

          {/* Migration plan */}
          {report.phases.length > 0 && (
            <section className="glass-card rounded-2xl p-6 sm:p-8">
              <SectionTitle icon={<ArrowRight className="w-4 h-4" />} title="Migration plan" />
              <p className="text-xs text-muted-foreground -mt-2 mb-5">Sizes are relative effort (S to XL), not a quote.</p>
              <ol className="relative flex flex-col gap-6 pl-8">
                <span className="timeline-line absolute left-[11px] top-2 bottom-2 w-px" aria-hidden />
                {report.phases.map((phase, i) => (
                  <li key={phase.name} className="relative">
                    <span className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-background border border-blue-500/40 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-display font-semibold text-foreground">{phase.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-400 font-mono text-[11px] font-bold">
                        {phase.size}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {phase.steps.map((step) => (
                        <li key={step} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                          <span className="text-blue-400 shrink-0">›</span>{step}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Quick wins + AI */}
          {(report.quickWins.length > 0 || report.aiOpportunities.length > 0) && (
            <div className="grid md:grid-cols-2 gap-5">
              {report.quickWins.length > 0 && (
                <section className="glass-card rounded-2xl p-6">
                  <SectionTitle icon={<Zap className="w-4 h-4" />} title="Quick wins" />
                  <BulletList items={report.quickWins} />
                </section>
              )}
              {report.aiOpportunities.length > 0 && (
                <section className="glass-card rounded-2xl p-6">
                  <SectionTitle icon={<Sparkles className="w-4 h-4" />} title="AI features it could offer" />
                  <BulletList items={report.aiOpportunities} />
                </section>
              )}
            </div>
          )}
        </>
      )}

      {/* CTA */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-rose-500/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            <p className="font-display text-lg font-bold text-foreground">
              {report.isDotNet ? "Want this migration done properly?" : "Have a .NET system to modernize?"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              The X-ray reads one file. A free 30-minute call covers the whole system.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={personalInfo.calendarBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="fx-sheen relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition-colors"
            >
              <Calendar className="w-4 h-4" /> Book a free call
            </a>
            <Link
              href="/hire"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 font-semibold rounded-xl text-sm transition-colors"
            >
              How I work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
      <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
        {icon}
      </span>
      {title}
    </h3>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
          <span className="text-blue-400 shrink-0">›</span>{item}
        </li>
      ))}
    </ul>
  );
}

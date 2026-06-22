'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { estimatePDFBase64, type EstimateResult } from '@/lib/estimate-pdf';
import { fmtUSD } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, string>;

type EmailDeliveryStatus = 'idle' | 'sending' | 'success' | 'error';

interface FormFields {
  description: string;
  techStack:   string;
  budget:      string;
  clientEmail: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DESC_MIN  = 30;
const DESC_MAX  = 2000;
const FIELD_MAX = 200;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM: FormFields = { description: '', techStack: '', budget: '', clientEmail: '' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Friendly error — never expose raw API/HTTP internals to the user
function getFriendlyError(raw: string): string {
  if (raw.startsWith('HTTP '))                    return 'Server error. Please try again in a moment.';
  if (/network|fetch|failed to fetch/i.test(raw)) return 'Network issue. Check your connection and try again.';
  if (/timeout/i.test(raw))                       return 'The request timed out. Please try again.';
  return "We couldn't generate your estimate. Please try again or contact me directly.";
}

async function deliverEstimateByEmail(
  result: EstimateResult,
  answers: Answers,
  token: string | null,
): Promise<void> {
  const clientEmail = answers.clientEmail?.trim();
  if (!clientEmail || !EMAIL_RE.test(clientEmail)) {
    throw new Error('A valid email address is required.');
  }

  const pdfBase64 = estimatePDFBase64(result, answers);

  const res = await fetch('/api/estimate/send-email', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ clientEmail, pdfBase64, token }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EstimatorClient() {
  const [fields,      setFields]      = useState<FormFields>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<FormFields>>({});
  const [loading,     setLoading]     = useState(false);
  const [apiError,    setApiError]    = useState('');
  const [emailStatus, setEmailStatus] = useState<EmailDeliveryStatus>('idle');
  const [emailError,  setEmailError]  = useState('');
  const [sentToEmail, setSentToEmail] = useState('');
  const [estimate,    setEstimate]    = useState<EstimateResult | null>(null);
  const [emailToken,  setEmailToken]  = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // Scroll to the result (or error) once it lands
  useEffect(() => {
    if (estimate || apiError) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [estimate, apiError]);

  const setField = (key: keyof FormFields) => (value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errors: Partial<FormFields> = {};
    const desc = fields.description.trim();

    if (desc.length < DESC_MIN) {
      errors.description = `Please describe your project in at least ${DESC_MIN} characters — the more detail, the better the estimate.`;
    }
    if (!EMAIL_RE.test(fields.clientEmail.trim())) {
      errors.clientEmail = 'Please enter a valid email address.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Build the answers object shared by the PDF and the email
  const buildAnswers = (): Answers => {
    const answers: Answers = {
      description: fields.description.trim(),
      clientEmail: fields.clientEmail.trim(),
    };
    if (fields.techStack.trim()) answers.techStack = fields.techStack.trim();
    if (fields.budget.trim())    answers.budget    = fields.budget.trim();
    return answers;
  };

  const sendEmail = async (result: EstimateResult, answers: Answers, token: string | null) => {
    setEmailStatus('sending');
    setEmailError('');
    setSentToEmail(answers.clientEmail);
    try {
      await deliverEstimateByEmail(result, answers, token);
      setEmailStatus('success');
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : 'Unknown error';
      console.error('[EstimatorClient] email error:', raw);
      setEmailStatus('error');
      setEmailError(getFriendlyError(raw));
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!validate()) return;

    const answers = buildAnswers();

    setLoading(true);
    setApiError('');
    setEstimate(null);
    setEmailStatus('idle');

    try {
      const res = await fetch('/api/estimate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // JSON.stringify drops undefined keys — blank optional fields are omitted,
        // matching the server's `techStack?` / `budget?` contract
        body:    JSON.stringify({
          description: answers.description,
          techStack:   answers.techStack,
          budget:      answers.budget,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      const { emailToken: token, ...result } =
        (await res.json()) as EstimateResult & { emailToken?: string | null };
      const tok = token ?? null;
      setEmailToken(tok);
      setEstimate(result);
      await sendEmail(result, answers, tok);
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : 'Unknown error';
      setApiError(getFriendlyError(raw));
    } finally {
      setLoading(false);
    }
  };

  // Resend only the email — the estimate already exists
  const retryEmail = async () => {
    if (!estimate || emailStatus === 'sending') return;
    await sendEmail(estimate, buildAnswers(), emailToken);
  };

  const reset = () => {
    setFields(EMPTY_FORM);
    setFieldErrors({});
    setLoading(false);
    setApiError('');
    setEmailStatus('idle');
    setEmailError('');
    setSentToEmail('');
    setEstimate(null);
    setEmailToken(null);
  };

  const descLen  = fields.description.length;
  const showForm = !estimate;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-sm">
            Describe your project once — the AI does the research, your estimate appears
            on screen and a PDF copy lands in your inbox
          </p>
        </div>

        {/* ── Single-step form ── */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  Tell me about your project
                </p>
                <p className="text-xs text-muted-foreground">
                  One form, everything in your own words — no technical jargon required
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">

              {/* Project details */}
              <div>
                <label htmlFor="est-description" className="block text-sm font-medium text-foreground mb-1.5">
                  Project details <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="est-description"
                  rows={7}
                  maxLength={DESC_MAX}
                  value={fields.description}
                  onChange={e => setField('description')(e.target.value)}
                  disabled={loading}
                  placeholder={
                    'Describe everything in plain English — what you want to build, the problem it solves, ' +
                    'key features, who will use it, expected timeline, team size, integrations (payments, auth, APIs), ' +
                    'and anything you have already researched or scoped...'
                  }
                  className="w-full bg-background border border-border focus:border-blue-500/50 rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-y outline-none transition-colors leading-relaxed disabled:opacity-60"
                />
                <div className="flex justify-between items-start mt-1 gap-3">
                  {fieldErrors.description
                    ? <p className="text-xs text-red-400">{fieldErrors.description}</p>
                    : <p className="text-xs text-muted-foreground/60">Features, goals, users, timeline, integrations — the more detail, the sharper the estimate.</p>}
                  <p className={`text-xs whitespace-nowrap transition-colors ${descLen >= DESC_MAX ? 'text-red-400' : 'text-muted-foreground/60'}`}>
                    {descLen}/{DESC_MAX}
                  </p>
                </div>
              </div>

              {/* Optional: stack + budget */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="est-stack" className="block text-sm font-medium text-foreground mb-1.5">
                    Preferred tech stack <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    id="est-stack"
                    type="text"
                    maxLength={FIELD_MAX}
                    value={fields.techStack}
                    onChange={e => setField('techStack')(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. Blazor Server, SQL Server, Stripe"
                    className="w-full bg-background border border-border focus:border-blue-500/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors disabled:opacity-60"
                  />
                  <p className="text-xs text-muted-foreground/60 mt-1">Leave blank and I&apos;ll recommend one.</p>
                </div>
                <div>
                  <label htmlFor="est-budget" className="block text-sm font-medium text-foreground mb-1.5">
                    Budget in mind <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    id="est-budget"
                    type="text"
                    maxLength={FIELD_MAX}
                    value={fields.budget}
                    onChange={e => setField('budget')(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. around $15,000, or quotes you received"
                    className="w-full bg-background border border-border focus:border-blue-500/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors disabled:opacity-60"
                  />
                  <p className="text-xs text-muted-foreground/60 mt-1">The estimate will be checked against it.</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="est-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Your email <span className="text-red-400">*</span>
                </label>
                <input
                  id="est-email"
                  type="email"
                  autoComplete="email"
                  value={fields.clientEmail}
                  onChange={e => setField('clientEmail')(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
                  disabled={loading}
                  placeholder="you@company.com"
                  className="w-full bg-background border border-border focus:border-blue-500/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors disabled:opacity-60"
                />
                {fieldErrors.clientEmail
                  ? <p className="text-xs text-red-400 mt-1">{fieldErrors.clientEmail}</p>
                  : <p className="text-xs text-muted-foreground/60 mt-1">Your PDF estimate is delivered here. No spam, ever.</p>}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-150 text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </span>
                    Analyzing your project & building the estimate...
                  </>
                ) : (
                  <>Get My Free Estimate →</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        <div ref={resultRef} className="flex flex-col gap-4 mt-6 scroll-mt-28">

          {/* API error */}
          {apiError && !loading && (
            <div className="glass-card rounded-2xl p-6 text-center border border-red-500/20">
              <p className="text-sm text-foreground mb-4">{apiError}</p>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-semibold transition-all"
              >
                ↺ Retry estimate
              </button>
            </div>
          )}

          {/* ── On-page estimate result ── */}
          {estimate && (
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-blue-500/20">

              {/* Range */}
              <div className="text-center mb-6">
                <p className="text-xs font-mono tracking-wide text-muted-foreground mb-2">
                  ESTIMATED BUDGET RANGE
                </p>
                <p className="font-display text-3xl sm:text-4xl font-bold text-blue-400 tabular-nums">
                  {fmtUSD(estimate.range_low)} – {fmtUSD(estimate.range_high)}
                </p>
              </div>

              {/* Summary */}
              <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-xl mx-auto mb-8">
                {estimate.summary}
              </p>

              {/* Phase breakdown */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-2.5 pr-4 font-medium">Phase</th>
                      <th className="py-2.5 pr-4 font-medium text-right">Hours</th>
                      <th className="py-2.5 pr-4 font-medium text-right">Rate</th>
                      <th className="py-2.5 font-medium text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimate.breakdown.filter(row => row.cost > 0).map(row => (
                      <tr key={row.phase} className="border-b border-border/50">
                        <td className="py-2.5 pr-4 text-foreground">{row.phase}</td>
                        <td className="py-2.5 pr-4 text-right text-muted-foreground tabular-nums">{row.hours}</td>
                        <td className="py-2.5 pr-4 text-right text-muted-foreground tabular-nums">${row.rate}/hr</td>
                        <td className="py-2.5 text-right text-foreground tabular-nums">{fmtUSD(row.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Risks */}
              {estimate.risks.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-display text-sm font-semibold text-foreground mb-3">
                    Key Risks to Watch
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {estimate.risks.map(risk => (
                      <li key={risk} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                        <span className="text-amber-400 flex-shrink-0">⚠</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended stack */}
              {estimate.recommended_stack && (
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                    Recommended Stack
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                    {estimate.recommended_stack}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Email sending ── */}
          {emailStatus === 'sending' && (
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Sending your PDF estimate to{" "}
                <span className="text-foreground font-medium">{sentToEmail}</span>...
              </p>
            </div>
          )}

          {/* ── Email sent successfully ── */}
          {emailStatus === 'success' && (
            <div className="glass-card rounded-2xl p-8 text-center border border-teal-500/20">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Estimate sent successfully
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Your PDF estimate has been emailed to{" "}
                <span className="text-foreground font-medium">{sentToEmail}</span>.
                Check your inbox and spam folder.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Book a Call
                </Link>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-blue-500/40 text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition-all"
                >
                  ↺ New Estimate
                </button>
              </div>
            </div>
          )}

          {/* ── Email failed ── */}
          {emailStatus === 'error' && (
            <div className="glass-card rounded-2xl p-8 text-center border border-red-500/20">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Failed to send estimate
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                {sentToEmail
                  ? <>Your estimate is shown above, but we could not deliver the PDF to <span className="text-foreground font-medium">{sentToEmail}</span>.</>
                  : 'Your estimate is shown above, but we could not deliver it by email.'}
              </p>
              {emailError && (
                <p className="text-xs text-red-400/90 mb-6">{emailError}</p>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={retryEmail}
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  ↺ Resend Email
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition-all"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

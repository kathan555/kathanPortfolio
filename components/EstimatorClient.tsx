'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { estimatePDFBase64, type EstimateResult } from '@/lib/estimate-pdf';

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, string>;

interface Option {
  label: string;
  sub?: string;
  value: string;
}

interface Step {
  msg: string;
  type: 'buttons' | 'text' | 'static';
  key: string;
  opts?: Option[];
  placeholder?: string;
}

interface BotMessage {
  id: string;
  role: 'bot';
  stepData: Step;
  answered: boolean;
}

interface UserMessage {
  id: string;
  role: 'user';
  text: string;
}

type Message = BotMessage | UserMessage;

type EmailDeliveryStatus = 'idle' | 'sending' | 'success' | 'error';

// ─── Constants ────────────────────────────────────────────────────────────────

const DESC_MAX = 800;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fix 13: flows extracted to module scope so getNextStep can guard indexOf === -1
const TECH_FLOW     = ['user_type', 'tech_type',       'tech_desc',        'timeline', 'team_size', 'client_email'];
const NON_TECH_FLOW = ['user_type', 'nontech_problem', 'nontech_audience', 'timeline', 'team_size', 'client_email'];

// ─── Conversation Steps ───────────────────────────────────────────────────────

const STEPS: Record<string, Step> = {
  user_type: {
    msg: "Hi! Before we begin — are you technical or non-technical?",
    type: 'buttons',
    key: 'userType',
    opts: [
      { label: 'Technical',     sub: 'Developer / Architect / Tech Lead', value: 'technical'     },
      { label: 'Non-Technical', sub: 'Founder / Manager / Client',        value: 'non-technical' },
    ],
  },
  tech_type: {
    msg: "What type of project are you building?",
    type: 'buttons',
    key: 'projectType',
    opts: [
      { label: 'Web Application',   value: 'Web Application'         },
      { label: 'Desktop App',       sub: 'WPF / WinForms',           value: 'Desktop Application'   },
      { label: 'API / Backend',     value: 'API or Backend Service'  },
      { label: 'Mobile App',        value: 'Mobile Application'      },
      { label: 'Enterprise System', sub: 'ERP / CRM / Multi-module', value: 'Enterprise System'     },
    ],
  },
  tech_desc: {
    msg: "Describe your project — key features, preferred stack, and any integrations (APIs, databases, auth, etc.).",
    type: 'text',
    key: 'description',
    placeholder: 'e.g. A Blazor Server web app with JWT auth, SQL Server, SignalR notifications, and Stripe integration...',
  },
  nontech_problem: {
    msg: "In plain English — what problem do you need software to solve? No technical terms needed.",
    type: 'text',
    key: 'description',
    placeholder: 'e.g. I want customers to book appointments online, pay upfront, and get automatic email reminders...',
  },
  nontech_audience: {
    msg: "Who will be using this software?",
    type: 'buttons',
    key: 'audience',
    opts: [
      { label: 'My team / internal staff', value: 'Internal team only'        },
      { label: 'My customers',             value: 'External customers'         },
      { label: 'Both',                     value: 'Both internal and external' },
    ],
  },
  timeline: {
    msg: "What's your expected project timeline?",
    type: 'buttons',
    key: 'timeline',
    opts: [
      { label: 'Under 2 weeks',  value: 'Under 2 weeks'      },
      { label: 'About 1 month',  value: '1 month'            },
      { label: '2–3 months',     value: '2-3 months'         },
      { label: '3–6 months',     value: '3-6 months'         },
      { label: '6+ months',      value: 'More than 6 months' },
    ],
  },
  team_size: {
    msg: "How many people will be involved in this project?",
    type: 'buttons',
    key: 'teamSize',
    opts: [
      { label: 'Just me',      sub: 'Solo project', value: 'Solo (1 person)'  },
      { label: '2–3 people',                        value: '2-3 people'       },
      { label: '4–8 people',                        value: '4-8 people'       },
      { label: '9+ people',                         value: '9 or more people' },
    ],
  },
  client_email: {
    msg: "Last step — where should we send your detailed PDF estimate?\nYou'll get a full phase breakdown, cost range, and recommended stack. No spam, ever.",
    type: 'text',
    key: 'clientEmail',
    placeholder: 'you@company.com',
  },
};

// ─── Flow Logic ───────────────────────────────────────────────────────────────

function getNextStep(currentStep: string, answers: Answers): string {
  if (currentStep === 'user_type') {
    return answers.userType === 'technical' ? 'tech_type' : 'nontech_problem';
  }

  const flow = answers.userType === 'technical' ? TECH_FLOW : NON_TECH_FLOW;
  const idx  = flow.indexOf(currentStep);

  // Fix 13: guard — unknown step falls through to DONE instead of silently resetting to user_type
  if (idx === -1) return 'DONE';

  return idx < flow.length - 1 ? flow[idx + 1] : 'DONE';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Fix 9: friendly error — never expose raw API/HTTP internals to the user
function getFriendlyError(raw: string): string {
  if (raw.startsWith('HTTP '))                                         return 'Server error. Please try again in a moment.';
  if (/network|fetch|failed to fetch/i.test(raw))                     return 'Network issue. Check your connection and try again.';
  if (/timeout/i.test(raw))                                           return 'The request timed out. Please try again.';
  return "We couldn't generate your estimate. Please try again or contact me directly.";
}

async function deliverEstimateByEmail(result: EstimateResult, answers: Answers): Promise<void> {
  const clientEmail = answers.clientEmail?.trim();
  if (!clientEmail || !EMAIL_RE.test(clientEmail)) {
    throw new Error('A valid email address is required.');
  }

  const pdfBase64 = estimatePDFBase64(result, answers);

  const res = await fetch('/api/estimate/send-email', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ clientEmail, pdfBase64 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

// Fix 11: renamed from EstimatorPage → EstimatorClient to match filename
export default function EstimatorClient() {
  const [started,      setStarted]      = useState(false);
  const [msgs,         setMsgs]         = useState<Message[]>([]);
  const [answers,      setAnswers]      = useState<Answers>({});
  const [activeStep,   setActiveStep]   = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);      // Fix 4: double-submit guard
  const [textVal,      setTextVal]      = useState('');
  const [apiError,     setApiError]     = useState('');
  const [emailStatus,  setEmailStatus]  = useState<EmailDeliveryStatus>('idle');
  const [emailError,   setEmailError]   = useState('');
  const [sentToEmail,  setSentToEmail]  = useState('');

  const lastMsgRef = useRef<HTMLDivElement>(null);

  // Fix 14: scroll via useEffect — reliable DOM-commit timing, no setTimeout race
  useEffect(() => {
    lastMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [msgs]);

  // Fix 5: progress indicator — returns null before user_type is answered (flow unknown)
  const getProgress = (): { current: number; total: number } | null => {
    if (!activeStep || !started) return null;
    const flow = answers.userType === 'technical' ? TECH_FLOW : NON_TECH_FLOW;
    const idx  = flow.indexOf(activeStep);
    if (idx === -1) return null;
    return { current: idx + 1, total: flow.length };
  };

  const pushBot = (stepId: string) => {
    setMsgs(prev => [...prev, { id: stepId, role: 'bot', stepData: STEPS[stepId], answered: false }]);
    setActiveStep(stepId);
  };

  const start = () => {
    setStarted(true);
    pushBot('user_type');
  };

  // Shared estimate runner — used by handleAnswer and retryEstimate
  const runEstimate = async (newAns: Answers) => {
    setActiveStep(null);
    setLoading(true);
    setApiError('');

    // Fix 2: always clear both 'err' and 'thinking' before adding a fresh thinking bubble
    setMsgs(prev => [
      ...prev.filter(m => m.id !== 'err' && m.id !== 'thinking'),
      {
        id: 'thinking', role: 'bot',
        stepData: { msg: 'Perfect — generating your estimate now...', type: 'static', key: '' },
        answered: true,
      } as BotMessage,
    ]);

    try {
      const res = await fetch('/api/estimate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(newAns),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      const estimate    = (await res.json()) as EstimateResult;
      const clientEmail = newAns.clientEmail?.trim() ?? '';

      setMsgs(prev => prev.map(m =>
        m.id === 'thinking'
          ? { ...m, stepData: { msg: 'Estimate ready — sending PDF to your email...', type: 'static', key: '' } }
          : m,
      ));
      setEmailStatus('sending');
      setSentToEmail(clientEmail);
      await deliverEstimateByEmail(estimate, newAns);
      setEmailStatus('success');
    } catch (e: unknown) {
      const raw      = e instanceof Error ? e.message : 'Unknown error';
      const friendly = getFriendlyError(raw); // Fix 9: never expose raw errors
      console.error('[EstimatorClient] estimate error:', raw);
      setApiError(raw);
      setEmailStatus('error');
      setEmailError(friendly);
      setMsgs(prev => [...prev, {
        id: 'err', role: 'bot',
        stepData: { msg: friendly, type: 'static', key: '' },
        answered: true,
      } as BotMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (stepId: string, value: string, label: string) => {
    // Fix 4: prevent double-submit
    if (submitting) return;
    setSubmitting(true);

    const step   = STEPS[stepId];
    const newAns = { ...answers, [step.key]: value };
    setAnswers(newAns);

    // Fix 12: single setMsgs call instead of two sequential calls
    setMsgs(prev => [
      ...prev.map(m => m.id === stepId ? { ...m, answered: true } : m),
      { id: `u_${stepId}`, role: 'user', text: label } as UserMessage,
    ]);

    const next = getNextStep(stepId, newAns);

    if (next === 'DONE') {
      try {
        await runEstimate(newAns);
      } finally {
        setSubmitting(false);
      }
    } else {
      setTimeout(() => {
        pushBot(next);
        setSubmitting(false);
      }, 450);
    }
  };

  const submitText = () => {
    if (!textVal.trim() || !activeStep || submitting) return;
    const value = textVal.trim();

    // Fix 1: email validation error is now surfaced (rendered below the input)
    if (activeStep === 'client_email' && !EMAIL_RE.test(value)) {
      setApiError('Please enter a valid email address.');
      return;
    }
    setApiError('');
    handleAnswer(activeStep, value, value);
    setTextVal('');
  };

  const retryEstimate = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await runEstimate(answers); // Fix 2: runEstimate already clears 'thinking' + 'err'
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStarted(false);
    setMsgs([]);
    setAnswers({});
    setActiveStep(null);
    setLoading(false);
    setSubmitting(false);
    setTextVal('');
    setApiError('');
    setEmailStatus('idle');
    setEmailError('');
    setSentToEmail('');
  };

  const progress = getProgress();

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    // Fix 6: removed min-h-screen + pt-20 — page.tsx controls layout, not the component
    <div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-sm">
            Answer a few questions and your PDF estimate is emailed to you instantly
          </p>
        </div>

        {/* ── Start screen ── */}
        {!started && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🤖
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">
              Ready to estimate your project?
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed max-w-sm mx-auto">
              Answer a few conversational questions and receive an AI-generated cost estimate as a PDF in your inbox.
            </p>
            <button
              onClick={start}
              className="bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-150 text-sm shadow-lg shadow-blue-500/25"
            >
              Start Estimating →
            </button>
          </div>
        )}

        {/* ── Chat ── */}
        {started && (
          <div className="flex flex-col gap-4">

            {/* Fix 5: progress bar — hidden until we know which path (userType answered) */}
            {progress && (
              <div className="flex items-center gap-3 px-1 mb-1">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap tabular-nums">
                  Step {progress.current} of {progress.total}
                </span>
              </div>
            )}

            {msgs.map((msg, index) => {
              const isLast = index === msgs.length - 1;

              /* ── User bubble ── */
              if (msg.role === 'user') return (
                <div key={msg.id} ref={isLast ? lastMsgRef : null} className="flex justify-end">
                  <div className="bg-blue-500/15 border border-blue-500/25 rounded-[14px_4px_14px_14px] px-4 py-3 max-w-[78%]">
                    <p className="text-sm text-blue-800 dark:text-blue-100 leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );

              /* ── Bot bubble ── */
              const step     = msg.stepData;
              const isActive = msg.id === activeStep && !msg.answered;

              return (
                <div key={msg.id} ref={isLast ? lastMsgRef : null} className="flex gap-3 items-start">

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-xl bg-muted/60 border border-border flex items-center justify-center flex-shrink-0 mt-0.5 text-sm select-none">
                    🤖
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="glass-card rounded-[4px_14px_14px_14px] px-4 py-3">

                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {step.msg}
                      </p>

                      {/* Typing dots */}
                      {msg.id === 'thinking' && loading && (
                        <div className="flex gap-1.5 mt-3">
                          {[0, 1, 2].map(i => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Error state with retry */}
                      {msg.id === 'err' && !loading && (
                        <div className="mt-4 flex flex-col gap-2">
                          <button
                            onClick={retryEstimate}
                            disabled={submitting}
                            className="self-start inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                          >
                            ↺ Retry estimate
                          </button>
                          <button
                            onClick={reset}
                            className="self-start text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                          >
                            Start over instead
                          </button>
                        </div>
                      )}

                      {/* Button options */}
                      {isActive && step.type === 'buttons' && (
                        <div className="flex flex-col gap-2 mt-3">
                          {step.opts?.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => handleAnswer(msg.id, opt.value, opt.label)}
                              disabled={submitting} // Fix 4: disabled while submitting
                              className="text-left px-4 py-3 bg-transparent border border-border hover:border-blue-500/40 hover:bg-blue-500/5 text-foreground rounded-xl transition-all duration-150 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span>
                                <span className="block text-sm">{opt.label}</span>
                                {opt.sub && (
                                  <span className="text-xs text-muted-foreground mt-0.5 block">{opt.sub}</span>
                                )}
                              </span>
                              <span className="text-muted-foreground/40 group-hover:text-blue-400 transition-colors text-xs">→</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Text input */}
                      {isActive && step.type === 'text' && (
                        <div className="mt-3">
                          <div className="flex gap-2 items-end">

                            {/* Fix 3: email → <input type="email">, description → <textarea> */}
                            {step.key === 'clientEmail' ? (
                              <input
                                type="email"
                                placeholder={step.placeholder}
                                value={textVal}
                                autoComplete="email"
                                onChange={e => { setTextVal(e.target.value); setApiError(''); }}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitText(); } }}
                                className="flex-1 bg-background border border-border focus:border-blue-500/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
                              />
                            ) : (
                              <textarea
                                placeholder={step.placeholder}
                                value={textVal}
                                rows={3}
                                maxLength={DESC_MAX} // Fix 8
                                onChange={e => setTextVal(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submitText();
                                  }
                                }}
                                className="flex-1 bg-background border border-border focus:border-blue-500/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none transition-colors leading-relaxed"
                              />
                            )}

                            {/* Fix 10: disabled while loading or empty */}
                            <button
                              onClick={submitText}
                              disabled={loading || submitting || !textVal.trim()}
                              aria-label="Send"
                              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-xl transition-colors flex-shrink-0 self-end text-base leading-none shadow-md shadow-blue-500/25"
                            >
                              ↑
                            </button>
                          </div>

                          {/* Fix 8: character counter — only on description fields */}
                          {step.key === 'description' && (
                            <p className={`text-xs text-right mt-1 transition-colors ${
                              textVal.length >= DESC_MAX ? 'text-red-400' : 'text-muted-foreground/60'
                            }`}>
                              {textVal.length}/{DESC_MAX}
                            </p>
                          )}

                          {/* Fix 1: email validation error now renders below the input */}
                          {step.key === 'clientEmail' && apiError && (
                            <p className="text-xs text-red-400 mt-1.5">{apiError}</p>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}

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
            {emailStatus === 'error' && !loading && (
              <div className="glass-card rounded-2xl p-8 text-center border border-red-500/20">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Failed to send estimate
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {sentToEmail
                    ? <>We could not deliver the PDF to <span className="text-foreground font-medium">{sentToEmail}</span>.</>
                    : 'We could not deliver your estimate by email.'}
                </p>
                {emailError && (
                  <p className="text-xs text-red-400/90 mb-6">{emailError}</p>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={retryEstimate}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                  >
                    ↺ Try Again
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
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Mail, Download } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

interface BreakdownRow {
  phase: string;
  hours: number;
  rate: number;
  cost: number;
}

interface EstimateResult {
  range_low: number;
  range_high: number;
  summary: string;
  breakdown: BreakdownRow[];
  risks: string[];
  recommended_stack: string;
}

// ─── Conversation Steps ───────────────────────────────────────────────────────

const STEPS: Record<string, Step> = {
  user_type: {
    msg: "Hi! Before we begin — are you technical or non-technical?",
    type: 'buttons',
    key: 'userType',
    opts: [
      { label: 'Technical',     sub: 'Developer / Architect / Tech Lead',    value: 'technical'     },
      { label: 'Non-Technical', sub: 'Founder / Manager / Client',           value: 'non-technical' },
    ],
  },
  tech_type: {
    msg: "What type of project are you building?",
    type: 'buttons',
    key: 'projectType',
    opts: [
      { label: 'Web Application',   value: 'Web Application'          },
      { label: 'Desktop App',       sub: 'WPF / WinForms',            value: 'Desktop Application'    },
      { label: 'API / Backend',     value: 'API or Backend Service'   },
      { label: 'Mobile App',        value: 'Mobile Application'       },
      { label: 'Enterprise System', sub: 'ERP / CRM / Multi-module',  value: 'Enterprise System'      },
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
      { label: 'My team / internal staff', value: 'Internal team only'          },
      { label: 'My customers',             value: 'External customers'           },
      { label: 'Both',                     value: 'Both internal and external'   },
    ],
  },
  timeline: {
    msg: "What's your expected project timeline?",
    type: 'buttons',
    key: 'timeline',
    opts: [
      { label: 'Under 2 weeks',  value: 'Under 2 weeks'       },
      { label: 'About 1 month',  value: '1 month'             },
      { label: '2–3 months',     value: '2-3 months'          },
      { label: '3–6 months',     value: '3-6 months'          },
      { label: '6+ months',      value: 'More than 6 months'  },
    ],
  },
  team_size: {
    msg: "How many people will be involved in this project?",
    type: 'buttons',
    key: 'teamSize',
    opts: [
      { label: 'Just me',      sub: 'Solo project', value: 'Solo (1 person)' },
      { label: '2–3 people',                        value: '2-3 people'      },
      { label: '4–8 people',                        value: '4-8 people'      },
      { label: '9+ people',                         value: '9 or more people'},
    ],
  },
};

// ─── Flow Logic ───────────────────────────────────────────────────────────────

function getNextStep(currentStep: string, answers: Answers): string {
  const techFlow    = ['user_type', 'tech_type',        'tech_desc',        'timeline', 'team_size'];
  const nonTechFlow = ['user_type', 'nontech_problem',  'nontech_audience', 'timeline', 'team_size'];

  if (currentStep === 'user_type') {
    return answers.userType === 'technical' ? 'tech_type' : 'nontech_problem';
  }

  const flow = answers.userType === 'technical' ? techFlow : nonTechFlow;
  const idx  = flow.indexOf(currentStep);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : 'DONE';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => '$' + Math.round(n).toLocaleString();

function buildEmailBody(result: EstimateResult, answers: Answers): string {
  const totalBase = result.breakdown.reduce((s, r) => s + r.cost, 0);

  const breakdownLines = result.breakdown
    .map(r => `  • ${r.phase.padEnd(28)} ${String(r.hours + 'h').padEnd(6)}  $${r.rate}/hr  →  ${fmt(r.cost)}`)
    .join('\n');

  const riskLines = result.risks?.length
    ? result.risks.map(r => `  ⚠ ${r}`).join('\n')
    : '  None flagged';

  return [
    'Hi,',
    '',
    "I used your AI Project Cost Estimator and wanted to discuss the quote I received. Here's a summary:",
    '',
    '════════════════════════════════════════',
    '  PROJECT DETAILS',
    '════════════════════════════════════════',
    answers.projectType  ? `  Type      : ${answers.projectType}`  : '',
    answers.description  ? `  Description: ${answers.description}` : '',
    answers.audience     ? `  Audience   : ${answers.audience}`    : '',
    answers.timeline     ? `  Timeline   : ${answers.timeline}`    : '',
    answers.teamSize     ? `  Team size  : ${answers.teamSize}`    : '',
    '',
    '════════════════════════════════════════',
    '  ESTIMATED COST RANGE',
    '════════════════════════════════════════',
    `  ${fmt(result.range_low)} – ${fmt(result.range_high)}`,
    '  (Includes 20% overhead for PM, QA & scope buffer)',
    '',
    '════════════════════════════════════════',
    '  COST BREAKDOWN',
    '════════════════════════════════════════',
    breakdownLines,
    `${''.padEnd(46, '─')}`,
    `  Base total:${' '.repeat(28)}${fmt(totalBase)}`,
    '',
    '════════════════════════════════════════',
    '  AI SUMMARY',
    '════════════════════════════════════════',
    `  ${result.summary}`,
    '',
    result.recommended_stack
      ? `  Recommended stack: ${result.recommended_stack}\n`
      : '',
    '════════════════════════════════════════',
    '  SCOPE RISK FLAGS',
    '════════════════════════════════════════',
    riskLines,
    '',
    '────────────────────────────────────────',
    'Looking forward to discussing this further!',
  ]
    .filter(l => l !== null && l !== undefined)
    .join('\n');
}

// ─── PDF Generator ────────────────────────────────────────────────────────────

function downloadEstimatePDF(result: EstimateResult, answers: Answers) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW  = doc.internal.pageSize.getWidth();   // 210
  const PH  = doc.internal.pageSize.getHeight();  // 297
  const ML  = 18; // margin left
  const MR  = PW - 18; // margin right
  const totalBase = result.breakdown.reduce((s, r) => s + r.cost, 0);

  // ── Palette ────────────────────────────────────────────────────────────────
  const C = {
    ink:        [15,  23,  42]  as [number,number,number],  // slate-900
    muted:      [100, 116, 139] as [number,number,number],  // slate-500
    blue:       [59,  130, 246] as [number,number,number],  // blue-500
    blueBg:     [239, 246, 255] as [number,number,number],  // blue-50
    emerald:    [16,  185, 129] as [number,number,number],  // emerald-500
    amber:      [180, 130,  10] as [number,number,number],  // amber-700
    border:     [226, 232, 240] as [number,number,number],  // slate-200
    white:      [255, 255, 255] as [number,number,number],
    headerBg:   [30,  58, 138]  as [number,number,number],  // blue-900
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const money = (n: number) => '$' + Math.round(n).toLocaleString();

  const setFont = (style: 'normal'|'bold'|'italic' = 'normal', size = 10, color = C.ink) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const addWatermark = () => {
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.saveGraphicsState();
      // diagonal watermark
      doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(25);
      doc.setTextColor(30, 58, 138);
      doc.text(
        'generated by kathanpatel.vercel.app',
        PW / 2, PH / 2,
        { align: 'center', angle: 45 },
      );
      doc.restoreGraphicsState();

      // footer URL (full opacity, small)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      doc.text('generated by kathanpatel.vercel.app', PW / 2, PH - 8, { align: 'center' });
      doc.setDrawColor(...C.border);
      doc.line(ML, PH - 11, MR, PH - 11);
    }
  };

  let y = 0; // cursor

  // ── Header bar ─────────────────────────────────────────────────────────────
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, PW, 38, 'F');

  setFont('bold', 18, C.white);
  doc.text('Project Cost Estimate', ML, 16);

  setFont('normal', 9, [186, 210, 255]);
  doc.text('AI-generated estimate · kathanpatel.vercel.app', ML, 24);

  const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(now, MR, 24, { align: 'right' });

  y = 46;

  // ── Cost range pill ────────────────────────────────────────────────────────
  doc.setFillColor(...C.blueBg);
  doc.roundedRect(ML, y, PW - 36, 22, 4, 4, 'F');
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML, y, PW - 36, 22, 4, 4, 'S');

  setFont('normal', 8, C.muted);
  doc.text('ESTIMATED PROJECT COST', PW / 2, y + 6, { align: 'center' });

  setFont('bold', 20, C.blue);
  doc.text(`${money(result.range_low)} – ${money(result.range_high)}`, PW / 2, y + 16, { align: 'center' });

  y += 27;

  setFont('normal', 7.5, C.muted);
  doc.text('Includes 20% overhead for PM, QA & scope buffer', PW / 2, y, { align: 'center' });

  y += 10;

  // ── Project details ────────────────────────────────────────────────────────
  setFont('bold', 8, C.muted);
  doc.setCharSpace(1.2);
  doc.text('PROJECT DETAILS', ML, y);
  doc.setCharSpace(0);
  y += 3;
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.8);
  doc.line(ML, y, ML + 36, y);
  y += 5;

  const details: [string, string][] = (
    [
      ['Type',      answers.projectType],
      ['Audience',  answers.audience],
      ['Timeline',  answers.timeline],
      ['Team size', answers.teamSize],
    ] as [string, string | undefined][]
  ).filter((pair): pair is [string, string] => Boolean(pair[1]));

  details.forEach(([label, value]) => {
    setFont('bold', 9, C.ink);
    doc.text(`${label}:`, ML, y);
    setFont('normal', 9, C.ink);
    doc.text(value, ML + 28, y);
    y += 6;
  });

  // description (may wrap)
  if (answers.description) {
    setFont('bold', 9, C.ink);
    doc.text('Description:', ML, y);
    y += 5;
    setFont('normal', 8.5, C.muted);
    const wrapped = doc.splitTextToSize(answers.description, PW - 36);
    doc.text(wrapped, ML, y);
    y += wrapped.length * 4.8 + 3;
  }

  y += 4;

  // ── AI Summary ─────────────────────────────────────────────────────────────
  setFont('bold', 8, C.muted);
  doc.setCharSpace(1.2);
  doc.text('AI SUMMARY', ML, y);
  doc.setCharSpace(0);
  y += 3;
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.8);
  doc.line(ML, y, ML + 28, y);
  y += 5;

  setFont('normal', 8.5, C.ink);
  const summaryLines = doc.splitTextToSize(result.summary, PW - 36);
  doc.text(summaryLines, ML, y);
  y += summaryLines.length * 4.8 + 8;

  // ── Cost breakdown table ────────────────────────────────────────────────────
  setFont('bold', 8, C.muted);
  doc.setCharSpace(1.2);
  doc.text('COST BREAKDOWN', ML, y);
  doc.setCharSpace(0);
  y += 3;
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.8);
  doc.line(ML, y, ML + 38, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: 18 },
    head: [['Phase', 'Hours', 'Rate', 'Cost']],
    body: [
      ...result.breakdown.map(r => [
        r.phase,
        `${r.hours}h`,
        `$${r.rate}/hr`,
        money(r.cost),
      ]),
      [{ content: 'Base total', colSpan: 3, styles: { fontStyle: 'bold' } }, money(totalBase)],
    ],
    headStyles: {
      fillColor:  C.headerBg,
      textColor:  C.white,
      fontStyle:  'bold',
      fontSize:   8,
      halign:     'left',
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'right', textColor: C.muted, fontSize: 8 },
      2: { halign: 'right', textColor: C.muted, fontSize: 8 },
      3: { halign: 'right', textColor: C.emerald as [number,number,number], fontStyle: 'bold', fontSize: 8.5 },
    },
    bodyStyles:   { fontSize: 8.5, textColor: C.ink },
    alternateRowStyles: { fillColor: [248, 250, 252] as [number,number,number] },
    tableLineColor: C.border,
    tableLineWidth: 0.3,
    didDrawPage: () => {},
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Recommended stack ──────────────────────────────────────────────────────
  if (result.recommended_stack) {
    setFont('bold', 8, C.muted);
    doc.setCharSpace(1.2);
    doc.text('RECOMMENDED STACK', ML, y);
    doc.setCharSpace(0);
    y += 3;
    doc.setDrawColor(...C.blue);
    doc.setLineWidth(0.8);
    doc.line(ML, y, ML + 44, y);
    y += 5;

    // Shared box constants
    const BOX_W      = PW - ML - 18;           // full content width (left 18 + right 18 margin)
    const TEXT_PAD_X = 6;                       // horizontal inner padding
    const TEXT_PAD_Y = 5;                       // vertical inner padding
    const MAX_TXT_W  = BOX_W - TEXT_PAD_X * 2; // usable wrap width
    const LH         = 5.5;                     // line-height mm

    // Split stack by comma → one tech per line, then word-wrap each
    setFont('normal', 8.5, C.ink);
    const stackItems: string[] = result.recommended_stack
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const stackLines: string[] = [];
    stackItems.forEach((item: string, i: number) => {
      const label   = i === 0 ? `⚙  ${item}` : `    ${item}`;
      const suffix  = i < stackItems.length - 1 ? ',' : '';
      const wrapped = doc.splitTextToSize(`${label}${suffix}`, MAX_TXT_W);
      stackLines.push(...(wrapped as string[]));
    });

    const stackBoxH = stackLines.length * LH + TEXT_PAD_Y * 2;
    if (y + stackBoxH > PH - 20) { doc.addPage(); y = 20; }

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y - TEXT_PAD_Y + 1, BOX_W, stackBoxH, 3, 3, 'FD');
    doc.text(stackLines, ML + TEXT_PAD_X, y + 1, { lineHeightFactor: 1.5 });
    y += stackBoxH + 6;
  }

  // ── Risk flags ─────────────────────────────────────────────────────────────
  {/*
  if (result.risks?.length) {
    setFont('bold', 8, C.muted);
    doc.setCharSpace(1.2);
    doc.text('SCOPE RISK FLAGS', ML, y);
    doc.setCharSpace(0);
    y += 3;
    doc.setDrawColor(...C.blue);
    doc.setLineWidth(0.8);
    doc.line(ML, y, ML + 38, y);
    y += 5;

    const RISK_BOX_W     = PW - ML - 18;
    const RISK_PAD_X     = 6;
    const RISK_PAD_Y     = 5;
    const RISK_MAX_TXT_W = RISK_BOX_W - RISK_PAD_X * 2;
    const RISK_LH        = 5.5;

    result.risks.forEach((risk: string) => {
      setFont('normal', 8.5, C.amber);
      // Wrap at exact usable width so text never bleeds past the box border
      const lines = doc.splitTextToSize(`⚠  ${risk}`, RISK_MAX_TXT_W) as string[];
      const riskBoxH = lines.length * RISK_LH + RISK_PAD_Y * 2;

      // Push to new page if not enough room
      if (y + riskBoxH > PH - 20) { doc.addPage(); y = 20; }

      doc.setFillColor(255, 251, 235);
      doc.setDrawColor(251, 191, 36);
      doc.setLineWidth(0.3);
      doc.roundedRect(ML, y - RISK_PAD_Y + 1, RISK_BOX_W, riskBoxH, 3, 3, 'FD');
      doc.text(lines, ML + RISK_PAD_X, y + 1, { lineHeightFactor: 1.5 });
      y += riskBoxH + 5;
    });
  } 
  */}

  // ── Watermark on every page ────────────────────────────────────────────────
  addWatermark();

  doc.save('project-estimate.pdf');
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EstimatorPage() {
  const [started,    setStarted]    = useState(false);
  const [msgs,       setMsgs]       = useState<Message[]>([]);
  const [answers,    setAnswers]    = useState<Answers>({});
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState<EstimateResult | null>(null);
  const [textVal,    setTextVal]    = useState('');
  const [apiError,   setApiError]   = useState('');

  // FIX 4: ref on the LAST message — scrollIntoView with block:'center'
  // so the new message appears in the middle of the viewport, not at the very bottom
  const lastMsgRef = useRef<HTMLDivElement>(null);

  const scroll = () =>
    setTimeout(() =>
      lastMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    80);

  const pushBot = (stepId: string) => {
    setMsgs(prev => [...prev, { id: stepId, role: 'bot', stepData: STEPS[stepId], answered: false }]);
    setActiveStep(stepId);
    scroll();
  };

  const start = () => {
    setStarted(true);
    pushBot('user_type');
  };

  const handleAnswer = async (stepId: string, value: string, label: string) => {
    const step   = STEPS[stepId];
    const newAns = { ...answers, [step.key]: value };
    setAnswers(newAns);

    setMsgs(prev => prev.map(m => m.id === stepId ? { ...m, answered: true } : m));
    setMsgs(prev => [...prev, { id: `u_${stepId}`, role: 'user', text: label }]);
    scroll();

    const next = getNextStep(stepId, newAns);

    if (next === 'DONE') {
      setActiveStep(null);
      setLoading(true);
      setApiError('');
      setMsgs(prev => [...prev, {
        id: 'thinking', role: 'bot',
        stepData: { msg: 'Perfect — generating your estimate now...', type: 'static', key: '' },
        answered: true,
      }]);
      scroll();

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
        setResult(await res.json());
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setApiError(msg);
        setMsgs(prev => [...prev, {
          id: 'err', role: 'bot',
          stepData: { msg: `Something went wrong: ${msg}`, type: 'static', key: '' },
          answered: true,
        }]);
      } finally {
        setLoading(false);
        scroll();
      }
    } else {
      setTimeout(() => pushBot(next), 450);
    }
  };

  const submitText = () => {
    if (!textVal.trim() || !activeStep) return;
    handleAnswer(activeStep, textVal.trim(), textVal.trim());
    setTextVal('');
  };

  // FIX 2: dedicated retry — re-sends saved answers without restarting the chat
  const retryEstimate = async () => {
    setApiError('');
    setLoading(true);
    // Remove the error bubble, add a fresh "retrying" bubble
    setMsgs(prev => prev.filter(m => m.id !== 'err'));
    setMsgs(prev => [...prev, {
      id: 'thinking', role: 'bot',
      stepData: { msg: 'Retrying — generating your estimate now...', type: 'static', key: '' },
      answered: true,
    }]);
    scroll();

    try {
      const res = await fetch('/api/estimate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(answers),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setApiError(msg);
      setMsgs(prev => [...prev, {
        id: 'err', role: 'bot',
        stepData: { msg: `Something went wrong: ${msg}`, type: 'static', key: '' },
        answered: true,
      }]);
    } finally {
      setLoading(false);
      scroll();
    }
  };

  const reset = () => {
    setStarted(false);
    setMsgs([]);
    setAnswers({});
    setActiveStep(null);
    setLoading(false);
    setResult(null);
    setTextVal('');
    setApiError('');
  };

  const totalBase = result?.breakdown?.reduce((s, r) => s + r.cost, 0) ?? 0;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    // FIX 1: bg-background is theme-aware (works in both dark + light)
    // FIX 3: pt-28 clears the fixed navbar — same as every other page
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 font-mono tracking-wide">
            ✦ AI-POWERED
          </span>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight mb-2">
            Free Project Cost Estimator
          </h1>
          <p className="text-muted-foreground text-sm">
            Conversational AI estimates — no email or sign-up required
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
              Answer a few conversational questions and get an AI-generated cost breakdown — including phases, hourly rates, and scope risk flags.
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
            {msgs.map((msg, index) => {
              // FIX 4: attach lastMsgRef to whichever message is last in the array
              const isLast = index === msgs.length - 1;

              /* ── User bubble ── */
              if (msg.role === 'user') return (
                <div key={msg.id} ref={isLast ? lastMsgRef : null} className="flex justify-end">
                  <div className="bg-blue-500/15 border border-blue-500/25 rounded-[14px_4px_14px_14px] px-4 py-3 max-w-[78%]">
                    <p className="text-sm text-blue-300 dark:text-blue-200 leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );

              /* ── Bot bubble ── */
              const step     = msg.stepData;
              const isActive = msg.id === activeStep && !msg.answered;

              return (
                <div key={msg.id} ref={isLast ? lastMsgRef : null} className="flex gap-3 items-start">

                  {/* Avatar — FIX 1: bg-muted + border-border instead of hardcoded hex */}
                  <div className="w-8 h-8 rounded-xl bg-muted/60 border border-border flex items-center justify-center flex-shrink-0 mt-0.5 text-sm select-none">
                    🤖
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* FIX 1: glass-card replaces hardcoded bg-[#0d1421] border-[#1e2d45] */}
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

                      {/* FIX 2: Error state — Retry button appears inline in the error bubble */}
                      {msg.id === 'err' && !loading && apiError && (
                        <div className="mt-4 flex flex-col gap-2">
                          <button
                            onClick={retryEstimate}
                            className="self-start inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-xl text-xs font-semibold transition-all"
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
                              className="text-left px-4 py-3 bg-transparent border border-border hover:border-blue-500/40 hover:bg-blue-500/5 text-foreground rounded-xl transition-all duration-150 flex items-center justify-between group"
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
                        <div className="flex gap-2 mt-3 items-end">
                          <textarea
                            placeholder={step.placeholder}
                            value={textVal}
                            rows={3}
                            onChange={e => setTextVal(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submitText();
                              }
                            }}
                            className="flex-1 bg-background border border-border focus:border-blue-500/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none transition-colors leading-relaxed"
                          />
                          <button
                            onClick={submitText}
                            aria-label="Send"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2.5 rounded-xl transition-colors flex-shrink-0 self-end text-base leading-none shadow-md shadow-blue-500/25"
                          >
                            ↑
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Result card ── */}
            {result && (
              <div className="glass-card rounded-2xl overflow-hidden">

                {/* Range header */}
                <div className="bg-blue-500/8 border-b border-blue-500/20 px-6 py-6 text-center">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-2">
                    Estimated Project Cost
                  </p>
                  <p className="text-4xl font-display font-bold text-blue-400 tracking-tight">
                    {fmt(result.range_low)} – {fmt(result.range_high)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Includes 20% overhead for PM, QA &amp; scope buffer
                  </p>
                </div>

                <div className="px-6 py-5 flex flex-col gap-6">

                  {/* AI summary */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.summary}
                  </p>

                  {/* Breakdown table */}
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                      Cost Breakdown
                    </p>
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            {(['Phase', 'Hours', 'Rate', 'Cost'] as const).map(h => (
                              <th
                                key={h}
                                className={`px-4 py-2.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide font-medium ${h !== 'Phase' ? 'text-right' : 'text-left'}`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.breakdown.map((row, i) => (
                            <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3 text-foreground text-[13px]">{row.phase}</td>
                              <td className="px-4 py-3 text-right font-mono text-muted-foreground text-xs">{row.hours}h</td>
                              <td className="px-4 py-3 text-right font-mono text-muted-foreground text-xs">${row.rate}/hr</td>
                              <td className="px-4 py-3 text-right font-mono text-emerald-500 text-xs">{fmt(row.cost)}</td>
                            </tr>
                          ))}
                          <tr className="bg-muted/30">
                            <td colSpan={3} className="px-4 py-3 text-[13px] font-semibold text-foreground">
                              Base total
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-500 text-[13px]">
                              {fmt(totalBase)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Risk flags */}
                  {result.risks?.length > 0 && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                        Scope Risk Flags
                      </p>
                      <div className="flex flex-col gap-2">
                        {result.risks.map((r, i) => (
                          <div
                            key={i}
                            className="flex gap-3 items-start bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-600 dark:text-amber-300 leading-relaxed"
                          >
                            <span className="flex-shrink-0 mt-0.5">⚠</span>
                            {r}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended stack */}
                  {result.recommended_stack && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                        Recommended Stack
                      </p>
                      <div className="inline-flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-4 py-2 text-xs font-mono text-muted-foreground">
                        ⚙ {result.recommended_stack}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl px-6 py-6 text-center">
                    <h3 className="font-display text-base font-semibold text-foreground mb-1.5">
                      Want a precise, detailed quote?
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-sm mx-auto">
                      This is a ballpark estimate. For a tailored breakdown based on your exact requirements, let&apos;s talk.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      {/* Primary — opens default mail app with pre-filled estimate */}
                      <a
                        href={`mailto:patel.kathan555@gmail.com?subject=${encodeURIComponent("Let's discuss your project estimate 💬")}&body=${encodeURIComponent(buildEmailBody(result, answers))}`}
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-150 text-sm shadow-lg shadow-blue-500/25"
                      >
                        <Mail className="w-4 h-4" />
                        Email This Estimate
                      </a>

                      {/* Secondary — Download as PDF */}
                      <button
                        onClick={() => downloadEstimatePDF(result, answers)}
                        className="inline-flex items-center gap-2 border border-border hover:border-blue-500/40 hover:bg-blue-500/5 bg-transparent text-muted-foreground hover:text-foreground px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
                      >
                        <Download className="w-4 h-4" />
                        Download Estimate
                      </button>
                    </div>
                  </div>

                  {/* FIX 2: Prominent post-result actions — Start New Estimate + View Rates */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-blue-500/40 hover:bg-blue-500/5 text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition-all"
                    >
                      ↺ Start New Estimate
                    </button>
                    <Link
                      href="/hire"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-teal-500/40 hover:bg-teal-500/5 text-muted-foreground hover:text-teal-400 rounded-xl text-sm font-medium transition-all"
                    >
                      View My Rates →
                    </Link>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
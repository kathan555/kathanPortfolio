// ─── Estimator rate card ──────────────────────────────────────────────────────
// Single source of truth for every number the estimator produces. The AI never
// sees a dollar figure and never does arithmetic — it returns hours and a tier
// label per phase, and everything below turns that into money.
//
// Deliberately NOT surfaced on the static page: the sample table there shows
// hours and totals only. Rates appear in the gated result and the emailed PDF,
// so a published number always arrives with a lead attached.

export const RATE_STANDARD   = 30;   // CRUD, forms, reports, auth, QA, design, deployment
export const RATE_SPECIALIST = 45;   // AI/LLM, real-time & multi-tenant architecture, payments/legal-tech

export const MONTHLY_RATE             = 4_000;
export const HOURS_PER_MONTH          = 160;
export const MONTHLY_EFFECTIVE_HOURLY = MONTHLY_RATE / HOURS_PER_MONTH;  // $25/hr — ~17% under hourly
export const MONTHLY_THRESHOLD_HOURS  = 240;                             // 1.5 months before monthly is offered

// Contingency scales with how much detail the brief actually carried, so a
// vague brief widens the range instead of inflating the point estimate.
export const BUFFER_PCT = { high: 0.15, medium: 0.25 } as const;

export const FULL_TIME_HOURS_PER_WEEK = 40;
export const PART_TIME_HOURS_PER_WEEK = 20;

// ─── Sanity bounds ────────────────────────────────────────────────────────────
// Backstops for model outliers, not a scoping opinion. Caps are generous enough
// that legitimately integration-heavy or design-heavy projects survive intact.

export const SPECIALIST_MAX_SHARE = 0.40;   // of total hours
export const TOTAL_HOURS_MIN      = 8;
export const TOTAL_HOURS_MAX      = 2_000;

export const CORE_PHASE = 'Core Development';

export const PHASES = [
  'Discovery & Planning',
  'UI/UX Design',
  CORE_PHASE,
  'Integrations & APIs',
  'Testing & QA',
  'Deployment & Handover',
] as const;

// Ceiling on each phase as a multiple of Core Development hours
export const PHASE_CAPS: Record<string, number> = {
  'Discovery & Planning':  0.20,
  'UI/UX Design':          0.35,
  'Integrations & APIs':   0.80,
  'Testing & QA':          0.30,
  'Deployment & Handover': 0.12,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type Tier        = 'standard' | 'specialist';
export type DetailLevel = 'low' | 'medium' | 'high';

/** Detail levels that produce a number at all — 'low' returns needs_detail instead. */
export type PricedDetailLevel = Exclude<DetailLevel, 'low'>;

/** What the model returns per phase — hours and a tier label, nothing priced. */
export interface RawPhase {
  phase: string;
  hours: number;
  tier:  Tier;
}

export interface PricedPhase extends RawPhase {
  rate: number;
  cost: number;
}

export interface HoursRange {
  low:  number;
  high: number;
}

export interface HourlyPricing {
  rate_standard:   number;
  rate_specialist: number;
  low:             number;
  high:            number;
}

export interface MonthlyPricing {
  rate:             number;
  hours_per_month:  number;
  effective_hourly: number;
  months_low:       number;
  months_high:      number;
  low:              number;
  high:             number;
  /** What committing to a month saves versus the same hours billed hourly. */
  saving_vs_hourly: number;
}

export interface Timeline {
  full_time_weeks: number;
  part_time_weeks: number;
}

export interface TimelineRange {
  low:  Timeline;
  high: Timeline;
}

export interface Pricing {
  breakdown:         PricedPhase[];
  hours:             HoursRange;
  buffer_pct:        number;
  hourly:            HourlyPricing;
  monthly:           MonthlyPricing | null;
  recommended_model: 'hourly' | 'monthly';
  timeline:          TimelineRange;
}

/** How the client's stated budget lands against the priced range. */
export interface BudgetFit {
  stated_usd: number;
  verdict:    'comfortable' | 'tight' | 'short';
}

/** The full payload the client renders and the PDF is built from. */
export interface EstimateResult extends Pricing {
  status:            'estimate';
  detail_level:      PricedDetailLevel;
  summary:           string;
  scope_assumptions: string[];
  risks:             string[];
  recommended_stack: string;
  budget_fit:        BudgetFit | null;
}

export interface EngagementOptions {
  hourly_rate:      number;
  monthly_rate:     number;
  hours_per_month:  number;
  effective_hourly: number;
}

export interface NeedsDetailResult {
  status:               'needs_detail';
  /** What the model did manage to understand — shown back so the gaps are legible. */
  understanding:        string;
  clarifying_questions: string[];
  engagement_options:   EngagementOptions;
  /** Whether the follow-up questions were successfully emailed to the visitor. */
  emailed:              boolean;
}

export type EstimateApiResponse = EstimateResult | NeedsDetailResult;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const rateFor = (tier: Tier): number =>
  tier === 'specialist' ? RATE_SPECIALIST : RATE_STANDARD;

/**
 * Renders a low–high pair, collapsing to a single value when the two ends round
 * to the same number — "5 weeks", never "5–5 weeks".
 */
export const fmtRange = (low: number, high: number): string =>
  low === high ? `${low}` : `${low}–${high}`;

const weeksFor = (hours: number, perWeek: number): number =>
  Math.max(1, Math.round(hours / perWeek));

const timelineFor = (hours: number): Timeline => ({
  full_time_weeks: weeksFor(hours, FULL_TIME_HOURS_PER_WEEK),
  part_time_weeks: weeksFor(hours, PART_TIME_HOURS_PER_WEEK),
});

export const engagementOptions = (): EngagementOptions => ({
  hourly_rate:      RATE_STANDARD,
  monthly_rate:     MONTHLY_RATE,
  hours_per_month:  HOURS_PER_MONTH,
  effective_hourly: MONTHLY_EFFECTIVE_HOURLY,
});

// ─── Outlier normalisation ────────────────────────────────────────────────────
// Clamps rather than rejects: a soft heuristic should never fail a request the
// visitor is waiting on. Every adjustment is reported so the caller can log it
// and tune the caps against real traffic.

export function normalizePhases(raw: RawPhase[]): { phases: RawPhase[]; warnings: string[] } {
  const warnings: string[] = [];

  // Keep only known phases, in canonical order, with clean non-negative hours
  const byPhase = new Map(raw.map(r => [r.phase, r]));

  let phases: RawPhase[] = PHASES.map(phase => {
    const row = byPhase.get(phase);
    return {
      phase,
      hours: Math.max(0, Math.round(row?.hours ?? 0)),
      tier:  row?.tier === 'specialist' ? 'specialist' : 'standard',
    };
  });

  // Cap support phases against Core Development, which anchors real scope
  const coreHours = phases.find(p => p.phase === CORE_PHASE)?.hours ?? 0;

  if (coreHours >= 1) {
    phases = phases.map(p => {
      const cap = PHASE_CAPS[p.phase];
      if (cap === undefined) return p;

      const ceiling = Math.round(coreHours * cap);
      if (p.hours <= ceiling) return p;

      warnings.push(`${p.phase} clamped ${p.hours}h to ${ceiling}h`);
      return { ...p, hours: ceiling };
    });
  }

  // Specialist share — without a cap the model labels almost everything
  // specialist. Demote smallest-first so the genuinely specialist work survives.
  const total = phases.reduce((s, p) => s + p.hours, 0);

  if (total > 0) {
    let specialistHours = phases
      .filter(p => p.tier === 'specialist')
      .reduce((s, p) => s + p.hours, 0);

    if (specialistHours / total > SPECIALIST_MAX_SHARE) {
      const demotable = phases
        .filter(p => p.tier === 'specialist' && p.hours > 0)
        .sort((a, b) => a.hours - b.hours);

      // Keep the largest specialist phase even if it alone breaches the share
      for (const row of demotable.slice(0, -1)) {
        if (specialistHours / total <= SPECIALIST_MAX_SHARE) break;

        row.tier = 'standard';
        specialistHours -= row.hours;
        warnings.push(`${row.phase} demoted to standard (specialist share cap)`);
      }
    }
  }

  // Absolute ceiling — scale proportionally so the shape of the estimate survives
  if (total > TOTAL_HOURS_MAX) {
    const factor = TOTAL_HOURS_MAX / total;
    phases = phases.map(p => ({ ...p, hours: Math.round(p.hours * factor) }));
    warnings.push(`total hours scaled ${total}h to ${TOTAL_HOURS_MAX}h`);
  }

  return { phases, warnings };
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export function priceFromHours(raw: RawPhase[], detail: PricedDetailLevel): Pricing {
  const { phases } = normalizePhases(raw);

  const breakdown: PricedPhase[] = phases.map(p => {
    const rate = rateFor(p.tier);
    return { ...p, rate, cost: p.hours * rate };
  });

  const hoursLow = breakdown.reduce((s, r) => s + r.hours, 0);
  const costLow  = breakdown.reduce((s, r) => s + r.cost,  0);
  const buffer   = BUFFER_PCT[detail];

  const hoursHigh = Math.round(hoursLow * (1 + buffer));
  const costHigh  = Math.round(costLow  * (1 + buffer));

  const monthlyLow  = Math.round(hoursLow  * MONTHLY_EFFECTIVE_HOURLY);
  const monthlyHigh = Math.round(hoursHigh * MONTHLY_EFFECTIVE_HOURLY);

  // Monthly is a commitment, not a discount on a two-week job — offered only
  // once the project is long enough for a dedicated month to make sense.
  const monthly: MonthlyPricing | null = hoursLow >= MONTHLY_THRESHOLD_HOURS
    ? {
        rate:             MONTHLY_RATE,
        hours_per_month:  HOURS_PER_MONTH,
        effective_hourly: MONTHLY_EFFECTIVE_HOURLY,
        // Deliberately not rounded to whole months: rounding creates cliffs
        // where 165h falls to "1 month" and picks up an accidental discount.
        months_low:       Math.round((hoursLow  / HOURS_PER_MONTH) * 10) / 10,
        months_high:      Math.round((hoursHigh / HOURS_PER_MONTH) * 10) / 10,
        low:              monthlyLow,
        high:             monthlyHigh,
        saving_vs_hourly: costLow - monthlyLow,
      }
    : null;

  return {
    breakdown,
    hours:      { low: hoursLow, high: hoursHigh },
    buffer_pct: buffer,
    hourly: {
      rate_standard:   RATE_STANDARD,
      rate_specialist: RATE_SPECIALIST,
      low:             costLow,
      high:            costHigh,
    },
    monthly,
    recommended_model: monthly ? 'monthly' : 'hourly',
    timeline: {
      low:  timelineFor(hoursLow),
      high: timelineFor(hoursHigh),
    },
  };
}

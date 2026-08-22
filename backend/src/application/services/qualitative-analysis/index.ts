// [ BACKEND > APPLICATION > SERVICES > QUALITATIVE ANALYSIS ] #######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { CompanyProfile } from "../../../domain/entities/company-profile.entity.js";
import type { AutomatedDecisionStrengths, MetricStrength } from "../../../domain/entities/automated-investment-decision.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface OverviewMetricSnapshot {
  debtToEquity: number | null;
  freeCashFlow: number | null;
  freeCashFlowCoverageYears: number | null;
  marginOfSafety: number | null;
  profitMargin: number | null;
  returnOnEquity: number | null;
}

export const QUALITATIVE_PILLAR_LABELS = [
  "Capital Efficiency",
  "Cash Generation",
  "Balance Sheet Discipline",
  "Valuation Context",
] as const;

export type QualitativePillarLabel = (typeof QUALITATIVE_PILLAR_LABELS)[number];

export interface QualitativePillar {
  description: string;
  label: QualitativePillarLabel;
  title: string;
}

export interface QualitativeAnalysis {
  pillars: QualitativePillar[];
  summary: string;
}

export interface QualitativeAnalysisGenerationInput {
  deterministicAnalysis: QualitativeAnalysis;
  metrics: OverviewMetricSnapshot;
  reportHeader: CompanyProfile;
  strengths: AutomatedDecisionStrengths;
}

export interface QualitativeAnalysisClient {
  generateOverview(
    input: QualitativeAnalysisGenerationInput,
    correlationId: string,
  ): Promise<QualitativeAnalysis>;
}
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
const METRIC_NAMES = {
  debtToEquity: "debt-to-equity",
  freeCashFlow: "free cash flow",
  marginOfSafety: "margin of safety",
  profitMargin: "profit margin",
  returnOnEquity: "return on equity",
} as const;
// 1.4. END ..........................................................................................

// 1.5. HELPERS ......................................................................................
function companySubject(reportHeader: CompanyProfile): string {
  const companyName = reportHeader.companyName?.trim();
  return companyName ? companyName : reportHeader.ticker;
}

function countStrengths(strengths: AutomatedDecisionStrengths): Record<MetricStrength, number> {
  return Object.values(strengths).reduce<Record<MetricStrength, number>>(
    (counts, strength) => {
      const metricStrength = strength as MetricStrength;
      counts[metricStrength] += 1;
      return counts;
    },
    { strong: 0, medium: 0, weak: 0 },
  );
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function listWeakMetrics(strengths: AutomatedDecisionStrengths): string[] {
  return Object.entries(strengths)
    .filter(([, strength]) => strength === "weak")
    .map(([metric]) => METRIC_NAMES[metric as keyof typeof METRIC_NAMES]);
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 1,
    notation: Math.abs(value) >= 1_000_000_000 ? "compact" : "standard",
    style: "currency",
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatRatio(value: number): string {
  return value.toFixed(2);
}

function formatMetricValue(
  metric: keyof OverviewMetricSnapshot,
  value: number | null,
): string {
  if (value === null) {
    return "unavailable";
  }

  switch (metric) {
    case "freeCashFlow":
      return formatCompactCurrency(value);
    case "freeCashFlowCoverageYears":
      return `${value.toFixed(1)}x`;
    case "debtToEquity":
      return formatRatio(value);
    case "marginOfSafety":
    case "profitMargin":
    case "returnOnEquity":
      return formatPercent(value);
  }
}

function buildSummary(
  subject: string,
  strengths: AutomatedDecisionStrengths,
): string {
  const counts = countStrengths(strengths);
  const weakMetrics = listWeakMetrics(strengths);

  if (counts.strong === 5) {
    return `${subject} currently clears every tracked quantitative rule in the framework, pairing strong profitability, cash generation, balance-sheet discipline, and valuation support.`;
  }

  if (counts.weak === 0) {
    return `${subject} shows a constructive quantitative profile, with ${counts.strong} of 5 tracked metrics screening strong and no weak readings in the current dataset.`;
  }

  if (counts.strong === 0 && counts.medium === 0) {
    return `${subject} currently falls short of the framework across all 5 tracked metrics, leaving limited quantitative support for a high-conviction case.`;
  }

  return `${subject} shows a mixed quantitative profile, with ${counts.strong} strong metric${counts.strong === 1 ? "" : "s"} offset by weakness in ${joinWithAnd(weakMetrics)}.`;
}

function buildCapitalEfficiencyPillar(
  subject: string,
  metrics: OverviewMetricSnapshot,
  strengths: AutomatedDecisionStrengths,
): QualitativePillar {
  const combinedStrengths = [strengths.returnOnEquity, strengths.profitMargin];
  let title = "Profitability evidence is limited";

  if (combinedStrengths.every((strength) => strength === "strong")) {
    title = "Returns and margins both screen strong";
  } else if (combinedStrengths.every((strength) => strength === "weak")) {
    title = "Profitability evidence is limited";
  } else if (combinedStrengths.some((strength) => strength === "weak")) {
    title = "Profitability profile is mixed";
  } else {
    title = "Profitability is solid but not uniformly strong";
  }

  return {
    label: "Capital Efficiency",
    title,
    description:
      `Return on equity (${formatMetricValue("returnOnEquity", metrics.returnOnEquity)}) and ` +
      `profit margin (${formatMetricValue("profitMargin", metrics.profitMargin)}) frame how efficiently ${subject} converts capital and revenue into profit within the current dataset.`,
  };
}

function buildCashGenerationPillar(
  subject: string,
  metrics: OverviewMetricSnapshot,
  strengths: AutomatedDecisionStrengths,
): QualitativePillar {
  let title = "Cash conversion is under pressure";

  if (strengths.freeCashFlow === "strong") {
    title = "Cash flow can fund 3 or more years of operations";
  } else if (strengths.freeCashFlow === "medium") {
    title = "Cash flow can fund 2 to under 3 years of operations";
  }

  return {
    label: "Cash Generation",
    title,
    description:
      `Free cash flow screens ${strengths.freeCashFlow} at ${formatMetricValue("freeCashFlowCoverageYears", metrics.freeCashFlowCoverageYears)}, ` +
      `which indicates how many years of operating cash flow ${subject} can currently self-fund without leaning on outside capital.`,
  };
}

function buildBalanceSheetPillar(
  metrics: OverviewMetricSnapshot,
  strengths: AutomatedDecisionStrengths,
): QualitativePillar {
  let title = "Leverage is elevated for this framework";

  if (strengths.debtToEquity === "strong") {
    title = "Leverage remains conservative";
  } else if (strengths.debtToEquity === "medium") {
    title = "Leverage remains manageable rather than conservative";
  }

  return {
    label: "Balance Sheet Discipline",
    title,
    description:
      `Debt-to-equity screens ${strengths.debtToEquity} at ${formatMetricValue("debtToEquity", metrics.debtToEquity)}, ` +
      "which sets the current balance-sheet discipline in relation to the rest of the profitability profile.",
  };
}

function buildValuationPillar(
  metrics: OverviewMetricSnapshot,
  strengths: AutomatedDecisionStrengths,
): QualitativePillar {
  let title = "The current price looks stretched";

  if (strengths.marginOfSafety === "strong") {
    title = "Current price still shows a margin of safety";
  } else if (strengths.marginOfSafety === "medium") {
    title = "Valuation is acceptable but not discounted";
  }

  return {
    label: "Valuation Context",
    title,
    description:
      `Margin of safety screens ${strengths.marginOfSafety} at ${formatMetricValue("marginOfSafety", metrics.marginOfSafety)}, ` +
      "so the current market price still needs to be weighed against the modelled intrinsic value produced by this framework.",
  };
}
// 1.5. END ..........................................................................................

// 1.6. SERVICE ......................................................................................
export function buildDeterministicQualitativeAnalysis(
  input: Omit<QualitativeAnalysisGenerationInput, "deterministicAnalysis">,
): QualitativeAnalysis {
  const subject = companySubject(input.reportHeader);

  return {
    summary: buildSummary(subject, input.strengths),
    pillars: [
      buildCapitalEfficiencyPillar(subject, input.metrics, input.strengths),
      buildCashGenerationPillar(subject, input.metrics, input.strengths),
      buildBalanceSheetPillar(input.metrics, input.strengths),
      buildValuationPillar(input.metrics, input.strengths),
    ],
  };
}
// 1.6. END ..........................................................................................

// END FILE ##########################################################################################

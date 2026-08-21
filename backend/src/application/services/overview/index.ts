// [ BACKEND > APPLICATION > SERVICES > OVERVIEW ] ###################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import { analyseProfitMargin } from "../profit-margin/index.js";
import { analyseDebtToEquity } from "../debt-to-equity/index.js";
import { analyseFreeCashFlow } from "../free-cash-flow/index.js";
import { analyseMarginOfSafety } from "../margin-of-safety/index.js";
import { analyseReturnOnEquity } from "../return-on-equity/index.js";
import type { CashFlowYear } from "../../../domain/entities/cash-flow-year.entity.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import type { CompanyProfile } from "../../../domain/entities/company-profile.entity.js";
import type { ProfitMarginYear } from "../../../domain/entities/profit-margin-year.entity.js";
import type { DebtToEquityYear } from "../../../domain/entities/debt-to-equity-year.entity.js";
import type { MarginOfSafetyYear } from "../../../domain/entities/margin-of-safety-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
import type { CompanyProfileRepository } from "../../../domain/repositories/company-profile.repository.js";
import {
  OVERVIEW_QUALITATIVE_PILLAR_LABELS,
  type OverviewQualitativeAnalysis,
  type QualitativeAnalysisRepository,
} from "../../../domain/repositories/qualitative-analysis.repository.js";
import type {
  AutomatedDecisionMetrics,
  AutomatedDecisionStatus,
  AutomatedDecisionStrengths,
} from "../../../domain/entities/automated-investment-decision.entity.js";
import type { InvestmentAnalysisRuleset } from "../../../domain/services/investment-analysis-ruleset/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface OverviewDependencies {
  companyProfileRepository: CompanyProfileRepository;
  debtToEquityRepository: FinancialDataRepository<DebtToEquityYear>;
  freeCashFlowRepository: FinancialDataRepository<CashFlowYear>;
  marginOfSafetyRepository: FinancialDataRepository<MarginOfSafetyYear>;
  profitMarginRepository: FinancialDataRepository<ProfitMarginYear>;
  qualitativeAnalysisRepository?: QualitativeAnalysisRepository;
  returnOnEquityRepository: FinancialDataRepository<FinancialYear>;
  ruleset: InvestmentAnalysisRuleset;
}

export interface OverviewAnalysis {
  metrics: AutomatedDecisionMetrics;
  qualitative: OverviewQualitativeAnalysis;
  reportHeader: CompanyProfile;
  strengths: AutomatedDecisionStrengths;
}
// 1.3. END ..........................................................................................

// 1.4. HELPERS ......................................................................................
/**
 * Collapses the horizon cards into the same single number shown on the overview
 * cards: the arithmetic mean of each horizon average. Empty horizon sets stay
 * `null` so the controller can render a placeholder instead of inventing a
 * value.
 */
function averageHorizons(horizons: Array<{ average: number }>): number | null {
  if (horizons.length === 0) {
    return null;
  }

  const total = horizons.reduce((sum, horizon) => sum + horizon.average, 0);
  return total / horizons.length;
}

function fallbackVerdictTitle(status: AutomatedDecisionStatus): string {
  switch (status) {
    case "buy":
      return "Strong Buy Candidate";
    case "watch":
      return "Watchlist Candidate";
    case "reject":
      return "Reject for Now";
  }
}

function fallbackVerdictDescription(
  ticker: string,
  status: AutomatedDecisionStatus,
  score: number,
  strengths: AutomatedDecisionStrengths,
): string {
  const strongMetrics = Object.entries(strengths)
    .filter(([, value]) => value === "strong")
    .map(([slug]) => slug);
  const weakMetrics = Object.entries(strengths)
    .filter(([, value]) => value === "weak")
    .map(([slug]) => slug);

  if (status === "buy") {
    return `${ticker} screens as a buy candidate with a Buffett-style score of ${Math.round(score)} because every tracked metric currently classifies as strong.`;
  }

  if (status === "watch") {
    return `${ticker} belongs on a watchlist with a Buffett-style score of ${Math.round(score)}. The current screen shows no weak metrics, but at least one pillar still sits in the medium band.`;
  }

  return `${ticker} is a reject for now with a Buffett-style score of ${Math.round(score)} because the current screen includes weak signals in ${weakMetrics.join(", ") || strongMetrics.join(", ") || "the tracked metrics"}.`;
}

function buildPillar(
  label: (typeof OVERVIEW_QUALITATIVE_PILLAR_LABELS)[number],
  title: string,
  description: string,
) {
  return { label, title, description };
}

function fallbackQualitativeOverview(input: {
  decision: AutomatedDecisionStatus;
  reportHeader: CompanyProfile;
  score: number;
  strengths: AutomatedDecisionStrengths;
}): OverviewQualitativeAnalysis {
  const { decision, reportHeader, score, strengths } = input;
  const companyRef = reportHeader.companyName ?? reportHeader.ticker;
  const sectorIndustry = [reportHeader.industry, reportHeader.sector].filter(Boolean).join(" in ");

  const moatTitle = strengths.returnOnEquity === "strong" && strengths.profitMargin === "strong"
    ? "Returns and margins support moat evidence"
    : strengths.returnOnEquity === "weak" || strengths.profitMargin === "weak"
      ? "Moat evidence is still unconvincing"
      : "Moat signals are mixed";

  const managementTitle = strengths.freeCashFlow === "strong" && strengths.debtToEquity !== "weak"
    ? "Cash generation supports capital discipline"
    : strengths.freeCashFlow === "weak" || strengths.debtToEquity === "weak"
      ? "Capital discipline needs more proof"
      : "Management quality reads as acceptable";

  const earningsTitle = strengths.profitMargin === "strong" && strengths.freeCashFlow !== "weak"
    ? "Earnings quality looks durable"
    : strengths.profitMargin === "weak" || strengths.freeCashFlow === "weak"
      ? "Earnings durability is uncertain"
      : "Earnings stability is moderate";

  const simplicityTitle = sectorIndustry
    ? "Business-model simplicity still needs diligence"
    : "Business-model simplicity cannot be judged confidently";

  return {
    verdict: {
      label: "Investment Verdict",
      title: fallbackVerdictTitle(decision),
      description: fallbackVerdictDescription(reportHeader.ticker, decision, score, strengths),
    },
    pillars: [
      buildPillar(
        OVERVIEW_QUALITATIVE_PILLAR_LABELS[0],
        moatTitle,
        `${companyRef} shows ${strengths.returnOnEquity} return-on-equity and ${strengths.profitMargin} profit-margin signals, which is the strongest numeric proxy this overview has for a durable competitive advantage.`,
      ),
      buildPillar(
        OVERVIEW_QUALITATIVE_PILLAR_LABELS[1],
        managementTitle,
        `${companyRef} currently screens ${strengths.freeCashFlow} on free cash flow and ${strengths.debtToEquity} on leverage, so the capital-allocation case should be read through those two facts rather than assumptions about management style.`,
      ),
      buildPillar(
        OVERVIEW_QUALITATIVE_PILLAR_LABELS[2],
        earningsTitle,
        `${companyRef} has ${strengths.profitMargin} profitability and ${strengths.freeCashFlow} cash-generation signals in the current screen, which is why the earnings-quality conclusion remains ${decision === "buy" ? "constructive" : decision === "watch" ? "measured" : "cautious"}.`,
      ),
      buildPillar(
        OVERVIEW_QUALITATIVE_PILLAR_LABELS[3],
        simplicityTitle,
        sectorIndustry
          ? `The available business context identifies ${companyRef} as operating in ${sectorIndustry}. That is enough for a screening summary, but business-model simplicity still needs manual diligence beyond the numeric overview.`
          : `The current overview lacks enough industry context to judge whether ${companyRef} has a simple business model, so this pillar stays intentionally cautious.`,
      ),
    ],
  };
}

async function buildQualitativeOverview(
  reportHeader: CompanyProfile,
  metrics: AutomatedDecisionMetrics,
  strengths: AutomatedDecisionStrengths,
  dependencies: OverviewDependencies,
  correlationId: string,
): Promise<OverviewQualitativeAnalysis> {
  const score = dependencies.ruleset.scoreDecisionStrengths(strengths);
  const decision = dependencies.ruleset.deriveDecisionStatus(strengths);
  const fallback = fallbackQualitativeOverview({ decision, reportHeader, score, strengths });

  if (!dependencies.qualitativeAnalysisRepository) {
    return fallback;
  }

  try {
    return await dependencies.qualitativeAnalysisRepository.generateOverviewQualitative(
      {
        reportHeader,
        metrics,
        strengths,
        decision,
        score,
        analysisModel: dependencies.ruleset.analysisModel,
        constitutionVersion: dependencies.ruleset.constitutionVersion,
      },
      correlationId,
    );
  } catch (error) {
    logger.warn(
      {
        correlationId,
        error: error instanceof Error ? error.message : String(error),
        ticker: reportHeader.ticker,
      },
      "Qualitative overview generation failed; returning fallback commentary",
    );
    return fallback;
  }
}
// 1.4. END ..........................................................................................

// 1.5. SERVICE ......................................................................................
/**
 * Builds the company overview from the existing profile and metric services.
 *
 * Every source is independent, so they are fetched in parallel and then reduced
 * into the small header-plus-cards payload the home page needs.
 */
export async function buildOverview(
  ticker: string,
  dependencies: OverviewDependencies,
  correlationId: string,
): Promise<OverviewAnalysis> {
  const [
    reportHeader,
    returnOnEquity,
    freeCashFlow,
    debtToEquity,
    profitMargin,
    marginOfSafety,
  ] = await Promise.all([
    dependencies.companyProfileRepository.getProfile(ticker, correlationId),
    analyseReturnOnEquity(ticker, dependencies.returnOnEquityRepository, correlationId),
    analyseFreeCashFlow(ticker, dependencies.freeCashFlowRepository, correlationId),
    analyseDebtToEquity(ticker, dependencies.debtToEquityRepository, correlationId),
    analyseProfitMargin(ticker, dependencies.profitMarginRepository, correlationId),
    analyseMarginOfSafety(ticker, dependencies.marginOfSafetyRepository, correlationId),
  ]);

  const metrics: AutomatedDecisionMetrics = {
    debtToEquity: averageHorizons(debtToEquity.horizons),
    freeCashFlow: averageHorizons(freeCashFlow.horizons),
    marginOfSafety: marginOfSafety.currentMarginOfSafety,
    profitMargin: averageHorizons(profitMargin.horizons),
    returnOnEquity: averageHorizons(returnOnEquity.horizons),
  };
  const strengths = dependencies.ruleset.classifyMetricStrengths(metrics);
  const qualitative = await buildQualitativeOverview(
    reportHeader,
    metrics,
    strengths,
    dependencies,
    correlationId,
  );

  return {
    metrics,
    qualitative,
    reportHeader,
    strengths,
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################

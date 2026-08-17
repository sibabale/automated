// [ BACKEND > PRESENTATION > CONTROLLERS > PROFIT MARGIN ] ##########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../errors/http-error/index.js";
import { statusForFmpError } from "../../fmp-error-status/index.js";
import type { ConsolidatedSummary } from "../../formatting/index.js";
import { FmpClientError } from "../../../infrastructure/clients/fmp-client/index.js";
import { analyseProfitMargin } from "../../../application/services/profit-margin/index.js";
import type { ProfitMarginYear } from "../../../domain/entities/profit-margin-year.entity.js";
import type { ProfitMarginAnalysis } from "../../../application/services/profit-margin/index.js";
import {
  calculateConsolidatedSummary,
  formatCurrency,
  formatPercent,
} from "../../formatting/index.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
import { createFmpProfitMarginDataRepository } from "../../../infrastructure/repositories/fmp-profit-margin-data/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * A single horizon card as consumed by the client: pre-formatted percentage
 * strings and a period label per year, mirroring the frontend's contract.
 */
interface HorizonView {
  label: string;
  range: string;
  value: string;
  breakdown: Array<{ period: string; value: string }>;
  trend: "up" | "down";
}

/**
 * Trailing twelve months (TTM) actuals used in formula displays: pre-formatted
 * for client consumption. TTM represents the most recent 12-month period.
 */
interface FormulaTrailingTwelveMonthsActuals {
  netIncome: string;
  revenue: string;
}

/**
 * Shape of a successful profit-margin analysis response body.
 */
export interface ProfitMarginResponse {
  correlationId: string;
  data: {
    ticker: string;
    horizons: HorizonView[];
    consolidatedSummary: ConsolidatedSummary;
    trailingTwelveMonthsActuals: FormulaTrailingTwelveMonthsActuals;
  };
}
// 1.3. END ..........................................................................................

// 1.4. MAPPING ......................................................................................
/**
 * Converts the numeric analysis into the client's presentation contract.
 *
 * Profit-margin outputs are percentages, while the formula inputs remain dollar
 * figures in the client. The consolidated summary is built from the precise
 * horizon averages, never re-parsed from formatted strings.
 */
function toResponseData(analysis: ProfitMarginAnalysis): ProfitMarginResponse["data"] {
  const horizonViews: HorizonView[] = analysis.horizons.map((horizon) => ({
    label: horizon.label,
    range: horizon.range,
    value: formatPercent(horizon.average),
    breakdown: horizon.breakdown.map((year) => ({
      period: String(year.fiscalYear),
      value: formatPercent(year.value),
    })),
    trend: horizon.trend,
  }));

  const consolidatedSummary = calculateConsolidatedSummary(
    analysis.horizons.map((horizon) => horizon.average),
    formatPercent,
  );

  const trailingTwelveMonthsActuals: FormulaTrailingTwelveMonthsActuals = {
    netIncome: formatCurrency(analysis.ttmNetIncome),
    revenue: formatCurrency(analysis.ttmRevenue),
  };

  return {
    ticker: analysis.ticker,
    horizons: horizonViews,
    consolidatedSummary,
    trailingTwelveMonthsActuals,
  };
}
// 1.4. END ..........................................................................................

// 1.5. CONTROLLER ...................................................................................
/**
 * Handles HTTP GET requests for a company's profit-margin analysis.
 *
 * Query params: ticker (required stock symbol, for example "AAPL").
 */
export const profitMarginController: RequestHandler = async (request, response, next) => {
  // 1.5.1. INPUT VALIDATION .........................................................................
  const ticker = String(request.query["ticker"] ?? "").trim().toUpperCase();

  if (!ticker) {
    return next(new HttpError(400, "Missing required query parameter: ticker"));
  }
  // 1.5.1. END ......................................................................................

  // 1.5.2. CORE LOGIC ...............................................................................
  try {
    // Tests can override repository creation for the whole app; otherwise the
    // production profit-margin repository is used. Reading the override from the
    // app keeps this controller free of any wiring decision.
    const override = request.app.get("repositoryFactory") as
      | (() => FinancialDataRepository<ProfitMarginYear>)
      | undefined;
    const repository = (override ?? createFmpProfitMarginDataRepository)();
    const analysis = await analyseProfitMargin(ticker, repository, request.correlationId);

    const body: ProfitMarginResponse = {
      correlationId: request.correlationId,
      data: toResponseData(analysis),
    };

    response.status(200).json(body);
  } catch (error) {
    if (error instanceof FmpClientError) {
      return next(new HttpError(statusForFmpError(error.kind), error.message));
    }
    next(error);
  }
  // 1.5.2. END ......................................................................................
};
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################

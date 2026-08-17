// [ BACKEND > PRESENTATION > CONTROLLERS > DEBT TO EQUITY ] #########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../errors/http-error/index.js";
import { statusForFmpError } from "../../fmp-error-status/index.js";
import type { ConsolidatedSummary } from "../../formatting/index.js";
import { FmpClientError } from "../../../infrastructure/clients/fmp-client/index.js";
import { analyseDebtToEquity } from "../../../application/services/debt-to-equity/index.js";
import type { DebtToEquityYear } from "../../../domain/entities/debt-to-equity-year.entity.js";
import type { DebtToEquityAnalysis } from "../../../application/services/debt-to-equity/index.js";
import {
  calculateConsolidatedSummary,
  formatCurrency,
  formatRatio,
} from "../../formatting/index.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
import { createFmpDebtToEquityDataRepository } from "../../../infrastructure/repositories/fmp-debt-to-equity-data/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * A single horizon card as consumed by the client: pre-formatted ratio strings
 * and a period label per year, mirroring the frontend's contract.
 */
interface HorizonView {
  label: string;
  range: string;
  value: string;
  breakdown: Array<{ period: string; value: string }>;
  trend: "up" | "down";
}

/**
 * Latest reported debt and equity actuals used in the formula display.
 */
interface TrailingTwelveMonthsActuals {
  totalDebt: string;
  shareholdersEquity: string;
}

/**
 * Shape of a successful debt-to-equity analysis response body.
 */
export interface DebtToEquityResponse {
  correlationId: string;
  data: {
    ticker: string;
    horizons: HorizonView[];
    consolidatedSummary: ConsolidatedSummary;
    trailingTwelveMonthsActuals: TrailingTwelveMonthsActuals;
  };
}
// 1.3. END ..........................................................................................

// 1.4. MAPPING ......................................................................................
/**
 * Converts the numeric analysis into the client's presentation contract.
 *
 * Debt and equity inputs are still shown as currency in the formula panel, while
 * the ratio outputs stay unitless with two decimal places. The consolidated
 * summary is built from the precise horizon averages, never re-parsed from
 * formatted strings.
 */
function toResponseData(analysis: DebtToEquityAnalysis): DebtToEquityResponse["data"] {
  const horizonViews: HorizonView[] = analysis.horizons.map((horizon) => ({
    label: horizon.label,
    range: horizon.range,
    value: formatRatio(horizon.average),
    breakdown: horizon.breakdown.map((year) => ({
      period: String(year.fiscalYear),
      value: formatRatio(year.value),
    })),
    trend: horizon.trend,
  }));

  const consolidatedSummary = calculateConsolidatedSummary(
    analysis.horizons.map((horizon) => horizon.average),
    formatRatio,
  );

  const trailingTwelveMonthsActuals: TrailingTwelveMonthsActuals = {
    totalDebt: formatCurrency(analysis.ttmTotalDebt),
    shareholdersEquity: formatCurrency(analysis.ttmShareholdersEquity),
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
 * Handles HTTP GET requests for a company's debt-to-equity analysis.
 *
 * Query params: ticker (required stock symbol, for example "AAPL").
 */
export const debtToEquityController: RequestHandler = async (request, response, next) => {
  // 1.5.1. INPUT VALIDATION .........................................................................
  const ticker = String(request.query["ticker"] ?? "").trim().toUpperCase();

  if (!ticker) {
    return next(new HttpError(400, "Missing required query parameter: ticker"));
  }
  // 1.5.1. END ......................................................................................

  // 1.5.2. CORE LOGIC ...............................................................................
  try {
    // Tests can override repository creation for the whole app; otherwise the
    // production debt-to-equity repository is used. Reading the override from
    // the app keeps this controller free of any wiring decision.
    const override = request.app.get("repositoryFactory") as
      | (() => FinancialDataRepository<DebtToEquityYear>)
      | undefined;
    const repository = (override ?? createFmpDebtToEquityDataRepository)();
    const analysis = await analyseDebtToEquity(ticker, repository, request.correlationId);

    const body: DebtToEquityResponse = {
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

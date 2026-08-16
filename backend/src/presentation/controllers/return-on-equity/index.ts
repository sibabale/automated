// [ BACKEND > PRESENTATION > CONTROLLERS > RETURN ON EQUITY ] #######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../errors/http-error/index.js";
import { statusForFmpError } from "../../fmp-error-status/index.js";
import type { ConsolidatedSummary } from "../../formatting/index.js";
import { FmpClientError } from "../../../infrastructure/clients/fmp-client/index.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import { analyseReturnOnEquity } from "../../../application/services/return-on-equity/index.js";
import type { ReturnOnEquityAnalysis } from "../../../application/services/return-on-equity/index.js";
import { formatPercent, formatCurrency, calculateConsolidatedSummary } from "../../formatting/index.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
import { createFmpFinancialDataRepository } from "../../../infrastructure/repositories/fmp-financial-data/index.js";
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
  shareholdersEquity: string;
}

/**
 * Shape of a successful return-on-equity analysis response body.
 */
export interface ReturnOnEquityResponse {
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
 * Formatting lives here, at the edge, so the service keeps returning precise
 * numbers that remain easy to test and reuse. The consolidated summary is built
 * from the precise horizon averages, never re-parsed from formatted strings.
 */
function toResponseData(analysis: ReturnOnEquityAnalysis): ReturnOnEquityResponse["data"] {
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
 * Handles HTTP GET requests for a company's return-on-equity analysis.
 *
 * Query params: ticker (required stock symbol, for example "AAPL").
 */
export const returnOnEquityController: RequestHandler = async (request, response, next) => {
  // 1.5.1. INPUT VALIDATION .........................................................................
  const ticker = String(request.query["ticker"] ?? "").trim().toUpperCase();

  if (!ticker) {
    return next(new HttpError(400, "Missing required query parameter: ticker"));
  }
  // 1.5.1. END ......................................................................................

  // 1.5.2. CORE LOGIC ...............................................................................
  try {
    // Tests can override repository creation for the whole app; otherwise the
    // production return-on-equity repository is used. Reading the override from
    // the app keeps this controller free of any wiring decision.
    const override = request.app.get("repositoryFactory") as
      | (() => FinancialDataRepository<FinancialYear>)
      | undefined;
    const repository = (override ?? createFmpFinancialDataRepository)();
    const analysis = await analyseReturnOnEquity(ticker, repository, request.correlationId);

    const body: ReturnOnEquityResponse = {
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

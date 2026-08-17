// [ BACKEND > PRESENTATION > CONTROLLERS > MARGIN OF SAFETY ] #######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../errors/http-error/index.js";
import { statusForFmpError } from "../../fmp-error-status/index.js";
import type { ConsolidatedSummary } from "../../formatting/index.js";
import { FmpClientError } from "../../../infrastructure/clients/fmp-client/index.js";
import { analyseMarginOfSafety } from "../../../application/services/margin-of-safety/index.js";
import type { MarginOfSafetyYear } from "../../../domain/entities/margin-of-safety-year.entity.js";
import type { MarginOfSafetyAnalysis } from "../../../application/services/margin-of-safety/index.js";
import {
  calculateConsolidatedSummary,
  formatPercent,
  formatSharePrice,
} from "../../formatting/index.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
import { createFmpMarginOfSafetyDataRepository } from "../../../infrastructure/repositories/fmp-margin-of-safety-data/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface HorizonView {
  label: string;
  range: string;
  value: string;
  breakdown: Array<{ period: string; value: string }>;
  trend: "up" | "down";
}

interface FormulaTrailingTwelveMonthsActuals {
  intrinsicValue: string;
  stockPrice: string;
}

export interface MarginOfSafetyResponse {
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
 * Margin of safety is now a current-snapshot metric. The historical-horizon
 * contract is preserved for compatibility, but the array is intentionally empty
 * because the documented provider endpoint exposes only the latest valuation.
 * The summary and formula facts therefore come from the one current percentage.
 */
function toResponseData(analysis: MarginOfSafetyAnalysis): MarginOfSafetyResponse["data"] {
  const currentValues =
    analysis.currentMarginOfSafety === null ? [] : [analysis.currentMarginOfSafety];

  const consolidatedSummary = calculateConsolidatedSummary(
    currentValues,
    formatPercent,
  );

  const trailingTwelveMonthsActuals: FormulaTrailingTwelveMonthsActuals = {
    intrinsicValue:
      analysis.currentIntrinsicValue === null ? "\u2014" : formatSharePrice(analysis.currentIntrinsicValue),
    stockPrice:
      analysis.currentStockPrice === null ? "\u2014" : formatSharePrice(analysis.currentStockPrice),
  };

  return {
    ticker: analysis.ticker,
    horizons: [],
    consolidatedSummary,
    trailingTwelveMonthsActuals,
  };
}
// 1.4. END ..........................................................................................

// 1.5. CONTROLLER ...................................................................................
/**
 * Handles HTTP GET requests for a company's margin-of-safety analysis.
 *
 * Query params: ticker (required stock symbol, for example "AAPL").
 */
export const marginOfSafetyController: RequestHandler = async (request, response, next) => {
  // 1.5.1. INPUT VALIDATION .........................................................................
  const ticker = String(request.query["ticker"] ?? "").trim().toUpperCase();

  if (!ticker) {
    return next(new HttpError(400, "Missing required query parameter: ticker"));
  }
  // 1.5.1. END ......................................................................................

  // 1.5.2. CORE LOGIC ...............................................................................
  try {
    const override = request.app.get("repositoryFactory") as
      | (() => FinancialDataRepository<MarginOfSafetyYear>)
      | undefined;
    const repository = (override ?? createFmpMarginOfSafetyDataRepository)();
    const analysis = await analyseMarginOfSafety(ticker, repository, request.correlationId);

    const body: MarginOfSafetyResponse = {
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

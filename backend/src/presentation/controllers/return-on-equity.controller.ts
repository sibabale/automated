// [ BACKEND > PRESENTATION > CONTROLLERS > RETURN ON EQUITY ] #######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../errors/http-error.js";
import { FmpClientError } from "../../infrastructure/clients/fmp-client.js";
import { analyseReturnOnEquity } from "../../application/services/return-on-equity.service.js";
import type { ReturnOnEquityAnalysis } from "../../application/services/return-on-equity.service.js";
import { createFmpFinancialDataRepository } from "../../infrastructure/repositories/fmp-financial-data.repository.js";
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
 * Shape of a successful return-on-equity analysis response body.
 */
export interface ReturnOnEquityResponse {
  correlationId: string;
  data: {
    ticker: string;
    horizons: HorizonView[];
  };
}
// 1.3. END ..........................................................................................

// 1.4. MAPPING ......................................................................................
/**
 * Formats a percentage to one decimal place, matching the client's display.
 */
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Converts the numeric analysis into the client's presentation contract.
 *
 * Formatting lives here, at the edge, so the service keeps returning precise
 * numbers that remain easy to test and reuse.
 */
function toResponseData(analysis: ReturnOnEquityAnalysis): ReturnOnEquityResponse["data"] {
  return {
    ticker: analysis.ticker,
    horizons: analysis.horizons.map((horizon) => ({
      label: horizon.label,
      range: horizon.range,
      value: formatPercent(horizon.averageReturnOnEquity),
      breakdown: horizon.breakdown.map((year) => ({
        period: String(year.fiscalYear),
        value: formatPercent(year.returnOnEquity),
      })),
      trend: horizon.trend,
    })),
  };
}

/**
 * Translates a provider failure into the HTTP status the client should see.
 */
function statusForFmpError(kind: FmpClientError["kind"]): number {
  switch (kind) {
    case "not-found":
      return 404;
    case "rate-limit":
      return 429;
    case "timeout":
      return 504;
    default:
      return 502;
  }
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
    const repository = createFmpFinancialDataRepository();
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

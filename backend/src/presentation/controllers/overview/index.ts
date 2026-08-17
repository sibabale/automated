// [ BACKEND > PRESENTATION > CONTROLLERS > OVERVIEW ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../errors/http-error/index.js";
import { FmpClientError } from "../../../infrastructure/clients/fmp-client/index.js";
import { buildOverview, type OverviewAnalysis } from "../../../application/services/overview/index.js";
import { createFmpCashFlowDataRepository } from "../../../infrastructure/repositories/fmp-cash-flow-data/index.js";
import { createFmpFinancialDataRepository } from "../../../infrastructure/repositories/fmp-financial-data/index.js";
import { createFmpCompanyProfileRepository } from "../../../infrastructure/repositories/fmp-company-profile/index.js";
import { createFmpProfitMarginDataRepository } from "../../../infrastructure/repositories/fmp-profit-margin-data/index.js";
import { createFmpDebtToEquityDataRepository } from "../../../infrastructure/repositories/fmp-debt-to-equity-data/index.js";
import { createFmpMarginOfSafetyDataRepository } from "../../../infrastructure/repositories/fmp-margin-of-safety-data/index.js";
import {
  formatCurrency,
  formatPercent,
  formatRatio,
  formatSharePrice,
} from "../../formatting/index.js";
import { statusForFmpError } from "../../fmp-error-status/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface OverviewMetricView {
  slug:
    | "return-on-equity"
    | "free-cash-flow"
    | "debt-to-equity"
    | "profit-margin"
    | "margin-of-safety";
  value: string;
}

interface OverviewReportHeaderView {
  companyName: string;
  industry: string;
  sector: string;
  sharePrice: string;
  ticker: string;
}

export interface OverviewResponse {
  correlationId: string;
  data: {
    metrics: OverviewMetricView[];
    reportHeader: OverviewReportHeaderView;
  };
}
// 1.3. END ..........................................................................................

// 1.4. MAPPING ......................................................................................
function formatMetricValue(
  slug: OverviewMetricView["slug"],
  value: number | null,
): string {
  if (value === null) {
    return "\u2014";
  }

  switch (slug) {
    case "debt-to-equity":
      return formatRatio(value);
    case "free-cash-flow":
      return formatCurrency(value);
    case "margin-of-safety":
    case "profit-margin":
    case "return-on-equity":
      return formatPercent(value);
  }
}

/**
 * Converts the raw overview analysis into the client's display contract.
 *
 * Missing profile facts are surfaced as em dashes so the home page can stay
 * renderable without inventing data the provider did not send.
 */
function toResponseData(analysis: OverviewAnalysis): OverviewResponse["data"] {
  return {
    metrics: [
      {
        slug: "return-on-equity",
        value: formatMetricValue("return-on-equity", analysis.metrics.returnOnEquity),
      },
      {
        slug: "free-cash-flow",
        value: formatMetricValue("free-cash-flow", analysis.metrics.freeCashFlow),
      },
      {
        slug: "debt-to-equity",
        value: formatMetricValue("debt-to-equity", analysis.metrics.debtToEquity),
      },
      {
        slug: "profit-margin",
        value: formatMetricValue("profit-margin", analysis.metrics.profitMargin),
      },
      {
        slug: "margin-of-safety",
        value: formatMetricValue("margin-of-safety", analysis.metrics.marginOfSafety),
      },
    ],
    reportHeader: {
      companyName: analysis.reportHeader.companyName ?? "\u2014",
      industry: analysis.reportHeader.industry ?? "\u2014",
      sector: analysis.reportHeader.sector ?? "\u2014",
      sharePrice:
        analysis.reportHeader.sharePrice === null
          ? "\u2014"
          : `${formatSharePrice(analysis.reportHeader.sharePrice)} USD`,
      ticker: analysis.reportHeader.ticker,
    },
  };
}
// 1.4. END ..........................................................................................

// 1.5. CONTROLLER ...................................................................................
/**
 * Handles HTTP GET requests for the company overview cards on the home page.
 *
 * Query params: ticker (required stock symbol, for example "AAPL").
 */
export const overviewController: RequestHandler = async (request, response, next) => {
  const ticker = String(request.query["ticker"] ?? "").trim().toUpperCase();

  if (!ticker) {
    return next(new HttpError(400, "Missing required query parameter: ticker"));
  }

  try {
    const analysis = await buildOverview(
      ticker,
      {
        companyProfileRepository: createFmpCompanyProfileRepository(),
        debtToEquityRepository: createFmpDebtToEquityDataRepository(),
        freeCashFlowRepository: createFmpCashFlowDataRepository(),
        marginOfSafetyRepository: createFmpMarginOfSafetyDataRepository(),
        profitMarginRepository: createFmpProfitMarginDataRepository(),
        returnOnEquityRepository: createFmpFinancialDataRepository(),
      },
      request.correlationId,
    );

    const body: OverviewResponse = {
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
};
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################

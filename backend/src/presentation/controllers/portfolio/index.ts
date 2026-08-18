// [ BACKEND > PRESENTATION > CONTROLLERS > PORTFOLIO ] ##############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "../../../errors/http-error/index.js";
import { statusForAlpacaError } from "../../alpaca-error-status/index.js";
import { formatPercent, formatSharePrice } from "../../formatting/index.js";
import type { TradeMode } from "../../../domain/entities/trade-order.entity.js";
import { getPortfolio } from "../../../application/services/get-portfolio/index.js";
import { AlpacaClientError } from "../../../infrastructure/clients/alpaca-client/index.js";
import { createAlpacaBrokerRepository } from "../../../infrastructure/repositories/alpaca-broker/index.js";
import type { PortfolioOverview, PortfolioPosition } from "../../../domain/entities/portfolio-position.entity.js";
import { createFilePurchaseSnapshotRepository } from "../../../infrastructure/repositories/file-purchase-snapshot/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface PortfolioPositionView {
  ticker: string;
  companyName: string | null;
  mode: TradeMode;
  quantity: number;
  averageEntryPrice: string | null;
  currentPrice: string | null;
  marketValue: string | null;
  unrealizedGainLoss: string | null;
  scoreAtPurchase: string | null;
  verdictAtPurchase: string | null;
  latestThesisSnapshot: Record<string, unknown> | null;
}

export interface PortfolioResponse {
  correlationId: string;
  data: {
    mode: TradeMode;
    summary: {
      totalValue: string;
      totalInvested: string;
      totalGainLoss: string;
      totalGainPercentage: string | null;
      averageScoreAtPurchase: string | null;
    };
    positions: PortfolioPositionView[];
  };
}
// 1.3. END ..........................................................................................

// 1.4. MAPPING ......................................................................................
function readMode(value: unknown): TradeMode {
  if (value === undefined || value === "paper") {
    return "paper";
  }
  if (value === "live") {
    return "live";
  }
  throw new HttpError(400, "Query parameter mode must be 'paper' or 'live'");
}

function formatCurrencyOrNull(value: number | null): string | null {
  return value === null ? null : formatSharePrice(value);
}

function formatScore(value: number | null): string | null {
  return value === null ? null : value.toFixed(1);
}

function mapPosition(position: PortfolioPosition): PortfolioPositionView {
  return {
    ticker: position.ticker,
    companyName: position.companyName,
    mode: position.mode,
    quantity: position.quantity,
    averageEntryPrice: formatCurrencyOrNull(position.averageEntryPrice),
    currentPrice: formatCurrencyOrNull(position.currentPrice),
    marketValue: formatCurrencyOrNull(position.marketValue),
    unrealizedGainLoss: formatCurrencyOrNull(position.unrealizedGainLoss),
    scoreAtPurchase: formatScore(position.scoreAtPurchase),
    verdictAtPurchase: position.verdictAtPurchase,
    latestThesisSnapshot: position.latestThesisSnapshot,
  };
}

function toResponseData(mode: TradeMode, overview: PortfolioOverview): PortfolioResponse["data"] {
  return {
    mode,
    summary: {
      totalValue: formatSharePrice(overview.summary.totalValue),
      totalInvested: formatSharePrice(overview.summary.totalInvested),
      totalGainLoss: formatSharePrice(overview.summary.totalGainLoss),
      totalGainPercentage:
        overview.summary.totalGainPercentage === null
          ? null
          : formatPercent(overview.summary.totalGainPercentage),
      averageScoreAtPurchase: formatScore(overview.summary.averageScoreAtPurchase),
    },
    positions: overview.positions.map(mapPosition),
  };
}
// 1.4. END ..........................................................................................

// 1.5. CONTROLLER ...................................................................................
export const portfolioController: RequestHandler = async (request, response, next) => {
  try {
    const mode = readMode(request.query["mode"]);
    const brokerRepository = createAlpacaBrokerRepository();
    const snapshotRepository = createFilePurchaseSnapshotRepository();
    const overview = await getPortfolio(
      mode,
      brokerRepository,
      snapshotRepository,
      request.correlationId,
    );

    const body: PortfolioResponse = {
      correlationId: request.correlationId,
      data: toResponseData(mode, overview),
    };

    response.status(200).json(body);
  } catch (error) {
    if (error instanceof AlpacaClientError) {
      return next(new HttpError(statusForAlpacaError(error.kind), error.message));
    }
    next(error);
  }
};
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################

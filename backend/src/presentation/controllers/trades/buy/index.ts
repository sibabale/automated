// [ BACKEND > PRESENTATION > CONTROLLERS > TRADES > BUY ] ###########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { formatSharePrice } from "../../../formatting/index.js";
import { HttpError } from "../../../../errors/http-error/index.js";
import { statusForAlpacaError } from "../../../alpaca-error-status/index.js";
import { AlpacaClientError } from "../../../../infrastructure/clients/alpaca-client/index.js";
import { createAlpacaBrokerRepository } from "../../../../infrastructure/repositories/alpaca-broker/index.js";
import { createFilePurchaseSnapshotRepository } from "../../../../infrastructure/repositories/file-purchase-snapshot/index.js";
import type { BrokerOrder, BuyTradeRequest, TradeMode, TradeOrderType } from "../../../../domain/entities/trade-order.entity.js";
import { placeBuyOrder, TradeAccountStateError, TradeValidationError } from "../../../../application/services/place-buy-order/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface BuyTradeRequestBody {
  ticker?: unknown;
  quantity?: unknown;
  mode?: unknown;
  side?: unknown;
  orderType?: unknown;
  limitPrice?: unknown;
  analysisModel?: unknown;
  constitutionVersion?: unknown;
  scoreAtPurchase?: unknown;
  verdictAtPurchase?: unknown;
  thesisSnapshot?: unknown;
  executionPassphrase?: unknown;
}

export interface BuyTradeResponse {
  correlationId: string;
  data: {
    order: {
      clientOrderId: string;
      brokerOrderId: string | null;
      broker: string;
      mode: TradeMode;
      status: string;
      ticker: string;
      side: "buy";
      orderType: TradeOrderType;
      quantity: number;
      limitPrice: string | null;
      filledQuantity: number | null;
      averageFillPrice: string | null;
      submittedAt: string;
    };
  };
}
// 1.3. END ..........................................................................................

// 1.4. MAPPING ......................................................................................
function toResponseData(order: BrokerOrder): BuyTradeResponse["data"] {
  return {
    order: {
      clientOrderId: order.clientOrderId,
      brokerOrderId: order.brokerOrderId,
      broker: order.broker,
      mode: order.mode,
      status: order.status,
      ticker: order.ticker,
      side: order.side,
      orderType: order.orderType,
      quantity: order.quantity,
      limitPrice: order.limitPrice === null ? null : formatSharePrice(order.limitPrice),
      filledQuantity: order.filledQuantity,
      averageFillPrice:
        order.averageFillPrice === null ? null : formatSharePrice(order.averageFillPrice),
      submittedAt: order.submittedAt,
    },
  };
}

function parseBody(body: BuyTradeRequestBody): BuyTradeRequest {
  const ticker = String(body.ticker ?? "").trim().toUpperCase();
  const quantity = Number(body.quantity);
  const mode = body.mode === "live" ? "live" : body.mode === "paper" ? "paper" : null;
  const side = body.side === "buy" ? "buy" : null;
  const orderType =
    body.orderType === "limit" ? "limit" : body.orderType === "market" ? "market" : null;
  const limitPrice =
    body.limitPrice === null || body.limitPrice === undefined || body.limitPrice === ""
      ? null
      : Number(body.limitPrice);
  const scoreAtPurchase =
    body.scoreAtPurchase === null || body.scoreAtPurchase === undefined || body.scoreAtPurchase === ""
      ? null
      : Number(body.scoreAtPurchase);

  if (!ticker) {
    throw new HttpError(400, "Missing required body field: ticker");
  }
  if (!Number.isFinite(quantity)) {
    throw new HttpError(400, "Body field quantity must be a number");
  }
  if (mode === null) {
    throw new HttpError(400, "Body field mode must be 'paper' or 'live'");
  }
  if (side === null) {
    throw new HttpError(400, "Body field side must be 'buy'");
  }
  if (orderType === null) {
    throw new HttpError(400, "Body field orderType must be 'market' or 'limit'");
  }
  if (limitPrice !== null && !Number.isFinite(limitPrice)) {
    throw new HttpError(400, "Body field limitPrice must be a number when provided");
  }
  if (scoreAtPurchase !== null && !Number.isFinite(scoreAtPurchase)) {
    throw new HttpError(400, "Body field scoreAtPurchase must be a number when provided");
  }
  if (body.thesisSnapshot !== null && body.thesisSnapshot !== undefined && !isPlainObject(body.thesisSnapshot)) {
    throw new HttpError(400, "Body field thesisSnapshot must be an object when provided");
  }

  return {
    ticker,
    quantity,
    mode,
    side,
    orderType,
    limitPrice,
    analysisModel: readOptionalString(body.analysisModel),
    constitutionVersion: readOptionalString(body.constitutionVersion),
    scoreAtPurchase,
    verdictAtPurchase: readOptionalString(body.verdictAtPurchase),
    thesisSnapshot: isPlainObject(body.thesisSnapshot) ? body.thesisSnapshot : null,
  };
}

function enforceLiveTradePassphrase(mode: TradeMode, executionPassphrase: unknown): void {
  if (mode !== "live") {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    throw new HttpError(403, "Live trading is only available in production");
  }

  const configured = process.env.LIVE_TRADE_PASSPHRASE ?? "";
  const provided = readOptionalString(executionPassphrase) ?? "";

  if (!configured) {
    throw new HttpError(500, "Live trading is not configured safely");
  }
  if (!provided) {
    throw new HttpError(403, "Live trading requires a valid execution passphrase");
  }

  const configuredBuffer = Buffer.from(configured);
  const providedBuffer = Buffer.from(provided);
  const isMatch =
    configuredBuffer.length === providedBuffer.length
    && timingSafeEqual(configuredBuffer, providedBuffer);

  if (!isMatch) {
    throw new HttpError(403, "Live trading requires a valid execution passphrase");
  }
}

function readOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
// 1.4. END ..........................................................................................

// 1.5. CONTROLLER ...................................................................................
export const buyTradeController: RequestHandler = async (request, response, next) => {
  try {
    const order = parseBody((request.body ?? {}) as BuyTradeRequestBody);
    enforceLiveTradePassphrase(order.mode, (request.body as BuyTradeRequestBody | undefined)?.executionPassphrase);

    const brokerRepository = createAlpacaBrokerRepository();
    const snapshotRepository = createFilePurchaseSnapshotRepository();
    const brokerOrder = await placeBuyOrder(
      order,
      brokerRepository,
      snapshotRepository,
      request.correlationId,
    );

    const body: BuyTradeResponse = {
      correlationId: request.correlationId,
      data: toResponseData(brokerOrder),
    };

    response.status(201).json(body);
  } catch (error) {
    if (error instanceof TradeValidationError) {
      return next(new HttpError(400, error.message));
    }
    if (error instanceof TradeAccountStateError) {
      return next(new HttpError(409, error.message));
    }
    if (error instanceof AlpacaClientError) {
      return next(new HttpError(statusForAlpacaError(error.kind), error.message));
    }
    next(error);
  }
};
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################

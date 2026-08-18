// [ BACKEND > APPLICATION > SERVICES > PLACE BUY ORDER ] ############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { randomUUID } from "node:crypto";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { BrokerRepository } from "../../../domain/repositories/broker.repository.js";
import type { PurchaseSnapshot } from "../../../domain/entities/purchase-snapshot.entity.js";
import type { BrokerOrder, BuyTradeRequest } from "../../../domain/entities/trade-order.entity.js";
import type { PurchaseSnapshotRepository } from "../../../domain/repositories/purchase-snapshot.repository.js";
// 1.2. END ..........................................................................................

// 1.3. ERRORS .......................................................................................
export class TradeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TradeValidationError";
  }
}

export class TradeAccountStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TradeAccountStateError";
  }
}
// 1.3. END ..........................................................................................

// 1.4. SERVICE ......................................................................................
/**
 * Places one buy order and persists the research snapshot that justified it.
 *
 * The broker remains the source of truth, so the snapshot is written only after
 * the broker accepts the order. This keeps local files from claiming a trade
 * exists when the ledger does not.
 */
export async function placeBuyOrder(
  order: BuyTradeRequest,
  brokerRepository: BrokerRepository,
  purchaseSnapshotRepository: PurchaseSnapshotRepository,
  correlationId: string,
): Promise<BrokerOrder> {
  validateBuyOrder(order);

  const account = await brokerRepository.getAccountStatus(order.mode, correlationId);
  if (account.tradingBlocked) {
    throw new TradeAccountStateError(`The ${order.mode} trading account is currently blocked`);
  }
  if (!["ACTIVE", "ACCOUNT_UPDATED", "active", "account_updated"].includes(account.accountStatus)) {
    throw new TradeAccountStateError(
      `The ${order.mode} trading account is not ready for trading (${account.accountStatus})`,
    );
  }

  const clientOrderId = createClientOrderId(order.mode);
  const brokerOrder = await brokerRepository.placeBuyOrder(order, clientOrderId, correlationId);

  const snapshot: PurchaseSnapshot = {
    clientOrderId: brokerOrder.clientOrderId,
    brokerOrderId: brokerOrder.brokerOrderId,
    ticker: brokerOrder.ticker,
    mode: brokerOrder.mode,
    side: brokerOrder.side,
    orderType: brokerOrder.orderType,
    quantity: brokerOrder.quantity,
    submittedAt: brokerOrder.submittedAt,
    scoreAtPurchase: order.scoreAtPurchase,
    verdictAtPurchase: order.verdictAtPurchase,
    analysisModel: order.analysisModel,
    constitutionVersion: order.constitutionVersion,
    thesisSnapshot: order.thesisSnapshot,
  };

  await purchaseSnapshotRepository.save(snapshot, correlationId);
  return brokerOrder;
}

function validateBuyOrder(order: BuyTradeRequest): void {
  if (order.side !== "buy") {
    throw new TradeValidationError("Only buy orders are supported in v1");
  }
  if (!(order.quantity > 0)) {
    throw new TradeValidationError("Buy order quantity must be greater than zero");
  }
  if (order.orderType === "limit" && order.limitPrice === null) {
    throw new TradeValidationError("Limit orders require a limit price");
  }
}

function createClientOrderId(mode: BuyTradeRequest["mode"]): string {
  return `trade-${mode}-${randomUUID().slice(0, 12)}`;
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

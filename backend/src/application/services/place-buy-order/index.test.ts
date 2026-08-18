// [ BACKEND > APPLICATION > SERVICES > PLACE BUY ORDER > TESTS ] ####################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { placeBuyOrder, TradeAccountStateError, TradeValidationError } from "./index.js";
import type { BrokerRepository } from "../../../domain/repositories/broker.repository.js";
import type { PurchaseSnapshot } from "../../../domain/entities/purchase-snapshot.entity.js";
import type { BrokerOrder, BuyTradeRequest } from "../../../domain/entities/trade-order.entity.js";
import type { PurchaseSnapshotRepository } from "../../../domain/repositories/purchase-snapshot.repository.js";
// 1.2. END ..........................................................................................

// 1.3. FIXTURES .....................................................................................
const CORRELATION_ID = "cid-place-buy-order";

function buyOrder(overrides: Partial<BuyTradeRequest> = {}): BuyTradeRequest {
  return {
    ticker: "AAPL",
    quantity: 2,
    mode: "paper",
    side: "buy",
    orderType: "market",
    limitPrice: null,
    analysisModel: "buffett_quality_v1",
    constitutionVersion: "buffett_quality_v1",
    scoreAtPurchase: 88,
    verdictAtPurchase: "green",
    thesisSnapshot: { ticker: "AAPL" },
    ...overrides,
  };
}

function brokerOrder(overrides: Partial<BrokerOrder> = {}): BrokerOrder {
  return {
    clientOrderId: "trade-paper-abc123",
    brokerOrderId: "alpaca-order-1",
    broker: "alpaca",
    mode: "paper",
    status: "accepted",
    ticker: "AAPL",
    side: "buy",
    orderType: "market",
    quantity: 2,
    limitPrice: null,
    filledQuantity: null,
    averageFillPrice: null,
    submittedAt: "2026-08-18T09:00:00.000Z",
    ...overrides,
  };
}

function fakeBrokerRepository(overrides: Partial<BrokerRepository> = {}): BrokerRepository {
  return {
    async getAccountStatus() {
      return { mode: "paper", accountStatus: "ACTIVE", tradingBlocked: false };
    },
    async placeBuyOrder() {
      return brokerOrder();
    },
    async getPortfolioPositions() {
      return [];
    },
    ...overrides,
  };
}

function fakeSnapshotRepository(
  savedSnapshots: PurchaseSnapshot[],
  shouldThrow = false,
): PurchaseSnapshotRepository {
  return {
    async save(snapshot) {
      if (shouldThrow) {
        throw new Error("disk full");
      }
      savedSnapshots.push(snapshot);
    },
    async listAll() {
      return savedSnapshots;
    },
    async findLatestByTicker() {
      return savedSnapshots[0] ?? null;
    },
  };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("placeBuyOrder", () => {
  // 1.4.1. PLACES A BUY ORDER AND WRITES THE SNAPSHOT AFTER BROKER ACCEPTANCE .......................
  it("places a buy order and writes the snapshot after broker acceptance", async () => {
    const savedSnapshots: PurchaseSnapshot[] = [];
    const result = await placeBuyOrder(
      buyOrder(),
      fakeBrokerRepository(),
      fakeSnapshotRepository(savedSnapshots),
      CORRELATION_ID,
    );

    assert.equal(result.brokerOrderId, "alpaca-order-1");
    assert.equal(savedSnapshots.length, 1);
    assert.equal(savedSnapshots[0]!.ticker, "AAPL");
    assert.equal(savedSnapshots[0]!.scoreAtPurchase, 88);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. REJECTS LIMIT ORDERS WITHOUT A LIMIT PRICE ...............................................
  it("rejects limit orders without a limit price", async () => {
    await assert.rejects(
      placeBuyOrder(
        buyOrder({ orderType: "limit", limitPrice: null }),
        fakeBrokerRepository(),
        fakeSnapshotRepository([]),
        CORRELATION_ID,
      ),
      (error: unknown) => error instanceof TradeValidationError && error.message === "Limit orders require a limit price",
    );
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. REJECTS NON POSITIVE QUANTITY ............................................................
  it("rejects non positive quantity", async () => {
    await assert.rejects(
      placeBuyOrder(
        buyOrder({ quantity: 0 }),
        fakeBrokerRepository(),
        fakeSnapshotRepository([]),
        CORRELATION_ID,
      ),
      (error: unknown) =>
        error instanceof TradeValidationError
        && error.message === "Buy order quantity must be greater than zero",
    );
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. REJECTS A BLOCKED ACCOUNT BEFORE SUBMITTING TO THE BROKER ................................
  it("rejects a blocked account before submitting to the broker", async () => {
    const repository = fakeBrokerRepository({
      async getAccountStatus() {
        return { mode: "paper", accountStatus: "ACTIVE", tradingBlocked: true };
      },
    });

    await assert.rejects(
      placeBuyOrder(buyOrder(), repository, fakeSnapshotRepository([]), CORRELATION_ID),
      (error: unknown) =>
        error instanceof TradeAccountStateError
        && error.message === "The paper trading account is currently blocked",
    );
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. DOES NOT WRITE A SNAPSHOT WHEN THE BROKER REJECTS THE ORDER ..............................
  it("does not write a snapshot when the broker rejects the order", async () => {
    const savedSnapshots: PurchaseSnapshot[] = [];
    const repository = fakeBrokerRepository({
      async placeBuyOrder() {
        throw new Error("broker unavailable");
      },
    });

    await assert.rejects(
      placeBuyOrder(buyOrder(), repository, fakeSnapshotRepository(savedSnapshots), CORRELATION_ID),
      /broker unavailable/,
    );
    assert.equal(savedSnapshots.length, 0);
  });
  // 1.4.5. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

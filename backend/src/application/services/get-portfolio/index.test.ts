// [ BACKEND > APPLICATION > SERVICES > GET PORTFOLIO > TESTS ] ######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { getPortfolio } from "./index.js";
import type { BrokerRepository } from "../../../domain/repositories/broker.repository.js";
import type { PurchaseSnapshot } from "../../../domain/entities/purchase-snapshot.entity.js";
import type { PortfolioPosition } from "../../../domain/entities/portfolio-position.entity.js";
import type { PurchaseSnapshotRepository } from "../../../domain/repositories/purchase-snapshot.repository.js";
// 1.2. END ..........................................................................................

// 1.3. FIXTURES .....................................................................................
const CORRELATION_ID = "cid-get-portfolio";

function position(overrides: Partial<PortfolioPosition> = {}): PortfolioPosition {
  return {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    mode: "paper",
    quantity: 2,
    averageEntryPrice: 180,
    currentPrice: 190,
    marketValue: 380,
    unrealizedGainLoss: 20,
    scoreAtPurchase: null,
    verdictAtPurchase: null,
    latestThesisSnapshot: null,
    ...overrides,
  };
}

function snapshot(overrides: Partial<PurchaseSnapshot> = {}): PurchaseSnapshot {
  return {
    clientOrderId: "trade-01",
    brokerOrderId: "alpaca-order-01",
    ticker: "AAPL",
    mode: "paper",
    side: "buy",
    orderType: "market",
    quantity: 2,
    submittedAt: "2026-08-18T09:00:00.000Z",
    scoreAtPurchase: 88,
    verdictAtPurchase: "green",
    analysisModel: "buffett_quality_v1",
    constitutionVersion: "buffett_quality_v1",
    thesisSnapshot: { ticker: "AAPL" },
    ...overrides,
  };
}

function fakeBrokerRepository(positions: PortfolioPosition[]): BrokerRepository {
  return {
    async getAccountStatus() {
      return { mode: "paper", accountStatus: "ACTIVE", tradingBlocked: false };
    },
    async placeBuyOrder() {
      throw new Error("not used");
    },
    async getPortfolioPositions() {
      return positions;
    },
  };
}

function fakeSnapshotRepository(snapshots: PurchaseSnapshot[]): PurchaseSnapshotRepository {
  return {
    async save() {
      throw new Error("not used");
    },
    async listAll() {
      return snapshots;
    },
    async findLatestByTicker() {
      return snapshots[0] ?? null;
    },
  };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("getPortfolio", () => {
  // 1.4.1. RETURNS AN EMPTY PORTFOLIO OVERVIEW WHEN THE BROKER HAS NO POSITIONS .....................
  it("returns an empty portfolio overview when the broker has no positions", async () => {
    const overview = await getPortfolio(
      "paper",
      fakeBrokerRepository([]),
      fakeSnapshotRepository([]),
      CORRELATION_ID,
    );

    assert.deepEqual(overview.positions, []);
    assert.equal(overview.summary.totalValue, 0);
    assert.equal(overview.summary.totalInvested, 0);
    assert.equal(overview.summary.totalGainPercentage, null);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. ENRICHES POSITIONS WITH THE LATEST SNAPSHOT FOR EACH TICKER ..............................
  it("enriches positions with the latest snapshot for each ticker", async () => {
    const overview = await getPortfolio(
      "paper",
      fakeBrokerRepository([position()]),
      fakeSnapshotRepository([
        snapshot({ clientOrderId: "trade-01", submittedAt: "2026-08-18T09:00:00.000Z", scoreAtPurchase: 81 }),
        snapshot({ clientOrderId: "trade-02", submittedAt: "2026-08-18T10:00:00.000Z", scoreAtPurchase: 88 }),
      ]),
      CORRELATION_ID,
    );

    assert.equal(overview.positions[0]!.scoreAtPurchase, 88);
    assert.equal(overview.positions[0]!.verdictAtPurchase, "green");
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. IGNORES SNAPSHOTS FOR TICKERS THAT ARE NOT CURRENTLY HELD ................................
  it("ignores snapshots for tickers that are not currently held", async () => {
    const overview = await getPortfolio(
      "paper",
      fakeBrokerRepository([position({ ticker: "AAPL" })]),
      fakeSnapshotRepository([snapshot({ ticker: "MSFT" })]),
      CORRELATION_ID,
    );

    assert.equal(overview.positions[0]!.scoreAtPurchase, null);
    assert.equal(overview.summary.averageScoreAtPurchase, null);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. CALCULATES TOTALS FROM THE ENRICHED PORTFOLIO POSITIONS ..................................
  it("calculates totals from the enriched portfolio positions", async () => {
    const overview = await getPortfolio(
      "paper",
      fakeBrokerRepository([
        position({ ticker: "AAPL", marketValue: 380, unrealizedGainLoss: 20, quantity: 2, averageEntryPrice: 180 }),
        position({ ticker: "MSFT", marketValue: 630, unrealizedGainLoss: 30, quantity: 3, averageEntryPrice: 200 }),
      ]),
      fakeSnapshotRepository([
        snapshot({ ticker: "AAPL", scoreAtPurchase: 88 }),
        snapshot({ ticker: "MSFT", scoreAtPurchase: 92 }),
      ]),
      CORRELATION_ID,
    );

    assert.equal(overview.summary.totalValue, 1010);
    assert.equal(overview.summary.totalInvested, 960);
    assert.equal(overview.summary.totalGainLoss, 50);
    assert.equal(overview.summary.averageScoreAtPurchase, 90);
  });
  // 1.4.4. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

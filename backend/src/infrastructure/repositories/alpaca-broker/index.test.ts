// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > ALPACA BROKER > TESTS ] ###############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createAlpacaBrokerRepository } from "./index.js";
import type { BuyTradeRequest } from "../../../domain/entities/trade-order.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe("createAlpacaBrokerRepository", () => {
  // 1.3.1. MAPS ACCOUNT STATUS INTO THE DOMAIN SHAPE ................................................
  it("maps account status into the domain shape", async () => {
    process.env.ALPACA_PAPER_API_BASE_URL = "http://127.0.0.1:1";
    process.env.ALPACA_PAPER_API_KEY = "paper-key";
    process.env.ALPACA_PAPER_API_SECRET = "paper-secret";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock.fn(async () => ({
      status: 200,
      async json() {
        return { status: "ACTIVE", trading_blocked: false };
      },
    } as Response));

    try {
      const repository = createAlpacaBrokerRepository();
      const account = await repository.getAccountStatus("paper", "cid-broker-001");
      assert.equal(account.accountStatus, "ACTIVE");
      assert.equal(account.tradingBlocked, false);
      assert.equal(account.mode, "paper");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
  // 1.3.1. END ......................................................................................

  // 1.3.2. MAPS A SUBMITTED ORDER INTO A BROKER ORDER ...............................................
  it("maps a submitted order into a broker order", async () => {
    process.env.ALPACA_PAPER_API_BASE_URL = "http://127.0.0.1:1";
    process.env.ALPACA_PAPER_API_KEY = "paper-key";
    process.env.ALPACA_PAPER_API_SECRET = "paper-secret";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock.fn(async () => ({
      status: 200,
      async json() {
        return {
          id: "alpaca-order-1",
          status: "accepted",
          symbol: "AAPL",
          qty: "2",
          filled_qty: "0",
          submitted_at: "2026-08-18T10:00:00.000Z",
        };
      },
    } as Response));

    const request: BuyTradeRequest = {
      ticker: "aapl",
      quantity: 2,
      mode: "paper",
      side: "buy",
      orderType: "market",
      limitPrice: null,
      analysisModel: null,
      constitutionVersion: null,
      scoreAtPurchase: null,
      verdictAtPurchase: null,
      thesisSnapshot: null,
    };

    try {
      const repository = createAlpacaBrokerRepository();
      const order = await repository.placeBuyOrder(request, "trade-01", "cid-broker-002");
      assert.equal(order.clientOrderId, "trade-01");
      assert.equal(order.brokerOrderId, "alpaca-order-1");
      assert.equal(order.ticker, "AAPL");
      assert.equal(order.quantity, 2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
  // 1.3.2. END ......................................................................................

  // 1.3.3. MAPS BROKER POSITIONS INTO PORTFOLIO POSITIONS ...........................................
  it("maps broker positions into portfolio positions", async () => {
    process.env.ALPACA_LIVE_API_BASE_URL = "http://127.0.0.1:1";
    process.env.ALPACA_LIVE_API_KEY = "live-key";
    process.env.ALPACA_LIVE_API_SECRET = "live-secret";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock.fn(async () => ({
      status: 200,
      async json() {
        return [
          {
            symbol: "MSFT",
            qty: "3",
            avg_entry_price: "400",
            current_price: "420",
            market_value: "1260",
            unrealized_pl: "60",
          },
        ];
      },
    } as Response));

    try {
      const repository = createAlpacaBrokerRepository();
      const positions = await repository.getPortfolioPositions("live", "cid-broker-003");
      assert.equal(positions.length, 1);
      assert.equal(positions[0]!.ticker, "MSFT");
      assert.equal(positions[0]!.mode, "live");
      assert.equal(positions[0]!.marketValue, 1260);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
  // 1.3.3. END ......................................................................................
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

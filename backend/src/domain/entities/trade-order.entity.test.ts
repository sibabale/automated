// [ BACKEND > DOMAIN > ENTITIES > TRADE ORDER > TESTS ] #############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { BrokerOrder, BuyTradeRequest, TradeMode, TradeOrderType, TradeSide } from "./trade-order.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe("trade-order domain contracts", () => {
  // 1.3.1. KEEPS V1 TRADE MODE VALUES EXPLICIT ......................................................
  it("keeps v1 trade mode values explicit", () => {
    const paper: TradeMode = "paper";
    const live: TradeMode = "live";

    assert.equal(paper, "paper");
    assert.equal(live, "live");
  });
  // 1.3.1. END ......................................................................................

  // 1.3.2. KEEPS V1 BUY REQUESTS LIMITED TO BUY SIDE AND ............................................
  it("keeps v1 buy requests limited to buy side and supported order types", () => {
    const request: BuyTradeRequest = {
      ticker: "AAPL",
      quantity: 2,
      mode: "paper",
      side: "buy",
      orderType: "limit",
      limitPrice: 220,
      analysisModel: "buffett_quality_v1",
      constitutionVersion: "buffett_quality_v1",
      scoreAtPurchase: 88,
      verdictAtPurchase: "green",
      thesisSnapshot: { ticker: "AAPL" },
    };
    const side: TradeSide = request.side;
    const orderType: TradeOrderType = request.orderType;

    assert.equal(side, "buy");
    assert.equal(orderType, "limit");
    assert.equal(request.limitPrice, 220);
  });
  // 1.3.2. END ......................................................................................

  // 1.3.3. REPRESENTS A BROKER ORDER WITHOUT LEAKING ................................................
  it("represents a broker order without leaking provider-specific field names", () => {
    const order: BrokerOrder = {
      clientOrderId: "auto-paper-abc123",
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
      submittedAt: "2026-08-18T08:00:00.000Z",
    };

    assert.equal(order.clientOrderId, "auto-paper-abc123");
    assert.equal(order.brokerOrderId, "alpaca-order-1");
    assert.equal(order.mode, "paper");
  });
  // 1.3.3. END ......................................................................................
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

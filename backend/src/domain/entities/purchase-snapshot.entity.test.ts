// [ BACKEND > DOMAIN > ENTITIES > PURCHASE SNAPSHOT > TESTS ] #######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { PurchaseSnapshot } from "./purchase-snapshot.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TESTS ........................................................................................
describe("purchase snapshot domain contract", () => {
  it("stores the purchase thesis separately from broker-ledger state", () => {
    const snapshot: PurchaseSnapshot = {
      clientOrderId: "auto-paper-abc123",
      brokerOrderId: "alpaca-order-1",
      ticker: "AAPL",
      mode: "paper",
      side: "buy",
      orderType: "market",
      quantity: 2,
      submittedAt: "2026-08-18T08:00:00.000Z",
      scoreAtPurchase: 88,
      verdictAtPurchase: "green",
      analysisModel: "buffett_quality_v1",
      constitutionVersion: "buffett_quality_v1",
      thesisSnapshot: {
        ticker: "AAPL",
        companyName: "Apple Inc.",
      },
    };

    assert.equal(snapshot.scoreAtPurchase, 88);
    assert.equal(snapshot.verdictAtPurchase, "green");
    assert.deepEqual(snapshot.thesisSnapshot, {
      ticker: "AAPL",
      companyName: "Apple Inc.",
    });
  });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

// [ BACKEND > DOMAIN > ENTITIES > PORTFOLIO POSITION > TESTS ] ######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { PortfolioOverview } from "./portfolio-position.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TESTS ........................................................................................
describe("portfolio position domain contract", () => {
  it("keeps broker market facts and purchase metadata together in one view", () => {
    const overview: PortfolioOverview = {
      positions: [
        {
          ticker: "AAPL",
          companyName: "Apple Inc.",
          mode: "paper",
          quantity: 2,
          averageEntryPrice: 180,
          currentPrice: 190,
          marketValue: 380,
          unrealizedGainLoss: 20,
          scoreAtPurchase: 88,
          verdictAtPurchase: "green",
          latestThesisSnapshot: { ticker: "AAPL" },
        },
      ],
      summary: {
        totalValue: 380,
        totalInvested: 360,
        totalGainLoss: 20,
        totalGainPercentage: 20 / 360 * 100,
        averageScoreAtPurchase: 88,
      },
    };

    assert.equal(overview.positions[0]!.marketValue, 380);
    assert.equal(overview.summary.totalInvested, 360);
    assert.equal(overview.summary.averageScoreAtPurchase, 88);
  });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

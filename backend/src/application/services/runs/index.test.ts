// [ BACKEND > APPLICATION > SERVICES > RUNS > TESTS ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { buildRunsPage } from "./index.js";
import type { RunsDecision } from "../../../domain/entities/runs-decision.entity.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
const decision = (ticker: string, processedAt: string): RunsDecision => ({
  apiVersion: "v1",
  ticker,
  companyName: `${ticker} Inc.`,
  batchId: "batch-1",
  sourceFile: "ticker.json",
  processedAt,
  status: "reject",
  scoreAtPurchase: 72,
  analysisModel: "automated-investment-v1",
  constitutionVersion: "all-five-metrics-must-be-strong",
});
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("buildRunsPage", () => {
  it("orders runs newest first and paginates them", async () => {
    const page = await buildRunsPage(
      [
        decision("AAPL", "2026-08-18T09:00:00.000Z"),
        decision("MSFT", "2026-08-19T10:00:00.000Z"),
        decision("GOOG", "2026-08-17T08:00:00.000Z"),
      ],
      1,
      2,
      "cid-runs-test",
    );

    assert.equal(page.totalItems, 3);
    assert.equal(page.totalPages, 2);
    assert.deepEqual(page.items.map((item) => item.ticker), ["MSFT", "AAPL"]);
  });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

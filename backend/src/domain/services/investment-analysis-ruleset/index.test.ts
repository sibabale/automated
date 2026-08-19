// [ BACKEND > DOMAIN > SERVICES > INVESTMENT ANALYSIS RULESET > TESTS ] #############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { resolveInvestmentAnalysisRuleset } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe("resolveInvestmentAnalysisRuleset", () => {
  it("keeps the original free-cash-flow threshold in v1", () => {
    const ruleset = resolveInvestmentAnalysisRuleset("v1");

    const strengths = ruleset.classifyMetricStrengths({
      returnOnEquity: 25,
      freeCashFlow: 7_000_000_000,
      debtToEquity: 0.4,
      profitMargin: 25,
      marginOfSafety: 25,
    });

    assert.equal(strengths.freeCashFlow, "medium");
    assert.equal(ruleset.analysisModel, "automated-investment-v1");
  });

  it("uses the lower sample free-cash-flow threshold in v2", () => {
    const ruleset = resolveInvestmentAnalysisRuleset("v2");

    const strengths = ruleset.classifyMetricStrengths({
      returnOnEquity: 25,
      freeCashFlow: 7_000_000_000,
      debtToEquity: 0.4,
      profitMargin: 25,
      marginOfSafety: 25,
    });

    assert.equal(strengths.freeCashFlow, "strong");
    assert.equal(ruleset.analysisModel, "automated-investment-v2");
  });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

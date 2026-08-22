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
  it("treats free-cash-flow coverage below 2x as weak in v1", () => {
    const ruleset = resolveInvestmentAnalysisRuleset("v1");

    const strengths = ruleset.classifyMetricStrengths({
      returnOnEquity: 25,
      freeCashFlow: 7_000_000_000,
      freeCashFlowCoverageYears: 1.5,
      debtToEquity: 0.4,
      profitMargin: 25,
      marginOfSafety: 25,
    });

    assert.equal(strengths.freeCashFlow, "weak");
    assert.equal(ruleset.analysisModel, "automated-investment-v1");
  });

  it("treats free-cash-flow coverage from 2x up to below 3x as medium in v2", () => {
    const ruleset = resolveInvestmentAnalysisRuleset("v2");

    const strengths = ruleset.classifyMetricStrengths({
      returnOnEquity: 25,
      freeCashFlow: 1,
      freeCashFlowCoverageYears: 2.8,
      debtToEquity: 0.4,
      profitMargin: 25,
      marginOfSafety: 25,
    });

    assert.equal(strengths.freeCashFlow, "medium");
    assert.equal(ruleset.analysisModel, "automated-investment-v2");
  });

  it("treats free-cash-flow coverage of 3x and above as strong", () => {
    const ruleset = resolveInvestmentAnalysisRuleset("v1");

    const strengths = ruleset.classifyMetricStrengths({
      returnOnEquity: 25,
      freeCashFlow: 1,
      freeCashFlowCoverageYears: 3,
      debtToEquity: 0.4,
      profitMargin: 25,
      marginOfSafety: 25,
    });

    assert.equal(strengths.freeCashFlow, "strong");
  });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

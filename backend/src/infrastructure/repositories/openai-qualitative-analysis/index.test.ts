// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > OPENAI QUALITATIVE ANALYSIS > TESTS ] ##################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createOpenAiQualitativeAnalysisRepository } from "./index.js";
import { resolveInvestmentAnalysisRuleset } from "../../../domain/services/investment-analysis-ruleset/index.js";
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const input = {
  reportHeader: {
    companyName: "Apple Inc.",
    industry: "Consumer Electronics",
    sector: "Technology",
    sharePrice: 184.25,
    ticker: "AAPL",
  },
  metrics: {
    returnOnEquity: 25,
    freeCashFlow: 96000000000,
    debtToEquity: 1.5,
    profitMargin: 20,
    marginOfSafety: 25,
  },
  strengths: resolveInvestmentAnalysisRuleset("v1").classifyMetricStrengths({
    returnOnEquity: 25,
    freeCashFlow: 96000000000,
    debtToEquity: 1.5,
    profitMargin: 20,
    marginOfSafety: 25,
  }),
  decision: "watch" as const,
  score: 76,
  analysisModel: "automated-investment-v1",
  constitutionVersion: "all-five-metrics-must-be-strong",
};
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createOpenAiQualitativeAnalysisRepository", () => {
  it("maps a structured OpenAI response into the overview qualitative contract", async () => {
    const repository = createOpenAiQualitativeAnalysisRepository({
      client: {
        async generateStructuredOutput() {
          return {
            model: "gpt-5-mini",
            outputText: JSON.stringify({
              verdict: {
                label: "ignored",
                title: "Watchlist Candidate",
                description: "The metrics are mixed but not broken.",
              },
              pillars: [
                {
                  label: "ignored",
                  title: "Moat signals are mixed",
                  description: "Returns and margins show quality, but leverage tempers conviction.",
                },
                {
                  label: "ignored",
                  title: "Capital discipline is acceptable",
                  description: "Cash generation supports operations while leverage remains manageable.",
                },
                {
                  label: "ignored",
                  title: "Earnings look fairly durable",
                  description: "Profitability and cash generation support a stable earnings base.",
                },
                {
                  label: "ignored",
                  title: "Business simplicity needs a manual check",
                  description: "The available facts are enough for screening, not for business-model diligence.",
                },
              ],
            }),
          };
        },
      },
    });

    const result = await repository.generateOverviewQualitative(input, "cid-qualitative-repo-001");

    assert.deepEqual(result, {
      verdict: {
        label: "Investment Verdict",
        title: "Watchlist Candidate",
        description: "The metrics are mixed but not broken.",
      },
      pillars: [
        {
          label: "Durable Competitive Advantage",
          title: "Moat signals are mixed",
          description: "Returns and margins show quality, but leverage tempers conviction.",
        },
        {
          label: "Management Quality",
          title: "Capital discipline is acceptable",
          description: "Cash generation supports operations while leverage remains manageable.",
        },
        {
          label: "Predictable Earnings",
          title: "Earnings look fairly durable",
          description: "Profitability and cash generation support a stable earnings base.",
        },
        {
          label: "Simple Business Model",
          title: "Business simplicity needs a manual check",
          description: "The available facts are enough for screening, not for business-model diligence.",
        },
      ],
    });
  });

  it("builds the OpenAI prompt from normalized overview facts", async () => {
    let capturedInput = "";

    const repository = createOpenAiQualitativeAnalysisRepository({
      client: {
        async generateStructuredOutput(request) {
          capturedInput = request.input;
          return {
            model: "gpt-5-mini",
            outputText: JSON.stringify({
              verdict: {
                label: "ignored",
                title: "Watchlist Candidate",
                description: "Mixed signals.",
              },
              pillars: [
                { label: "ignored", title: "1", description: "1" },
                { label: "ignored", title: "2", description: "2" },
                { label: "ignored", title: "3", description: "3" },
                { label: "ignored", title: "4", description: "4" },
              ],
            }),
          };
        },
      },
    });

    await repository.generateOverviewQualitative(input, "cid-qualitative-repo-002");

    assert.match(capturedInput, /"ticker":"AAPL"/);
    assert.match(capturedInput, /"industry":"Consumer Electronics"/);
    assert.match(capturedInput, /"decision":"watch"/);
    assert.match(capturedInput, /"constitutionVersion":"all-five-metrics-must-be-strong"/);
    assert.match(capturedInput, /"returnOnEquity":25/);
    assert.match(capturedInput, /"freeCashFlow":"?96000000000"?/);
  });

  it("rejects malformed structured output", async () => {
    const repository = createOpenAiQualitativeAnalysisRepository({
      client: {
        async generateStructuredOutput() {
          return {
            model: "gpt-5-mini",
            outputText: JSON.stringify({
              verdict: { title: "Missing description" },
              pillars: [],
            }),
          };
        },
      },
    });

    await assert.rejects(
      repository.generateOverviewQualitative(input, "cid-qualitative-repo-003"),
      /verdict title and description|exactly four pillars/,
    );
  });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

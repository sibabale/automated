// [ BACKEND > APPLICATION > SERVICES > OVERVIEW > TESTS ] ###########################################
//
// These tests prove the overview service reuses the existing metric analyzers,
// reduces them to the current card values, and adds structured qualitative
// commentary without failing the numeric overview when AI generation is absent.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { buildOverview } from "./index.js";
import type { CashFlowYear } from "../../../domain/entities/cash-flow-year.entity.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import type { CompanyProfile } from "../../../domain/entities/company-profile.entity.js";
import type { ProfitMarginYear } from "../../../domain/entities/profit-margin-year.entity.js";
import type { DebtToEquityYear } from "../../../domain/entities/debt-to-equity-year.entity.js";
import type { MarginOfSafetyYear } from "../../../domain/entities/margin-of-safety-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
import type { CompanyProfileRepository } from "../../../domain/repositories/company-profile.repository.js";
import { resolveInvestmentAnalysisRuleset } from "../../../domain/services/investment-analysis-ruleset/index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
const CORRELATION_ID = "cid-overview-service-001";

function profileRepository(profile: CompanyProfile): CompanyProfileRepository {
  return {
    async getProfile() {
      return profile;
    },
  };
}

function financialRepository<TYear>(years: TYear[]): FinancialDataRepository<TYear> {
  return {
    async getAnnualFinancials() {
      return years;
    },
  };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("buildOverview", () => {
  it("returns the current overview facts plus generated qualitative output", async () => {
    let capturedInput: unknown;

    const overview = await buildOverview(
      "AAPL",
      {
        companyProfileRepository: profileRepository({
          companyName: "Apple Inc.",
          industry: "Consumer Electronics",
          sector: "Technology",
          sharePrice: 184.25,
          ticker: "AAPL",
        }),
        debtToEquityRepository: financialRepository<DebtToEquityYear>([
          { fiscalYear: 2024, totalDebt: 150, shareholdersEquity: 75 },
          { fiscalYear: 2023, totalDebt: 120, shareholdersEquity: 80 },
          { fiscalYear: 2022, totalDebt: 100, shareholdersEquity: 100 },
        ]),
        freeCashFlowRepository: financialRepository<CashFlowYear>([
          { fiscalYear: 2024, operatingCashFlow: 140, capitalExpenditure: -20 },
          { fiscalYear: 2023, operatingCashFlow: 120, capitalExpenditure: -30 },
          { fiscalYear: 2022, operatingCashFlow: 100, capitalExpenditure: -20 },
        ]),
        marginOfSafetyRepository: financialRepository<MarginOfSafetyYear>([
          { fiscalYear: 2024, intrinsicValue: 200, stockPrice: 150 },
        ]),
        profitMarginRepository: financialRepository<ProfitMarginYear>([
          { fiscalYear: 2024, netIncome: 30, revenue: 100 },
          { fiscalYear: 2023, netIncome: 20, revenue: 100 },
          { fiscalYear: 2022, netIncome: 10, revenue: 100 },
        ]),
        qualitativeAnalysisRepository: {
          async generateOverviewQualitative(input) {
            capturedInput = input;
            return {
              verdict: {
                label: "Investment Verdict",
                title: "Watchlist Candidate",
                description: "The metrics are mixed but still constructive.",
              },
              pillars: [
                {
                  label: "Durable Competitive Advantage",
                  title: "Moat signals are encouraging",
                  description: "Returns and margins point to solid economics.",
                },
                {
                  label: "Management Quality",
                  title: "Capital discipline is acceptable",
                  description: "Cash flow supports investment while leverage remains manageable.",
                },
                {
                  label: "Predictable Earnings",
                  title: "Earnings quality looks durable",
                  description: "Profitability and cash generation support resilience.",
                },
                {
                  label: "Simple Business Model",
                  title: "Manual diligence still matters",
                  description: "The business description is concise but not exhaustive.",
                },
              ],
            };
          },
        },
        returnOnEquityRepository: financialRepository<FinancialYear>([
          { fiscalYear: 2024, netIncome: 20, shareholdersEquity: 100 },
          { fiscalYear: 2023, netIncome: 30, shareholdersEquity: 100 },
          { fiscalYear: 2022, netIncome: 40, shareholdersEquity: 100 },
        ]),
        ruleset: resolveInvestmentAnalysisRuleset("v1"),
      },
      CORRELATION_ID,
    );

    assert.deepEqual(overview.reportHeader, {
      companyName: "Apple Inc.",
      industry: "Consumer Electronics",
      sector: "Technology",
      sharePrice: 184.25,
      ticker: "AAPL",
    });
    assert.deepEqual(overview.metrics, {
      debtToEquity: (2 + 1.5 + 1) / 3,
      freeCashFlow: (120 + 90 + 80) / 3,
      marginOfSafety: 25,
      profitMargin: (30 + 20 + 10) / 3,
      returnOnEquity: (20 + 30 + 40) / 3,
    });
    assert.deepEqual(overview.strengths, {
      returnOnEquity: "strong",
      freeCashFlow: "medium",
      debtToEquity: "medium",
      profitMargin: "strong",
      marginOfSafety: "strong",
    });
    assert.deepEqual(overview.qualitative.verdict, {
      label: "Investment Verdict",
      title: "Watchlist Candidate",
      description: "The metrics are mixed but still constructive.",
    });
    assert.deepEqual(capturedInput, {
      reportHeader: overview.reportHeader,
      metrics: overview.metrics,
      strengths: overview.strengths,
      decision: "watch",
      score: 84,
      analysisModel: "automated-investment-v1",
      constitutionVersion: "all-five-metrics-must-be-strong",
    });
  });

  it("builds a fallback qualitative summary when no qualitative repository is configured", async () => {
    const overview = await buildOverview(
      "MISS",
      {
        companyProfileRepository: profileRepository({
          companyName: null,
          industry: null,
          sector: null,
          sharePrice: null,
          ticker: "MISS",
        }),
        debtToEquityRepository: financialRepository<DebtToEquityYear>([]),
        freeCashFlowRepository: financialRepository<CashFlowYear>([]),
        marginOfSafetyRepository: financialRepository<MarginOfSafetyYear>([
          { fiscalYear: 2024, intrinsicValue: 0, stockPrice: 10 },
        ]),
        profitMarginRepository: financialRepository<ProfitMarginYear>([]),
        returnOnEquityRepository: financialRepository<FinancialYear>([]),
        ruleset: resolveInvestmentAnalysisRuleset("v1"),
      },
      "cid-overview-service-002",
    );

    assert.deepEqual(overview.metrics, {
      debtToEquity: null,
      freeCashFlow: null,
      marginOfSafety: null,
      profitMargin: null,
      returnOnEquity: null,
    });
    assert.equal(overview.qualitative.verdict.label, "Investment Verdict");
    assert.equal(overview.qualitative.pillars.length, 4);
  });

  it("falls back when qualitative generation throws", async () => {
    const overview = await buildOverview(
      "AAPL",
      {
        companyProfileRepository: profileRepository({
          companyName: "Apple Inc.",
          industry: "Consumer Electronics",
          sector: "Technology",
          sharePrice: 184.25,
          ticker: "AAPL",
        }),
        debtToEquityRepository: financialRepository<DebtToEquityYear>([]),
        freeCashFlowRepository: financialRepository<CashFlowYear>([]),
        marginOfSafetyRepository: financialRepository<MarginOfSafetyYear>([
          { fiscalYear: 2024, intrinsicValue: 0, stockPrice: 150 },
        ]),
        profitMarginRepository: financialRepository<ProfitMarginYear>([]),
        qualitativeAnalysisRepository: {
          async generateOverviewQualitative() {
            throw new Error("provider unavailable");
          },
        },
        returnOnEquityRepository: financialRepository<FinancialYear>([]),
        ruleset: resolveInvestmentAnalysisRuleset("v1"),
      },
      "cid-overview-service-003",
    );

    assert.equal(overview.qualitative.verdict.label, "Investment Verdict");
    assert.equal(overview.qualitative.verdict.title, "Reject for Now");
    assert.equal(overview.qualitative.pillars.length, 4);
  });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

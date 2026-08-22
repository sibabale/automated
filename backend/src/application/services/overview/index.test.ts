// [ BACKEND > APPLICATION > SERVICES > OVERVIEW > TESTS ] ###########################################
//
// These tests prove the overview service reuses the existing metric analyzers
// and reduces them to the exact current card values the home page needs.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { buildOverview } from "./index.js";
import type { QualitativeAnalysisClient } from "../qualitative-analysis/index.js";
import type { CashFlowYear } from "../../../domain/entities/cash-flow-year.entity.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import type { CompanyProfile } from "../../../domain/entities/company-profile.entity.js";
import type { ProfitMarginYear } from "../../../domain/entities/profit-margin-year.entity.js";
import type { DebtToEquityYear } from "../../../domain/entities/debt-to-equity-year.entity.js";
import type { MarginOfSafetyYear } from "../../../domain/entities/margin-of-safety-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
import type { CompanyProfileRepository } from "../../../domain/repositories/company-profile.repository.js";
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
  // 1.4.1. RETURNS THE HEADER FACTS AND CURRENT CARD VALUES .........................................
  it("returns the current overview header facts and summary values for every metric", async () => {
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
        returnOnEquityRepository: financialRepository<FinancialYear>([
          { fiscalYear: 2024, netIncome: 20, shareholdersEquity: 100 },
          { fiscalYear: 2023, netIncome: 30, shareholdersEquity: 100 },
          { fiscalYear: 2022, netIncome: 40, shareholdersEquity: 100 },
        ]),
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
      freeCashFlowCoverageYears: 120 / 140,
      marginOfSafety: 25,
      profitMargin: (30 + 20 + 10) / 3,
      returnOnEquity: (20 + 30 + 40) / 3,
    });
    assert.deepEqual(overview.strengths, {
      returnOnEquity: "strong",
      freeCashFlow: "weak",
      debtToEquity: "medium",
      profitMargin: "strong",
      marginOfSafety: "strong",
    });
    assert.deepEqual(overview.qualitativeAnalysis, {
      summary:
        "Apple Inc. shows a constructive quantitative profile, with 3 of 5 tracked metrics screening strong and no weak readings in the current dataset.",
      pillars: [
        {
          label: "Capital Efficiency",
          title: "Returns and margins both screen strong",
          description:
            "Return on equity (30.0%) and profit margin (20.0%) frame how efficiently Apple Inc. converts capital and revenue into profit within the current dataset.",
        },
        {
          label: "Cash Generation",
          title: "Cash conversion is under pressure",
          description:
            "Free cash flow screens weak at 0.9x, which indicates how many years of operating cash flow Apple Inc. can currently self-fund without leaning on outside capital.",
        },
        {
          label: "Balance Sheet Discipline",
          title: "Leverage remains manageable rather than conservative",
          description:
            "Debt-to-equity screens medium at 1.50, which sets the current balance-sheet discipline in relation to the rest of the profitability profile.",
        },
        {
          label: "Valuation Context",
          title: "Current price still shows a margin of safety",
          description:
            "Margin of safety screens strong at 25.0%, so the current market price still needs to be weighed against the modelled intrinsic value produced by this framework.",
        },
      ],
    });
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. KEEPS EMPTY OR INVALID SOURCES AS NULL PLACEHOLDERS ......................................
  it("keeps empty horizon metrics and unusable margin of safety as null placeholders", async () => {
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
      },
      "cid-overview-service-002",
    );

    assert.deepEqual(overview.metrics, {
      debtToEquity: null,
      freeCashFlow: null,
      freeCashFlowCoverageYears: null,
      marginOfSafety: null,
      profitMargin: null,
      returnOnEquity: null,
    });
    assert.deepEqual(overview.qualitativeAnalysis, {
      summary:
        "MISS currently falls short of the framework across all 5 tracked metrics, leaving limited quantitative support for a high-conviction case.",
      pillars: [
        {
          label: "Capital Efficiency",
          title: "Profitability evidence is limited",
          description:
            "Return on equity (unavailable) and profit margin (unavailable) frame how efficiently MISS converts capital and revenue into profit within the current dataset.",
        },
        {
          label: "Cash Generation",
          title: "Cash conversion is under pressure",
          description:
            "Free cash flow screens weak at unavailable, which indicates how much room MISS currently has to fund investment needs without leaning on outside capital.",
        },
        {
          label: "Balance Sheet Discipline",
          title: "Leverage is elevated for this framework",
          description:
            "Debt-to-equity screens weak at unavailable, which sets the current balance-sheet discipline in relation to the rest of the profitability profile.",
        },
        {
          label: "Valuation Context",
          title: "The current price looks stretched",
          description:
            "Margin of safety screens weak at unavailable, so the current market price still needs to be weighed against the modelled intrinsic value produced by this framework.",
        },
      ],
    });
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. USES AN INJECTED QUALITATIVE ANALYSIS CLIENT WHEN AVAILABLE ..............................
  it("uses an injected qualitative analysis client and passes the grounded overview inputs to it", async () => {
    const captured: Array<{ correlationId: string; ticker: string }> = [];
    const qualitativeAnalysisClient: QualitativeAnalysisClient = {
      async generateOverview(input, correlationId) {
        captured.push({ correlationId, ticker: input.reportHeader.ticker });
        assert.deepEqual(input.strengths, {
          returnOnEquity: "strong",
          freeCashFlow: "weak",
          debtToEquity: "medium",
          profitMargin: "strong",
          marginOfSafety: "strong",
        });
        assert.equal(
          input.deterministicAnalysis.summary,
          "Apple Inc. shows a constructive quantitative profile, with 3 of 5 tracked metrics screening strong and no weak readings in the current dataset.",
        );

        return {
          summary: "Custom AI overview",
          pillars: [
            {
              label: "Capital Efficiency",
              title: "AI capital efficiency title",
              description: "AI capital efficiency description",
            },
            {
              label: "Cash Generation",
              title: "AI cash generation title",
              description: "AI cash generation description",
            },
            {
              label: "Balance Sheet Discipline",
              title: "AI balance sheet title",
              description: "AI balance sheet description",
            },
            {
              label: "Valuation Context",
              title: "AI valuation title",
              description: "AI valuation description",
            },
          ],
        };
      },
    };

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
        qualitativeAnalysisClient,
        returnOnEquityRepository: financialRepository<FinancialYear>([
          { fiscalYear: 2024, netIncome: 20, shareholdersEquity: 100 },
          { fiscalYear: 2023, netIncome: 30, shareholdersEquity: 100 },
          { fiscalYear: 2022, netIncome: 40, shareholdersEquity: 100 },
        ]),
      },
      CORRELATION_ID,
    );

    assert.deepEqual(captured, [{ correlationId: CORRELATION_ID, ticker: "AAPL" }]);
    assert.equal(overview.qualitativeAnalysis.summary, "Custom AI overview");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. FALLS BACK TO THE DETERMINISTIC ANALYSIS WHEN THE AI CLIENT FAILS ........................
  it("falls back to the deterministic analysis when the injected qualitative analysis client throws", async () => {
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
        qualitativeAnalysisClient: {
          async generateOverview() {
            throw new Error("provider offline");
          },
        },
        returnOnEquityRepository: financialRepository<FinancialYear>([
          { fiscalYear: 2024, netIncome: 20, shareholdersEquity: 100 },
          { fiscalYear: 2023, netIncome: 30, shareholdersEquity: 100 },
          { fiscalYear: 2022, netIncome: 40, shareholdersEquity: 100 },
        ]),
      },
      CORRELATION_ID,
    );

    assert.equal(
      overview.qualitativeAnalysis.summary,
      "Apple Inc. shows a constructive quantitative profile, with 3 of 5 tracked metrics screening strong and no weak readings in the current dataset.",
    );
  });
  // 1.4.4. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

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
      marginOfSafety: 25,
      profitMargin: (30 + 20 + 10) / 3,
      returnOnEquity: (20 + 30 + 40) / 3,
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
      marginOfSafety: null,
      profitMargin: null,
      returnOnEquity: null,
    });
  });
  // 1.4.2. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

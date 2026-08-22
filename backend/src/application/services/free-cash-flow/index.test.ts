// [ BACKEND > APPLICATION > SERVICES > FREE CASH FLOW > TESTS ] #####################################
//
// Table-driven tests for the free-cash-flow formula and the analysis wrapper.
// The formula cases assert the exact sign convention (capital expenditure is a
// negative outflow, so it is added) and the wrapper cases pin the trailing
// twelve-month actuals read from the latest year, including the empty fallback.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
  calculateFreeCashFlow,
  calculateFreeCashFlowCoverageYears,
  analyseFreeCashFlow,
} from "./index.js";
import type { CashFlowYear } from "../../../domain/entities/cash-flow-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/** Builds a cash-flow year fixture with an explicit fiscal year. */
function cashFlowYear(
  fiscalYear: number,
  operatingCashFlow: number,
  capitalExpenditure: number,
): CashFlowYear {
  return { fiscalYear, operatingCashFlow, capitalExpenditure };
}

/** A repository stub returning fixed cash-flow years, keeping tests off the network. */
function fakeRepository(years: CashFlowYear[]): FinancialDataRepository<CashFlowYear> {
  return {
    async getAnnualFinancials() {
      return years;
    },
  };
}

const CORRELATION_ID = "test-correlation-id";
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("calculateFreeCashFlow", () => {
  // 1.4.1. ADDS A NEGATIVE CAPITAL EXPENDITURE OUTFLOW ..............................................
  it("adds the negative capital expenditure to operating cash flow (kills '+' to '-')", () => {
    assert.equal(calculateFreeCashFlow(cashFlowYear(2024, 110_000, -30_000)), 80_000);
  });

  describe("calculateFreeCashFlowCoverageYears", () => {
    it("returns the free-cash-flow-to-operating-cash-flow ratio for positive operating cash flow", () => {
      assert.equal(calculateFreeCashFlowCoverageYears(cashFlowYear(2024, 100_000, -20_000)), 0.8);
    });

    it("returns null when operating cash flow is zero or negative", () => {
      assert.equal(calculateFreeCashFlowCoverageYears(cashFlowYear(2024, 0, -20_000)), null);
      assert.equal(calculateFreeCashFlowCoverageYears(cashFlowYear(2024, -10_000, -20_000)), null);
    });
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. RETURNS ZERO WHEN OUTFLOW MATCHES INFLOW .................................................
  it("returns zero when the outflow exactly offsets the inflow", () => {
    assert.equal(calculateFreeCashFlow(cashFlowYear(2024, 30_000, -30_000)), 0);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS A NEGATIVE RESULT WHEN OUTFLOW EXCEEDS INFLOW ....................................
  it("returns a negative free cash flow when spending exceeds operating cash", () => {
    assert.equal(calculateFreeCashFlow(cashFlowYear(2024, 20_000, -50_000)), -30_000);
  });
  // 1.4.3. END ......................................................................................
});

describe("analyseFreeCashFlow", () => {
  // 1.4.4. READS TRAILING TWELVE MONTH ACTUALS FROM THE LATEST YEAR .................................
  it("reads trailing twelve-month actuals from the newest reported year", async () => {
    const years = [
      cashFlowYear(2024, 110_000, -30_000),
      cashFlowYear(2023, 100_000, -25_000),
      cashFlowYear(2022, 90_000, -20_000),
    ];

    const analysis = await analyseFreeCashFlow("AAPL", fakeRepository(years), CORRELATION_ID);

    assert.equal(analysis.ticker, "AAPL");
    assert.equal(analysis.ttmOperatingCashFlow, 110_000);
    assert.equal(analysis.ttmCapitalExpenditure, -30_000);
    assert.equal(analysis.ttmCoverageYears, 80_000 / 110_000);
    assert.ok(analysis.horizons.length > 0);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. AVERAGES FREE CASH FLOW ACROSS THE HORIZON ...............................................
  it("averages the free-cash-flow values across a horizon", async () => {
    const years = [
      cashFlowYear(2024, 110_000, -30_000),
      cashFlowYear(2023, 100_000, -20_000),
      cashFlowYear(2022, 90_000, -10_000),
    ];

    const analysis = await analyseFreeCashFlow("AAPL", fakeRepository(years), CORRELATION_ID);

    const expectedAverage = (80_000 + 80_000 + 80_000) / 3;
    assert.equal(analysis.horizons[0]!.average, expectedAverage);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. FALLS BACK TO ZERO ACTUALS FOR EMPTY HISTORY .............................................
  it("falls back to zero trailing actuals when the provider returns no years", async () => {
    const analysis = await analyseFreeCashFlow("AAPL", fakeRepository([]), CORRELATION_ID);

    assert.equal(analysis.ttmOperatingCashFlow, 0);
    assert.equal(analysis.ttmCapitalExpenditure, 0);
    assert.equal(analysis.ttmCoverageYears, null);
    assert.deepEqual(analysis.horizons, []);
  });
  // 1.4.6. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

// [ BACKEND > APPLICATION > SERVICES > PROFIT MARGIN > TESTS ] ######################################
//
// Table-driven tests for the profit-margin formula and the analysis wrapper.
// The formula cases pin the exact percentage math and the zero-revenue guard,
// while the wrapper cases prove that unusable years are dropped without
// distorting the remaining horizon average.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { analyseProfitMargin, calculateProfitMargin } from "./index.js";
import type { ProfitMarginYear } from "../../../domain/entities/profit-margin-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/** Builds a profit-margin year fixture with an explicit fiscal year. */
function profitMarginYear(fiscalYear: number, netIncome: number, revenue: number): ProfitMarginYear {
  return { fiscalYear, netIncome, revenue };
}

/** A repository stub returning fixed income-statement years, keeping tests off the network. */
function fakeRepository(years: ProfitMarginYear[]): FinancialDataRepository<ProfitMarginYear> {
  return {
    async getAnnualFinancials() {
      return years;
    },
  };
}

const CORRELATION_ID = "test-correlation-id";
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("calculateProfitMargin", () => {
  // 1.4.1. DIVIDES NET INCOME BY REVENUE ............................................................
  it("divides net income by revenue and scales the result to a percentage", () => {
    assert.equal(calculateProfitMargin(profitMarginYear(2024, 25, 100)), 25);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. KEEPS ZERO NET INCOME AS A VALID ZERO MARGIN .............................................
  it("keeps zero net income as a valid zero margin", () => {
    assert.equal(calculateProfitMargin(profitMarginYear(2024, 0, 100)), 0);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS A NEGATIVE MARGIN WHEN EARNINGS ARE NEGATIVE .....................................
  it("returns a negative margin when net income is negative", () => {
    assert.equal(calculateProfitMargin(profitMarginYear(2024, -10, 100)), -10);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. RETURNS NULL WHEN REVENUE IS ZERO ........................................................
  it("returns null when revenue is zero", () => {
    assert.equal(calculateProfitMargin(profitMarginYear(2024, 25, 0)), null);
  });
  // 1.4.4. END ......................................................................................
});

describe("analyseProfitMargin", () => {
  // 1.4.5. READS TRAILING TWELVE MONTH ACTUALS FROM THE LATEST YEAR .................................
  it("reads trailing twelve-month actuals from the newest reported year", async () => {
    const years = [
      profitMarginYear(2024, 100, 400),
      profitMarginYear(2023, 90, 360),
      profitMarginYear(2022, 80, 320),
    ];

    const analysis = await analyseProfitMargin("AAPL", fakeRepository(years), CORRELATION_ID);

    assert.equal(analysis.ticker, "AAPL");
    assert.equal(analysis.ttmNetIncome, 100);
    assert.equal(analysis.ttmRevenue, 400);
    assert.ok(analysis.horizons.length > 0);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. AVERAGES THE MARGIN ACROSS A HORIZON .....................................................
  it("averages the profit-margin values across a horizon", async () => {
    const years = [
      profitMarginYear(2024, 100, 400),
      profitMarginYear(2023, 90, 300),
      profitMarginYear(2022, 50, 250),
    ];

    const analysis = await analyseProfitMargin("AAPL", fakeRepository(years), CORRELATION_ID);

    const expectedAverage = (25 + 30 + 20) / 3;
    assert.equal(analysis.horizons[0]!.average, expectedAverage);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. EXCLUDES ZERO REVENUE YEARS WITHOUT DROPPING THE WHOLE HORIZON ...........................
  it("excludes zero-revenue years without dropping the whole horizon", async () => {
    const years = [
      profitMarginYear(2024, 100, 400),
      profitMarginYear(2023, 90, 0),
      profitMarginYear(2022, 50, 250),
    ];

    const analysis = await analyseProfitMargin("AAPL", fakeRepository(years), CORRELATION_ID);

    assert.deepEqual(
      analysis.horizons[0]!.breakdown.map((entry) => entry.fiscalYear),
      [2024, 2022],
    );
    assert.equal(analysis.horizons[0]!.average, (25 + 20) / 2);
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. FALLS BACK TO ZERO ACTUALS FOR EMPTY HISTORY .............................................
  it("falls back to zero trailing actuals when the provider returns no years", async () => {
    const analysis = await analyseProfitMargin("AAPL", fakeRepository([]), CORRELATION_ID);

    assert.equal(analysis.ttmNetIncome, 0);
    assert.equal(analysis.ttmRevenue, 0);
    assert.deepEqual(analysis.horizons, []);
  });
  // 1.4.8. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

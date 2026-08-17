// [ BACKEND > APPLICATION > SERVICES > MARGIN OF SAFETY > TESTS ] ###################################
//
// Table-driven tests for the margin-of-safety formula and current-snapshot
// analysis wrapper. They pin the exact percentage math, the invalid-intrinsic
// guard, and the latest valuation facts used by the client formula panel.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { analyseMarginOfSafety, calculateMarginOfSafety } from "./index.js";
import type { MarginOfSafetyYear } from "../../../domain/entities/margin-of-safety-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
function marginOfSafetyYear(
  fiscalYear: number,
  intrinsicValue: number,
  stockPrice: number,
): MarginOfSafetyYear {
  return { fiscalYear, intrinsicValue, stockPrice };
}

function fakeRepository(years: MarginOfSafetyYear[]): FinancialDataRepository<MarginOfSafetyYear> {
  return {
    async getAnnualFinancials() {
      return years;
    },
  };
}

const CORRELATION_ID = "test-correlation-id";
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("calculateMarginOfSafety", () => {
  // 1.4.1. RETURNS THE DISCOUNT TO INTRINSIC VALUE AS A PERCENTAGE ..................................
  it("returns the discount to intrinsic value as a percentage", () => {
    assert.equal(calculateMarginOfSafety(marginOfSafetyYear(2024, 250, 200)), 20);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. RETURNS 100 WHEN THE MARKET PRICE IS ZERO ................................................
  it("returns 100 when the market price is zero", () => {
    assert.equal(calculateMarginOfSafety(marginOfSafetyYear(2024, 250, 0)), 100);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS A NEGATIVE VALUE WHEN THE STOCK TRADES ABOVE INTRINSIC VALUE .....................
  it("returns a negative value when the stock trades above intrinsic value", () => {
    assert.equal(calculateMarginOfSafety(marginOfSafetyYear(2024, 250, 300)), -20);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. RETURNS NULL WHEN INTRINSIC VALUE IS ZERO ................................................
  it("returns null when intrinsic value is zero", () => {
    assert.equal(calculateMarginOfSafety(marginOfSafetyYear(2024, 0, 200)), null);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. RETURNS NULL WHEN INTRINSIC VALUE IS NEGATIVE ............................................
  it("returns null when intrinsic value is negative", () => {
    assert.equal(calculateMarginOfSafety(marginOfSafetyYear(2024, -10, 200)), null);
  });
  // 1.4.5. END ......................................................................................
});

describe("analyseMarginOfSafety", () => {
  // 1.4.6. READS THE CURRENT SNAPSHOT FROM THE NEWEST RETURNED ROW ..................................
  it("reads the current snapshot from the newest returned row", async () => {
    const years = [
      marginOfSafetyYear(2024, 250, 200),
      marginOfSafetyYear(2023, 240, 210),
      marginOfSafetyYear(2022, 230, 190),
    ];

    const analysis = await analyseMarginOfSafety("AAPL", fakeRepository(years), CORRELATION_ID);

    assert.equal(analysis.ticker, "AAPL");
    assert.equal(analysis.currentIntrinsicValue, 250);
    assert.equal(analysis.currentStockPrice, 200);
    assert.equal(analysis.currentMarginOfSafety, 20);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. CALCULATES THE CURRENT MARGIN OF SAFETY FROM THE NEWEST ROW ..............................
  it("calculates the current margin of safety from the newest row", async () => {
    const years = [
      marginOfSafetyYear(2024, 250, 200),
      marginOfSafetyYear(2023, 200, 180),
      marginOfSafetyYear(2022, 300, 210),
    ];

    const analysis = await analyseMarginOfSafety("AAPL", fakeRepository(years), CORRELATION_ID);

    assert.equal(analysis.currentMarginOfSafety, 20);
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. RETURNS NULL WHEN THE CURRENT SNAPSHOT HAS A NON POSITIVE INTRINSIC VALUE ................
  it("returns null when the current snapshot has a non-positive intrinsic value", async () => {
    const years = [
      marginOfSafetyYear(2024, 0, 180),
      marginOfSafetyYear(2023, 250, 200),
    ];

    const analysis = await analyseMarginOfSafety("AAPL", fakeRepository(years), CORRELATION_ID);

    assert.equal(analysis.currentMarginOfSafety, null);
    assert.equal(analysis.currentIntrinsicValue, null);
    assert.equal(analysis.currentStockPrice, null);
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. FALLS BACK TO NULL ACTUALS FOR EMPTY HISTORY .............................................
  it("falls back to null current snapshot values when the provider returns no rows", async () => {
    const analysis = await analyseMarginOfSafety("AAPL", fakeRepository([]), CORRELATION_ID);

    assert.equal(analysis.currentMarginOfSafety, null);
    assert.equal(analysis.currentIntrinsicValue, null);
    assert.equal(analysis.currentStockPrice, null);
  });
  // 1.4.9. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

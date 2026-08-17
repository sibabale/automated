// [ BACKEND > APPLICATION > SERVICES > DEBT TO EQUITY > TESTS ] #####################################
//
// Table-driven tests for the debt-to-equity formula and the analysis wrapper.
// They pin the divide-by-zero exclusion, exact ratio outputs, and the latest-
// year actuals exposed for the formula panel.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { calculateDebtToEquity, analyseDebtToEquity } from "./index.js";
import type { DebtToEquityYear } from "../../../domain/entities/debt-to-equity-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/** Builds a debt-and-equity year fixture with an explicit fiscal year. */
function debtToEquityYear(
  fiscalYear: number,
  totalDebt: number,
  shareholdersEquity: number,
): DebtToEquityYear {
  return { fiscalYear, totalDebt, shareholdersEquity };
}

/** A repository stub returning fixed balance-sheet years, keeping tests off the network. */
function fakeRepository(years: DebtToEquityYear[]): FinancialDataRepository<DebtToEquityYear> {
  return {
    async getAnnualFinancials() {
      return years;
    },
  };
}

const CORRELATION_ID = "test-correlation-id";
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("calculateDebtToEquity", () => {
  // 1.4.1. DIVIDES DEBT BY EQUITY ...................................................................
  it("divides total debt by shareholders' equity", () => {
    assert.equal(calculateDebtToEquity(debtToEquityYear(2024, 150, 75)), 2);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. KEEPS ZERO DEBT AS A VALID 0 RATIO .......................................................
  it("keeps zero debt as a valid zero ratio", () => {
    assert.equal(calculateDebtToEquity(debtToEquityYear(2024, 0, 75)), 0);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS A NEGATIVE RATIO WHEN EQUITY IS NEGATIVE .........................................
  it("returns a negative ratio when equity is negative", () => {
    assert.equal(calculateDebtToEquity(debtToEquityYear(2024, 150, -75)), -2);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. EXCLUDES YEARS WITH ZERO EQUITY ..........................................................
  it("returns null when shareholders' equity is zero", () => {
    assert.equal(calculateDebtToEquity(debtToEquityYear(2024, 150, 0)), null);
  });
  // 1.4.4. END ......................................................................................
});

describe("analyseDebtToEquity", () => {
  // 1.4.5. READS LATEST REPORTED ACTUALS ............................................................
  it("reads the latest reported debt and equity figures from the newest year", async () => {
    const years = [
      debtToEquityYear(2024, 150, 75),
      debtToEquityYear(2023, 140, 70),
      debtToEquityYear(2022, 120, 60),
    ];

    const analysis = await analyseDebtToEquity("AAPL", fakeRepository(years), CORRELATION_ID);

    assert.equal(analysis.ticker, "AAPL");
    assert.equal(analysis.ttmTotalDebt, 150);
    assert.equal(analysis.ttmShareholdersEquity, 75);
    assert.equal(analysis.horizons[0]?.average, 2);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. AVERAGES THE RATIO ACROSS A HORIZON ......................................................
  it("averages the per-year debt-to-equity ratios across a horizon", async () => {
    const years = [
      debtToEquityYear(2024, 150, 75),
      debtToEquityYear(2023, 120, 60),
      debtToEquityYear(2022, 90, 45),
    ];

    const analysis = await analyseDebtToEquity("AAPL", fakeRepository(years), CORRELATION_ID);

    assert.equal(analysis.horizons[0]?.average, 2);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. EXCLUDES ZERO-EQUITY YEARS WITHOUT DROPPING THE WHOLE HORIZON ............................
  it("excludes zero-equity years without dropping the whole horizon", async () => {
    const years = [
      debtToEquityYear(2024, 150, 75),
      debtToEquityYear(2023, 120, 0),
      debtToEquityYear(2022, 90, 45),
    ];

    const analysis = await analyseDebtToEquity("AAPL", fakeRepository(years), CORRELATION_ID);

    assert.deepEqual(
      analysis.horizons[0]?.breakdown.map((entry) => entry.fiscalYear),
      [2024, 2022],
    );
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. FALLS BACK TO ZERO ACTUALS FOR EMPTY HISTORY .............................................
  it("falls back to zero trailing actuals when the provider returns no years", async () => {
    const analysis = await analyseDebtToEquity("AAPL", fakeRepository([]), CORRELATION_ID);

    assert.equal(analysis.ttmTotalDebt, 0);
    assert.equal(analysis.ttmShareholdersEquity, 0);
    assert.deepEqual(analysis.horizons, []);
  });
  // 1.4.8. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

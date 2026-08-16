// [ BACKEND > APPLICATION > SERVICES > RETURN ON EQUITY > TESTS ] ###################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { analyseReturnOnEquity } from "./index.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/**
 * Builds a fiscal year whose return on equity equals `returnOnEquity` by fixing
 * equity at 100 so `netIncome` reads directly as the percentage under test.
 */
function year(fiscalYear: number, returnOnEquity: number): FinancialYear {
  return { fiscalYear, netIncome: returnOnEquity, shareholdersEquity: 100 };
}

/** A repository stub that returns fixed data, keeping the tests free of network. */
function fakeRepository(financials: FinancialYear[]): FinancialDataRepository {
  return {
    async getAnnualFinancials() {
      return financials;
    },
  };
}

const CORRELATION_ID = "test-correlation-id";
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("Return on equity analysis", () => {
  // 1.4.1. GROUPS TWELVE YEARS INTO FOUR NON ........................................................
  it("groups twelve years into four non-overlapping horizons", async () => {
    const financials = [
      year(2024, 28.3), year(2023, 25.8), year(2022, 24.2),
      year(2021, 22.1), year(2020, 21.5), year(2019, 27.2),
      year(2018, 18.4), year(2017, 17.2), year(2016, 19.6),
      year(2015, 45.0), year(2014, 36.0), year(2013, 30.0),
    ];

    const analysis = await analyseReturnOnEquity("AAPL", fakeRepository(financials), CORRELATION_ID);

    assert.deepEqual(
      analysis.horizons.map((horizon) => horizon.key),
      ["short", "medium", "long", "veryLong"],
    );

    const usedYears = analysis.horizons.flatMap((horizon) =>
      horizon.breakdown.map((entry) => entry.fiscalYear),
    );
    assert.equal(new Set(usedYears).size, usedYears.length, "no year is reused across horizons");
    for (const horizon of analysis.horizons) {
      assert.equal(horizon.breakdown.length, 3);
    }
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. AVERAGES EACH HORIZON AND DERIVES ITS ....................................................
  it("averages each horizon and derives its trend from newest versus oldest", async () => {
    const financials = [
      year(2024, 28.3), year(2023, 25.8), year(2022, 24.2),
      year(2021, 22.1), year(2020, 21.5), year(2019, 27.2),
    ];

    const analysis = await analyseReturnOnEquity("AAPL", fakeRepository(financials), CORRELATION_ID);
    const [short, medium] = analysis.horizons;

    assert.ok(Math.abs(short!.averageReturnOnEquity - (28.3 + 25.8 + 24.2) / 3) < 1e-9);
    assert.equal(short!.trend, "up");

    assert.ok(Math.abs(medium!.averageReturnOnEquity - (22.1 + 21.5 + 27.2) / 3) < 1e-9);
    assert.equal(medium!.trend, "down");
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. OMITS HORIZONS THAT HAVE NO DATA .........................................................
  it("omits horizons that have no data when history is short", async () => {
    const financials = [
      year(2024, 28.3), year(2023, 25.8), year(2022, 24.2),
      year(2021, 22.1), year(2020, 21.5),
    ];

    const analysis = await analyseReturnOnEquity("AAPL", fakeRepository(financials), CORRELATION_ID);

    assert.deepEqual(
      analysis.horizons.map((horizon) => horizon.key),
      ["short", "medium"],
    );
    assert.equal(analysis.horizons[1]!.breakdown.length, 2);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. EXCLUDES YEARS WHOSE EQUITY IS ZERO ......................................................
  it("excludes years whose equity is zero to avoid dividing by nothing", async () => {
    const financials = [
      year(2024, 28.3),
      { fiscalYear: 2023, netIncome: 500, shareholdersEquity: 0 },
      year(2022, 24.2),
    ];

    const analysis = await analyseReturnOnEquity("AAPL", fakeRepository(financials), CORRELATION_ID);
    const short = analysis.horizons[0]!;

    assert.deepEqual(
      short.breakdown.map((entry) => entry.fiscalYear),
      [2024, 2022],
    );
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. RETURNS ZERO TRAILING TWELVE MONTH ACTUALS WHEN NO HISTORY EXISTS ........................
  it("returns zero trailing-twelve-month actuals and no horizons when history is empty", async () => {
    const analysis = await analyseReturnOnEquity("AAPL", fakeRepository([]), CORRELATION_ID);

    assert.deepEqual(analysis.horizons, []);
    assert.equal(analysis.ttmNetIncome, 0);
    assert.equal(analysis.ttmShareholdersEquity, 0);
  });
  // 1.4.5. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

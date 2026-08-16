// [ BACKEND > APPLICATION > SERVICES > HORIZON ANALYSIS > TESTS ] ###################################
//
// Exercises the metric-agnostic engine directly with a trivial identity formula
// so grouping, ordering, averaging, trend direction, formula-driven exclusion,
// and the empty-history path are asserted without any specific metric's noise.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { MetricFormula } from "./index.js";
import { analyseHorizons, HORIZONS, HORIZON_YEARS } from "./index.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/** A minimal reported year: a fiscal year and one raw figure the formula reads. */
interface SampleYear {
  fiscalYear: number;
  figure: number;
}

/** Identity formula — the raw figure is the metric value, so cases read directly. */
const identity: MetricFormula<SampleYear> = (year) => year.figure;

/** A repository stub that returns fixed data, keeping the tests free of network. */
function fakeRepository(years: SampleYear[]): FinancialDataRepository<SampleYear> {
  return {
    async getAnnualFinancials() {
      return years;
    },
  };
}

/** Builds a sample year whose metric value equals `figure`. */
function year(fiscalYear: number, figure: number): SampleYear {
  return { fiscalYear, figure };
}

const CORRELATION_ID = "test-correlation-id";
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("analyseHorizons", () => {
  // 1.4.1. REQUESTS EXACTLY THE HORIZON WINDOW ......................................................
  it("requests exactly the full horizon window of years from the repository", async () => {
    let requestedYears = -1;
    const repository: FinancialDataRepository<SampleYear> = {
      async getAnnualFinancials(_ticker, years) {
        requestedYears = years;
        return [];
      },
    };

    await analyseHorizons("AAPL", repository, identity, CORRELATION_ID);

    assert.equal(requestedYears, HORIZON_YEARS);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. GROUPS TWELVE YEARS INTO FOUR NON ........................................................
  it("groups twelve years into four non-overlapping horizons of three years each", async () => {
    const years = [
      year(2024, 28.3), year(2023, 25.8), year(2022, 24.2),
      year(2021, 22.1), year(2020, 21.5), year(2019, 27.2),
      year(2018, 18.4), year(2017, 17.2), year(2016, 19.6),
      year(2015, 45.0), year(2014, 36.0), year(2013, 30.0),
    ];

    const analysis = await analyseHorizons("AAPL", fakeRepository(years), identity, CORRELATION_ID);

    assert.deepEqual(
      analysis.horizons.map((horizon) => horizon.key),
      HORIZONS.map((horizon) => horizon.key),
    );

    const usedYears = analysis.horizons.flatMap((horizon) =>
      horizon.breakdown.map((entry) => entry.fiscalYear),
    );
    assert.equal(new Set(usedYears).size, usedYears.length, "no year is reused across horizons");
    for (const horizon of analysis.horizons) {
      assert.equal(horizon.breakdown.length, 3);
    }
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. SORTS UNORDERED INPUT NEWEST FIRST .......................................................
  it("sorts unordered input newest-first before grouping and in the returned years", async () => {
    const years = [year(2022, 24.2), year(2024, 28.3), year(2023, 25.8)];

    const analysis = await analyseHorizons("AAPL", fakeRepository(years), identity, CORRELATION_ID);

    assert.deepEqual(
      analysis.years.map((entry) => entry.fiscalYear),
      [2024, 2023, 2022],
    );
    assert.deepEqual(
      analysis.horizons[0]!.breakdown.map((entry) => entry.fiscalYear),
      [2024, 2023, 2022],
    );
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. AVERAGES EACH HORIZON AND DERIVES ITS ....................................................
  it("averages each horizon and derives its trend from newest versus oldest", async () => {
    const years = [
      year(2024, 28.3), year(2023, 25.8), year(2022, 24.2),
      year(2021, 22.1), year(2020, 21.5), year(2019, 27.2),
    ];

    const analysis = await analyseHorizons("AAPL", fakeRepository(years), identity, CORRELATION_ID);
    const [short, medium] = analysis.horizons;

    assert.ok(Math.abs(short!.average - (28.3 + 25.8 + 24.2) / 3) < 1e-9);
    assert.equal(short!.trend, "up");

    assert.ok(Math.abs(medium!.average - (22.1 + 21.5 + 27.2) / 3) < 1e-9);
    assert.equal(medium!.trend, "down");
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. TREATS EQUAL ENDPOINTS AS AN UP TREND ....................................................
  it("treats equal newest and oldest values as an 'up' trend (kills >= to > boundary)", async () => {
    const years = [year(2024, 20), year(2023, 25), year(2022, 20)];

    const analysis = await analyseHorizons("AAPL", fakeRepository(years), identity, CORRELATION_ID);

    assert.equal(analysis.horizons[0]!.trend, "up");
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. OMITS HORIZONS THAT HAVE NO DATA .........................................................
  it("omits horizons that have no data when history is short", async () => {
    const years = [
      year(2024, 28.3), year(2023, 25.8), year(2022, 24.2),
      year(2021, 22.1), year(2020, 21.5),
    ];

    const analysis = await analyseHorizons("AAPL", fakeRepository(years), identity, CORRELATION_ID);

    assert.deepEqual(
      analysis.horizons.map((horizon) => horizon.key),
      ["short", "medium"],
    );
    assert.equal(analysis.horizons[1]!.breakdown.length, 2);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. EXCLUDES YEARS THE FORMULA REJECTS .......................................................
  it("excludes years whose formula returns null from the breakdown and average", async () => {
    const rejectEven: MetricFormula<SampleYear> = (entry) =>
      entry.figure % 2 === 0 ? null : entry.figure;
    const years = [year(2024, 3), year(2023, 4), year(2022, 5)];

    const analysis = await analyseHorizons("AAPL", fakeRepository(years), rejectEven, CORRELATION_ID);
    const short = analysis.horizons[0]!;

    assert.deepEqual(
      short.breakdown.map((entry) => entry.fiscalYear),
      [2024, 2022],
    );
    assert.ok(Math.abs(short.average - (3 + 5) / 2) < 1e-9);
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. RETURNS NO HORIZONS AND EMPTY YEARS FOR EMPTY HISTORY ....................................
  it("returns no horizons and an empty years list when history is empty", async () => {
    const analysis = await analyseHorizons("AAPL", fakeRepository([]), identity, CORRELATION_ID);

    assert.deepEqual(analysis.horizons, []);
    assert.deepEqual(analysis.years, []);
    assert.equal(analysis.ticker, "AAPL");
  });
  // 1.4.8. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP DEBT TO EQUITY DATA > TESTS ] #####################
//
// These tests exercise the repository in isolation by injecting raw FMP balance
// sheet rows via a mock HTTP server. They pin the metric-specific field mapping
// and exclusions while the shared generic repository covers the reusable join and
// fetch machinery.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFmpDebtToEquityDataRepository } from "./index.js";
import { startMockFmpServer } from "../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/** Starts a mock FMP server pre-configured with balance-sheet rows only. */
async function startRepoMock(
  balanceRows: unknown[],
): Promise<{ url: string; close: () => Promise<unknown> }> {
  return startMockFmpServer({
    "balance-sheet-statement": { body: balanceRows },
  }) as Promise<{ url: string; close: () => Promise<unknown> }>;
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createFmpDebtToEquityDataRepository", () => {
  // 1.4.1. SETUP ....................................................................................
  const savedKey = process.env.FMP_API_KEY;

  before(() => {
    process.env.FMP_API_KEY = "test-key";
  });

  after(() => {
    process.env.FMP_API_KEY = savedKey;
    delete process.env.FMP_BASE_URL;
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. MAPS TOTAL DEBT AND EQUITY FROM ONE BALANCE ROW ..........................................
  it("maps total debt and equity from one balance-sheet row", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", totalDebt: 120_000, totalStockholdersEquity: 60_000, date: "2023-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpDebtToEquityDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-dte-r-001");
    await mock.close();

    assert.deepEqual(result, [{ fiscalYear: 2023, totalDebt: 120_000, shareholdersEquity: 60_000 }]);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. FALLS BACK TO THE DATE YEAR WHEN FISCALYEAR IS ABSENT ....................................
  it("falls back to the date year when fiscalYear is absent", async () => {
    const mock = await startRepoMock([
      { date: "2022-09-30", totalDebt: 90_000, totalStockholdersEquity: 45_000 },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpDebtToEquityDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-dte-r-002");
    await mock.close();

    assert.equal(result[0]?.fiscalYear, 2022);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. PRESERVES THE PROVIDER'S NEWEST-FIRST ORDERING ............................................
  it("preserves the provider's newest-first ordering", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", totalDebt: 120_000, totalStockholdersEquity: 60_000 },
      { fiscalYear: "2022", totalDebt: 100_000, totalStockholdersEquity: 50_000 },
      { fiscalYear: "2021", totalDebt: 80_000, totalStockholdersEquity: 40_000 },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpDebtToEquityDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-dte-r-003");
    await mock.close();

    assert.deepEqual(
      result.map((year) => year.fiscalYear),
      [2023, 2022, 2021],
    );
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. EXCLUDES ROWS WHERE TOTAL DEBT IS NOT USABLE .............................................
  it("excludes rows where totalDebt is null, NaN, or Infinity", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", totalDebt: null, totalStockholdersEquity: 60_000 },
      { fiscalYear: "2022", totalDebt: Number.NaN, totalStockholdersEquity: 50_000 },
      { fiscalYear: "2021", totalDebt: Infinity, totalStockholdersEquity: 40_000 },
      { fiscalYear: "2020", totalDebt: 70_000, totalStockholdersEquity: 35_000 },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpDebtToEquityDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 4, "cid-dte-r-004");
    await mock.close();

    assert.deepEqual(result, [{ fiscalYear: 2020, totalDebt: 70_000, shareholdersEquity: 35_000 }]);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. EXCLUDES ROWS WHERE SHAREHOLDERS EQUITY IS NOT USABLE ....................................
  it("excludes rows where totalStockholdersEquity is null, NaN, or Infinity", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", totalDebt: 120_000, totalStockholdersEquity: null },
      { fiscalYear: "2022", totalDebt: 100_000, totalStockholdersEquity: Number.NaN },
      { fiscalYear: "2021", totalDebt: 80_000, totalStockholdersEquity: Infinity },
      { fiscalYear: "2020", totalDebt: 70_000, totalStockholdersEquity: 35_000 },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpDebtToEquityDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 4, "cid-dte-r-005");
    await mock.close();

    assert.deepEqual(result, [{ fiscalYear: 2020, totalDebt: 70_000, shareholdersEquity: 35_000 }]);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. KEEPS ZERO DEBT BECAUSE IT IS A VALID REPORTED FIGURE ....................................
  it("keeps a zero totalDebt because it is a valid reported figure", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", totalDebt: 0, totalStockholdersEquity: 60_000 },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpDebtToEquityDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-dte-r-006");
    await mock.close();

    assert.deepEqual(result, [{ fiscalYear: 2023, totalDebt: 0, shareholdersEquity: 60_000 }]);
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. EXCLUDES ROWS WITH AN UNREADABLE FISCAL YEAR .............................................
  it("excludes rows with an unreadable fiscal year", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "1900", totalDebt: 120_000, totalStockholdersEquity: 60_000, date: "1900-09-30" },
      { fiscalYear: "bad", totalDebt: 100_000, totalStockholdersEquity: 50_000 },
      { fiscalYear: "2021", totalDebt: 80_000, totalStockholdersEquity: 40_000 },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpDebtToEquityDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-dte-r-007");
    await mock.close();

    assert.deepEqual(result, [{ fiscalYear: 2021, totalDebt: 80_000, shareholdersEquity: 40_000 }]);
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. RETURNS AN EMPTY ARRAY WHEN THE PROVIDER RETURNS NO ROWS .................................
  it("returns an empty array when the provider returns no rows", async () => {
    const mock = await startRepoMock([]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpDebtToEquityDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 12, "cid-dte-r-008");
    await mock.close();

    assert.deepEqual(result, []);
  });
  // 1.4.9. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

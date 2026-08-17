// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP PROFIT MARGIN DATA > TESTS ] ######################
//
// These tests exercise the repository in isolation by injecting raw FMP income
// rows via a mock HTTP server. The assertions pin the exact exclusion behavior
// so malformed revenue or net-income rows cannot silently enter the analysis.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFmpProfitMarginDataRepository } from "./index.js";
import { startMockFmpServer } from "../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/** Starts a mock FMP server pre-configured with income-statement rows. */
async function startRepoMock(
  incomeRows: unknown[],
): Promise<{ url: string; close: () => Promise<unknown> }> {
  return startMockFmpServer({
    "income-statement": { body: incomeRows },
  }) as Promise<{ url: string; close: () => Promise<unknown> }>;
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createFmpProfitMarginDataRepository", () => {
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

  // 1.4.2. MAPS INCOME ROWS INTO PROFITMARGINYEAR ENTITIES ..........................................
  it("maps income rows into ProfitMarginYear entities", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", netIncome: 90_000, revenue: 300_000, date: "2023-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpProfitMarginDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-pm-r-001");
    await mock.close();

    assert.equal(result.length, 1);
    assert.deepEqual(result[0], {
      fiscalYear: 2023,
      netIncome: 90_000,
      revenue: 300_000,
    });
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. FALLS BACK TO YEAR EXTRACTED FROM DATE ...................................................
  it("falls back to the year extracted from date when fiscalYear is absent", async () => {
    const mock = await startRepoMock([
      { date: "2022-09-30", netIncome: 80_000, revenue: 280_000 },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpProfitMarginDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-pm-r-002");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2022);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. PRESERVES NEWEST FIRST ORDERING FROM THE PROVIDER ........................................
  it("preserves newest-first ordering from the provider", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", netIncome: 90_000, revenue: 300_000, date: "2023-09-30" },
      { fiscalYear: "2022", netIncome: 80_000, revenue: 280_000, date: "2022-09-30" },
      { fiscalYear: "2021", netIncome: 70_000, revenue: 260_000, date: "2021-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpProfitMarginDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-pm-r-003");
    await mock.close();

    assert.equal(result.length, 3);
    assert.equal(result[0].fiscalYear, 2023);
    assert.equal(result[1].fiscalYear, 2022);
    assert.equal(result[2].fiscalYear, 2021);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. EXCLUDES ROWS WHERE NET INCOME IS NOT USABLE .............................................
  it("excludes rows where net income is not a finite number", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", netIncome: "bad", revenue: 300_000, date: "2023-09-30" },
      { fiscalYear: "2022", netIncome: null, revenue: 280_000, date: "2022-09-30" },
      { fiscalYear: "2021", netIncome: 70_000, revenue: 260_000, date: "2021-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpProfitMarginDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-pm-r-004");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2021);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. EXCLUDES ROWS WHERE REVENUE IS NOT USABLE ................................................
  it("excludes rows where revenue is Infinity, NaN, or null", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", netIncome: 90_000, revenue: Infinity, date: "2023-09-30" },
      { fiscalYear: "2022", netIncome: 80_000, revenue: null, date: "2022-09-30" },
      { fiscalYear: "2021", netIncome: 70_000, revenue: 260_000, date: "2021-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpProfitMarginDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-pm-r-005");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2021);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. EXCLUDES ROWS WITH AN UNREADABLE FISCAL YEAR .............................................
  it("excludes rows with an unreadable fiscal year", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "1800", netIncome: 90_000, revenue: 300_000, date: "1800-09-30" },
      { fiscalYear: "bad", netIncome: 80_000, revenue: 280_000 },
      { fiscalYear: "2021", netIncome: 70_000, revenue: 260_000, date: "2021-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpProfitMarginDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-pm-r-006");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2021);
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. RETURNS AN EMPTY ARRAY WHEN PROVIDER RETURNS NO ROWS .....................................
  it("returns an empty array when the provider returns no rows", async () => {
    const mock = await startRepoMock([]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpProfitMarginDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 12, "cid-pm-r-007");
    await mock.close();

    assert.equal(result.length, 0);
    assert.ok(Array.isArray(result));
  });
  // 1.4.8. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

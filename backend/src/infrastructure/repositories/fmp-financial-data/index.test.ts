// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP FINANCIAL DATA > TESTS ] ##########################
//
// These tests exercise the repository in isolation by injecting raw FMP fixture
// rows directly via a mock HTTP server. Every branch of readNumber, readFiscalYear,
// and the join logic is covered — the exact gaps Stryker identified.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFmpFinancialDataRepository } from "./index.js";
import { startMockFmpServer } from "../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/** Starts a mock FMP server pre-configured with income and balance rows. */
async function startRepoMock(
  incomeRows: unknown[],
  balanceRows: unknown[],
): Promise<{ url: string; close: () => Promise<unknown> }> {
  return startMockFmpServer({
    "income-statement": { body: incomeRows },
    "balance-sheet-statement": { body: balanceRows },
  }) as Promise<{ url: string; close: () => Promise<unknown> }>;
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createFmpFinancialDataRepository", () => {
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

  // 1.4.2. JOINS INCOME AND BALANCE ROWS ON .........................................................
  it("joins income and balance rows on fiscal year and returns FinancialYear entities", async () => {
    const mock = await startRepoMock(
      [{ fiscalYear: "2023", netIncome: 90000, date: "2023-09-30" }],
      [{ fiscalYear: "2023", totalStockholdersEquity: 60000 }],
    );
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-r-001");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2023);
    assert.equal(result[0].netIncome, 90000);
    assert.equal(result[0].shareholdersEquity, 60000);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. FALLS BACK TO YEAR EXTRACTED FROM ........................................................
  it("falls back to year extracted from date when fiscalYear field is absent", async () => {
    const mock = await startRepoMock(
      [{ date: "2022-09-30", netIncome: 80000 }],
      [{ date: "2022-09-30", totalStockholdersEquity: 50000 }],
    );
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-r-002");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2022);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. PRESERVES NEWEST FIRST ORDERING FROM THE .................................................
  it("preserves newest-first ordering from the provider", async () => {
    const mock = await startRepoMock(
      [
        { fiscalYear: "2023", netIncome: 9000, date: "2023-09-30" },
        { fiscalYear: "2022", netIncome: 8000, date: "2022-09-30" },
        { fiscalYear: "2021", netIncome: 7000, date: "2021-09-30" },
      ],
      [
        { fiscalYear: "2023", totalStockholdersEquity: 6000 },
        { fiscalYear: "2022", totalStockholdersEquity: 5500 },
        { fiscalYear: "2021", totalStockholdersEquity: 5000 },
      ],
    );
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-r-003");
    await mock.close();

    assert.equal(result.length, 3);
    assert.equal(result[0].fiscalYear, 2023);
    assert.equal(result[1].fiscalYear, 2022);
    assert.equal(result[2].fiscalYear, 2021);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. EXCLUDES INCOME ROWS WITH NO MATCHING ....................................................
  it("excludes income rows with no matching balance sheet year", async () => {
    const mock = await startRepoMock(
      [{ fiscalYear: "2023", netIncome: 9000, date: "2023-09-30" }],
      [{ fiscalYear: "2022", totalStockholdersEquity: 5000 }],
    );
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 2, "cid-r-004");
    await mock.close();

    assert.equal(result.length, 0);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. EXCLUDES INCOME ROWS WHERE NETINCOME IS ..................................................
  it("excludes income rows where netIncome is not a finite number", async () => {
    const mock = await startRepoMock(
      [
        { fiscalYear: "2023", netIncome: "not-a-number", date: "2023-09-30" },
        { fiscalYear: "2022", netIncome: null, date: "2022-09-30" },
        { fiscalYear: "2021", netIncome: 7000, date: "2021-09-30" },
      ],
      [
        { fiscalYear: "2023", totalStockholdersEquity: 6000 },
        { fiscalYear: "2022", totalStockholdersEquity: 5500 },
        { fiscalYear: "2021", totalStockholdersEquity: 5000 },
      ],
    );
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-r-005");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2021);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. EXCLUDES BALANCE ROWS WHERE TOTALSTOCKHOLDERSEQUITY IS ...................................
  it("excludes balance rows where totalStockholdersEquity is Infinity or NaN", async () => {
    const mock = await startRepoMock(
      [
        { fiscalYear: "2023", netIncome: 9000, date: "2023-09-30" },
        { fiscalYear: "2022", netIncome: 8000, date: "2022-09-30" },
      ],
      [
        { fiscalYear: "2023", totalStockholdersEquity: Infinity },
        { fiscalYear: "2022", totalStockholdersEquity: 5500 },
      ],
    );
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 2, "cid-r-006");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2022);
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. EXCLUDES ROWS WITH AN UNREADABLE FISCAL ..................................................
  it("excludes rows with an unreadable fiscal year (too old or non-numeric)", async () => {
    const mock = await startRepoMock(
      [
        { fiscalYear: "1800", netIncome: 9000, date: "1800-09-30" },
        { fiscalYear: "bad", netIncome: 8000 },
        { fiscalYear: "2021", netIncome: 7000, date: "2021-09-30" },
      ],
      [{ fiscalYear: "2021", totalStockholdersEquity: 5000 }],
    );
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-r-007");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2021);
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. RETURNS AN EMPTY ARRAY WHEN PROVIDER .....................................................
  it("returns an empty array when provider returns no rows", async () => {
    const mock = await startRepoMock([], []);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 12, "cid-r-008");
    await mock.close();

    assert.equal(result.length, 0);
    assert.ok(Array.isArray(result));
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. RETURNS FEWER YEARS THAN REQUESTED WHEN .................................................
  it("returns fewer years than requested when provider history is short", async () => {
    const mock = await startRepoMock(
      [
        { fiscalYear: "2023", netIncome: 9000, date: "2023-09-30" },
        { fiscalYear: "2022", netIncome: 8000, date: "2022-09-30" },
      ],
      [
        { fiscalYear: "2023", totalStockholdersEquity: 6000 },
        { fiscalYear: "2022", totalStockholdersEquity: 5500 },
      ],
    );
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 12, "cid-r-009");
    await mock.close();

    assert.equal(result.length, 2);
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. USES LIMIT-ONLY QUERY SHAPE FOR JOINED ANNUAL HISTORY ...................................
  it("requests joined annual history using symbol and limit without a period parameter", async () => {
    const mock = await startRepoMock(
      [{ fiscalYear: "2023", netIncome: 90000, date: "2023-09-30" }],
      [{ fiscalYear: "2023", totalStockholdersEquity: 60000, date: "2023-09-30" }],
    );
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpFinancialDataRepository();
    await repo.getAnnualFinancials("AAPL", 5, "cid-r-010");

    assert.equal(mock.lastRequest?.searchParams.get("symbol"), "AAPL");
    assert.equal(mock.lastRequest?.searchParams.get("limit"), "5");
    assert.equal(mock.lastRequest?.searchParams.get("period"), null);

    await mock.close();
  });
  // 1.4.11. END .....................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

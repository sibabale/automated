// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP MARGIN OF SAFETY DATA > TESTS ] ###################
//
// These tests pin the exact row-mapping and exclusion behavior for the
// documented discounted-cash-flow feed so malformed intrinsic values or stock
// prices cannot silently enter the analysis.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFmpMarginOfSafetyDataRepository } from "./index.js";
import { startMockFmpServer } from "../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
async function startRepoMock(
  valuationRows: unknown[],
): Promise<{ url: string; close: () => Promise<unknown> }> {
  return startMockFmpServer({
    "discounted-cash-flow": { body: valuationRows },
  }) as Promise<{ url: string; close: () => Promise<unknown> }>;
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createFmpMarginOfSafetyDataRepository", () => {
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

  // 1.4.2. MAPS CAMELCASE PRICE ROWS INTO MARGINOFSAFETYYEAR ENTITIES ...............................
  it("maps camelCase stock-price rows into MarginOfSafetyYear entities", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", dcf: 250.25, stockPrice: 200.5, date: "2023-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpMarginOfSafetyDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-mos-r-001");
    await mock.close();

    assert.equal(result.length, 1);
    assert.deepEqual(result[0], {
      fiscalYear: 2023,
      intrinsicValue: 250.25,
      stockPrice: 200.5,
    });
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. ACCEPTS THE LEGACY SPACED STOCK PRICE KEY ................................................
  it("accepts the legacy spaced stock-price key used by older FMP payloads", async () => {
    const mock = await startRepoMock([
      { date: "2022-09-30", dcf: 240.1, "Stock Price": 210.4 },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpMarginOfSafetyDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-mos-r-002");
    await mock.close();

    assert.equal(result.length, 1);
    assert.deepEqual(result[0], {
      fiscalYear: 2022,
      intrinsicValue: 240.1,
      stockPrice: 210.4,
    });
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. PRESERVES NEWEST FIRST ORDERING FROM THE PROVIDER ........................................
  it("preserves newest-first ordering from the provider", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", dcf: 250, stockPrice: 200, date: "2023-09-30" },
      { fiscalYear: "2022", dcf: 240, stockPrice: 190, date: "2022-09-30" },
      { fiscalYear: "2021", dcf: 230, stockPrice: 180, date: "2021-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpMarginOfSafetyDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-mos-r-003");
    await mock.close();

    assert.equal(result.length, 3);
    assert.deepEqual(
      result.map((year) => year.fiscalYear),
      [2023, 2022, 2021],
    );
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. EXCLUDES ROWS WHERE THE INTRINSIC VALUE IS NOT USABLE ....................................
  it("excludes rows where the intrinsic value is Infinity, NaN, or null", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", dcf: Infinity, stockPrice: 200, date: "2023-09-30" },
      { fiscalYear: "2022", dcf: null, stockPrice: 190, date: "2022-09-30" },
      { fiscalYear: "2021", dcf: 230, stockPrice: 180, date: "2021-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpMarginOfSafetyDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-mos-r-004");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2021);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. EXCLUDES ROWS WHERE THE STOCK PRICE IS NOT USABLE ........................................
  it("excludes rows where the stock price is missing from both supported keys", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", dcf: 250, date: "2023-09-30" },
      { fiscalYear: "2022", dcf: 240, stockPrice: "bad", date: "2022-09-30" },
      { fiscalYear: "2021", dcf: 230, stockPrice: 180, date: "2021-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpMarginOfSafetyDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-mos-r-005");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2021);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. EXCLUDES ROWS WITH AN UNREADABLE FISCAL YEAR .............................................
  it("excludes rows with an unreadable fiscal year", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "1800", dcf: 250, stockPrice: 200, date: "1800-09-30" },
      { fiscalYear: "bad", dcf: 240, stockPrice: 190 },
      { fiscalYear: "2021", dcf: 230, stockPrice: 180, date: "2021-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpMarginOfSafetyDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-mos-r-006");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0].fiscalYear, 2021);
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. RETURNS AN EMPTY ARRAY WHEN PROVIDER RETURNS NO ROWS .....................................
  it("returns an empty array when the provider returns no rows", async () => {
    const mock = await startRepoMock([]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpMarginOfSafetyDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 12, "cid-mos-r-007");
    await mock.close();

    assert.equal(result.length, 0);
    assert.ok(Array.isArray(result));
  });
  // 1.4.8. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

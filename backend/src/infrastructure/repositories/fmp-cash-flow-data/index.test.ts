// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP CASH FLOW DATA > TESTS ] ##########################
//
// Exercises the free-cash-flow repository in isolation against a mock FMP server.
// A single cash-flow statement supplies both figures, so these tests cover the
// single-endpoint path of the shared generic repository: reading the two fields,
// excluding malformed rows, and preserving the provider's newest-first order.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFmpCashFlowDataRepository } from "./index.js";
import { startMockFmpServer } from "../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/** Starts a mock FMP server pre-configured with the cash-flow statement rows. */
async function startRepoMock(
  cashFlowRows: unknown[],
): Promise<{ url: string; close: () => Promise<unknown> }> {
  return startMockFmpServer({
    "cash-flow-statement": { body: cashFlowRows },
  }) as Promise<{ url: string; close: () => Promise<unknown> }>;
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createFmpCashFlowDataRepository", () => {
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

  // 1.4.2. READS OPERATING CASH FLOW AND CAPITAL EXPENDITURE ........................................
  it("reads operating cash flow and capital expenditure into CashFlowYear entities", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", operatingCashFlow: 110_000, capitalExpenditure: -30_000, date: "2023-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpCashFlowDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 1, "cid-cf-001");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0]!.fiscalYear, 2023);
    assert.equal(result[0]!.operatingCashFlow, 110_000);
    assert.equal(result[0]!.capitalExpenditure, -30_000);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. PRESERVES NEWEST FIRST ORDERING FROM THE PROVIDER ........................................
  it("preserves the provider's newest-first ordering", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", operatingCashFlow: 9_000, capitalExpenditure: -1_000, date: "2023-09-30" },
      { fiscalYear: "2022", operatingCashFlow: 8_000, capitalExpenditure: -900, date: "2022-09-30" },
      { fiscalYear: "2021", operatingCashFlow: 7_000, capitalExpenditure: -800, date: "2021-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpCashFlowDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 3, "cid-cf-002");
    await mock.close();

    assert.deepEqual(
      result.map((year) => year.fiscalYear),
      [2023, 2022, 2021],
    );
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. EXCLUDES ROWS WHERE OPERATING CASH FLOW IS NOT FINITE ....................................
  it("excludes rows where operating cash flow is not a finite number", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", operatingCashFlow: "n/a", capitalExpenditure: -1_000, date: "2023-09-30" },
      { fiscalYear: "2022", operatingCashFlow: 8_000, capitalExpenditure: -900, date: "2022-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpCashFlowDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 2, "cid-cf-003");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0]!.fiscalYear, 2022);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. EXCLUDES ROWS WHERE CAPITAL EXPENDITURE IS MISSING .......................................
  it("excludes rows where capital expenditure is missing", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", operatingCashFlow: 9_000, date: "2023-09-30" },
      { fiscalYear: "2022", operatingCashFlow: 8_000, capitalExpenditure: -900, date: "2022-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpCashFlowDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 2, "cid-cf-004");
    await mock.close();

    assert.equal(result.length, 1);
    assert.equal(result[0]!.fiscalYear, 2022);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. RETURNS AN EMPTY ARRAY WHEN PROVIDER RETURNS NO ROWS .....................................
  it("returns an empty array when the provider returns no rows", async () => {
    const mock = await startRepoMock([]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpCashFlowDataRepository();
    const result = await repo.getAnnualFinancials("AAPL", 12, "cid-cf-005");
    await mock.close();

    assert.equal(result.length, 0);
    assert.ok(Array.isArray(result));
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. USES LIMIT-ONLY QUERY SHAPE FOR ANNUAL HISTORY ...........................................
  it("requests annual history using symbol and limit without a period parameter", async () => {
    const mock = await startRepoMock([
      { fiscalYear: "2023", operatingCashFlow: 110_000, capitalExpenditure: -30_000, date: "2023-09-30" },
    ]);
    process.env.FMP_BASE_URL = mock.url;

    const repo = createFmpCashFlowDataRepository();
    await repo.getAnnualFinancials("AAPL", 5, "cid-cf-006");

    assert.equal(mock.lastRequest?.searchParams.get("symbol"), "AAPL");
    assert.equal(mock.lastRequest?.searchParams.get("limit"), "5");
    assert.equal(mock.lastRequest?.searchParams.get("period"), null);

    await mock.close();
  });
  // 1.4.7. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

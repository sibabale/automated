// [ BACKEND > PRESENTATION > CONTROLLERS > DEBT TO EQUITY > TESTS ] #################################
//
// Integration tests for the full debt-to-equity HTTP pipeline. The FMP provider
// is replaced by a local mock server; the real repository, service, and
// controller run. Ratio outputs are asserted exactly, currency actuals are kept
// separate, and provider-error mapping is verified end to end alongside the
// injected-repository seam.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { once } from "node:events";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createApp } from "../../../app.js";
import { startMockFmpServer } from "../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
function makeBalanceRow(fiscalYear: number, totalDebt: number, totalStockholdersEquity: number) {
  return {
    fiscalYear: String(fiscalYear),
    totalDebt,
    totalStockholdersEquity,
    date: `${fiscalYear}-09-30`,
  };
}

async function startAppWithBalanceSheet(balanceRows: unknown[]) {
  const mock = await startMockFmpServer({
    "balance-sheet-statement": { body: balanceRows },
  });
  const savedUrl = process.env.FMP_BASE_URL;
  process.env.FMP_BASE_URL = mock.url;
  process.env.FMP_API_KEY = "test-key";
  const server = createApp().listen(0);
  await once(server, "listening");
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;
  const close = async () => {
    await new Promise((resolve) => server.close(resolve));
    await mock.close();
    process.env.FMP_BASE_URL = savedUrl;
  };
  return { baseUrl, close };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("Debt-to-equity controller integration (mocked FMP)", () => {
  // 1.4.1. SETUP ....................................................................................
  let sharedBaseUrl = "";
  let sharedClose = async () => undefined;

  const balance12 = Array.from({ length: 12 }, (_, i) => makeBalanceRow(2023 - i, 120, 60));

  before(async () => {
    const app = await startAppWithBalanceSheet(balance12);
    sharedBaseUrl = app.baseUrl;
    sharedClose = app.close;
  });

  after(async () => {
    await sharedClose();
    delete process.env.FMP_BASE_URL;
    delete process.env.FMP_API_KEY;
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. RETURNS 200 WITH THE FULL RESPONSE SHAPE .................................................
  it("returns 200 with correlationId, ticker, horizons, consolidatedSummary, and latest actuals", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/debt-to-equity?ticker=AAPL`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(typeof body.correlationId, "string");
    assert.equal(body.data.ticker, "AAPL");
    assert.ok(Array.isArray(body.data.horizons));
    assert.ok(body.data.horizons.length > 0);
    assert.ok("consolidatedSummary" in body.data);
    assert.ok("trailingTwelveMonthsActuals" in body.data);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. FORMATS EACH HORIZON VALUE AS A TWO-DECIMAL RATIO ........................................
  it("formats each horizon value as a two-decimal ratio string", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/debt-to-equity?ticker=AAPL`);
    const body = await res.json();
    const horizon = body.data.horizons[0];

    assert.equal(horizon.value, "2.00");
    assert.equal(horizon.breakdown[0].value, "2.00");
    assert.equal(horizon.breakdown[0].period, "2023");
    assert.ok(horizon.trend === "up" || horizon.trend === "down");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. FORMATS THE LATEST ACTUALS AS CURRENCY ...................................................
  it("formats the latest total debt and equity actuals as currency", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/debt-to-equity?ticker=AAPL`);
    const body = await res.json();
    const actuals = body.data.trailingTwelveMonthsActuals;

    assert.equal(actuals.totalDebt, "$120");
    assert.equal(actuals.shareholdersEquity, "$60");
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. CONSOLIDATED SUMMARY USES THE RATIO FORMATTER ............................................
  it("formats the consolidated summary result as a ratio and matches the horizon count", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/debt-to-equity?ticker=AAPL`);
    const body = await res.json();
    const summary = body.data.consolidatedSummary;

    assert.equal(summary.result, "2.00");
    assert.deepEqual(summary.values, ["2.00", "2.00", "2.00", "2.00"]);
    assert.equal(summary.denominator, String(body.data.horizons.length));
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. RETURNS THE PLACEHOLDER SUMMARY WHEN NO USABLE HORIZONS EXIST ............................
  it("returns the placeholder summary when every year has zero equity", async () => {
    const { baseUrl, close } = await startAppWithBalanceSheet([
      makeBalanceRow(2023, 120, 0),
      makeBalanceRow(2022, 100, 0),
    ]);
    try {
      const res = await fetch(`${baseUrl}/analysis/debt-to-equity?ticker=AAPL`);
      const body = await res.json();

      assert.equal(body.data.consolidatedSummary.result, "—");
      assert.equal(body.data.consolidatedSummary.denominator, "0");
      assert.deepEqual(body.data.horizons, []);
    } finally {
      await close();
    }
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. RETURNS 400 FOR A MISSING TICKER .........................................................
  it("returns 400 with the exact message for a missing ticker", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/debt-to-equity`);
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.error?.message, "Missing required query parameter: ticker");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. RETURNS 400 FOR A WHITESPACE-ONLY TICKER .................................................
  it("returns 400 for a whitespace-only ticker", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/debt-to-equity?ticker=%20%20`);

    assert.equal(res.status, 400);
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. MAPS PROVIDER 404 TO HTTP 404 ............................................................
  it("maps provider 404 to HTTP 404", async () => {
    const mock = await startMockFmpServer({ "balance-sheet-statement": { status: 404, body: {} } });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/debt-to-equity?ticker=NOTFOUND`);
      assert.equal(res.status, 404);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. MAPS PROVIDER 429 TO HTTP 429 ...........................................................
  it("maps provider 429 to HTTP 429", async () => {
    const mock = await startMockFmpServer({ "balance-sheet-statement": { status: 429, body: {} } });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/debt-to-equity?ticker=AAPL`);
      assert.equal(res.status, 429);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. MAPS PROVIDER AUTHENTICATION ERRORS TO HTTP 502 .........................................
  it("maps provider authentication errors to HTTP 502", async () => {
    const mock = await startMockFmpServer({ "balance-sheet-statement": { status: 401, body: {} } });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/debt-to-equity?ticker=AAPL`);
      assert.equal(res.status, 502);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.11. END .....................................................................................
});

describe("Debt-to-equity controller (injected repository seam)", () => {
  // 1.4.12. USES AN INJECTED REPOSITORY FACTORY AND RETURNS 200 .....................................
  it("uses an injected repository factory and returns ratio-formatted horizons", async () => {
    const repository = {
      async getAnnualFinancials() {
        return [
          { fiscalYear: 2024, totalDebt: 150, shareholdersEquity: 75 },
          { fiscalYear: 2023, totalDebt: 140, shareholdersEquity: 70 },
          { fiscalYear: 2022, totalDebt: 120, shareholdersEquity: 60 },
        ];
      },
    };
    const server = createApp({ repositoryFactory: () => repository }).listen(0);
    await once(server, "listening");
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const res = await fetch(`${baseUrl}/analysis/debt-to-equity?ticker=AAPL`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.ticker, "AAPL");
      assert.equal(body.data.horizons[0].value, "2.00");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
  // 1.4.12. END .....................................................................................

  // 1.4.13. MAPS A NON FMPCLIENTERROR FROM THE REPOSITORY TO HTTP 500 ...............................
  it("maps a non-FmpClientError from the repository to HTTP 500 with a generic message", async () => {
    const repository = {
      async getAnnualFinancials() {
        throw new Error("unexpected repository failure");
      },
    };
    const server = createApp({ repositoryFactory: () => repository }).listen(0);
    await once(server, "listening");
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const res = await fetch(`${baseUrl}/analysis/debt-to-equity?ticker=AAPL`);
      const body = await res.json();

      assert.equal(res.status, 500);
      assert.equal(body.error.message, "Internal server error");
      assert.equal(typeof body.correlationId, "string");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
  // 1.4.13. END .....................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

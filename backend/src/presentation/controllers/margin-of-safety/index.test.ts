// [ BACKEND > PRESENTATION > CONTROLLERS > MARGIN OF SAFETY > TESTS ] ###############################
//
// Integration tests for the full margin-of-safety HTTP pipeline. The provider
// is replaced by a local mock server so the real repository, service, and
// controller run end to end against controlled valuation snapshots.

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
function makeValuationRow(fiscalYear: number, intrinsicValue: number, stockPrice: number) {
  return {
    fiscalYear: String(fiscalYear),
    dcf: intrinsicValue,
    stockPrice,
    date: `${fiscalYear}-09-30`,
  };
}

async function startAppWithValuations(valuationRows: unknown[]) {
  const mock = await startMockFmpServer({
    "discounted-cash-flow": { body: valuationRows },
  });
  const savedUrl = process.env.FMP_BASE_URL;
  process.env.FMP_BASE_URL = mock.url;
  process.env.FMP_API_KEY = "test-key";
  const server = createApp().listen(0);
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  const close = async () => {
    await new Promise((resolve) => server.close(resolve));
    await mock.close();
    process.env.FMP_BASE_URL = savedUrl;
  };
  return { baseUrl, close };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("Margin of safety controller integration (mocked FMP)", () => {
  // 1.4.1. SETUP ....................................................................................
  let sharedBaseUrl: string;
  let sharedClose: () => Promise<void>;

  const valuation12 = Array.from({ length: 12 }, (_, index) =>
    makeValuationRow(2024 - index, 250, 200),
  );

  before(async () => {
    const app = await startAppWithValuations(valuation12);
    sharedBaseUrl = app.baseUrl;
    sharedClose = app.close;
  });

  after(async () => {
    await sharedClose();
    delete process.env.FMP_BASE_URL;
    delete process.env.FMP_API_KEY;
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. RETURNS 200 WITH THE CURRENT SNAPSHOT RESPONSE SHAPE .....................................
  it("returns 200 with correlationId, ticker, an empty horizons array, consolidatedSummary, and latest valuation inputs", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/margin-of-safety?ticker=AAPL`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(typeof body.correlationId, "string");
    assert.equal(body.data.ticker, "AAPL");
    assert.deepEqual(body.data.horizons, []);
    assert.ok("consolidatedSummary" in body.data);
    assert.ok("trailingTwelveMonthsActuals" in body.data);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. FORMATS THE CURRENT SUMMARY RESULT AS A PERCENTAGE .......................................
  it("formats the current summary result as a percentage string with one decimal place", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/margin-of-safety?ticker=AAPL`);
    const body = await res.json();
    const summary = body.data.consolidatedSummary;

    assert.deepEqual(body.data.horizons, []);
    assert.deepEqual(summary.values, ["20.0%"]);
    assert.equal(summary.result, "20.0%");
    assert.equal(summary.denominator, "1");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. FORMATS THE LATEST INTRINSIC VALUE AND STOCK PRICE AS SHARE PRICES .......................
  it("formats the latest intrinsic value and stock price as share prices", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/margin-of-safety?ticker=AAPL`);
    const body = await res.json();
    const ttm = body.data.trailingTwelveMonthsActuals;

    assert.equal(ttm.intrinsicValue, "$250.00");
    assert.equal(ttm.stockPrice, "$200.00");
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. RETURNS A ONE SNAPSHOT CONSOLIDATED SUMMARY ..............................................
  it("returns a one-snapshot consolidated summary for the current valuation", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/margin-of-safety?ticker=AAPL`);
    const body = await res.json();
    const summary = body.data.consolidatedSummary;

    assert.equal(summary.result, "20.0%");
    assert.deepEqual(summary.values, ["20.0%"]);
    assert.equal(summary.denominator, "1");
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. RETURNS THE PLACEHOLDER SUMMARY WHEN NO HORIZONS EXIST ...................................
  it("returns '—' and '0' in consolidatedSummary when the provider returns no usable rows", async () => {
    const empty = [makeValuationRow(2024, 0, 200)];
    const { baseUrl, close } = await startAppWithValuations(empty);
    try {
      const res = await fetch(`${baseUrl}/analysis/margin-of-safety?ticker=TEST`);
      const body = await res.json();
      assert.equal(body.data.consolidatedSummary.result, "—");
      assert.equal(body.data.consolidatedSummary.denominator, "0");
      assert.deepEqual(body.data.consolidatedSummary.values, []);
      assert.deepEqual(body.data.horizons, []);
      assert.equal(body.data.trailingTwelveMonthsActuals.intrinsicValue, "—");
      assert.equal(body.data.trailingTwelveMonthsActuals.stockPrice, "—");
    } finally {
      await close();
    }
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. RETURNS 400 FOR A MISSING TICKER .........................................................
  it("returns 400 with the exact message for a missing ticker", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/margin-of-safety`);
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.error?.message, "Missing required query parameter: ticker");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. RETURNS 400 FOR A WHITESPACE ONLY TICKER .................................................
  it("returns 400 for a whitespace-only ticker", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/margin-of-safety?ticker=%20%20`);
    assert.equal(res.status, 400);
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. MAPS PROVIDER 404 TO HTTP 404 ............................................................
  it("maps provider 404 to HTTP 404", async () => {
    const mock = await startMockFmpServer({
      "discounted-cash-flow": { status: 404, body: {} },
    });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/margin-of-safety?ticker=MISS`);
      assert.equal(res.status, 404);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. MAPS PROVIDER 429 TO HTTP 429 ...........................................................
  it("maps provider 429 to HTTP 429", async () => {
    const mock = await startMockFmpServer({
      "discounted-cash-flow": { status: 429, body: {} },
    });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/margin-of-safety?ticker=AAPL`);
      assert.equal(res.status, 429);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. MAPS PROVIDER AUTHENTICATION ERROR TO HTTP 502 ..........................................
  it("maps provider authentication error to HTTP 502", async () => {
    const mock = await startMockFmpServer({
      "discounted-cash-flow": { status: 401, body: {} },
    });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/margin-of-safety?ticker=AAPL`);
      assert.equal(res.status, 502);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.11. END .....................................................................................
});

describe("Margin of safety controller (injected repository seam)", () => {
  // 1.4.12. USES AN INJECTED REPOSITORY FACTORY AND RETURNS 200 .....................................
  it("uses an injected repository factory and returns a current percentage-formatted summary", async () => {
    const repository = {
      async getAnnualFinancials() {
        return [
          { fiscalYear: 2024, intrinsicValue: 250, stockPrice: 200 },
          { fiscalYear: 2023, intrinsicValue: 240, stockPrice: 210 },
          { fiscalYear: 2022, intrinsicValue: 230, stockPrice: 190 },
        ];
      },
    };
    const server = createApp({ repositoryFactory: () => repository }).listen(0);
    await once(server, "listening");
    const baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

    try {
      const res = await fetch(`${baseUrl}/analysis/margin-of-safety?ticker=AAPL`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.ticker, "AAPL");
      assert.deepEqual(body.data.horizons, []);
      assert.equal(body.data.consolidatedSummary.result, "20.0%");
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
    const baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

    try {
      const res = await fetch(`${baseUrl}/analysis/margin-of-safety?ticker=AAPL`);
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

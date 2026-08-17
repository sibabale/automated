// [ BACKEND > PRESENTATION > CONTROLLERS > PROFIT MARGIN > TESTS ] ##################################
//
// Integration tests for the full profit-margin HTTP pipeline. The FMP provider
// is replaced by a local mock server; the real repository, service, and
// controller run. Profit-margin figures are percentages, while the formula
// actuals remain currency, so both formats are asserted end to end.

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
function makeIncomeRow(fiscalYear: number, revenue: number, netIncome: number) {
  return {
    fiscalYear: String(fiscalYear),
    revenue,
    netIncome,
    date: `${fiscalYear}-09-30`,
  };
}

async function startAppWithIncome(incomeRows: unknown[]) {
  const mock = await startMockFmpServer({
    "income-statement": { body: incomeRows },
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
describe("Profit margin controller integration (mocked FMP)", () => {
  // 1.4.1. SETUP ....................................................................................
  let sharedBaseUrl: string;
  let sharedClose: () => Promise<void>;

  const income12 = Array.from({ length: 12 }, (_, index) =>
    makeIncomeRow(2023 - index, 400_000_000_000, 100_000_000_000),
  );

  before(async () => {
    const app = await startAppWithIncome(income12);
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
  it("returns 200 with correlationId, ticker, horizons, consolidatedSummary, and TTM actuals", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/profit-margin?ticker=AAPL`);
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

  // 1.4.3. FORMATS EACH HORIZON VALUE AS A PERCENTAGE ...............................................
  it("formats each horizon value as a percentage string with one decimal place", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/profit-margin?ticker=AAPL`);
    const body = await res.json();
    const horizon = body.data.horizons[0];

    assert.match(horizon.value, /^-?\d+\.\d%$/);
    assert.match(horizon.breakdown[0].value, /^-?\d+\.\d%$/);
    assert.equal(horizon.breakdown[0].period, "2023");
    assert.ok(horizon.trend === "up" || horizon.trend === "down");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. FORMATS TRAILING TWELVE MONTH ACTUALS AS CURRENCY ........................................
  it("formats trailing twelve-month net income and revenue as currency", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/profit-margin?ticker=AAPL`);
    const body = await res.json();
    const ttm = body.data.trailingTwelveMonthsActuals;

    assert.match(ttm.netIncome, /^\$\d+\.\d{2}B$/);
    assert.match(ttm.revenue, /^\$\d+\.\d{2}B$/);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. CONSOLIDATED SUMMARY RESULT USES THE PERCENT FORMATTER ...................................
  it("formats the consolidated summary result as a percentage with a matching denominator", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/profit-margin?ticker=AAPL`);
    const body = await res.json();
    const summary = body.data.consolidatedSummary;

    assert.match(summary.result, /^-?\d+\.\d%$/);
    assert.ok(Array.isArray(summary.values));
    assert.equal(summary.denominator, String(body.data.horizons.length));
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. RETURNS THE PLACEHOLDER SUMMARY WHEN NO HORIZONS EXIST ...................................
  it("returns '—' and '0' in consolidatedSummary when the provider returns no usable rows", async () => {
    const empty = [makeIncomeRow(2023, undefined as unknown as number, 90_000)];
    const { baseUrl, close } = await startAppWithIncome(empty);
    try {
      const res = await fetch(`${baseUrl}/analysis/profit-margin?ticker=TEST`);
      const body = await res.json();
      assert.equal(body.data.consolidatedSummary.result, "—");
      assert.equal(body.data.consolidatedSummary.denominator, "0");
      assert.deepEqual(body.data.consolidatedSummary.values, []);
      assert.equal(body.data.horizons.length, 0);
    } finally {
      await close();
    }
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. RETURNS 400 FOR A MISSING TICKER .........................................................
  it("returns 400 with the exact message for a missing ticker", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/profit-margin`);
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.error?.message, "Missing required query parameter: ticker");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. RETURNS 400 FOR A WHITESPACE ONLY TICKER .................................................
  it("returns 400 for a whitespace-only ticker", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/profit-margin?ticker=%20%20`);
    assert.equal(res.status, 400);
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. MAPS PROVIDER 404 TO HTTP 404 ............................................................
  it("maps provider 404 to HTTP 404", async () => {
    const mock = await startMockFmpServer({ "income-statement": { status: 404, body: {} } });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/profit-margin?ticker=MISS`);
      assert.equal(res.status, 404);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. MAPS PROVIDER 429 TO HTTP 429 ...........................................................
  it("maps provider 429 to HTTP 429", async () => {
    const mock = await startMockFmpServer({ "income-statement": { status: 429, body: {} } });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/profit-margin?ticker=AAPL`);
      assert.equal(res.status, 429);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. MAPS PROVIDER AUTHENTICATION ERROR TO HTTP 502 ..........................................
  it("maps provider authentication error to HTTP 502", async () => {
    const mock = await startMockFmpServer({ "income-statement": { status: 401, body: {} } });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/profit-margin?ticker=AAPL`);
      assert.equal(res.status, 502);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.11. END .....................................................................................
});

describe("Profit margin controller (injected repository seam)", () => {
  // 1.4.12. USES AN INJECTED REPOSITORY FACTORY AND RETURNS 200 .....................................
  it("uses an injected repository factory and returns percentage-formatted horizons", async () => {
    const repository = {
      async getAnnualFinancials() {
        return [
          { fiscalYear: 2024, netIncome: 100_000_000_000, revenue: 400_000_000_000 },
          { fiscalYear: 2023, netIncome: 90_000_000_000, revenue: 300_000_000_000 },
          { fiscalYear: 2022, netIncome: 50_000_000_000, revenue: 250_000_000_000 },
        ];
      },
    };
    const server = createApp({ repositoryFactory: () => repository }).listen(0);
    await once(server, "listening");
    const baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

    try {
      const res = await fetch(`${baseUrl}/analysis/profit-margin?ticker=AAPL`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.ticker, "AAPL");
      assert.match(body.data.horizons[0].value, /^-?\d+\.\d%$/);
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
      const res = await fetch(`${baseUrl}/analysis/profit-margin?ticker=AAPL`);
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

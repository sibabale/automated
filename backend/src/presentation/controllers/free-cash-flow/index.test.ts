// [ BACKEND > PRESENTATION > CONTROLLERS > FREE CASH FLOW > TESTS ] #################################
//
// Integration tests for the full free-cash-flow HTTP pipeline. The FMP provider
// is replaced by a local mock server; the real repository, service, and
// controller run. Horizon, summary, and trailing-actual figures remain dollar
// amounts for the client contract. Provider-error mapping is verified end to
// end alongside the injected-repository seam.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { once } from "node:events";
import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createApp } from "../../../app.js";
import { startMockFmpServer } from "../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
function makeCashFlowRow(fiscalYear, operatingCashFlow, capitalExpenditure) {
  return {
    fiscalYear: String(fiscalYear),
    operatingCashFlow,
    capitalExpenditure,
    date: `${fiscalYear}-09-30`,
  };
}

async function startAppWithCashFlow(cashFlowRows) {
  const mock = await startMockFmpServer({
    "cash-flow-statement": { body: cashFlowRows },
  });
  const savedUrl = process.env.FMP_BASE_URL;
  process.env.FMP_BASE_URL = mock.url;
  process.env.FMP_API_KEY = "test-key";
  const server = createApp().listen(0);
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const close = async () => {
    await new Promise((resolve) => server.close(resolve));
    await mock.close();
    process.env.FMP_BASE_URL = savedUrl;
  };
  return { baseUrl, close };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("Free cash flow controller integration (mocked FMP)", () => {
  // 1.4.1. SETUP ....................................................................................
  let sharedBaseUrl;
  let sharedClose;

  // Twelve years of billions-scale data so all four horizons populate and every
  // value formats in the billions branch.
  const cashFlow12 = Array.from({ length: 12 }, (_, i) =>
    makeCashFlowRow(2023 - i, 100_000_000_000, -4_000_000_000));

  before(async () => {
    const app = await startAppWithCashFlow(cashFlow12);
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
    const res = await fetch(`${sharedBaseUrl}/analysis/free-cash-flow?ticker=AAPL`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(typeof body.correlationId, "string");
    assert.equal(body.data.ticker, "AAPL");
    assert.ok(Array.isArray(body.data.horizons), "horizons must be an array");
    assert.ok(body.data.horizons.length > 0);
    assert.ok("consolidatedSummary" in body.data);
    assert.ok("trailingTwelveMonthsActuals" in body.data);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. FORMATS EACH HORIZON VALUE AS CURRENCY ...................................................
  it("formats each horizon value as billions currency '$X.XXB' (kills StringLiteral '$'/'B')", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/free-cash-flow?ticker=AAPL`);
    const body = await res.json();
    const horizon = body.data.horizons[0];

    assert.match(horizon.value, /^\$\d+\.\d{2}B$/, "billions format must be $X.XXB");
    assert.ok(horizon.value.startsWith("$"));
    assert.ok(horizon.value.endsWith("B"));
    assert.match(horizon.breakdown[0].value, /^\$\d+\.\d{2}B$/);
    assert.equal(horizon.breakdown[0].period, "2023");
    assert.ok(horizon.trend === "up" || horizon.trend === "down");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. FORMATS TRAILING TWELVE MONTH ACTUALS AS CURRENCY ........................................
  it("formats trailing twelve-month operating cash flow, capital expenditure, and free cash flow as currency", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/free-cash-flow?ticker=AAPL`);
    const body = await res.json();
    const ttm = body.data.trailingTwelveMonthsActuals;

    assert.match(ttm.operatingCashFlow, /^\$\d+\.\d{2}B$/);
    assert.ok(ttm.capitalExpenditure.startsWith("$-"), "negative outflow keeps its sign");
    assert.match(ttm.freeCashFlow, /^\$\d+\.\d{2}B$/);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. CONSOLIDATEDSUMMARY RESULT IS A FORMATTED CURRENCY .......................................
  it("consolidatedSummary.result is a formatted currency string with matching denominator", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/free-cash-flow?ticker=AAPL`);
    const body = await res.json();
    const cs = body.data.consolidatedSummary;

    assert.match(cs.result, /^\$\d+\.\d{2}B$/);
    assert.ok(Array.isArray(cs.values));
    assert.equal(cs.denominator, String(body.data.horizons.length));
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. FORMATS A MILLIONS SCALE FREE CASH FLOW WITH THE M SUFFIX ................................
  it("formats a millions-scale free cash flow as '$X.XM' (kills EqualityOperator >= 1M)", async () => {
    const millions = [makeCashFlowRow(2023, 5_000_000, -1_000_000)];
    const { baseUrl, close } = await startAppWithCashFlow(millions);
    try {
      const res = await fetch(`${baseUrl}/analysis/free-cash-flow?ticker=TEST`);
      const body = await res.json();
      assert.match(body.data.horizons[0].value, /^\$\d+\.\dM$/, "millions format must be $X.XM");
    } finally {
      await close();
    }
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. RETURNS THE PLACEHOLDER SUMMARY WHEN NO HORIZONS EXIST ...................................
  it("returns '\u2014' and '0' in consolidatedSummary when the provider returns no usable rows", async () => {
    const empty = [makeCashFlowRow(2023, 9_000, undefined)];
    const { baseUrl, close } = await startAppWithCashFlow(empty);
    try {
      const res = await fetch(`${baseUrl}/analysis/free-cash-flow?ticker=TEST`);
      const body = await res.json();
      assert.equal(body.data.consolidatedSummary.result, "\u2014");
      assert.equal(body.data.consolidatedSummary.denominator, "0");
      assert.deepEqual(body.data.consolidatedSummary.values, []);
      assert.equal(body.data.horizons.length, 0);
    } finally {
      await close();
    }
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. RETURNS 400 FOR A MISSING TICKER .........................................................
  it("returns 400 with the exact message for a missing ticker", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/free-cash-flow`);
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.error?.message, "Missing required query parameter: ticker");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. RETURNS 400 FOR A WHITESPACE ONLY TICKER .................................................
  it("returns 400 for a whitespace-only ticker (kills ConditionalExpression on !ticker)", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/free-cash-flow?ticker=%20%20`);
    assert.equal(res.status, 400);
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. MAPS PROVIDER 404 HTTP 404 ..............................................................
  it("maps provider 404 → HTTP 404 (not-found kind)", async () => {
    const mock = await startMockFmpServer({ "cash-flow-statement": { status: 404, body: {} } });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/free-cash-flow?ticker=NOTFOUND`);
      assert.equal(res.status, 404);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. MAPS PROVIDER 429 HTTP 429 ..............................................................
  it("maps provider 429 → HTTP 429 (rate-limit kind)", async () => {
    const mock = await startMockFmpServer({ "cash-flow-statement": { status: 429, body: {} } });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/free-cash-flow?ticker=AAPL`);
      assert.equal(res.status, 429);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.11. END .....................................................................................

  // 1.4.12. MAPS PROVIDER AUTHENTICATION ERROR HTTP 502 .............................................
  it("maps provider authentication error → HTTP 502 (default switch case)", async () => {
    const mock = await startMockFmpServer({ "cash-flow-statement": { status: 401, body: {} } });
    const saved = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/free-cash-flow?ticker=AAPL`);
      assert.equal(res.status, 502);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = saved;
    }
  });
  // 1.4.12. END .....................................................................................
});

describe("Free cash flow controller (injected repository seam)", () => {
  // 1.4.13. USES AN INJECTED REPOSITORY FACTORY AND RETURNS 200 .....................................
  it("uses an injected repository factory and returns currency-formatted horizons", async () => {
    const repository = {
      async getAnnualFinancials() {
        return [
          { fiscalYear: 2024, operatingCashFlow: 110_000_000_000, capitalExpenditure: -30_000_000_000 },
          { fiscalYear: 2023, operatingCashFlow: 100_000_000_000, capitalExpenditure: -25_000_000_000 },
          { fiscalYear: 2022, operatingCashFlow: 90_000_000_000, capitalExpenditure: -20_000_000_000 },
        ];
      },
    };
    const server = createApp({ repositoryFactory: () => repository }).listen(0);
    await once(server, "listening");
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
      const res = await fetch(`${baseUrl}/analysis/free-cash-flow?ticker=AAPL`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.ticker, "AAPL");
      assert.match(body.data.horizons[0].value, /^\$\d+\.\d{2}B$/);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
  // 1.4.13. END .....................................................................................

  // 1.4.14. MAPS A NON FMPCLIENTERROR FROM THE REPOSITORY TO HTTP 500 ...............................
  it("maps a non-FmpClientError from the repository to HTTP 500 with a generic message", async () => {
    const repository = {
      async getAnnualFinancials() {
        throw new Error("unexpected repository failure");
      },
    };
    const server = createApp({ repositoryFactory: () => repository }).listen(0);
    await once(server, "listening");
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
      const res = await fetch(`${baseUrl}/analysis/free-cash-flow?ticker=AAPL`);
      const body = await res.json();

      assert.equal(res.status, 500);
      assert.equal(body.error.message, "Internal server error");
      assert.equal(typeof body.correlationId, "string");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
  // 1.4.14. END .....................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

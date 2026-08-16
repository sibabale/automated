// [ BACKEND > PRESENTATION > CONTROLLERS > RETURN ON EQUITY > TESTS ] ###############################
//
// Integration tests for the full HTTP pipeline. The FMP provider is replaced
// by a local mock server; the real repository, service, and controller run.
//
// Stryker survivors targeted:
//   StringLiteral         — formatPercent "%", formatCurrency "$"/"B"/"M",
//                           error messages, "—" in empty summary, status-code strings
//   ConditionalExpression — formatCurrency thresholds, empty horizons guard,
//                           FmpClientError instanceof check
//   EqualityOperator      — absValue >= 1_000_000_000, absValue >= 1_000_000
//   ArithmeticOperator    — division in formatCurrency (/ 1B vs * 1B)
//   ObjectLiteral         — response body shape assertions
//   ArrayDeclaration      — horizons array
//   ArrowFunction         — breakdown map

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
function makeFinancialRow(fiscalYear, netIncome, equity) {
  return { fiscalYear: String(fiscalYear), netIncome, date: `${fiscalYear}-09-30` };
}
function makeBalanceRow(fiscalYear, equity) {
  return { fiscalYear: String(fiscalYear), totalStockholdersEquity: equity };
}

async function startAppWithFixtures(incomeRows, balanceRows) {
  const mock = await startMockFmpServer({
    "income-statement": { body: incomeRows },
    "balance-sheet-statement": { body: balanceRows },
  });
  // Save before overriding so close() can restore the shared mock URL
  const savedUrl = process.env.FMP_BASE_URL;
  process.env.FMP_BASE_URL = mock.url;
  process.env.FMP_API_KEY = "test-key";
  const server = createApp().listen(0);
  await once(server, "listening");
  const addr = server.address();
  const baseUrl = `http://127.0.0.1:${addr.port}`;
  const close = async () => {
    await new Promise(r => server.close(r));
    await mock.close();
    // Restore so subsequent tests against the shared server still work
    process.env.FMP_BASE_URL = savedUrl;
  };
  return { baseUrl, close };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("Controller integration (mocked FMP)", () => {
  // 1.4.1. SETUP ....................................................................................
  let sharedBaseUrl;
  let sharedClose;

  // Build 12 years of data so all four horizons are populated
  const income12 = Array.from({ length: 12 }, (_, i) =>
    makeFinancialRow(2023 - i, 96_995_000_000, 0));
  const balance12 = Array.from({ length: 12 }, (_, i) =>
    makeBalanceRow(2023 - i, 62_146_000_000));

  before(async () => {
    const app = await startAppWithFixtures(income12, balance12);
    sharedBaseUrl = app.baseUrl;
    sharedClose = app.close;
  });

  after(async () => {
    await sharedClose();
    delete process.env.FMP_BASE_URL;
    delete process.env.FMP_API_KEY;
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. RETURNS 200 WITH CORRELATIONID DATA TICKER ...............................................
  it("returns 200 with correlationId, data.ticker, horizons array, consolidatedSummary, TTM actuals", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(typeof body.correlationId, "string");
    assert.equal(body.data.ticker, "AAPL");
    assert.ok(Array.isArray(body.data.horizons), "horizons must be an array (kills ArrayDeclaration)");
    assert.ok(body.data.horizons.length > 0);
    assert.ok("consolidatedSummary" in body.data, "consolidatedSummary must exist");
    assert.ok("trailingTwelveMonthsActuals" in body.data, "TTM actuals must exist");
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. FORMATS ROE AS EXACTLY ONE DECIMAL .......................................................
  it("formats ROE as exactly one-decimal percent ending in '%' (kills StringLiteral '%')", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
    const body = await res.json();
    const firstHorizonValue = body.data.horizons[0].value;
    assert.match(firstHorizonValue, /^\d+\.\d%$/, "format must be N.N%");
    assert.ok(firstHorizonValue.endsWith("%"), "must end with %");
    const breakdownEntry = body.data.horizons[0].breakdown[0];
    assert.match(breakdownEntry.value, /^\d+\.\d%$/);
    assert.equal(breakdownEntry.period, "2023");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. CONSOLIDATEDSUMMARY RESULT IS A FORMATTED PERCENT ........................................
  it("consolidatedSummary.result is a formatted percent string (kills StringLiteral and ObjectLiteral)", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
    const body = await res.json();
    const cs = body.data.consolidatedSummary;
    assert.match(cs.result, /^\d+\.\d%$/, "result must be a percent");
    assert.ok(Array.isArray(cs.values), "values must be an array");
    assert.ok(cs.values.length > 0);
    assert.equal(typeof cs.denominator, "string");
    assert.equal(cs.denominator, String(body.data.horizons.length));
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. FORMATS NETINCOME 1B AS X XXB ............................................................
  it("formats netIncome >= 1B as '$X.XXB' (kills ArithmeticOperator, StringLiteral B, EqualityOperator)", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
    const body = await res.json();
    const ni = body.data.trailingTwelveMonthsActuals.netIncome;
    assert.match(ni, /^\$\d+\.\d{2}B$/, "billions format must be $X.XXB");
    assert.ok(ni.endsWith("B"), "must end with B (kills StringLiteral 'B')");
    assert.ok(ni.startsWith("$"), "must start with $ (kills StringLiteral '$')");
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. FORMATS SHAREHOLDERSEQUITY 1B AS X XXB ...................................................
  it("formats shareholdersEquity >= 1B as '$X.XXB'", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
    const body = await res.json();
    const eq = body.data.trailingTwelveMonthsActuals.shareholdersEquity;
    assert.match(eq, /^\$\d+\.\d{2}B$/);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. FORMATS NETINCOME IN MILLIONS RANGE AS ...................................................
  it("formats netIncome in millions range as '$X.XM' (kills StringLiteral M, EqualityOperator >= 1M)", async () => {
    const millionIncome = [makeFinancialRow(2023, 500_000_000, 0)];
    const millionBalance = [makeBalanceRow(2023, 200_000_000)];
    const { baseUrl, close } = await startAppWithFixtures(millionIncome, millionBalance);
    try {
      const res = await fetch(`${baseUrl}/analysis/return-on-equity?ticker=TEST`);
      const body = await res.json();
      const ni = body.data.trailingTwelveMonthsActuals.netIncome;
      assert.match(ni, /^\$\d+\.\dM$/, "millions format must be $X.XM");
      assert.ok(ni.endsWith("M"), "must end with M");
      assert.ok(ni.startsWith("$"), "must start with $");
    } finally {
      await close();
    }
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. FORMATS NETINCOME EXACTLY AT 1 000 .......................................................
  it("formats netIncome exactly at 1_000_000_000 as billions not millions (kills EqualityOperator boundary)", async () => {
    const exactBillion = [makeFinancialRow(2023, 1_000_000_000, 0)];
    const balanceExact = [makeBalanceRow(2023, 1_000_000_000)];
    const { baseUrl, close } = await startAppWithFixtures(exactBillion, balanceExact);
    try {
      const res = await fetch(`${baseUrl}/analysis/return-on-equity?ticker=TEST`);
      const body = await res.json();
      const ni = body.data.trailingTwelveMonthsActuals.netIncome;
      assert.ok(ni.endsWith("B"), `expected B suffix for 1B, got: ${ni}`);
    } finally {
      await close();
    }
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. FORMATS NETINCOME EXACTLY AT 1 000 .......................................................
  it("formats netIncome exactly at 1_000_000 as millions not dollars (kills EqualityOperator boundary)", async () => {
    const exactMillion = [makeFinancialRow(2023, 1_000_000, 0)];
    const balanceExact = [makeBalanceRow(2023, 1_000_000)];
    const { baseUrl, close } = await startAppWithFixtures(exactMillion, balanceExact);
    try {
      const res = await fetch(`${baseUrl}/analysis/return-on-equity?ticker=TEST`);
      const body = await res.json();
      const ni = body.data.trailingTwelveMonthsActuals.netIncome;
      assert.ok(ni.endsWith("M"), `expected M suffix for 1M, got: ${ni}`);
    } finally {
      await close();
    }
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. FORMATS NETINCOME BELOW 1M AS RAW .......................................................
  it("formats netIncome below 1M as raw dollars with no suffix (kills ConditionalExpression fallthrough)", async () => {
    const smallIncome = [makeFinancialRow(2023, 999_999, 0)];
    const smallBalance = [makeBalanceRow(2023, 999_999)];
    const { baseUrl, close } = await startAppWithFixtures(smallIncome, smallBalance);
    try {
      const res = await fetch(`${baseUrl}/analysis/return-on-equity?ticker=TEST`);
      const body = await res.json();
      const ni = body.data.trailingTwelveMonthsActuals.netIncome;
      assert.match(ni, /^\$\d+$/, "sub-million must be $N with no suffix");
    } finally {
      await close();
    }
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. FORMATS NEGATIVE NETINCOME CORRECTLY ....................................................
  it("formats negative netIncome correctly (kills absValue ConditionalExpression)", async () => {
    const negativeIncome = [makeFinancialRow(2023, -2_000_000_000, 0)];
    const balancePositive = [makeBalanceRow(2023, 1_000_000_000)];
    const { baseUrl, close } = await startAppWithFixtures(negativeIncome, balancePositive);
    try {
      const res = await fetch(`${baseUrl}/analysis/return-on-equity?ticker=TEST`);
      const body = await res.json();
      const ni = body.data.trailingTwelveMonthsActuals.netIncome;
      assert.ok(ni.includes("B"), `expected B format for -2B, got: ${ni}`);
      assert.ok(ni.startsWith("$"), "must start with $");
    } finally {
      await close();
    }
  });
  // 1.4.11. END .....................................................................................

  // 1.4.12. RETURNS AND 0 IN CONSOLIDATEDSUMMARY WHEN ...............................................
  it("returns '—' and '0' in consolidatedSummary when no horizons exist (kills StringLiteral survivors)", async () => {
    const zeroEquityIncome = [makeFinancialRow(2023, 1_000_000, 0)];
    const zeroEquityBalance = [makeBalanceRow(2023, 0)];
    const { baseUrl, close } = await startAppWithFixtures(zeroEquityIncome, zeroEquityBalance);
    try {
      const res = await fetch(`${baseUrl}/analysis/return-on-equity?ticker=TEST`);
      const body = await res.json();
      assert.equal(body.data.consolidatedSummary.result, "—", "empty summary result must be exactly '—'");
      assert.equal(body.data.consolidatedSummary.denominator, "0", "empty denominator must be exactly '0'");
      assert.deepEqual(body.data.consolidatedSummary.values, []);
      assert.equal(body.data.horizons.length, 0);
    } finally {
      await close();
    }
  });
  // 1.4.12. END .....................................................................................

  // 1.4.13. RETURNS 400 WITH EXACT MESSAGE FOR ......................................................
  it("returns 400 with exact message for missing ticker (kills StringLiteral for error message)", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity`);
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.error?.message, "Missing required query parameter: ticker");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.13. END .....................................................................................

  // 1.4.14. RETURNS 400 FOR WHITESPACE ONLY TICKER ..................................................
  it("returns 400 for whitespace-only ticker (kills ConditionalExpression on !ticker)", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=%20%20`);
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.equal(body.error?.message, "Missing required query parameter: ticker");
  });
  // 1.4.14. END .....................................................................................

  // 1.4.15. MAPS PROVIDER 404 HTTP 404 ..............................................................
  it("maps provider 404 → HTTP 404 (not-found kind)", async () => {
    const mock = await startMockFmpServer({ "income-statement": { status: 404, body: {} }, "balance-sheet-statement": { body: [] } });
    const savedUrl404 = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=NOTFOUND`);
      assert.equal(res.status, 404);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = savedUrl404;
    }
  });
  // 1.4.15. END .....................................................................................

  // 1.4.16. MAPS PROVIDER 429 HTTP 429 ..............................................................
  it("maps provider 429 → HTTP 429 (rate-limit kind)", async () => {
    const mock = await startMockFmpServer({ "income-statement": { status: 429, body: {} }, "balance-sheet-statement": { body: [] } });
    const savedUrl429 = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
      assert.equal(res.status, 429);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = savedUrl429;
    }
  });
  // 1.4.16. END .....................................................................................

  // 1.4.17. MAPS PROVIDER TIMEOUT HTTP 504 ..........................................................
  it("maps provider timeout → HTTP 504 (timeout kind)", async () => {
    const { createServer } = await import("node:http");
    const slow = createServer((_q, _r) => {});
    await new Promise(r => slow.listen(0, "127.0.0.1", r));
    const savedUrl = process.env.FMP_BASE_URL;
    const savedTimeout = process.env.FMP_TIMEOUT_MS;
    process.env.FMP_BASE_URL = `http://127.0.0.1:${slow.address().port}`;
    process.env.FMP_TIMEOUT_MS = "1";
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
      assert.equal(res.status, 504);
    } finally {
      await new Promise(r => slow.close(r));
      process.env.FMP_BASE_URL = savedUrl;
      if (savedTimeout === undefined) delete process.env.FMP_TIMEOUT_MS;
      else process.env.FMP_TIMEOUT_MS = savedTimeout;
    }
  });
  // 1.4.17. END .....................................................................................

  // 1.4.18. MAPS PROVIDER AUTHENTICATION ERROR HTTP 502 .............................................
  it("maps provider authentication error → HTTP 502 (default switch case)", async () => {
    const mock = await startMockFmpServer({ "income-statement": { status: 401, body: {} }, "balance-sheet-statement": { body: [] } });
    const savedUrl401 = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
      assert.equal(res.status, 502);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = savedUrl401;
    }
  });
  // 1.4.18. END .....................................................................................

  // 1.4.19. MAPS PROVIDER INVALID RESPONSE HTTP 502 .................................................
  it("maps provider invalid-response → HTTP 502 (default switch case, kills ConditionalExpression)", async () => {
    const mock = await startMockFmpServer({
      "income-statement": { status: 200, body: { "Error Message": "Invalid API KEY." } },
      "balance-sheet-statement": { body: [] }
    });
    const savedUrlInvalid = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url;
    try {
      const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
      assert.equal(res.status, 502);
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = savedUrlInvalid;
    }
  });
  // 1.4.19. END .....................................................................................

  // 1.4.20. INCLUDES CORRELATIONID IN ERROR RESPONSES ...............................................
  it("includes correlationId in error responses (kills ObjectLiteral on error body)", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity`);
    const body = await res.json();
    assert.equal(typeof body.correlationId, "string");
    assert.ok(body.correlationId.length > 0);
    assert.ok("error" in body);
    assert.ok("message" in body.error);
  });
  // 1.4.20. END .....................................................................................

  // 1.4.21. EACH HORIZON HAS LABEL RANGE VALUE ......................................................
  it("each horizon has label, range, value, breakdown, and trend fields (kills ObjectLiteral)", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
    const body = await res.json();
    const h = body.data.horizons[0];
    assert.ok(typeof h.label === "string" && h.label.length > 0);
    assert.ok(typeof h.range === "string" && h.range.length > 0);
    assert.match(h.value, /^\d+\.\d%$/);
    assert.ok(Array.isArray(h.breakdown));
    assert.ok(h.breakdown.length > 0);
    assert.ok(h.trend === "up" || h.trend === "down");
  });
  // 1.4.21. END .....................................................................................

  // 1.4.22. EACH BREAKDOWN ENTRY HAS PERIOD .........................................................
  it("each breakdown entry has period (year string) and formatted value (kills ArrowFunction)", async () => {
    const res = await fetch(`${sharedBaseUrl}/analysis/return-on-equity?ticker=AAPL`);
    const body = await res.json();
    const entry = body.data.horizons[0].breakdown[0];
    assert.match(entry.period, /^\d{4}$/);
    assert.match(entry.value, /^\d+\.\d%$/);
  });
  // 1.4.22. END .....................................................................................
});

describe("Controller (injected repository seam)", () => {
  // 1.4.23. USES AN INJECTED REPOSITORY FACTORY AND RETURNS 200 .....................................
  it("uses an injected repository factory and returns 200 (covers the app injection seam)", async () => {
    const repository = {
      async getAnnualFinancials() {
        return [
          { fiscalYear: 2024, netIncome: 30, shareholdersEquity: 100 },
          { fiscalYear: 2023, netIncome: 25, shareholdersEquity: 100 },
          { fiscalYear: 2022, netIncome: 20, shareholdersEquity: 100 },
        ];
      },
    };
    const server = createApp({ repositoryFactory: () => repository }).listen(0);
    await once(server, "listening");
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
      const res = await fetch(`${baseUrl}/analysis/return-on-equity?ticker=AAPL`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.ticker, "AAPL");
      assert.ok(Array.isArray(body.data.horizons));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
  // 1.4.23. END .....................................................................................

  // 1.4.24. MAPS A NON FMPCLIENTERROR FROM THE REPOSITORY TO HTTP 500 ...............................
  it("maps a non-FmpClientError from the repository to HTTP 500 with a generic message and correlationId", async () => {
    const repository = {
      async getAnnualFinancials() {
        throw new Error("unexpected repository failure");
      },
    };
    const server = createApp({ repositoryFactory: () => repository }).listen(0);
    await once(server, "listening");
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
      const res = await fetch(`${baseUrl}/analysis/return-on-equity?ticker=AAPL`);
      const body = await res.json();

      assert.equal(res.status, 500);
      assert.equal(body.error.message, "Internal server error");
      assert.equal(typeof body.correlationId, "string");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
  // 1.4.24. END .....................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

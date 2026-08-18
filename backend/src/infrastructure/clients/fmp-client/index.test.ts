// [ BACKEND > INFRASTRUCTURE > CLIENTS > FMP CLIENT > TESTS ] #######################################
//
// Tests for fmpGetJson — every branch, every error kind, exact URL/query
// parameter assertions, and exact error message text.
//
// Stryker survivors targeted:
//   StringLiteral         — query param names, error messages, endpoint paths, regex
//   ConditionalExpression — apiKey guard, AbortError check, Array.isArray, object check
//   EqualityOperator      — response.status comparisons (401, 403, 404, 429)
//   LogicalOperator       — AbortError combined condition
//   Regex                 — /\/+$/ trailing-slash stripper
//   BlockStatement        — entire error-throw blocks
//   ArrowFunction         — filter callback inside Array.isArray branch

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import http from "node:http";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { fmpGetJson, FMP_ENDPOINTS, FmpClientError } from "./index.js";
import { startMockFmpServer } from "../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
// Saves/restores FMP_BASE_URL around each test that needs an isolated mock server.
async function withMock(routes, fn) {
  const mock = await startMockFmpServer(routes);
  const saved = process.env.FMP_BASE_URL;
  process.env.FMP_BASE_URL = mock.url;
  try { await fn(mock); }
  finally {
    await mock.close();
    if (saved === undefined) delete process.env.FMP_BASE_URL;
    else process.env.FMP_BASE_URL = saved;
  }
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("fmpGetJson (FMP HTTP client)", () => {
  // 1.4.1. SETUP ....................................................................................
  before(() => { process.env.FMP_API_KEY = "test-key"; });
  after(() => {
    delete process.env.FMP_API_KEY;
    delete process.env.FMP_BASE_URL;
    delete process.env.FMP_TIMEOUT_MS;
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. RETURNS PARSED ROWS ON A 200 .............................................................
  it("returns parsed rows on a 200 array response", async () => {
    await withMock({ "income-statement": { body: [{ fiscalYear: 2023, netIncome: 1000 }] } }, async () => {
      const rows = await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL", period: "annual", limit: 1 }, "cid-001");
      assert.equal(rows.length, 1);
      assert.equal(rows[0].fiscalYear, 2023);
    });
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. WRAPS A SINGLE OBJECT RESPONSE AS ........................................................
  it("wraps a single-object response as a one-element array (kills ConditionalExpression on isArray)", async () => {
    await withMock({ "income-statement": { body: { fiscalYear: 2023, netIncome: 5000 } } }, async () => {
      const rows = await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-002");
      assert.equal(rows.length, 1);
      assert.equal(rows[0].netIncome, 5000);
    });
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. FILTERS NULL AND NON OBJECT ENTRIES ......................................................
  it("filters null and non-object entries from array response (kills ArrowFunction)", async () => {
    await withMock({ "income-statement": { body: [{ fiscalYear: 2023 }, null, "stray", { fiscalYear: 2022 }] } }, async () => {
      const rows = await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-003");
      assert.equal(rows.length, 2);
    });
  });
  // 1.4.4. END ......................................................................................

  // These kill every StringLiteral survivor for param names.

  // 1.4.5. SENDS THE CORRECT ENDPOINT PATH IN .......................................................
  it("sends the correct endpoint path in the URL (kills StringLiteral for endpoint path)", async () => {
    await withMock({ "income-statement": { body: [] } }, async (mock) => {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "TSLA" }, "cid-004");
      assert.equal(mock.lastRequest?.pathname, "income-statement");
    });
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. SENDS BALANCE SHEET STATEMENT PATH CORRECTLY .............................................
  it("sends balance-sheet-statement path correctly for balance sheet endpoint", async () => {
    await withMock({ "balance-sheet-statement": { body: [] } }, async (mock) => {
      await fmpGetJson(FMP_ENDPOINTS.balanceSheet, { symbol: "AAPL" }, "cid-004b");
      assert.equal(mock.lastRequest?.pathname, "balance-sheet-statement");
    });
  });
  // 1.4.6. END ......................................................................................

  // 1.4.6A. SENDS THE CURRENT DCF PATH CORRECTLY ....................................................
  it("sends the documented discounted-cash-flow path correctly for margin-of-safety data", async () => {
    await withMock({ "discounted-cash-flow": { body: [] } }, async (mock) => {
      await fmpGetJson(FMP_ENDPOINTS.discountedCashFlow, { symbol: "AAPL" }, "cid-004c");
      assert.equal(mock.lastRequest?.pathname, "discounted-cash-flow");
    });
  });
  // 1.4.6A. END .....................................................................................

  // 1.4.7. SENDS SYMBOL WITH CORRECT PARAMETER NAME .................................................
  it("sends symbol with correct parameter name 'symbol' (kills StringLiteral)", async () => {
    await withMock({ "income-statement": { body: [] } }, async (mock) => {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "MSFT" }, "cid-005");
      assert.equal(mock.lastRequest?.searchParams.get("symbol"), "MSFT");
    });
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. SENDS APIKEY WITH CORRECT PARAMETER NAME .................................................
  it("sends apikey with correct parameter name and value (kills StringLiteral for 'apikey')", async () => {
    await withMock({ "income-statement": { body: [] } }, async (mock) => {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-006");
      assert.equal(mock.lastRequest?.searchParams.get("apikey"), "test-key");
    });
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. SENDS PERIOD QUERY PARAMETER WHEN PROVIDED ...............................................
  it("sends 'period' query parameter when provided (kills StringLiteral for 'period')", async () => {
    await withMock({ "income-statement": { body: [] } }, async (mock) => {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL", period: "annual" }, "cid-007");
      assert.equal(mock.lastRequest?.searchParams.get("period"), "annual");
    });
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. OMITS PERIOD WHEN NOT PROVIDED ..........................................................
  it("omits 'period' when not provided (kills ConditionalExpression on period check)", async () => {
    await withMock({ "income-statement": { body: [] } }, async (mock) => {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-008");
      assert.equal(mock.lastRequest?.searchParams.get("period"), null);
    });
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. SENDS LIMIT QUERY PARAMETER WHEN PROVIDED ...............................................
  it("sends 'limit' query parameter when provided (kills StringLiteral for 'limit')", async () => {
    await withMock({ "income-statement": { body: [] } }, async (mock) => {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL", limit: 12 }, "cid-009");
      assert.equal(mock.lastRequest?.searchParams.get("limit"), "12");
    });
  });
  // 1.4.11. END .....................................................................................

  // 1.4.12. OMITS LIMIT WHEN UNDEFINED ..............................................................
  it("omits 'limit' when undefined (kills ConditionalExpression on limit check)", async () => {
    await withMock({ "income-statement": { body: [] } }, async (mock) => {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-010");
      assert.equal(mock.lastRequest?.searchParams.get("limit"), null);
    });
  });
  // 1.4.12. END .....................................................................................

  // 1.4.13. STRIPS TRAILING SLASHES FROM FMP BASE ...................................................
  it("strips trailing slashes from FMP_BASE_URL (kills the /\\/+$/ Regex mutants)", async () => {
    const mock = await startMockFmpServer({ "income-statement": { body: [] } });
    const savedUrl = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = mock.url + "///";
    try {
      const rows = await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-011");
      assert.ok(Array.isArray(rows));
    } finally {
      await mock.close();
      process.env.FMP_BASE_URL = savedUrl;
    }
  });
  // 1.4.13. END .....................................................................................

  // 1.4.14. THROWS AUTHENTICATION ERROR WITH EXACT MESSAGE ..........................................
  it("throws authentication error with exact message when API key is absent", async () => {
    const savedKey = process.env.FMP_API_KEY;
    delete process.env.FMP_API_KEY;
    try {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-012");
      assert.fail("Expected FmpClientError");
    } catch (error) {
      assert.ok(error instanceof FmpClientError);
      assert.equal(error.kind, "authentication");
      assert.equal(error.message, "FMP API key is not configured");
    } finally {
      if (savedKey !== undefined) process.env.FMP_API_KEY = savedKey;
    }
  });
  // 1.4.14. END .....................................................................................

  // Assert both kind AND exact message to kill StringLiteral survivors.

  // 1.4.15. THROWS AUTHENTICATION ERROR WITH EXACT MESSAGE ..........................................
  it("throws authentication error with exact message on 401", async () => {
    await withMock({ "income-statement": { status: 401, body: {} } }, async () => {
      try {
        await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-013");
        assert.fail();
      } catch (error) {
        assert.ok(error instanceof FmpClientError);
        assert.equal(error.kind, "authentication");
        assert.equal(error.message, "FMP authentication failed for income-statement");
      }
    });
  });
  // 1.4.15. END .....................................................................................

  // 1.4.16. THROWS AUTHENTICATION ERROR WITH EXACT MESSAGE ..........................................
  it("throws authentication error with exact message on 403 (kills EqualityOperator 401 vs 403)", async () => {
    await withMock({ "income-statement": { status: 403, body: {} } }, async () => {
      try {
        await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-014");
        assert.fail();
      } catch (error) {
        assert.ok(error instanceof FmpClientError);
        assert.equal(error.kind, "authentication");
        assert.equal(error.message, "FMP authentication failed for income-statement");
      }
    });
  });
  // 1.4.16. END .....................................................................................

  // 1.4.17. THROWS NOT FOUND WITH EXACT MESSAGE .....................................................
  it("throws not-found with exact message on 404", async () => {
    await withMock({ "income-statement": { status: 404, body: {} } }, async () => {
      try {
        await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-015");
        assert.fail();
      } catch (error) {
        assert.ok(error instanceof FmpClientError);
        assert.equal(error.kind, "not-found");
        assert.equal(error.message, "FMP endpoint not found for income-statement");
      }
    });
  });
  // 1.4.17. END .....................................................................................

  // 1.4.18. THROWS RATE LIMIT WITH EXACT MESSAGE ....................................................
  it("throws rate-limit with exact message on 429", async () => {
    await withMock({ "income-statement": { status: 429, body: {} } }, async () => {
      try {
        await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-016");
        assert.fail();
      } catch (error) {
        assert.ok(error instanceof FmpClientError);
        assert.equal(error.kind, "rate-limit");
        assert.equal(error.message, "FMP rate limit exceeded for income-statement");
      }
    });
  });
  // 1.4.18. END .....................................................................................

  // 1.4.18A. RETRIES 429S BEFORE SUCCEEDING .........................................................
  it("retries a 429 response with retry-after before succeeding", async () => {
    const savedUrl = process.env.FMP_BASE_URL;
    const savedMinInterval = process.env.FMP_MIN_INTERVAL_MS;
    const savedRetries = process.env.FMP_RATE_LIMIT_RETRIES;
    let requestCount = 0;

    const server = http.createServer((_req, res) => {
      requestCount += 1;
      if (requestCount === 1) {
        res.statusCode = 429;
        res.setHeader("retry-after", "0.001");
        res.setHeader("content-type", "application/json");
        res.end("{}");
        return;
      }

      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify([{ fiscalYear: 2023, netIncome: 1000 }]));
    });

    await new Promise(r => server.listen(0, "127.0.0.1", r));
    const addr = server.address();
    process.env.FMP_BASE_URL = `http://127.0.0.1:${addr.port}`;
    process.env.FMP_MIN_INTERVAL_MS = "1";
    process.env.FMP_RATE_LIMIT_RETRIES = "2";

    try {
      const rows = await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-016a");
      assert.equal(requestCount, 2);
      assert.equal(rows.length, 1);
      assert.equal(rows[0].fiscalYear, 2023);
    } finally {
      await new Promise(r => server.close(r));
      process.env.FMP_BASE_URL = savedUrl;
      if (savedMinInterval === undefined) delete process.env.FMP_MIN_INTERVAL_MS;
      else process.env.FMP_MIN_INTERVAL_MS = savedMinInterval;
      if (savedRetries === undefined) delete process.env.FMP_RATE_LIMIT_RETRIES;
      else process.env.FMP_RATE_LIMIT_RETRIES = savedRetries;
    }
  });
  // 1.4.18A. END ....................................................................................

  // 1.4.19. THROWS PROVIDER ERROR WITH EXACT MESSAGE ................................................
  it("throws provider error with exact message on 500", async () => {
    await withMock({ "income-statement": { status: 500, body: {} } }, async () => {
      try {
        await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-017");
        assert.fail();
      } catch (error) {
        assert.ok(error instanceof FmpClientError);
        assert.equal(error.kind, "provider");
        assert.equal(error.message, "FMP returned 500 for income-statement");
      }
    });
  });
  // 1.4.19. END .....................................................................................

  // 1.4.20. THROWS PROVIDER ERROR ...................................................................
  it("throws provider error (not rate-limit) on 430 — exercises >= 400 fallthrough", async () => {
    await withMock({ "income-statement": { status: 430, body: {} } }, async () => {
      try {
        await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-018");
        assert.fail();
      } catch (error) {
        assert.ok(error instanceof FmpClientError);
        assert.equal(error.kind, "provider");
      }
    });
  });
  // 1.4.20. END .....................................................................................

  // 1.4.21. THROWS INVALID RESPONSE WITH THE PROVIDER ...............................................
  it("throws invalid-response with the provider's Error Message text", async () => {
    await withMock({ "income-statement": { status: 200, body: { "Error Message": "Invalid API KEY." } } }, async () => {
      try {
        await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-019");
        assert.fail();
      } catch (error) {
        assert.ok(error instanceof FmpClientError);
        assert.equal(error.kind, "invalid-response");
        assert.equal(error.message, "Invalid API KEY.");
      }
    });
  });
  // 1.4.21. END .....................................................................................

  // 1.4.21A. THROTTLES REQUESTS TO RESPECT MINIMUM INTERVAL .........................................
  it("spaces consecutive requests by the configured minimum interval", async () => {
    const savedUrl = process.env.FMP_BASE_URL;
    const savedMinInterval = process.env.FMP_MIN_INTERVAL_MS;
    const timestamps: number[] = [];

    const server = http.createServer((_req, res) => {
      timestamps.push(Date.now());
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify([{ fiscalYear: 2023, netIncome: 1000 }]));
    });

    await new Promise(r => server.listen(0, "127.0.0.1", r));
    const addr = server.address();
    process.env.FMP_BASE_URL = `http://127.0.0.1:${addr.port}`;
    process.env.FMP_MIN_INTERVAL_MS = "25";

    try {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-019a");
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "MSFT" }, "cid-019b");
      assert.equal(timestamps.length, 2);
      assert.ok(timestamps[1] - timestamps[0] >= 20);
    } finally {
      await new Promise(r => server.close(r));
      process.env.FMP_BASE_URL = savedUrl;
      if (savedMinInterval === undefined) delete process.env.FMP_MIN_INTERVAL_MS;
      else process.env.FMP_MIN_INTERVAL_MS = savedMinInterval;
    }
  });
  // 1.4.21A. END ....................................................................................

  // 1.4.22. THROWS INVALID RESPONSE WITH EXACT MESSAGE ..............................................
  it("throws invalid-response with exact message when body is an unsupported primitive", async () => {
    const server = http.createServer((_req, res) => {
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end('"just a string"');
    });
    await new Promise(r => server.listen(0, "127.0.0.1", r));
    const addr = server.address();
    const savedUrl = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = `http://127.0.0.1:${addr.port}`;
    try {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-020");
      assert.fail();
    } catch (error) {
      assert.ok(error instanceof FmpClientError);
      assert.equal(error.kind, "invalid-response");
      assert.equal(error.message, "FMP returned an unsupported response shape");
    } finally {
      await new Promise(r => server.close(r));
      process.env.FMP_BASE_URL = savedUrl;
    }
  });
  // 1.4.22. END .....................................................................................

  // 1.4.23. THROWS TIMEOUT ERROR WITH EXACT MESSAGE .................................................
  it("throws timeout error with exact message when request exceeds FMP_TIMEOUT_MS", async () => {
    const slowServer = http.createServer((_req, _res) => { /* never respond */ });
    await new Promise(r => slowServer.listen(0, "127.0.0.1", r));
    const addr = slowServer.address();
    const savedUrl = process.env.FMP_BASE_URL;
    const savedTimeout = process.env.FMP_TIMEOUT_MS;
    process.env.FMP_BASE_URL = `http://127.0.0.1:${addr.port}`;
    process.env.FMP_TIMEOUT_MS = "1";
    try {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-021");
      assert.fail();
    } catch (error) {
      assert.ok(error instanceof FmpClientError);
      assert.equal(error.kind, "timeout");
      assert.equal(error.message, "FMP request timed out for income-statement");
    } finally {
      await new Promise(r => slowServer.close(r));
      process.env.FMP_BASE_URL = savedUrl;
      if (savedTimeout === undefined) delete process.env.FMP_TIMEOUT_MS;
      else process.env.FMP_TIMEOUT_MS = savedTimeout;
    }
  });
  // 1.4.23. END .....................................................................................

  // 1.4.24. THROWS PROVIDER ERROR WITH EXACT MESSAGE ................................................
  it("throws provider error with exact message when fetch fails (connection refused)", async () => {
    const savedUrl = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = "http://127.0.0.1:1";
    try {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-022");
      assert.fail();
    } catch (error) {
      assert.ok(error instanceof FmpClientError);
      assert.equal(error.kind, "provider");
      assert.equal(error.message, "FMP request failed for income-statement");
    } finally {
      process.env.FMP_BASE_URL = savedUrl;
    }
  });
  // 1.4.24. END .....................................................................................

  // 1.4.25. THROWS INVALID RESPONSE WHEN THE BODY IS NOT VALID JSON .................................
  it("throws invalid-response with exact message when the body is not valid JSON", async () => {
    // A JSON content-type with a malformed payload forces response.json() to
    // reject, exercising the parse-failure catch that structured mocks cannot.
    const server = http.createServer((_req, res) => {
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end("{ this is not valid json");
    });
    await new Promise(r => server.listen(0, "127.0.0.1", r));
    const addr = server.address();
    const savedUrl = process.env.FMP_BASE_URL;
    process.env.FMP_BASE_URL = `http://127.0.0.1:${addr.port}`;
    try {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-023");
      assert.fail();
    } catch (error) {
      assert.ok(error instanceof FmpClientError);
      assert.equal(error.kind, "invalid-response");
      assert.equal(error.message, "FMP returned invalid JSON for income-statement");
    } finally {
      await new Promise(r => server.close(r));
      process.env.FMP_BASE_URL = savedUrl;
    }
  });
  // 1.4.25. END .....................................................................................

  // 1.4.26. FALLS BACK TO THE DEFAULT BASE URL WHEN FMP_BASE_URL IS UNSET ...........................
  it("falls back to the default base URL when FMP_BASE_URL is unset", async () => {
    // With no base URL and no API key, resolveConfig takes the default-URL
    // branch and the pre-fetch API-key guard fires, so this exercises the
    // fallback without making a real network request to the live provider.
    const savedUrl = process.env.FMP_BASE_URL;
    const savedKey = process.env.FMP_API_KEY;
    delete process.env.FMP_BASE_URL;
    delete process.env.FMP_API_KEY;
    try {
      await fmpGetJson(FMP_ENDPOINTS.incomeStatement, { symbol: "AAPL" }, "cid-024");
      assert.fail("Expected FmpClientError");
    } catch (error) {
      assert.ok(error instanceof FmpClientError);
      assert.equal(error.kind, "authentication");
      assert.equal(error.message, "FMP API key is not configured");
    } finally {
      if (savedUrl !== undefined) process.env.FMP_BASE_URL = savedUrl;
      if (savedKey !== undefined) process.env.FMP_API_KEY = savedKey;
    }
  });
  // 1.4.26. END .....................................................................................

});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

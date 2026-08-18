// [ BACKEND > INFRASTRUCTURE > CLIENTS > ALPACA CLIENT > TESTS ] ####################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import http from "node:http";
import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
  alpacaGetAccount,
  alpacaGetPositions,
  alpacaSubmitOrder,
  AlpacaClientError,
} from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
async function withMockAlpaca(
  handler: http.RequestListener,
  fn: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = http.createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected TCP address");
  }

  const savedPaperBase = process.env.ALPACA_PAPER_API_BASE_URL;
  const savedPaperKey = process.env.ALPACA_PAPER_API_KEY;
  const savedPaperSecret = process.env.ALPACA_PAPER_API_SECRET;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  process.env.ALPACA_PAPER_API_BASE_URL = baseUrl;
  process.env.ALPACA_PAPER_API_KEY = "paper-key";
  process.env.ALPACA_PAPER_API_SECRET = "paper-secret";

  try {
    await fn(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    if (savedPaperBase === undefined) delete process.env.ALPACA_PAPER_API_BASE_URL;
    else process.env.ALPACA_PAPER_API_BASE_URL = savedPaperBase;
    if (savedPaperKey === undefined) delete process.env.ALPACA_PAPER_API_KEY;
    else process.env.ALPACA_PAPER_API_KEY = savedPaperKey;
    if (savedPaperSecret === undefined) delete process.env.ALPACA_PAPER_API_SECRET;
    else process.env.ALPACA_PAPER_API_SECRET = savedPaperSecret;
    delete process.env.ALPACA_TIMEOUT_MS;
  }
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("alpaca client", () => {
  // 1.4.1. RETURNS THE ACCOUNT OBJECT FOR A 200 RESPONSE ............................................
  it("returns the account object for a 200 response", async () => {
    await withMockAlpaca((request, response) => {
      assert.equal(request.url, "/v2/account");
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ status: "ACTIVE", trading_blocked: false }));
    }, async () => {
      const account = await alpacaGetAccount("paper", "cid-alpaca-001");
      assert.equal(account.status, "ACTIVE");
      assert.equal(account.trading_blocked, false);
    });
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. SUBMITS AN ORDER BODY TO THE ORDERS ENDPOINT .............................................
  it("submits an order body to the orders endpoint", async () => {
    await withMockAlpaca((request, response) => {
      assert.equal(request.url, "/v2/orders");
      assert.equal(request.method, "POST");
      let body = "";
      request.on("data", (chunk) => {
        body += String(chunk);
      });
      request.on("end", () => {
        const payload = JSON.parse(body);
        assert.equal(payload.symbol, "AAPL");
        assert.equal(payload.client_order_id, "auto-paper-001");
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ id: "alpaca-order-1", status: "accepted" }));
      });
    }, async () => {
      const order = await alpacaSubmitOrder(
        "paper",
        { symbol: "AAPL", qty: 2, client_order_id: "auto-paper-001" },
        "cid-alpaca-002",
      );
      assert.equal(order.id, "alpaca-order-1");
      assert.equal(order.status, "accepted");
    });
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS POSITIONS FROM AN ARRAY RESPONSE .................................................
  it("returns positions from an array response", async () => {
    await withMockAlpaca((request, response) => {
      assert.equal(request.url, "/v2/positions");
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify([{ symbol: "MSFT", qty: "3" }]));
    }, async () => {
      const positions = await alpacaGetPositions("paper", "cid-alpaca-003");
      assert.equal(positions.length, 1);
      assert.equal(positions[0]!.symbol, "MSFT");
    });
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. THROWS AUTHENTICATION WHEN CREDENTIALS ARE MISSING .......................................
  it("throws authentication when credentials are missing", async () => {
    const savedKey = process.env.ALPACA_PAPER_API_KEY;
    const savedSecret = process.env.ALPACA_PAPER_API_SECRET;
    const savedBase = process.env.ALPACA_PAPER_API_BASE_URL;
    delete process.env.ALPACA_PAPER_API_KEY;
    delete process.env.ALPACA_PAPER_API_SECRET;
    delete process.env.ALPACA_PAPER_API_BASE_URL;

    try {
      await assert.rejects(
        alpacaGetAccount("paper", "cid-alpaca-004"),
        (error: unknown) =>
          error instanceof AlpacaClientError
          && error.kind === "authentication"
          && error.message === "Alpaca paper credentials are not configured",
      );
    } finally {
      if (savedKey === undefined) delete process.env.ALPACA_PAPER_API_KEY;
      else process.env.ALPACA_PAPER_API_KEY = savedKey;
      if (savedSecret === undefined) delete process.env.ALPACA_PAPER_API_SECRET;
      else process.env.ALPACA_PAPER_API_SECRET = savedSecret;
      if (savedBase === undefined) delete process.env.ALPACA_PAPER_API_BASE_URL;
      else process.env.ALPACA_PAPER_API_BASE_URL = savedBase;
    }
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. MAPS 422 TO INVALID REQUEST ..............................................................
  it("maps 422 to invalid-request", async () => {
    await withMockAlpaca((_request, response) => {
      response.writeHead(422, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "bad order" }));
    }, async () => {
      await assert.rejects(
        alpacaSubmitOrder("paper", { symbol: "AAPL" }, "cid-alpaca-005"),
        (error: unknown) =>
          error instanceof AlpacaClientError
          && error.kind === "invalid-request"
          && error.message === "Alpaca rejected the orders request",
      );
    });
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. THROWS INVALID RESPONSE WHEN POSITIONS IS NOT AN ARRAY ...................................
  it("throws invalid-response when positions is not an array", async () => {
    await withMockAlpaca((_request, response) => {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ symbol: "AAPL" }));
    }, async () => {
      await assert.rejects(
        alpacaGetPositions("paper", "cid-alpaca-006"),
        (error: unknown) =>
          error instanceof AlpacaClientError
          && error.kind === "invalid-response"
          && error.message === "Alpaca positions response must be an array",
      );
    });
  });
  // 1.4.6. END ......................................................................................
});
// 1.4. END ..........................................................................................

after(() => {
  delete process.env.ALPACA_PAPER_API_KEY;
  delete process.env.ALPACA_PAPER_API_SECRET;
  delete process.env.ALPACA_PAPER_API_BASE_URL;
  delete process.env.ALPACA_TIMEOUT_MS;
});

// END FILE ##########################################################################################

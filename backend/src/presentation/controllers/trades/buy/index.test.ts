// [ BACKEND > PRESENTATION > CONTROLLERS > TRADES > BUY > TESTS ] ###################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import os from "node:os";
import path from "node:path";
import { mock } from "node:test";
import { once } from "node:events";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createApp } from "../../../../app.js";
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const temporaryDirectories: string[] = [];

async function createTestServer() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "buy-controller-"));
  temporaryDirectories.push(directory);

  process.env.PORTFOLIO_BASE_DIRECTORY = directory;
  process.env.ALPACA_PAPER_API_BASE_URL = "http://127.0.0.1:1";
  process.env.ALPACA_PAPER_API_KEY = "paper-key";
  process.env.ALPACA_PAPER_API_SECRET = "paper-secret";

  const brokerFetch = mock.fn(async (url, init) => {
    if (String(url).endsWith("/v2/account")) {
      return {
        status: 200,
        async json() {
          return { status: "ACTIVE", trading_blocked: false };
        },
      } as Response;
    }

    if (String(url).endsWith("/v2/orders")) {
      return {
        status: 200,
        async json() {
          const payload = JSON.parse(String(init?.body ?? "{}"));
          return {
            id: "alpaca-order-01",
            status: "accepted",
            symbol: payload.symbol,
            qty: String(payload.qty),
            limit_price: payload.limit_price ?? null,
            filled_qty: "0",
            filled_avg_price: null,
            submitted_at: "2026-08-18T10:00:00.000Z",
          };
        },
      } as Response;
    }

    throw new Error(`Unexpected fetch url: ${String(url)}`);
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) => {
    if (typeof url === "string" && url.startsWith("http://127.0.0.1:")) {
      return originalFetch(url, init);
    }

    return brokerFetch(url, init) as Promise<Response>;
  }) as typeof fetch;

  const server = createApp().listen(0);
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

  const close = async () => {
    globalThis.fetch = originalFetch;
    delete process.env.PORTFOLIO_BASE_DIRECTORY;
    await new Promise((resolve) => server.close(resolve));
  };

  return { baseUrl, close, directory };
}

afterEach(async () => {
  while (temporaryDirectories.length > 0) {
    const directory = temporaryDirectories.pop();
    if (directory) {
      await rm(directory, { recursive: true, force: true });
    }
  }
});
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("buyTradeController integration", () => {
  // 1.4.1. SUBMITS A PAPER BUY AND WRITES ITS SNAPSHOT FILE .........................................
  it("submits a paper buy and writes its snapshot file", async () => {
    const { baseUrl, close, directory } = await createTestServer();

    try {
      const response = await fetch(`${baseUrl}/trades/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-correlation-id": "cid-buy-001" },
        body: JSON.stringify({
          ticker: "msft",
          quantity: 2,
          mode: "paper",
          side: "buy",
          orderType: "market",
          limitPrice: null,
          analysisModel: "buffett_quality_v1",
          constitutionVersion: "buffett_quality_v1",
          scoreAtPurchase: 88,
          verdictAtPurchase: "green",
          thesisSnapshot: { ticker: "MSFT", verdict: "green" },
        }),
      });
      const body = await response.json();
      const ledgerPath = path.join(directory, "portfolio", "paper", "MSFT.json");
      const ledger = JSON.parse(await readFile(ledgerPath, "utf8"));

      assert.equal(response.status, 201);
      assert.equal(body.correlationId, "cid-buy-001");
      assert.equal(body.data.order.mode, "paper");
      assert.equal(body.data.order.ticker, "MSFT");
      assert.equal(Object.keys(ledger).length, 1);
    } finally {
      await close();
    }
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. REJECTS LIVE BUYS WITHOUT THE EXECUTION PASSPHRASE IN PRODUCTION .........................
  it("rejects live buys without the execution passphrase in production", async () => {
    const { baseUrl, close } = await createTestServer();
    process.env.LIVE_TRADE_PASSPHRASE = "top-secret";
    process.env.NODE_ENV = "production";

    try {
      const response = await fetch(`${baseUrl}/trades/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: "AAPL",
          quantity: 1,
          mode: "live",
          side: "buy",
          orderType: "market",
        }),
      });
      const body = await response.json();

      assert.equal(response.status, 403);
      assert.equal(body.error.message, "Live trading requires a valid execution passphrase");
      assert.equal(typeof body.correlationId, "string");
    } finally {
      delete process.env.NODE_ENV;
      delete process.env.LIVE_TRADE_PASSPHRASE;
      await close();
    }
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. REJECTS LIVE BUYS OUTSIDE PRODUCTION .....................................................
  it("rejects live buys outside production", async () => {
    const { baseUrl, close } = await createTestServer();
    process.env.LIVE_TRADE_PASSPHRASE = "top-secret";

    try {
      const response = await fetch(`${baseUrl}/trades/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: "AAPL",
          quantity: 1,
          mode: "live",
          side: "buy",
          orderType: "market",
          executionPassphrase: "top-secret",
        }),
      });
      const body = await response.json();

      assert.equal(response.status, 403);
      assert.equal(body.error.message, "Live trading is only available in production");
    } finally {
      delete process.env.LIVE_TRADE_PASSPHRASE;
      await close();
    }
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. REJECTS INVALID REQUEST BODIES WITH 400 ..................................................
  it("rejects invalid request bodies with 400", async () => {
    const { baseUrl, close } = await createTestServer();

    try {
      const response = await fetch(`${baseUrl}/trades/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: "",
          quantity: "two",
          mode: "paper",
          side: "buy",
          orderType: "market",
        }),
      });
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.equal(body.error.message, "Missing required body field: ticker");
    } finally {
      await close();
    }
  });
  // 1.4.4. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

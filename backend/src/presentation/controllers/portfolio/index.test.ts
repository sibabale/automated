// [ BACKEND > PRESENTATION > CONTROLLERS > PORTFOLIO > TESTS ] ######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import os from "node:os";
import path from "node:path";
import { mock } from "node:test";
import { once } from "node:events";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createApp } from "../../../app.js";
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const temporaryDirectories: string[] = [];

async function createPortfolioServer() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-controller-"));
  temporaryDirectories.push(directory);

  process.env.PORTFOLIO_BASE_DIRECTORY = directory;
  process.env.ALPACA_PAPER_API_BASE_URL = "http://127.0.0.1:1";
  process.env.ALPACA_PAPER_API_KEY = "paper-key";
  process.env.ALPACA_PAPER_API_SECRET = "paper-secret";

  const brokerFetch = mock.fn(async (url) => {
    if (String(url).endsWith("/v2/positions")) {
      return {
        status: 200,
        async json() {
          return [
            {
              symbol: "MSFT",
              qty: "3",
              avg_entry_price: "400",
              current_price: "420",
              market_value: "1260",
              unrealized_pl: "60",
            },
          ];
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

    return brokerFetch(url) as Promise<Response>;
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
describe("portfolioController integration", () => {
  // 1.4.1. RETURNS THE PAPER PORTFOLIO ENRICHED WITH THE LATEST SNAPSHOT ............................
  it("returns the paper portfolio enriched with the latest snapshot", async () => {
    const { baseUrl, close, directory } = await createPortfolioServer();
    await writeFile(
      path.join(directory, "paper", "MSFT.json"),
      `${JSON.stringify({
        "trade-01": {
          clientOrderId: "trade-01",
          brokerOrderId: "alpaca-order-01",
          ticker: "MSFT",
          mode: "paper",
          side: "buy",
          orderType: "market",
          quantity: 3,
          submittedAt: "2026-08-18T10:00:00.000Z",
          scoreAtPurchase: 92,
          verdictAtPurchase: "green",
          analysisModel: "buffett_quality_v1",
          constitutionVersion: "buffett_quality_v1",
          thesisSnapshot: { note: "high quality" },
        },
      }, null, 2)}\n`,
      "utf8",
    );

    try {
      const response = await fetch(`${baseUrl}/portfolio`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.data.mode, "paper");
      assert.equal(body.data.positions[0].ticker, "MSFT");
      assert.equal(body.data.positions[0].scoreAtPurchase, "92.0");
      assert.equal(body.data.summary.totalValue, "$1260.00");
    } finally {
      await close();
    }
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. REJECTS UNKNOWN MODES WITH 400 ...........................................................
  it("rejects unknown modes with 400", async () => {
    const { baseUrl, close } = await createPortfolioServer();

    try {
      const response = await fetch(`${baseUrl}/portfolio?mode=test`);
      const body = await response.json();

      assert.equal(response.status, 400);
      assert.equal(body.error.message, "Query parameter mode must be 'paper' or 'live'");
    } finally {
      await close();
    }
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. MAPS ALPACA FAILURES TO THE CORRECT HTTP STATUS ..........................................
  it("maps Alpaca failures to the correct HTTP status", async () => {
    const { baseUrl, close } = await createPortfolioServer();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ status: 429, async json() { return {}; } } as Response);

    try {
      const response = await fetch(`${baseUrl}/portfolio`);
      assert.equal(response.status, 429);
    } finally {
      globalThis.fetch = originalFetch;
      await close();
    }
  });
  // 1.4.3. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

// [ BACKEND > PRESENTATION > CONTROLLERS > AUTOMATION > RUN INVESTMENT PASS > TESTS ] ###############

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import os from "node:os";
import path from "node:path";
import { mock } from "node:test";
import { once } from "node:events";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createApp } from "../../../../app.js";
import { startMockFmpServer } from "../../../../../test/mock-fmp-server.js";
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const temporaryDirectories: string[] = [];

function incomeRow(fiscalYear: number, revenue: number, netIncome: number) {
  return { fiscalYear: String(fiscalYear), revenue, netIncome, date: `${fiscalYear}-09-30` };
}

function balanceRow(fiscalYear: number, totalDebt: number, totalStockholdersEquity: number) {
  return {
    fiscalYear: String(fiscalYear),
    totalDebt,
    totalStockholdersEquity,
    date: `${fiscalYear}-09-30`,
  };
}

function cashFlowRow(fiscalYear: number, operatingCashFlow: number, capitalExpenditure: number) {
  return {
    capitalExpenditure,
    fiscalYear: String(fiscalYear),
    operatingCashFlow,
    date: `${fiscalYear}-09-30`,
  };
}

async function createAutomationServer() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "automation-controller-"));
  temporaryDirectories.push(directory);

  process.env.PORTFOLIO_BASE_DIRECTORY = path.join(directory, "portfolio");
  process.env.TICKER_SOURCE_DIRECTORY = path.join(directory, "tickers");
  process.env.AUTOMATED_INVESTMENT_DECISIONS_FILE = path.join(
    directory,
    "automation",
    "decisions.json",
  );
  process.env.MAX_TRADE_AMOUNT = "1000";
  process.env.ALPACA_PAPER_API_BASE_URL = "http://127.0.0.1:1";
  process.env.ALPACA_PAPER_API_KEY = "paper-key";
  process.env.ALPACA_PAPER_API_SECRET = "paper-secret";

  const mockFmpServer = await startMockFmpServer({
    profile: {
      body: [
        {
          companyName: "Microsoft Corporation",
          industry: "Software",
          price: 200,
          sector: "Technology",
          symbol: "MSFT",
        },
      ],
    },
    "income-statement": {
      body: [incomeRow(2024, 100, 25)],
    },
    "balance-sheet-statement": {
      body: [balanceRow(2024, 40, 100)],
    },
    "cash-flow-statement": {
      body: [cashFlowRow(2024, 12_500_000_000, 0)],
    },
    "discounted-cash-flow": {
      body: [{ date: "2024-09-30", dcf: 250, stockPrice: 180 }],
    },
  });
  process.env.FMP_BASE_URL = mockFmpServer.url;
  process.env.FMP_API_KEY = "test-key";

  await mkdir(path.join(directory, "tickers"), { recursive: true });
  await writeFile(
    path.join(directory, "tickers", "batch-1.json"),
    `${JSON.stringify({ batchId: "batch-1", tickers: ["MSFT"] }, null, 2)}\n`,
    "utf8",
  );

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
            limit_price: null,
            filled_qty: "0",
            filled_avg_price: null,
            submitted_at: "2026-08-19T12:00:00.000Z",
          };
        },
      } as Response;
    }

    throw new Error(`Unexpected fetch url: ${String(url)}`);
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) => {
    const requestUrl = String(url);

    if (requestUrl.startsWith(mockFmpServer.url)) {
      return originalFetch(url, init);
    }

    if (requestUrl.startsWith("http://127.0.0.1:1")) {
      return brokerFetch(url, init) as Promise<Response>;
    }

    return originalFetch(url, init);
  }) as typeof fetch;

  const server = createApp().listen(0);
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

  const close = async () => {
    globalThis.fetch = originalFetch;
    delete process.env.PORTFOLIO_BASE_DIRECTORY;
    delete process.env.TICKER_SOURCE_DIRECTORY;
    delete process.env.AUTOMATED_INVESTMENT_DECISIONS_FILE;
    delete process.env.MAX_TRADE_AMOUNT;
    delete process.env.FMP_BASE_URL;
    delete process.env.FMP_API_KEY;
    await new Promise((resolve) => server.close(resolve));
    await mockFmpServer.close();
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
describe("runInvestmentPassController integration", () => {
  // 1.4.1. RUNS A BATCH PERSISTS THE DECISION AND PLACES A PAPER ORDER ..............................
  it("runs a batch persists the decision and places a paper order", async () => {
    const { baseUrl, close, directory } = await createAutomationServer();

    try {
      const response = await fetch(`${baseUrl}/automation/run-investment-pass`, {
        method: "POST",
        headers: { "x-correlation-id": "cid-run-pass-001" },
      });
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.correlationId, "cid-run-pass-001");
      assert.equal(body.data.totals.buy, 1);
      assert.equal(body.data.totals.ordersPlaced, 1);

      const decisions = JSON.parse(
        await (await import("node:fs/promises")).readFile(
          path.join(directory, "automation", "decisions.json"),
          "utf8",
        ),
      );
      assert.equal(decisions.MSFT.status, "buy");
    } finally {
      await close();
    }
  });
  // 1.4.1. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

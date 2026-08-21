// [ BACKEND > PRESENTATION > CONTROLLERS > OVERVIEW > TESTS ] #######################################
//
// Integration tests for the overview HTTP pipeline. The real repositories and
// services run against a mock FMP server so the response format, provider
// mapping, and error translation are pinned end to end.

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

async function startAppWithOverview(routes?: Record<string, { status?: number; body?: unknown }>) {
  const mock = await startMockFmpServer({
    profile: {
      body: [
        {
          companyName: "Apple Inc.",
          industry: "Consumer Electronics",
          price: 184.25,
          sector: "Technology",
          symbol: "AAPL",
        },
      ],
    },
    "income-statement": {
      body: [
        incomeRow(2024, 100, 30),
        incomeRow(2023, 100, 20),
        incomeRow(2022, 100, 10),
      ],
    },
    "balance-sheet-statement": {
      body: [
        balanceRow(2024, 150, 75),
        balanceRow(2023, 120, 80),
        balanceRow(2022, 100, 100),
      ],
    },
    "cash-flow-statement": {
      body: [
        cashFlowRow(2024, 140, -20),
        cashFlowRow(2023, 120, -30),
        cashFlowRow(2022, 98, -20),
      ],
    },
    "discounted-cash-flow": {
      body: [{ date: "2024-09-30", dcf: 200, stockPrice: 150 }],
    },
    ...routes,
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
describe("Overview controller integration (mocked FMP)", () => {
  // 1.4.1. SETUP ....................................................................................
  let sharedBaseUrl: string;
  let sharedClose: () => Promise<void>;

  before(async () => {
    const app = await startAppWithOverview();
    sharedBaseUrl = app.baseUrl;
    sharedClose = app.close;
  });

  after(async () => {
    await sharedClose();
    delete process.env.FMP_BASE_URL;
    delete process.env.FMP_API_KEY;
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. RETURNS THE FULL OVERVIEW RESPONSE SHAPE .................................................
  it("returns the report header and metric card values for the requested ticker", async () => {
    const res = await fetch(`${sharedBaseUrl}/overview?ticker=AAPL`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(typeof body.correlationId, "string");
    assert.deepEqual(body.data.reportHeader, {
      companyName: "Apple Inc.",
      industry: "Consumer Electronics",
      sector: "Technology",
      sharePrice: "$184.25 USD",
      ticker: "AAPL",
    });
    assert.deepEqual(body.data.qualitativeAnalysis, {
      summary:
        "Apple Inc. shows a constructive quantitative profile, with 3 of 5 tracked metrics screening strong and no weak readings in the current dataset.",
      pillars: [
        {
          label: "Capital Efficiency",
          title: "Returns and margins both screen strong",
          description:
            "Return on equity (25.0%) and profit margin (20.0%) frame how efficiently Apple Inc. converts capital and revenue into profit within the current dataset.",
        },
        {
          label: "Cash Generation",
          title: "Cash flow remains positive but not exceptional",
          description:
            "Free cash flow screens medium at $96.0, which indicates how much room Apple Inc. currently has to fund investment needs without leaning on outside capital.",
        },
        {
          label: "Balance Sheet Discipline",
          title: "Leverage remains manageable rather than conservative",
          description:
            "Debt-to-equity screens medium at 1.50, which sets the current balance-sheet discipline in relation to the rest of the profitability profile.",
        },
        {
          label: "Valuation Context",
          title: "Current price still shows a margin of safety",
          description:
            "Margin of safety screens strong at 25.0%, so the current market price still needs to be weighed against the modelled intrinsic value produced by this framework.",
        },
      ],
    });
    assert.deepEqual(body.data.metrics, [
      {
        slug: "return-on-equity",
        value: "25.0%",
        strength: "strong",
        description: "Strong shareholder returns",
      },
      {
        slug: "free-cash-flow",
        value: "$96",
        strength: "medium",
        description: "Supports ongoing investment",
      },
      {
        slug: "debt-to-equity",
        value: "1.50",
        strength: "medium",
        description: "Manageable leverage",
      },
      {
        slug: "profit-margin",
        value: "20.0%",
        strength: "strong",
        description: "High pricing power",
      },
      {
        slug: "margin-of-safety",
        value: "25.0%",
        strength: "strong",
        description: "Attractive discount",
      },
    ]);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS 400 FOR A MISSING TICKER .........................................................
  it("returns 400 with the exact message for a missing ticker", async () => {
    const res = await fetch(`${sharedBaseUrl}/overview`);
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.error?.message, "Missing required query parameter: ticker");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. SURFACES PLACEHOLDERS WHEN PROFILE FACTS OR METRICS ARE MISSING ..........................
  it("surfaces placeholders when the profile facts or horizon values are missing", async () => {
    const { baseUrl, close } = await startAppWithOverview({
      profile: { body: [{ companyName: " ", industry: "", sector: "", symbol: "MISS" }] },
      "income-statement": { body: [] },
      "balance-sheet-statement": { body: [] },
      "cash-flow-statement": { body: [] },
      "discounted-cash-flow": { body: [{ date: "2024-09-30", dcf: 0, stockPrice: 150 }] },
    });

    try {
      const res = await fetch(`${baseUrl}/overview?ticker=MISS`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.deepEqual(body.data.reportHeader, {
        companyName: "—",
        industry: "—",
        sector: "—",
        sharePrice: "—",
        ticker: "MISS",
      });
      assert.deepEqual(body.data.qualitativeAnalysis, {
        summary:
          "MISS currently falls short of the framework across all 5 tracked metrics, leaving limited quantitative support for a high-conviction case.",
        pillars: [
          {
            label: "Capital Efficiency",
            title: "Profitability evidence is limited",
            description:
              "Return on equity (unavailable) and profit margin (unavailable) frame how efficiently MISS converts capital and revenue into profit within the current dataset.",
          },
          {
            label: "Cash Generation",
            title: "Cash conversion is under pressure",
            description:
              "Free cash flow screens weak at unavailable, which indicates how much room MISS currently has to fund investment needs without leaning on outside capital.",
          },
          {
            label: "Balance Sheet Discipline",
            title: "Leverage is elevated for this framework",
            description:
              "Debt-to-equity screens weak at unavailable, which sets the current balance-sheet discipline in relation to the rest of the profitability profile.",
          },
          {
            label: "Valuation Context",
            title: "The current price looks stretched",
            description:
              "Margin of safety screens weak at unavailable, so the current market price still needs to be weighed against the modelled intrinsic value produced by this framework.",
          },
        ],
      });
      assert.deepEqual(body.data.metrics, [
        {
          slug: "return-on-equity",
          value: "—",
          strength: "weak",
          description: "Weak shareholder returns",
        },
        {
          slug: "free-cash-flow",
          value: "—",
          strength: "weak",
          description: "Limited capacity to self-fund growth",
        },
        {
          slug: "debt-to-equity",
          value: "—",
          strength: "weak",
          description: "Leverage risk",
        },
        {
          slug: "profit-margin",
          value: "—",
          strength: "weak",
          description: "Low pricing power",
        },
        {
          slug: "margin-of-safety",
          value: "—",
          strength: "weak",
          description: "Overvalued",
        },
      ]);
    } finally {
      await close();
    }
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. MAPS PROVIDER 404 TO HTTP 404 ............................................................
  it("maps provider 404 to HTTP 404", async () => {
    const { baseUrl, close } = await startAppWithOverview({
      profile: { status: 404, body: {} },
    });

    try {
      const res = await fetch(`${baseUrl}/overview?ticker=MISS`);
      assert.equal(res.status, 404);
    } finally {
      await close();
    }
  });
  // 1.4.5. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

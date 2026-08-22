// [ BACKEND > APPLICATION > SERVICES > AUTOMATED INVESTMENT RUNNER > TESTS ] ########################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
  classifyMetricStrengths,
  deriveDecisionStatus,
  runAutomatedInvestmentPass,
  scoreDecisionStrengths,
} from "./index.js";
import type { CashFlowYear } from "../../../domain/entities/cash-flow-year.entity.js";
import type { FinancialYear } from "../../../domain/entities/financial-year.entity.js";
import type { CompanyProfile } from "../../../domain/entities/company-profile.entity.js";
import type { BrokerRepository } from "../../../domain/repositories/broker.repository.js";
import type { ProfitMarginYear } from "../../../domain/entities/profit-margin-year.entity.js";
import type { DebtToEquityYear } from "../../../domain/entities/debt-to-equity-year.entity.js";
import type { MarginOfSafetyYear } from "../../../domain/entities/margin-of-safety-year.entity.js";
import type { FinancialDataRepository } from "../../../domain/repositories/financial-data.repository.js";
import type { CompanyProfileRepository } from "../../../domain/repositories/company-profile.repository.js";
import type { PurchaseSnapshotRepository } from "../../../domain/repositories/purchase-snapshot.repository.js";
import { resolveInvestmentAnalysisRuleset } from "../../../domain/services/investment-analysis-ruleset/index.js";
import type { AutomatedInvestmentDecision } from "../../../domain/entities/automated-investment-decision.entity.js";
import type { AutomatedInvestmentDecisionRepository } from "../../../domain/repositories/automated-investment-decision.repository.js";
import type {
  TickerSourceBatch,
  TickerSourceBatchRepository,
} from "../../../domain/repositories/ticker-source-batch.repository.js";
// 1.2. END ..........................................................................................

// 1.3. FIXTURES .....................................................................................
const CORRELATION_ID = "cid-automated-runner-001";

function profileRepository(profiles: Record<string, CompanyProfile>): CompanyProfileRepository {
  return {
    async getProfile(ticker) {
      const profile = profiles[ticker];
      if (!profile) {
        throw new Error(`Missing profile for ${ticker}`);
      }
      return profile;
    },
  };
}

function financialRepository<TYear>(
  values: Record<string, TYear[]>,
): FinancialDataRepository<TYear> {
  return {
    async getAnnualFinancials(ticker) {
      return values[ticker] ?? [];
    },
  };
}

function tickerBatchRepository(batches: TickerSourceBatch[]): TickerSourceBatchRepository {
  const progressCalls: Array<{ batchId: string; completedAt: string | null; lastTicker: string | null; sourceFile: string }> = [];

  return {
    async listBatches(_correlationId, options) {
      if (!options?.maxTickers) {
        return batches;
      }

      let remaining = options.maxTickers;
      const limited: TickerSourceBatch[] = [];

      for (const batch of batches) {
        if (remaining <= 0) {
          break;
        }

        const tickers = batch.tickers.slice(0, remaining);
        if (tickers.length === 0) {
          continue;
        }

        limited.push({ ...batch, tickers });
        remaining -= tickers.length;
      }

      return limited;
    },
    async markBatchProgress(progress) {
      progressCalls.push(progress);
    },
    progressCalls,
  } as TickerSourceBatchRepository & {
    progressCalls: Array<{ batchId: string; completedAt: string | null; lastTicker: string | null; sourceFile: string }>;
  };
}

function decisionRepository(seed: AutomatedInvestmentDecision[] = []): AutomatedInvestmentDecisionRepository & {
  saved: AutomatedInvestmentDecision[];
} {
  const saved = [...seed];

  return {
    saved,
    async hasDecisionForTicker(ticker) {
      return saved.some((decision) => decision.ticker === ticker);
    },
    async save(decision) {
      saved.push(decision);
    },
    async listAll() {
      return saved;
    },
  };
}

function brokerRepository(): BrokerRepository & { orderCalls: string[] } {
  const orderCalls: string[] = [];

  return {
    orderCalls,
    async getAccountStatus(mode) {
      return { mode, accountStatus: "ACTIVE", tradingBlocked: false };
    },
    async placeBuyOrder(order, clientOrderId) {
      orderCalls.push(order.ticker);
      return {
        clientOrderId,
        brokerOrderId: `broker-${order.ticker}`,
        broker: "alpaca",
        mode: order.mode,
        status: "accepted",
        ticker: order.ticker,
        side: order.side,
        orderType: order.orderType,
        quantity: order.quantity,
        limitPrice: order.limitPrice,
        filledQuantity: null,
        averageFillPrice: null,
        submittedAt: "2026-08-19T10:00:00.000Z",
      };
    },
    async getPortfolioPositions() {
      return [];
    },
  };
}

function purchaseSnapshotRepository(): PurchaseSnapshotRepository & { snapshots: unknown[] } {
  const snapshots: unknown[] = [];

  return {
    snapshots,
    async save(snapshot) {
      snapshots.push(snapshot);
    },
    async listAll() {
      return [];
    },
    async findLatestByTicker() {
      return null;
    },
  };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("classifyMetricStrengths", () => {
  // 1.4.1. MAPS THE AGREED THRESHOLDS TO STRONG MEDIUM WEAK .........................................
  it("maps the agreed thresholds to strong medium weak", () => {
    const strengths = classifyMetricStrengths({
      returnOnEquity: 25,
      freeCashFlow: 12_000_000_000,
      freeCashFlowCoverageYears: 3.2,
      debtToEquity: 0.4,
      profitMargin: 20,
      marginOfSafety: 25,
    });

    assert.deepEqual(strengths, {
      returnOnEquity: "strong",
      freeCashFlow: "strong",
      debtToEquity: "strong",
      profitMargin: "strong",
      marginOfSafety: "strong",
    });
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. TREATS NULL OR UNFAVORABLE VALUES AS WEAK ................................................
  it("treats null or unfavorable values as weak", () => {
    const strengths = classifyMetricStrengths({
      returnOnEquity: null,
      freeCashFlow: -1,
      freeCashFlowCoverageYears: 1.5,
      debtToEquity: 2,
      profitMargin: 5,
      marginOfSafety: -10,
    });

    assert.deepEqual(strengths, {
      returnOnEquity: "weak",
      freeCashFlow: "weak",
      debtToEquity: "weak",
      profitMargin: "weak",
      marginOfSafety: "weak",
    });
  });
  // 1.4.2. END ......................................................................................
});

describe("deriveDecisionStatus", () => {
  // 1.4.3. RETURNS BUY ONLY WHEN EVERY METRIC IS STRONG .............................................
  it("returns buy only when every metric is strong", () => {
    assert.equal(
      deriveDecisionStatus({
        returnOnEquity: "strong",
        freeCashFlow: "strong",
        debtToEquity: "strong",
        profitMargin: "strong",
        marginOfSafety: "strong",
      }),
      "buy",
    );
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. RETURNS WATCH WHEN THERE ARE NO WEAK METRICS .............................................
  it("returns watch when there are no weak metrics", () => {
    assert.equal(
      deriveDecisionStatus({
        returnOnEquity: "medium",
        freeCashFlow: "strong",
        debtToEquity: "medium",
        profitMargin: "strong",
        marginOfSafety: "medium",
      }),
      "watch",
    );
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. RETURNS REJECT WHEN ANY METRIC IS WEAK ...................................................
  it("returns reject when any metric is weak", () => {
    assert.equal(
      deriveDecisionStatus({
        returnOnEquity: "strong",
        freeCashFlow: "weak",
        debtToEquity: "strong",
        profitMargin: "strong",
        marginOfSafety: "strong",
      }),
      "reject",
    );
  });
  // 1.4.5. END ......................................................................................
});

describe("scoreDecisionStrengths", () => {
  // 1.4.6. CONVERTS METRIC STRENGTHS INTO ONE PURCHASE SCORE ........................................
  it("converts metric strengths into one purchase score", () => {
    assert.equal(
      scoreDecisionStrengths({
        returnOnEquity: "strong",
        freeCashFlow: "strong",
        debtToEquity: "medium",
        profitMargin: "medium",
        marginOfSafety: "weak",
      }),
      68,
    );
  });
  // 1.4.6. END ......................................................................................
});

describe("runAutomatedInvestmentPass", () => {
  // 1.4.7. PROCESSES NEW TICKERS PERSISTS DECISIONS AND AUTO-BUYS QUALIFIERS ........................
  it("processes new tickers persists decisions and auto-buys qualifiers", async () => {
    process.env.MAX_TRADE_AMOUNT = "1000";
    process.env.MAX_TICKERS_PER_RUN = "3";

    const decisions = decisionRepository([
      {
        apiVersion: "v1",
        ticker: "DONE",
        companyName: "Done Corp",
        batchId: "batch-0",
        sourceFile: "done.json",
        processedAt: "2026-08-19T00:00:00.000Z",
        status: "reject",
        verdictAtPurchase: "reject",
        scoreAtPurchase: 20,
        analysisModel: "automated-investment-v1",
        constitutionVersion: "all-five-metrics-must-be-strong",
        metrics: {
          returnOnEquity: 1,
          freeCashFlow: -1,
          freeCashFlowCoverageYears: 1.5,
          debtToEquity: 5,
          profitMargin: 1,
          marginOfSafety: -20,
        },
        strengths: {
          returnOnEquity: "weak",
          freeCashFlow: "weak",
          debtToEquity: "weak",
          profitMargin: "weak",
          marginOfSafety: "weak",
        },
        tradeExecution: {
          attempted: false,
          mode: "paper",
          maxTradeAmount: 1000,
          sharePrice: null,
          quantity: null,
          orderClientId: null,
          status: "not-attempted",
          skipReason: null,
        },
      },
    ]);
    const broker = brokerRepository();
    const snapshots = purchaseSnapshotRepository();
    const batchRepository = tickerBatchRepository([
      {
        batchId: "batch-1",
        sourceFile: "us-tech.json",
        tickers: ["BUY", "WATCH", "REJECT", "DONE"],
      },
    ]);

    const summary = await runAutomatedInvestmentPass(
      {
        tickerSourceBatchRepository: batchRepository,
        ruleset: resolveInvestmentAnalysisRuleset("v1"),
        decisionRepository: decisions,
        brokerRepository: broker,
        purchaseSnapshotRepository: snapshots,
        companyProfileRepository: profileRepository({
          BUY: {
            companyName: "Buy Corp",
            industry: "Software",
            sector: "Technology",
            sharePrice: 200,
            ticker: "BUY",
          },
          WATCH: {
            companyName: "Watch Corp",
            industry: "Software",
            sector: "Technology",
            sharePrice: 100,
            ticker: "WATCH",
          },
          REJECT: {
            companyName: "Reject Corp",
            industry: "Software",
            sector: "Technology",
            sharePrice: 50,
            ticker: "REJECT",
          },
        }),
        returnOnEquityRepository: financialRepository<FinancialYear>({
          BUY: [{ fiscalYear: 2024, netIncome: 25, shareholdersEquity: 100 }],
          WATCH: [{ fiscalYear: 2024, netIncome: 15, shareholdersEquity: 100 }],
          REJECT: [{ fiscalYear: 2024, netIncome: 5, shareholdersEquity: 100 }],
        }),
        freeCashFlowRepository: financialRepository<CashFlowYear>({
          BUY: [{ fiscalYear: 2024, operatingCashFlow: 100, capitalExpenditure: 250 }],
          WATCH: [{ fiscalYear: 2024, operatingCashFlow: 100, capitalExpenditure: 120 }],
          REJECT: [{ fiscalYear: 2024, operatingCashFlow: -50, capitalExpenditure: 0 }],
        }),
        debtToEquityRepository: financialRepository<DebtToEquityYear>({
          BUY: [{ fiscalYear: 2024, totalDebt: 40, shareholdersEquity: 100 }],
          WATCH: [{ fiscalYear: 2024, totalDebt: 100, shareholdersEquity: 100 }],
          REJECT: [{ fiscalYear: 2024, totalDebt: 200, shareholdersEquity: 100 }],
        }),
        profitMarginRepository: financialRepository<ProfitMarginYear>({
          BUY: [{ fiscalYear: 2024, netIncome: 25, revenue: 100 }],
          WATCH: [{ fiscalYear: 2024, netIncome: 15, revenue: 100 }],
          REJECT: [{ fiscalYear: 2024, netIncome: 5, revenue: 100 }],
        }),
        marginOfSafetyRepository: financialRepository<MarginOfSafetyYear>({
          BUY: [{ fiscalYear: 2024, intrinsicValue: 250, stockPrice: 180 }],
          WATCH: [{ fiscalYear: 2024, intrinsicValue: 100, stockPrice: 90 }],
          REJECT: [{ fiscalYear: 2024, intrinsicValue: 100, stockPrice: 120 }],
        }),
      },
      CORRELATION_ID,
    );

    assert.equal(summary.totals.processedTickers, 3);
    assert.equal(summary.totals.skippedTickers, 0);
    assert.equal(summary.totals.buy, 1);
    assert.equal(summary.totals.watch, 1);
    assert.equal(summary.totals.reject, 1);
    assert.equal(summary.totals.ordersPlaced, 1);
    assert.deepEqual(broker.orderCalls, ["BUY"]);
    assert.equal(snapshots.snapshots.length, 1);
    assert.equal(summary.decisions[0]?.tradeExecution.quantity, 5);
    assert.equal(summary.decisions[1]?.status, "watch");
    assert.equal(summary.decisions[2]?.status, "reject");
    assert.deepEqual(summary.batches, [
      {
        batchId: "batch-1",
        completed: true,
        lastTicker: "REJECT",
        sourceFile: "us-tech.json",
        processedTickers: 3,
        skippedTickers: 0,
      },
    ]);
    assert.equal(batchRepository.progressCalls.length, 1);
    assert.deepEqual(
      {
        ...batchRepository.progressCalls[0],
        completedAt: batchRepository.progressCalls[0]?.completedAt ? "set" : null,
      },
      {
        batchId: "batch-1",
        completedAt: "set",
        lastTicker: "REJECT",
        sourceFile: "us-tech.json",
      },
    );

    delete process.env.MAX_TRADE_AMOUNT;
    delete process.env.MAX_TICKERS_PER_RUN;
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. SKIPS AUTO-BUY WHEN THE PRICE EXCEEDS THE TRADE CAP ......................................
  it("skips auto-buy when the price exceeds the trade cap", async () => {
    process.env.MAX_TRADE_AMOUNT = "100";

    const summary = await runAutomatedInvestmentPass(
      {
        tickerSourceBatchRepository: tickerBatchRepository([
          { batchId: "batch-1", sourceFile: "single.json", tickers: ["EXP"] },
        ]),
        ruleset: resolveInvestmentAnalysisRuleset("v1"),
        decisionRepository: decisionRepository(),
        brokerRepository: brokerRepository(),
        purchaseSnapshotRepository: purchaseSnapshotRepository(),
        companyProfileRepository: profileRepository({
          EXP: {
            companyName: "Expensive Corp",
            industry: "Software",
            sector: "Technology",
            sharePrice: 250,
            ticker: "EXP",
          },
        }),
        returnOnEquityRepository: financialRepository<FinancialYear>({
          EXP: [{ fiscalYear: 2024, netIncome: 25, shareholdersEquity: 100 }],
        }),
        freeCashFlowRepository: financialRepository<CashFlowYear>({
          EXP: [{ fiscalYear: 2024, operatingCashFlow: 100, capitalExpenditure: 250 }],
        }),
        debtToEquityRepository: financialRepository<DebtToEquityYear>({
          EXP: [{ fiscalYear: 2024, totalDebt: 40, shareholdersEquity: 100 }],
        }),
        profitMarginRepository: financialRepository<ProfitMarginYear>({
          EXP: [{ fiscalYear: 2024, netIncome: 25, revenue: 100 }],
        }),
        marginOfSafetyRepository: financialRepository<MarginOfSafetyYear>({
          EXP: [{ fiscalYear: 2024, intrinsicValue: 300, stockPrice: 200 }],
        }),
      },
      "cid-automated-runner-002",
    );

    assert.equal(summary.totals.buy, 1);
    assert.equal(summary.totals.ordersPlaced, 0);
    assert.equal(summary.decisions[0]?.tradeExecution.status, "skipped");
    assert.equal(summary.decisions[0]?.tradeExecution.skipReason, "Share price exceeds MAX_TRADE_AMOUNT");

    delete process.env.MAX_TRADE_AMOUNT;
  });
  // 1.4.8. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

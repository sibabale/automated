// [ BACKEND > APPLICATION > SERVICES > AUTOMATED INVESTMENT RUNNER ] ##################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import { buildOverview, type OverviewDependencies } from "../overview/index.js";
import { placeBuyOrder } from "../place-buy-order/index.js";
import type { BrokerRepository } from "../../../domain/repositories/broker.repository.js";
import type { PurchaseSnapshotRepository } from "../../../domain/repositories/purchase-snapshot.repository.js";
import type {
  MetricStrength,
  AutomatedDecisionStatus,
  AutomatedTradeExecution,
  AutomatedInvestmentDecision,
  AutomatedDecisionStrengths,
} from "../../../domain/entities/automated-investment-decision.entity.js";
import type { AutomatedInvestmentDecisionRepository } from "../../../domain/repositories/automated-investment-decision.repository.js";
import type {
  TickerSourceBatch,
  TickerSourceBatchRepository,
} from "../../../domain/repositories/ticker-source-batch.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface AutomatedInvestmentRunnerDependencies extends OverviewDependencies {
  brokerRepository: BrokerRepository;
  purchaseSnapshotRepository: PurchaseSnapshotRepository;
  decisionRepository: AutomatedInvestmentDecisionRepository;
  tickerSourceBatchRepository: TickerSourceBatchRepository;
}

export interface AutomatedInvestmentRunSummary {
  batches: Array<{
    batchId: string;
    sourceFile: string;
    processedTickers: number;
    skippedTickers: number;
  }>;
  totals: {
    processedTickers: number;
    skippedTickers: number;
    buy: number;
    watch: number;
    reject: number;
    ordersPlaced: number;
  };
  decisions: AutomatedInvestmentDecision[];
}
// 1.3. END ..........................................................................................

// 1.4. HELPERS ......................................................................................
const ANALYSIS_MODEL = "automated-investment-v1";
const CONSTITUTION_VERSION = "all-five-metrics-must-be-strong";

export function classifyMetricStrengths(metrics: AutomatedInvestmentDecision["metrics"]): AutomatedDecisionStrengths {
  return {
    returnOnEquity: classifyReturnOnEquity(metrics.returnOnEquity),
    freeCashFlow: classifyFreeCashFlow(metrics.freeCashFlow),
    debtToEquity: classifyDebtToEquity(metrics.debtToEquity),
    profitMargin: classifyProfitMargin(metrics.profitMargin),
    marginOfSafety: classifyMarginOfSafety(metrics.marginOfSafety),
  };
}

export function deriveDecisionStatus(strengths: AutomatedDecisionStrengths): AutomatedDecisionStatus {
  const values = Object.values(strengths);

  if (values.every((value) => value === "strong")) {
    return "buy";
  }

  if (values.some((value) => value === "weak")) {
    return "reject";
  }

  return "watch";
}

export function scoreDecisionStrengths(strengths: AutomatedDecisionStrengths): number {
  const scores = Object.values(strengths).map((value) => {
    if (value === "strong") {
      return 100;
    }
    if (value === "medium") {
      return 60;
    }
    return 20;
  });

  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
}

function classifyReturnOnEquity(value: number | null): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value >= 20) {
    return "strong";
  }
  if (value >= 10) {
    return "medium";
  }
  return "weak";
}

function classifyFreeCashFlow(value: number | null): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value > 10_000_000_000) {
    return "strong";
  }
  if (value > 0) {
    return "medium";
  }
  return "weak";
}

function classifyDebtToEquity(value: number | null): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value <= 0.5) {
    return "strong";
  }
  if (value <= 1.5) {
    return "medium";
  }
  return "weak";
}

function classifyProfitMargin(value: number | null): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value >= 20) {
    return "strong";
  }
  if (value >= 10) {
    return "medium";
  }
  return "weak";
}

function classifyMarginOfSafety(value: number | null): MetricStrength {
  if (value === null) {
    return "weak";
  }
  if (value >= 20) {
    return "strong";
  }
  if (value >= 0) {
    return "medium";
  }
  return "weak";
}

function readMaxTradeAmount(): number {
  const value = Number(process.env.MAX_TRADE_AMOUNT);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("MAX_TRADE_AMOUNT must be configured as a number greater than zero");
  }

  return value;
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

function createTradeExecution(maxTradeAmount: number, sharePrice: number | null): AutomatedTradeExecution {
  if (sharePrice === null || !Number.isFinite(sharePrice) || sharePrice <= 0) {
    return {
      attempted: false,
      mode: "paper",
      maxTradeAmount,
      sharePrice,
      quantity: null,
      orderClientId: null,
      status: "skipped",
      skipReason: "Missing or invalid share price for automated paper trade",
    };
  }

  const quantity = Math.floor(maxTradeAmount / sharePrice);
  if (quantity < 1) {
    return {
      attempted: false,
      mode: "paper",
      maxTradeAmount,
      sharePrice,
      quantity: 0,
      orderClientId: null,
      status: "skipped",
      skipReason: "Share price exceeds MAX_TRADE_AMOUNT",
    };
  }

  return {
    attempted: false,
    mode: "paper",
    maxTradeAmount,
    sharePrice,
    quantity,
    orderClientId: null,
    status: "not-attempted",
    skipReason: null,
  };
}

async function processTicker(
  ticker: string,
  batch: TickerSourceBatch,
  dependencies: AutomatedInvestmentRunnerDependencies,
  maxTradeAmount: number,
  correlationId: string,
): Promise<AutomatedInvestmentDecision> {
  const overview = await buildOverview(ticker, dependencies, correlationId);
  const strengths = classifyMetricStrengths(overview.metrics);
  const status = deriveDecisionStatus(strengths);
  const scoreAtPurchase = scoreDecisionStrengths(strengths);

  let tradeExecution = createTradeExecution(maxTradeAmount, overview.reportHeader.sharePrice);

  if (status === "buy" && tradeExecution.status === "not-attempted" && tradeExecution.quantity !== null) {
    const order = await placeBuyOrder(
      {
        ticker,
        quantity: tradeExecution.quantity,
        mode: "paper",
        side: "buy",
        orderType: "market",
        limitPrice: null,
        analysisModel: ANALYSIS_MODEL,
        constitutionVersion: CONSTITUTION_VERSION,
        scoreAtPurchase,
        verdictAtPurchase: status,
        thesisSnapshot: {
          source: "automated-investment-runner",
          metrics: overview.metrics,
          strengths,
          batchId: batch.batchId,
          sourceFile: batch.sourceFile,
        },
      },
      dependencies.brokerRepository,
      dependencies.purchaseSnapshotRepository,
      correlationId,
    );

    tradeExecution = {
      ...tradeExecution,
      attempted: true,
      orderClientId: order.clientOrderId,
      status: "placed",
      skipReason: null,
    };
  }

  return {
    ticker,
    companyName: overview.reportHeader.companyName,
    batchId: batch.batchId,
    sourceFile: batch.sourceFile,
    processedAt: new Date().toISOString(),
    status,
    verdictAtPurchase: status,
    scoreAtPurchase,
    analysisModel: ANALYSIS_MODEL,
    constitutionVersion: CONSTITUTION_VERSION,
    metrics: overview.metrics,
    strengths,
    tradeExecution,
  };
}
// 1.4. END ..........................................................................................

// 1.5. SERVICE ......................................................................................
/**
 * Runs one full automated pass across every ticker source file.
 *
 * Decisions are persisted one ticker at a time so a partially completed run can
 * resume safely without reprocessing already-reviewed companies.
 */
export async function runAutomatedInvestmentPass(
  dependencies: AutomatedInvestmentRunnerDependencies,
  correlationId: string,
): Promise<AutomatedInvestmentRunSummary> {
  const maxTradeAmount = readMaxTradeAmount();
  const batches = await dependencies.tickerSourceBatchRepository.listBatches(correlationId);
  const decisions: AutomatedInvestmentDecision[] = [];
  const batchSummaries: AutomatedInvestmentRunSummary["batches"] = [];
  let skippedTickers = 0;

  for (const batch of batches) {
    let processedForBatch = 0;
    let skippedForBatch = 0;

    for (const rawTicker of batch.tickers) {
      const ticker = normalizeTicker(rawTicker);
      if (!ticker) {
        continue;
      }

      const alreadyProcessed = await dependencies.decisionRepository.hasDecisionForTicker(
        ticker,
        correlationId,
      );

      if (alreadyProcessed) {
        skippedForBatch += 1;
        skippedTickers += 1;
        continue;
      }

      const decision = await processTicker(
        ticker,
        batch,
        dependencies,
        maxTradeAmount,
        correlationId,
      );

      await dependencies.decisionRepository.save(decision, correlationId);
      decisions.push(decision);
      processedForBatch += 1;

      logger.info(
        {
          correlationId,
          ticker,
          batchId: batch.batchId,
          decision: decision.status,
          tradeStatus: decision.tradeExecution.status,
        },
        "Processed automated investment ticker",
      );
    }

    batchSummaries.push({
      batchId: batch.batchId,
      sourceFile: batch.sourceFile,
      processedTickers: processedForBatch,
      skippedTickers: skippedForBatch,
    });
  }

  return {
    batches: batchSummaries,
    totals: {
      processedTickers: decisions.length,
      skippedTickers,
      buy: decisions.filter((decision) => decision.status === "buy").length,
      watch: decisions.filter((decision) => decision.status === "watch").length,
      reject: decisions.filter((decision) => decision.status === "reject").length,
      ordersPlaced: decisions.filter((decision) => decision.tradeExecution.status === "placed").length,
    },
    decisions,
  };
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################

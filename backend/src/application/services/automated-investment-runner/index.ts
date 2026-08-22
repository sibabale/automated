// [ BACKEND > APPLICATION > SERVICES > AUTOMATED INVESTMENT RUNNER ] ################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import { placeBuyOrder } from "../place-buy-order/index.js";
import { buildOverview, type OverviewDependencies } from "../overview/index.js";
import type { BrokerRepository } from "../../../domain/repositories/broker.repository.js";
import type { PurchaseSnapshotRepository } from "../../../domain/repositories/purchase-snapshot.repository.js";
import type {
  MetricStrength,
  AutomatedDecisionStatus,
  AutomatedDecisionStrengths,
  AutomatedTradeExecution,
  AutomatedInvestmentDecision,
} from "../../../domain/entities/automated-investment-decision.entity.js";
import type { AutomatedInvestmentDecisionRepository } from "../../../domain/repositories/automated-investment-decision.repository.js";
import type {
  TickerSourceBatch,
  TickerSourceBatchRepository,
} from "../../../domain/repositories/ticker-source-batch.repository.js";
import {
  resolveInvestmentAnalysisRuleset,
  type InvestmentAnalysisRuleset,
} from "../../../domain/services/investment-analysis-ruleset/index.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface AutomatedInvestmentRunnerDependencies extends OverviewDependencies {
  brokerRepository: BrokerRepository;
  purchaseSnapshotRepository: PurchaseSnapshotRepository;
  decisionRepository: AutomatedInvestmentDecisionRepository;
  tickerSourceBatchRepository: TickerSourceBatchRepository;
  ruleset: InvestmentAnalysisRuleset;
}

export interface AutomatedInvestmentRunSummary {
  batches: Array<{
    batchId: string;
    completed: boolean;
    lastTicker: string | null;
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
export function classifyMetricStrengths(metrics: AutomatedInvestmentDecision["metrics"]): AutomatedDecisionStrengths {
  return resolveInvestmentAnalysisRuleset("v1").classifyMetricStrengths(metrics);
}

export function deriveDecisionStatus(strengths: AutomatedDecisionStrengths): AutomatedDecisionStatus {
  return resolveInvestmentAnalysisRuleset("v1").deriveDecisionStatus(strengths);
}

export function scoreDecisionStrengths(strengths: AutomatedDecisionStrengths): number {
  return resolveInvestmentAnalysisRuleset("v1").scoreDecisionStrengths(strengths);
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
  const strengths = dependencies.ruleset.classifyMetricStrengths(overview.metrics);
  const status = dependencies.ruleset.deriveDecisionStatus(strengths);
  const scoreAtPurchase = dependencies.ruleset.scoreDecisionStrengths(strengths);

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
        analysisModel: dependencies.ruleset.analysisModel,
        constitutionVersion: dependencies.ruleset.constitutionVersion,
        scoreAtPurchase,
        verdictAtPurchase: status,
        thesisSnapshot: {
          source: "automated-investment-runner",
          apiVersion: dependencies.ruleset.apiVersion,
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
    apiVersion: dependencies.ruleset.apiVersion,
    ticker,
    companyName: overview.reportHeader.companyName,
    batchId: batch.batchId,
    sourceFile: batch.sourceFile,
    processedAt: new Date().toISOString(),
    status,
    verdictAtPurchase: status,
    scoreAtPurchase,
    analysisModel: dependencies.ruleset.analysisModel,
    constitutionVersion: dependencies.ruleset.constitutionVersion,
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
  const maxTickersPerRun = readMaxTickersPerRun();
  const batchSelection = maxTickersPerRun === undefined
    ? undefined
    : { maxTickers: maxTickersPerRun };
  const batches = await dependencies.tickerSourceBatchRepository.listBatches(
    correlationId,
    batchSelection,
  );
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

    const lastTicker = batch.tickers.at(-1) ?? null;
    const completed = lastTicker !== null && (processedForBatch + skippedForBatch) >= batch.tickers.length;
    await dependencies.tickerSourceBatchRepository.markBatchProgress(
      {
        batchId: batch.batchId,
        completedAt: completed ? new Date().toISOString() : null,
        lastTicker,
        sourceFile: batch.sourceFile,
      },
      correlationId,
    );

    batchSummaries.push({
      batchId: batch.batchId,
      completed,
      lastTicker,
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

function readMaxTickersPerRun(): number | undefined {
  const rawValue = process.env.MAX_TICKERS_PER_RUN;
  if (rawValue === undefined || rawValue.trim() === "") {
    return undefined;
  }

  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("MAX_TICKERS_PER_RUN must be configured as an integer greater than zero");
  }

  return parsed;
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################

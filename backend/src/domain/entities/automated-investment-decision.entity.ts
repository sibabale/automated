// [ BACKEND > DOMAIN > ENTITIES > AUTOMATED INVESTMENT DECISION ] ###################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { TradeMode } from "./trade-order.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export type MetricStrength = "strong" | "medium" | "weak";

export type AutomatedDecisionStatus = "buy" | "watch" | "reject";

export interface AutomatedDecisionMetrics {
  returnOnEquity: number | null;
  freeCashFlow: number | null;
  debtToEquity: number | null;
  profitMargin: number | null;
  marginOfSafety: number | null;
}

export interface AutomatedDecisionStrengths {
  returnOnEquity: MetricStrength;
  freeCashFlow: MetricStrength;
  debtToEquity: MetricStrength;
  profitMargin: MetricStrength;
  marginOfSafety: MetricStrength;
}

export interface AutomatedTradeExecution {
  attempted: boolean;
  mode: TradeMode;
  maxTradeAmount: number;
  sharePrice: number | null;
  quantity: number | null;
  orderClientId: string | null;
  status: "not-attempted" | "placed" | "skipped";
  skipReason: string | null;
}

/**
 * The persisted outcome of one automated company review.
 *
 * This records both the numeric metric facts and the resulting buy/watch/reject
 * decision so future batch runs can skip already-processed tickers without
 * recomputing the entire analysis set.
 */
export interface AutomatedInvestmentDecision {
  ticker: string;
  companyName: string | null;
  batchId: string;
  sourceFile: string;
  processedAt: string;
  status: AutomatedDecisionStatus;
  verdictAtPurchase: string;
  scoreAtPurchase: number;
  analysisModel: string;
  constitutionVersion: string;
  metrics: AutomatedDecisionMetrics;
  strengths: AutomatedDecisionStrengths;
  tradeExecution: AutomatedTradeExecution;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

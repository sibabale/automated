// [ BACKEND > DOMAIN > ENTITIES > PORTFOLIO POSITION ] ##############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * The live broker facts for one current holding in the portfolio.
 *
 * These values come from the broker ledger and describe what is held now, not
 * why it was originally bought.
 */
export interface PortfolioPosition {
  ticker: string;
  companyName: string | null;
  mode: "paper" | "live";
  quantity: number;
  averageEntryPrice: number | null;
  currentPrice: number | null;
  marketValue: number | null;
  unrealizedGainLoss: number | null;
  scoreAtPurchase: number | null;
  verdictAtPurchase: string | null;
  latestThesisSnapshot: Record<string, unknown> | null;
}

/**
 * The portfolio totals the frontend needs for the summary cards.
 */
export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainPercentage: number | null;
  averageScoreAtPurchase: number | null;
}

/**
 * The full portfolio view returned by the application layer.
 */
export interface PortfolioOverview {
  positions: PortfolioPosition[];
  summary: PortfolioSummary;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

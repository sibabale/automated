// [ BACKEND > DOMAIN > REPOSITORIES > AUTOMATED INVESTMENT DECISION ] #################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { AutomatedInvestmentDecision } from "../entities/automated-investment-decision.entity.js";
// 1.2. END ..........................................................................................

// 1.3. PORT .........................................................................................
/**
 * The contract for the automation decision ledger.
 *
 * The ledger is append-only at the ticker level: once a ticker has a persisted
 * decision, future source-batch runs can skip it until a deliberate re-review
 * flow is introduced.
 */
export interface AutomatedInvestmentDecisionRepository {
  hasDecisionForTicker(ticker: string, correlationId: string): Promise<boolean>;
  save(decision: AutomatedInvestmentDecision, correlationId: string): Promise<void>;
  listAll(correlationId: string): Promise<AutomatedInvestmentDecision[]>;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

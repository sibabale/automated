// [ BACKEND > DOMAIN > REPOSITORIES > BROKER ] ######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { PortfolioPosition } from "../entities/portfolio-position.entity.js";
import type { BrokerOrder, BuyTradeRequest, TradeMode } from "../entities/trade-order.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * The broker account facts needed before submitting an order.
 */
export interface BrokerAccountStatus {
  mode: TradeMode;
  accountStatus: string;
  tradingBlocked: boolean;
}
// 1.3. END ..........................................................................................

// 1.4. PORT .........................................................................................
/**
 * The contract the application depends on for broker-ledger operations.
 *
 * Infrastructure adapters implement this against Alpaca, while the application
 * and presentation layers rely only on these broker-agnostic domain terms.
 */
export interface BrokerRepository {
  /**
   * Confirms whether the target trading account is able to accept orders.
   */
  getAccountStatus(mode: TradeMode, correlationId: string): Promise<BrokerAccountStatus>;

  /**
   * Submits one buy order to the broker and returns the accepted order facts.
   */
  placeBuyOrder(order: BuyTradeRequest, clientOrderId: string, correlationId: string): Promise<BrokerOrder>;

  /**
   * Returns the broker's current portfolio positions for the chosen mode.
   */
  getPortfolioPositions(mode: TradeMode, correlationId: string): Promise<PortfolioPosition[]>;
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

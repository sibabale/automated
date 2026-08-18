// [ BACKEND > DOMAIN > ENTITIES > TRADE ORDER ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
/**
 * The execution environment for a trade.
 *
 * Paper trades simulate or route to Alpaca's paper account, while live trades
 * can move real money and therefore require stronger safety controls.
 */
export type TradeMode = "paper" | "live";

/** The only trade side supported in v1. */
export type TradeSide = "buy";

/** The order styles the trading workflow currently supports. */
export type TradeOrderType = "market" | "limit";

/**
 * The immutable business request to place one buy order.
 *
 * This is the trading language the application layer uses before any broker
 * adapter translates it into Alpaca-specific payload fields.
 */
export interface BuyTradeRequest {
  ticker: string;
  quantity: number;
  mode: TradeMode;
  side: TradeSide;
  orderType: TradeOrderType;
  limitPrice: number | null;
  analysisModel: string | null;
  constitutionVersion: string | null;
  scoreAtPurchase: number | null;
  verdictAtPurchase: string | null;
  thesisSnapshot: Record<string, unknown> | null;
}

/**
 * The broker-agnostic result of a submitted buy order.
 *
 * This captures the facts the rest of the application cares about regardless
 * of whether the order came from Alpaca paper, Alpaca live, or a future broker.
 */
export interface BrokerOrder {
  clientOrderId: string;
  brokerOrderId: string | null;
  broker: string;
  mode: TradeMode;
  status: string;
  ticker: string;
  side: TradeSide;
  orderType: TradeOrderType;
  quantity: number;
  limitPrice: number | null;
  filledQuantity: number | null;
  averageFillPrice: number | null;
  submittedAt: string;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

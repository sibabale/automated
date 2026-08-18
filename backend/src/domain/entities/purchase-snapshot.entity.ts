// [ BACKEND > DOMAIN > ENTITIES > PURCHASE SNAPSHOT ] ###############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { TradeMode, TradeOrderType, TradeSide } from "./trade-order.entity.js";
// 1.2. END ..........................................................................................

// 1.3. ENTITY .......................................................................................
/**
 * The research context preserved at the moment a buy order is submitted.
 *
 * Alpaca remains the ledger of trading facts; this snapshot stores the
 * investment thesis and scoring metadata that the broker does not know about.
 */
export interface PurchaseSnapshot {
  clientOrderId: string;
  brokerOrderId: string | null;
  ticker: string;
  mode: TradeMode;
  side: TradeSide;
  orderType: TradeOrderType;
  quantity: number;
  submittedAt: string;
  scoreAtPurchase: number | null;
  verdictAtPurchase: string | null;
  analysisModel: string | null;
  constitutionVersion: string | null;
  thesisSnapshot: Record<string, unknown> | null;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

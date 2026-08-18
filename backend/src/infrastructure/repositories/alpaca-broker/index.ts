// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > ALPACA BROKER ] #######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
  alpacaGetAccount,
  alpacaGetPositions,
  alpacaSubmitOrder,
} from "../../clients/alpaca-client/index.js";
import type { PortfolioPosition } from "../../../domain/entities/portfolio-position.entity.js";
import type { BrokerOrder, BuyTradeRequest } from "../../../domain/entities/trade-order.entity.js";
import type {
  BrokerAccountStatus,
  BrokerRepository,
} from "../../../domain/repositories/broker.repository.js";
// 1.2. END ..........................................................................................

// 1.3. REPOSITORY ...................................................................................
/**
 * Builds the Alpaca-backed implementation of the broker port.
 *
 * The client owns raw HTTP details; this repository only translates Alpaca's
 * payload fields into the stable domain entities used elsewhere in the app.
 */
export function createAlpacaBrokerRepository(): BrokerRepository {
  return {
    async getAccountStatus(mode, correlationId): Promise<BrokerAccountStatus> {
      const account = await alpacaGetAccount(mode, correlationId);
      return {
        mode,
        accountStatus: readString(account.status) ?? "UNKNOWN",
        tradingBlocked: account.trading_blocked === true,
      };
    },

    async placeBuyOrder(order, clientOrderId, correlationId): Promise<BrokerOrder> {
      const result = await alpacaSubmitOrder(
        order.mode,
        {
          symbol: order.ticker.toUpperCase(),
          qty: order.quantity,
          side: order.side,
          type: order.orderType,
          time_in_force: "day",
          client_order_id: clientOrderId,
          ...(order.limitPrice === null ? {} : { limit_price: order.limitPrice }),
        },
        correlationId,
      );

      return {
        clientOrderId,
        brokerOrderId: readString(result.id),
        broker: "alpaca",
        mode: order.mode,
        status: readString(result.status) ?? "accepted",
        ticker: readString(result.symbol) ?? order.ticker.toUpperCase(),
        side: order.side,
        orderType: order.orderType,
        quantity: readNumber(result.qty) ?? order.quantity,
        limitPrice: readNumber(result.limit_price) ?? order.limitPrice,
        filledQuantity: readNumber(result.filled_qty),
        averageFillPrice: readNumber(result.filled_avg_price),
        submittedAt: readString(result.submitted_at) ?? new Date().toISOString(),
      };
    },

    async getPortfolioPositions(mode, correlationId): Promise<PortfolioPosition[]> {
      const positions = await alpacaGetPositions(mode, correlationId);
      return positions.map((position) => ({
        ticker: readString(position.symbol) ?? "UNKNOWN",
        companyName: readString(position.asset_name) ?? readString(position.name),
        mode,
        quantity: readNumber(position.qty) ?? 0,
        averageEntryPrice: readNumber(position.avg_entry_price),
        currentPrice: readNumber(position.current_price),
        marketValue: readNumber(position.market_value),
        unrealizedGainLoss: readNumber(position.unrealized_pl),
        scoreAtPurchase: null,
        verdictAtPurchase: null,
        latestThesisSnapshot: null,
      }));
    },
  };
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

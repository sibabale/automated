// [ BACKEND > APPLICATION > SERVICES > GET PORTFOLIO ] ##############################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type {
  PortfolioOverview,
  PortfolioPosition,
  PortfolioSummary,
} from "../../../domain/entities/portfolio-position.entity.js";
import type { TradeMode } from "../../../domain/entities/trade-order.entity.js";
import type { BrokerRepository } from "../../../domain/repositories/broker.repository.js";
import type { PurchaseSnapshotRepository } from "../../../domain/repositories/purchase-snapshot.repository.js";
// 1.2. END ..........................................................................................

// 1.3. SERVICE ......................................................................................
/**
 * Builds the portfolio read model the frontend consumes.
 *
 * Alpaca provides the live holding facts, while the snapshot repository
 * provides the analysis context from the latest recorded buy for each ticker.
 * This service merges them into one coherent response so the frontend does not
 * need to understand either storage source directly.
 */
export async function getPortfolio(
  mode: TradeMode,
  brokerRepository: BrokerRepository,
  purchaseSnapshotRepository: PurchaseSnapshotRepository,
  correlationId: string,
): Promise<PortfolioOverview> {
  const [positions, snapshots] = await Promise.all([
    brokerRepository.getPortfolioPositions(mode, correlationId),
    purchaseSnapshotRepository.listAll(mode, correlationId),
  ]);

  const latestSnapshotsByTicker = new Map<string, typeof snapshots[number]>();
  snapshots.forEach((snapshot) => {
    const existing = latestSnapshotsByTicker.get(snapshot.ticker.toUpperCase());
    if (!existing || snapshot.submittedAt > existing.submittedAt) {
      latestSnapshotsByTicker.set(snapshot.ticker.toUpperCase(), snapshot);
    }
  });

  const enrichedPositions = positions.map((position) => enrichPosition(position, latestSnapshotsByTicker));
  return {
    positions: enrichedPositions,
    summary: summarisePortfolio(enrichedPositions),
  };
}

function enrichPosition(
  position: PortfolioPosition,
  latestSnapshotsByTicker: Map<string, { scoreAtPurchase: number | null; verdictAtPurchase: string | null; thesisSnapshot: Record<string, unknown> | null }>,
): PortfolioPosition {
  const snapshot = latestSnapshotsByTicker.get(position.ticker.toUpperCase());
  if (!snapshot) {
    return position;
  }

  return {
    ...position,
    scoreAtPurchase: snapshot.scoreAtPurchase,
    verdictAtPurchase: snapshot.verdictAtPurchase,
    latestThesisSnapshot: snapshot.thesisSnapshot,
  };
}

function summarisePortfolio(positions: PortfolioPosition[]): PortfolioSummary {
  const totalValue = positions.reduce((sum, position) => sum + (position.marketValue ?? 0), 0);
  const totalInvested = positions.reduce(
    (sum, position) => sum + ((position.averageEntryPrice ?? 0) * position.quantity),
    0,
  );
  const totalGainLoss = positions.reduce((sum, position) => sum + (position.unrealizedGainLoss ?? 0), 0);

  const scoredPositions = positions.filter((position) => position.scoreAtPurchase !== null);
  const averageScoreAtPurchase = scoredPositions.length === 0
    ? null
    : scoredPositions.reduce((sum, position) => sum + (position.scoreAtPurchase ?? 0), 0) / scoredPositions.length;

  return {
    totalValue,
    totalInvested,
    totalGainLoss,
    totalGainPercentage: totalInvested === 0 ? null : (totalGainLoss / totalInvested) * 100,
    averageScoreAtPurchase,
  };
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

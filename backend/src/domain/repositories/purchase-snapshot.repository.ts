// [ BACKEND > DOMAIN > REPOSITORIES > PURCHASE SNAPSHOT ] ###########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { PurchaseSnapshot } from "../entities/purchase-snapshot.entity.js";
// 1.2. END ..........................................................................................

// 1.3. PORT .........................................................................................
/**
 * The contract the application depends on to persist and read purchase-thesis
 * snapshots independently of the broker ledger.
 */
export interface PurchaseSnapshotRepository {
    /** Persists one purchase snapshot after a broker accepts the order. */
  save(snapshot: PurchaseSnapshot, correlationId: string): Promise<void>;

    /** Lists every stored snapshot for one trading mode so portfolio enrichment can join on ticker. */
    listAll(mode: PurchaseSnapshot["mode"], correlationId: string): Promise<PurchaseSnapshot[]>;

  /** Returns the most recent stored snapshot for a ticker, or null when absent. */
    findLatestByTicker(
      ticker: string,
      mode: PurchaseSnapshot["mode"],
      correlationId: string,
    ): Promise<PurchaseSnapshot | null>;
  }
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

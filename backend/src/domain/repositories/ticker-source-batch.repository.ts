// [ BACKEND > DOMAIN > REPOSITORIES > TICKER SOURCE BATCH ] #########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface TickerSourceBatch {
  batchId: string;
  sourceFile: string;
  tickers: string[];
}

export interface TickerBatchProgress {
  batchId: string;
  completedAt: string | null;
  lastTicker: string | null;
  sourceFile: string;
}

export interface TickerBatchSelectionOptions {
  maxTickers?: number;
}
// 1.3. END ..........................................................................................

// 1.4. PORT .........................................................................................
export interface TickerSourceBatchRepository {
  listBatches(correlationId: string, options?: TickerBatchSelectionOptions): Promise<TickerSourceBatch[]>;
  markBatchProgress(progress: TickerBatchProgress, correlationId: string): Promise<void>;
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

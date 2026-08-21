// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FILE TICKER SOURCE BATCH ] ############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import path from "node:path";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import type {
  TickerSourceBatch,
  TickerBatchProgress,
  TickerSourceBatchRepository,
  TickerBatchSelectionOptions,
} from "../../../domain/repositories/ticker-source-batch.repository.js";
// 1.2. END ..........................................................................................

// 1.3. REPOSITORY ...................................................................................
interface RawTickerSourceBatch {
  batchId?: unknown;
  tickers?: unknown;
}

interface TickerBatchCursorLedger {
  batchId?: unknown;
  completedAt?: unknown;
  lastTicker?: unknown;
  sourceFile?: unknown;
}

export function createFileTickerSourceBatchRepository(
  directory = process.env.TICKER_SOURCE_DIRECTORY
    ? path.resolve(process.env.TICKER_SOURCE_DIRECTORY)
    : path.resolve(process.cwd(), "data", "tickers"),
  progressNamespace: string,
): TickerSourceBatchRepository {
  const progressFilePath = path.join(directory, `.progress-${progressNamespace}.json`);

  return {
    async listBatches(correlationId, options = {}): Promise<TickerSourceBatch[]> {
      try {
        const fileNames = (await readdir(directory))
          .filter((fileName) => fileName.endsWith(".json") && fileName !== path.basename(progressFilePath))
          .sort((left, right) => left.localeCompare(right));

        const batches = await Promise.all(
          fileNames.map(async (fileName) => {
            const filePath = path.join(directory, fileName);
            const content = await readFile(filePath, "utf8");
            const parsed = JSON.parse(content) as RawTickerSourceBatch;
            const tickers = Array.isArray(parsed.tickers)
              ? parsed.tickers
                  .filter((value): value is string => typeof value === "string")
                  .map((value) => value.trim().toUpperCase())
                  .filter(Boolean)
              : [];

            return {
              batchId:
                typeof parsed.batchId === "string" && parsed.batchId.trim().length > 0
                  ? parsed.batchId.trim()
                  : path.basename(fileName, ".json"),
              sourceFile: fileName,
              tickers,
            };
          }),
        );

        return applySelection(batches, await readProgress(progressFilePath, correlationId), options);
      } catch (error) {
        if (isMissingFileError(error)) {
          return [];
        }

        logger.error({ correlationId, directory, err: error }, "Failed to read ticker source directory");
        throw error;
      }
    },

    async markBatchProgress(progress, correlationId): Promise<void> {
      try {
        await mkdir(path.dirname(progressFilePath), { recursive: true });
        await writeFile(
          progressFilePath,
          `${JSON.stringify(progress, null, 2)}\n`,
          "utf8",
        );
      } catch (error) {
        logger.error({ correlationId, directory, err: error, progressFilePath }, "Failed to write ticker batch progress");
        throw error;
      }
    },
  };
}

function applySelection(
  batches: TickerSourceBatch[],
  progress: TickerBatchProgress | null,
  options: TickerBatchSelectionOptions,
): TickerSourceBatch[] {
  const maxTickers = options.maxTickers;

  if (!progress) {
    return maxTickers ? limitBatches(batches, maxTickers) : batches;
  }

  const progressIndex = batches.findIndex(
    (candidate) => candidate.batchId === progress.batchId && candidate.sourceFile === progress.sourceFile,
  );
  if (progressIndex < 0) {
    throw new Error(`Ticker batch progress points to a missing batch: ${progress.sourceFile}`);
  }

  const selected = batches.flatMap((batch, index) => {
    const isCurrentBatch = batch.batchId === progress.batchId && batch.sourceFile === progress.sourceFile;
    if (!isCurrentBatch) {
      return index > progressIndex ? [batch] : [];
    }

    if (progress.completedAt) {
      return [];
    }

    const tickerIndex = progress.lastTicker
      ? batch.tickers.findIndex((ticker) => ticker === progress.lastTicker)
      : -1;
    if (progress.lastTicker && tickerIndex < 0) {
      throw new Error(
        `Ticker batch progress points to a missing ticker: ${progress.lastTicker} in ${progress.sourceFile}`,
      );
    }

    return [{
      ...batch,
      tickers: tickerIndex >= 0 ? batch.tickers.slice(tickerIndex + 1) : batch.tickers,
    }];
  });

  return maxTickers ? limitBatches(selected, maxTickers) : selected;
}

function limitBatches(batches: TickerSourceBatch[], maxTickers: number): TickerSourceBatch[] {
  if (!Number.isInteger(maxTickers) || maxTickers <= 0) {
    return batches;
  }

  const limited: TickerSourceBatch[] = [];
  let remaining = maxTickers;

  for (const batch of batches) {
    if (remaining <= 0) {
      break;
    }

    const tickers = batch.tickers.slice(0, remaining);
    if (tickers.length === 0) {
      continue;
    }

    limited.push({
      ...batch,
      tickers,
    });
    remaining -= tickers.length;
  }

  return limited;
}

async function readProgress(filePath: string, correlationId: string): Promise<TickerBatchProgress | null> {
  try {
    const content = await readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as TickerBatchCursorLedger;

    if (
      typeof parsed.batchId !== "string"
      || typeof parsed.sourceFile !== "string"
      || (parsed.lastTicker !== null && parsed.lastTicker !== undefined && typeof parsed.lastTicker !== "string")
      || (parsed.completedAt !== null && parsed.completedAt !== undefined && typeof parsed.completedAt !== "string")
    ) {
      throw new Error("Ticker batch progress file must contain string batchId/sourceFile and optional string values");
    }

    return {
      batchId: parsed.batchId,
      completedAt: parsed.completedAt ?? null,
      lastTicker: parsed.lastTicker ?? null,
      sourceFile: parsed.sourceFile,
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }

    logger.error({ correlationId, filePath, err: error }, "Failed to read ticker batch progress");
    throw error;
  }
}

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

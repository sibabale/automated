// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FILE TICKER SOURCE BATCH ] ###############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import type {
  TickerSourceBatch,
  TickerSourceBatchRepository,
} from "../../../domain/repositories/ticker-source-batch.repository.js";
// 1.2. END ..........................................................................................

// 1.3. REPOSITORY ...................................................................................
interface RawTickerSourceBatch {
  batchId?: unknown;
  tickers?: unknown;
}

export function createFileTickerSourceBatchRepository(
  directory = process.env.TICKER_SOURCE_DIRECTORY
    ? path.resolve(process.env.TICKER_SOURCE_DIRECTORY)
    : path.resolve(process.cwd(), "data", "tickers"),
): TickerSourceBatchRepository {
  return {
    async listBatches(correlationId): Promise<TickerSourceBatch[]> {
      try {
        const fileNames = (await readdir(directory))
          .filter((fileName) => fileName.endsWith(".json"))
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

        return batches;
      } catch (error) {
        if (isMissingFileError(error)) {
          return [];
        }

        logger.error({ correlationId, directory, err: error }, "Failed to read ticker source directory");
        throw error;
      }
    },
  };
}

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

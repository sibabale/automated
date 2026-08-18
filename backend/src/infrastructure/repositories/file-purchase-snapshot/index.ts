// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FILE PURCHASE SNAPSHOT ] ##############################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import path from "node:path";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import type { PurchaseSnapshot } from "../../../domain/entities/purchase-snapshot.entity.js";
import type { PurchaseSnapshotRepository } from "../../../domain/repositories/purchase-snapshot.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
type SnapshotLedger = Record<string, PurchaseSnapshot>;
// 1.3. END ..........................................................................................

// 1.4. REPOSITORY ...................................................................................
/**
 * Builds the filesystem-backed purchase-snapshot repository.
 *
 * Each holding gets one JSON file under `portfolio/<mode>/`, and each file is
 * an append-only ledger keyed by client order id so multiple buys of the same
 * holding can be preserved together.
 */
export function createFilePurchaseSnapshotRepository(
  baseDirectory = process.env.PORTFOLIO_BASE_DIRECTORY
    ? path.resolve(process.env.PORTFOLIO_BASE_DIRECTORY)
    : path.resolve(process.cwd(), "portfolio"),
): PurchaseSnapshotRepository {
  return {
    async save(snapshot, correlationId): Promise<void> {
      const filePath = filePathFor(baseDirectory, snapshot.ticker, snapshot.mode);
      await mkdir(path.dirname(filePath), { recursive: true });

      const ledger = await readLedger(filePath, correlationId);
      ledger[snapshot.clientOrderId] = snapshot;

      logger.info({ correlationId, ticker: snapshot.ticker, mode: snapshot.mode }, "Writing purchase snapshot file");
      await writeFile(filePath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
    },

    async listAll(mode, correlationId): Promise<PurchaseSnapshot[]> {
      const directory = path.join(baseDirectory, mode);
      try {
        const fileNames = await readdir(directory);
        const snapshots = await Promise.all(
          fileNames
            .filter((fileName) => fileName.endsWith(".json"))
            .map(async (fileName) => Object.values(await readLedger(path.join(directory, fileName), correlationId))),
        );
        return snapshots.flat();
      } catch (error) {
        if (isMissingFileError(error)) {
          return [];
        }
        throw error;
      }
    },

    async findLatestByTicker(ticker, mode, correlationId): Promise<PurchaseSnapshot | null> {
      const ledger = await readLedger(filePathFor(baseDirectory, ticker, mode), correlationId);
      const snapshots = Object.values(ledger).sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
      return snapshots[0] ?? null;
    },
  };
}

async function readLedger(filePath: string, correlationId: string): Promise<SnapshotLedger> {
  try {
    const content = await readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Snapshot ledger must be a JSON object");
    }
    return parsed as SnapshotLedger;
  } catch (error) {
    if (isMissingFileError(error)) {
      return {};
    }

    logger.error({ correlationId, filePath, err: error }, "Failed to read purchase snapshot ledger");
    throw error;
  }
}

function filePathFor(baseDirectory: string, ticker: string, mode: PurchaseSnapshot["mode"]): string {
  return path.join(baseDirectory, mode, `${sanitizeHoldingName(ticker)}.json`);
}

function sanitizeHoldingName(value: string): string {
  return value.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-");
}

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

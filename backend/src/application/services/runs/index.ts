// [ BACKEND > APPLICATION > SERVICES > RUNS ] #######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { logger } from "../../../logger.js";
import type { RunsDecision } from "../../../domain/entities/runs-decision.entity.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface RunsPage<TDecision = RunsDecision> {
  items: TDecision[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
// 1.3. END ..........................................................................................

// 1.4. HELPERS ......................................................................................
function parseDecisionDate(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

/**
 * Reads a decisions.json file and returns its entries. Returns an empty array
 * if the file is missing or contains invalid JSON, allowing the service to
 * gracefully handle partial data availability.
 */
async function readDecisionFile(filePath: string): Promise<RunsDecision[]> {
  try {
    const contents = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(contents) as Record<string, RunsDecision>;
    return Object.values(parsed);
  } catch {
    // File missing or malformed — skip without blocking other files.
    return [];
  }
}

function resolveRunsDataDirectory(): string {
  return path.resolve(process.cwd(), "data");
}

/**
 * Discovers all decisions.json files in the data directory, including the root
 * file and any versioned subdirectories (v1, v2, v3, etc.). This allows new
 * decision batches to be added without code changes.
 */
async function discoverDecisionFiles(dataDir: string): Promise<string[]> {
  const files: string[] = [];

  // Check root decisions.json
  const rootFile = path.join(dataDir, "decisions.json");
  files.push(rootFile);

  // Scan for versioned subdirectories (v1, v2, v3, ...)
  try {
    const entries = await fs.readdir(dataDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && /^v\d+$/.test(entry.name)) {
        files.push(path.join(dataDir, entry.name, "decisions.json"));
      }
    }
  } catch {
    // Data directory inaccessible — return just the root file attempt.
  }

  return files;
}
// 1.4. END ..........................................................................................

// 1.5. SERVICE ......................................................................................
export interface BuildRunsPageOptions {
  /** Optional status filter to apply before pagination. */
  status?: string;
}

export async function buildRunsPage(
  decisions: RunsDecision[],
  page: number,
  pageSize: number,
  correlationId: string,
  options?: BuildRunsPageOptions,
): Promise<RunsPage> {
  logger.debug({ correlationId, page, pageSize, status: options?.status }, "Building runs table page");

  // Filter by status if provided
  const filtered = options?.status
    ? decisions.filter((d) => d.status === options.status)
    : decisions;

  const ordered = [...filtered].sort((a, b) => {
    const delta = parseDecisionDate(b.processedAt) - parseDecisionDate(a.processedAt);
    if (delta !== 0) {
      return delta;
    }
    return a.ticker.localeCompare(b.ticker);
  });

  const totalItems = ordered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const items = ordered.slice(start, start + pageSize);

  logger.info({ correlationId, page: currentPage, totalItems, totalPages, status: options?.status }, "Runs page built");

  return {
    items,
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
  };
}

export async function loadRunsDecisions(): Promise<RunsDecision[]> {
  const dataDir = resolveRunsDataDirectory();
  const files = await discoverDecisionFiles(dataDir);

  const allDecisions = await Promise.all(files.map(readDecisionFile));
  return allDecisions.flat();
}

/**
 * Finds a single decision by batch ID and ticker.
 * Returns the full decision record including metrics, strengths, and trade
 * execution details.
 */
export async function findDecisionByBatchAndTicker(
  batchId: string,
  ticker: string,
  correlationId: string,
): Promise<RunsDecision | null> {
  logger.debug({ correlationId, batchId, ticker }, "Finding decision by batch and ticker");

  const decisions = await loadRunsDecisions();
  const match = decisions.find((d) => d.batchId === batchId && d.ticker === ticker);

  if (!match) {
    logger.warn({ correlationId, batchId, ticker }, "Decision not found");
    return null;
  }

  logger.info({ correlationId, batchId, ticker }, "Decision found");
  return match;
}

/**
 * Pure helper for finding a decision by batch and ticker. Exported for
 * testability; production code uses findDecisionByBatchAndTicker.
 */
export function findDecisionByBatchAndTickerFromList(
  decisions: RunsDecision[],
  batchId: string,
  ticker: string,
): RunsDecision | null {
  return decisions.find((d) => d.batchId === batchId && d.ticker === ticker) ?? null;
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################

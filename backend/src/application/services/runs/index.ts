// [ BACKEND > APPLICATION > SERVICES > RUNS ] ########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import type { RunsDecision } from "../../../domain/entities/runs-decision.entity.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
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

async function readDecisionFile(filePath: string): Promise<RunsDecision[]> {
  const contents = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(contents) as Record<string, RunsDecision>;
  return Object.values(parsed);
}

function resolveRunsDataDirectory(): string {
  return path.resolve(process.cwd(), "data");
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
  const files = [
    "decisions.json",
    "v1/decisions.json",
    "v2/decisions.json",
  ].map((file) => path.join(dataDir, file));

  const allDecisions = await Promise.all(files.map(readDecisionFile));
  return allDecisions.flat();
}
// 1.5. END ..........................................................................................

// END FILE ##########################################################################################

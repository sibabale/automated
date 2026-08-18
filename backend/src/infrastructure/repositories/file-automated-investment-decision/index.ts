// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FILE AUTOMATED INVESTMENT DECISION ] ####################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { logger } from "../../../logger.js";
import type { AutomatedInvestmentDecision } from "../../../domain/entities/automated-investment-decision.entity.js";
import type { AutomatedInvestmentDecisionRepository } from "../../../domain/repositories/automated-investment-decision.repository.js";
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
type DecisionLedger = Record<string, AutomatedInvestmentDecision>;
// 1.3. END ..........................................................................................

// 1.4. REPOSITORY ...................................................................................
export function createFileAutomatedInvestmentDecisionRepository(
  filePath = process.env.AUTOMATED_INVESTMENT_DECISIONS_FILE
    ? path.resolve(process.env.AUTOMATED_INVESTMENT_DECISIONS_FILE)
    : path.resolve(process.cwd(), "data", "automation", "decisions.json"),
): AutomatedInvestmentDecisionRepository {
  return {
    async hasDecisionForTicker(ticker, correlationId): Promise<boolean> {
      const ledger = await readLedger(filePath, correlationId);
      return ledger[normalizeTicker(ticker)] !== undefined;
    },

    async save(decision, correlationId): Promise<void> {
      const ledger = await readLedger(filePath, correlationId);
      ledger[normalizeTicker(decision.ticker)] = decision;

      await mkdir(path.dirname(filePath), { recursive: true });
      logger.info({ correlationId, ticker: decision.ticker, filePath }, "Writing automated investment decision ledger");
      await writeFile(filePath, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
    },

    async listAll(correlationId): Promise<AutomatedInvestmentDecision[]> {
      const ledger = await readLedger(filePath, correlationId);
      return Object.values(ledger);
    },
  };
}

async function readLedger(filePath: string, correlationId: string): Promise<DecisionLedger> {
  try {
    const content = await readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Automated decision ledger must be a JSON object");
    }
    return parsed as DecisionLedger;
  } catch (error) {
    if (isMissingFileError(error)) {
      return {};
    }

    logger.error({ correlationId, filePath, err: error }, "Failed to read automated decision ledger");
    throw error;
  }
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

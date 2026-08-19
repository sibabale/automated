// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FILE AUTOMATED INVESTMENT DECISION > TESTS ] ##########

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFileAutomatedInvestmentDecisionRepository } from "./index.js";
import type { AutomatedInvestmentDecision } from "../../../domain/entities/automated-investment-decision.entity.js";
// 1.2. END ..........................................................................................

// 1.3. FIXTURES .....................................................................................
const temporaryDirectories: string[] = [];

async function createTempRepository() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "automated-decisions-"));
  temporaryDirectories.push(directory);
  return {
    directory,
    repository: createFileAutomatedInvestmentDecisionRepository(
      "v1",
      path.join(directory, "automation", "decisions.json"),
    ),
  };
}

function decision(overrides: Partial<AutomatedInvestmentDecision> = {}): AutomatedInvestmentDecision {
  return {
    apiVersion: "v1",
    ticker: "MSFT",
    companyName: "Microsoft",
    batchId: "batch-1",
    sourceFile: "tickers.json",
    processedAt: "2026-08-19T12:00:00.000Z",
    status: "buy",
    verdictAtPurchase: "buy",
    scoreAtPurchase: 100,
    analysisModel: "automated-investment-v1",
    constitutionVersion: "all-five-metrics-must-be-strong",
    metrics: {
      returnOnEquity: 25,
      freeCashFlow: 12_000_000_000,
      debtToEquity: 0.4,
      profitMargin: 22,
      marginOfSafety: 25,
    },
    strengths: {
      returnOnEquity: "strong",
      freeCashFlow: "strong",
      debtToEquity: "strong",
      profitMargin: "strong",
      marginOfSafety: "strong",
    },
    tradeExecution: {
      attempted: true,
      mode: "paper",
      maxTradeAmount: 1000,
      sharePrice: 200,
      quantity: 5,
      orderClientId: "trade-paper-001",
      status: "placed",
      skipReason: null,
    },
    ...overrides,
  };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createFileAutomatedInvestmentDecisionRepository", () => {
  // 1.4.1. SAVES DECISIONS INTO ONE JSON LEDGER .....................................................
  it("saves decisions into one JSON ledger", async () => {
    const { directory, repository } = await createTempRepository();
    await repository.save(decision(), "cid-auto-decisions-001");

    const content = await readFile(path.join(directory, "automation", "decisions.json"), "utf8");
    const parsed = JSON.parse(content);

    assert.equal(parsed.MSFT.apiVersion, "v1");
    assert.equal(parsed.MSFT.status, "buy");
    assert.equal(parsed.MSFT.tradeExecution.quantity, 5);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. REPORTS WHETHER A TICKER HAS ALREADY BEEN PROCESSED ......................................
  it("reports whether a ticker has already been processed", async () => {
    const { repository } = await createTempRepository();
    await repository.save(decision(), "cid-auto-decisions-002");

    assert.equal(await repository.hasDecisionForTicker("msft", "cid-auto-decisions-003"), true);
    assert.equal(await repository.hasDecisionForTicker("aapl", "cid-auto-decisions-004"), false);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. LISTS ALL STORED DECISIONS ...............................................................
  it("lists all stored decisions", async () => {
    const { repository } = await createTempRepository();
    await repository.save(decision(), "cid-auto-decisions-005");
    await repository.save(
      decision({
        ticker: "AAPL",
        companyName: "Apple",
        status: "watch",
        verdictAtPurchase: "watch",
      }),
      "cid-auto-decisions-006",
    );

    const decisions = await repository.listAll("cid-auto-decisions-007");
    assert.equal(decisions.length, 2);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. KEEPS VERSIONED LEDGERS SEPARATE WHEN A LEGACY FILE OVERRIDE IS CONFIGURED ...............
  it("keeps versioned ledgers separate when a legacy file override is configured", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "automated-decisions-override-"));
    temporaryDirectories.push(directory);
    const configuredFilePath = path.join(directory, "automation", "decisions.json");

    const v1Repository = createFileAutomatedInvestmentDecisionRepository("v1", configuredFilePath);
    const v2Repository = createFileAutomatedInvestmentDecisionRepository("v2", configuredFilePath);

    await v1Repository.save(decision(), "cid-auto-decisions-008");
    await v2Repository.save(
      decision({
        apiVersion: "v2",
        analysisModel: "automated-investment-v2",
        constitutionVersion: "all-five-metrics-must-be-strong-lower-free-cash-flow-threshold",
      }),
      "cid-auto-decisions-009",
    );

    const v1Content = JSON.parse(
      await readFile(path.join(directory, "automation", "decisions.json"), "utf8"),
    );
    const v2Content = JSON.parse(
      await readFile(path.join(directory, "automation", "v2", "decisions.json"), "utf8"),
    );

    assert.equal(v1Content.MSFT.apiVersion, "v1");
    assert.equal(v2Content.MSFT.apiVersion, "v2");
  });
  // 1.4.4. END ......................................................................................
});
// 1.4. END ..........................................................................................

afterEach(async () => {
  while (temporaryDirectories.length > 0) {
    const directory = temporaryDirectories.pop()!;
    await rm(directory, { recursive: true, force: true });
  }
});

// END FILE ##########################################################################################

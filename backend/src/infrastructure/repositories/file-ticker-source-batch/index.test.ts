// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FILE TICKER SOURCE BATCH > TESTS ] ####################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFileTickerSourceBatchRepository } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. FIXTURES .....................................................................................
const temporaryDirectories: string[] = [];

async function createTempDirectory() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ticker-source-batches-"));
  temporaryDirectories.push(directory);
  return directory;
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createFileTickerSourceBatchRepository", () => {
  // 1.4.1. LISTS BATCH FILES IN NAME ORDER ..........................................................
  it("lists batch files in name order", async () => {
    const directory = await createTempDirectory();
    await writeFile(
      path.join(directory, "b-second.json"),
      `${JSON.stringify({ batchId: "batch-b", tickers: ["msft"] }, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(directory, "a-first.json"),
      `${JSON.stringify({ batchId: "batch-a", tickers: ["aapl"] }, null, 2)}\n`,
      "utf8",
    );

    const repository = createFileTickerSourceBatchRepository(directory, "v1");
    const batches = await repository.listBatches("cid-source-batches-001");

    assert.deepEqual(
      batches.map((batch) => batch.batchId),
      ["batch-a", "batch-b"],
    );
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. NORMALIZES TICKERS AND FALLS BACK TO THE FILE NAME .......................................
  it("normalizes tickers and falls back to the file name", async () => {
    const directory = await createTempDirectory();
    await writeFile(
      path.join(directory, "us-growth.json"),
      `${JSON.stringify({ tickers: [" msft ", "AAPL", "", 12] }, null, 2)}\n`,
      "utf8",
    );

    const repository = createFileTickerSourceBatchRepository(directory, "v1");
    const [batch] = await repository.listBatches("cid-source-batches-002");

    assert.equal(batch?.batchId, "us-growth");
    assert.deepEqual(batch?.tickers, ["MSFT", "AAPL"]);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS AN EMPTY LIST WHEN THE DIRECTORY DOES NOT EXIST ..................................
  it("returns an empty list when the directory does not exist", async () => {
    const repository = createFileTickerSourceBatchRepository(path.join(os.tmpdir(), "missing-batches"), "v1");
    const batches = await repository.listBatches("cid-source-batches-003");

    assert.deepEqual(batches, []);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. LIMITS THE NEXT RUN TO THE CONFIGURED NUMBER OF TICKERS ..................................
  it("limits the next run to the configured number of tickers", async () => {
    const directory = await createTempDirectory();
    await writeFile(
      path.join(directory, "a-first.json"),
      `${JSON.stringify({ batchId: "batch-a", tickers: ["aapl", "msft", "nvda"] }, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(directory, "b-second.json"),
      `${JSON.stringify({ batchId: "batch-b", tickers: ["amzn", "meta"] }, null, 2)}\n`,
      "utf8",
    );

    const repository = createFileTickerSourceBatchRepository(directory, "v1");
    const batches = await repository.listBatches("cid-source-batches-004", { maxTickers: 4 });

    assert.deepEqual(batches, [
      { batchId: "batch-a", sourceFile: "a-first.json", tickers: ["AAPL", "MSFT", "NVDA"] },
      { batchId: "batch-b", sourceFile: "b-second.json", tickers: ["AMZN"] },
    ]);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. RESUMES AFTER THE LAST PROCESSED TICKER IN THE CURRENT BATCH .............................
  it("resumes after the last processed ticker in the current batch", async () => {
    const directory = await createTempDirectory();
    await writeFile(
      path.join(directory, "a-first.json"),
      `${JSON.stringify({ batchId: "batch-a", tickers: ["AAPL", "MSFT", "NVDA"] }, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(directory, ".progress-v1.json"),
      `${JSON.stringify({
        batchId: "batch-a",
        completedAt: null,
        lastTicker: "MSFT",
        sourceFile: "a-first.json",
      }, null, 2)}\n`,
      "utf8",
    );

    const repository = createFileTickerSourceBatchRepository(directory, "v1");
    const [batch] = await repository.listBatches("cid-source-batches-005");

    assert.deepEqual(batch, {
      batchId: "batch-a",
      sourceFile: "a-first.json",
      tickers: ["NVDA"],
    });
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. PERSISTS PROGRESS AFTER A RUN ............................................................
  it("persists progress after a run", async () => {
    const directory = await createTempDirectory();
    const repository = createFileTickerSourceBatchRepository(directory, "v1");

    await repository.markBatchProgress(
      {
        batchId: "batch-a",
        completedAt: "2026-08-21T13:00:00.000Z",
        lastTicker: "NVDA",
        sourceFile: "a-first.json",
      },
      "cid-source-batches-006",
    );

    const saved = JSON.parse(await readFile(path.join(directory, ".progress-v1.json"), "utf8"));
    assert.deepEqual(saved, {
      batchId: "batch-a",
      completedAt: "2026-08-21T13:00:00.000Z",
      lastTicker: "NVDA",
      sourceFile: "a-first.json",
    });
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. FAILS WHEN SAVED PROGRESS POINTS TO A MISSING BATCH ......................................
  it("fails when saved progress points to a missing batch", async () => {
    const directory = await createTempDirectory();
    await writeFile(
      path.join(directory, "a-first.json"),
      `${JSON.stringify({ batchId: "batch-a", tickers: ["AAPL"] }, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(directory, ".progress-v1.json"),
      `${JSON.stringify({
        batchId: "batch-missing",
        completedAt: "2026-08-21T13:00:00.000Z",
        lastTicker: "MSFT",
        sourceFile: "missing.json",
      }, null, 2)}\n`,
      "utf8",
    );

    const repository = createFileTickerSourceBatchRepository(directory, "v1");

    await assert.rejects(
      () => repository.listBatches("cid-source-batches-007"),
      /Ticker batch progress points to a missing batch: missing.json/,
    );
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. KEEPS PROGRESS FILES SEPARATE BY NAMESPACE ...............................................
  it("keeps progress files separate by namespace", async () => {
    const directory = await createTempDirectory();
    const v1Repository = createFileTickerSourceBatchRepository(directory, "v1");
    const v2Repository = createFileTickerSourceBatchRepository(directory, "v2");

    await v1Repository.markBatchProgress(
      {
        batchId: "batch-a",
        completedAt: null,
        lastTicker: "AAPL",
        sourceFile: "a-first.json",
      },
      "cid-source-batches-008",
    );
    await v2Repository.markBatchProgress(
      {
        batchId: "batch-b",
        completedAt: "2026-08-21T13:00:00.000Z",
        lastTicker: "MSFT",
        sourceFile: "b-second.json",
      },
      "cid-source-batches-009",
    );

    const v1Saved = JSON.parse(await readFile(path.join(directory, ".progress-v1.json"), "utf8"));
    const v2Saved = JSON.parse(await readFile(path.join(directory, ".progress-v2.json"), "utf8"));

    assert.equal(v1Saved.batchId, "batch-a");
    assert.equal(v2Saved.batchId, "batch-b");
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. FAILS WHEN SAVED PROGRESS POINTS TO A MISSING TICKER .....................................
  it("fails when saved progress points to a missing ticker", async () => {
    const directory = await createTempDirectory();
    await writeFile(
      path.join(directory, "a-first.json"),
      `${JSON.stringify({ batchId: "batch-a", tickers: ["AAPL", "MSFT"] }, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(directory, ".progress-v1.json"),
      `${JSON.stringify({
        batchId: "batch-a",
        completedAt: null,
        lastTicker: "NVDA",
        sourceFile: "a-first.json",
      }, null, 2)}\n`,
      "utf8",
    );

    const repository = createFileTickerSourceBatchRepository(directory, "v1");

    await assert.rejects(
      () => repository.listBatches("cid-source-batches-010"),
      /Ticker batch progress points to a missing ticker: NVDA in a-first.json/,
    );
  });
  // 1.4.9. END ......................................................................................
});
// 1.4. END ..........................................................................................

afterEach(async () => {
  while (temporaryDirectories.length > 0) {
    const directory = temporaryDirectories.pop()!;
    await rm(directory, { recursive: true, force: true });
  }
});

// END FILE ##########################################################################################

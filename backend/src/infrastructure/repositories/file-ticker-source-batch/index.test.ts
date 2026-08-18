// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FILE TICKER SOURCE BATCH > TESTS ] ######################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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
  // 1.4.1. LISTS BATCH FILES IN NAME ORDER ...........................................................
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

    const repository = createFileTickerSourceBatchRepository(directory);
    const batches = await repository.listBatches("cid-source-batches-001");

    assert.deepEqual(
      batches.map((batch) => batch.batchId),
      ["batch-a", "batch-b"],
    );
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. NORMALIZES TICKERS AND FALLS BACK TO THE FILE NAME ........................................
  it("normalizes tickers and falls back to the file name", async () => {
    const directory = await createTempDirectory();
    await writeFile(
      path.join(directory, "us-growth.json"),
      `${JSON.stringify({ tickers: [" msft ", "AAPL", "", 12] }, null, 2)}\n`,
      "utf8",
    );

    const repository = createFileTickerSourceBatchRepository(directory);
    const [batch] = await repository.listBatches("cid-source-batches-002");

    assert.equal(batch?.batchId, "us-growth");
    assert.deepEqual(batch?.tickers, ["MSFT", "AAPL"]);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS AN EMPTY LIST WHEN THE DIRECTORY DOES NOT EXIST ...................................
  it("returns an empty list when the directory does not exist", async () => {
    const repository = createFileTickerSourceBatchRepository(path.join(os.tmpdir(), "missing-batches"));
    const batches = await repository.listBatches("cid-source-batches-003");

    assert.deepEqual(batches, []);
  });
  // 1.4.3. END ......................................................................................
});
// 1.4. END ..........................................................................................

afterEach(async () => {
  while (temporaryDirectories.length > 0) {
    const directory = temporaryDirectories.pop()!;
    await rm(directory, { recursive: true, force: true });
  }
});

// END FILE ##########################################################################################

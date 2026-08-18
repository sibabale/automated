// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FILE PURCHASE SNAPSHOT > TESTS ] ######################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createFilePurchaseSnapshotRepository } from "./index.js";
import type { PurchaseSnapshot } from "../../../domain/entities/purchase-snapshot.entity.js";
// 1.2. END ..........................................................................................

// 1.3. FIXTURES .....................................................................................
const temporaryDirectories: string[] = [];

async function createTempRepository() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "purchase-snapshot-"));
  temporaryDirectories.push(directory);
  return createFilePurchaseSnapshotRepository(directory);
}

function snapshot(overrides: Partial<PurchaseSnapshot> = {}): PurchaseSnapshot {
  return {
    clientOrderId: "trade-01",
    brokerOrderId: "alpaca-order-01",
    ticker: "Microsoft",
    mode: "paper",
    side: "buy",
    orderType: "market",
    quantity: 2,
    submittedAt: "2026-08-18T10:00:00.000Z",
    scoreAtPurchase: 88,
    verdictAtPurchase: "green",
    analysisModel: "buffett_quality_v1",
    constitutionVersion: "buffett_quality_v1",
    thesisSnapshot: { companyName: "Microsoft" },
    ...overrides,
  };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("createFilePurchaseSnapshotRepository", () => {
  // 1.4.1. SAVES SNAPSHOTS UNDER PORTFOLIO MODE AND HOLDING FILE ....................................
  it("saves snapshots under portfolio mode and holding file", async () => {
    const repository = await createTempRepository();
    await repository.save(snapshot(), "cid-file-001");

    const filePath = path.join(temporaryDirectories[0]!, "paper", "Microsoft.json");
    const content = await readFile(filePath, "utf8");
    const parsed = JSON.parse(content);

    assert.deepEqual(Object.keys(parsed), ["trade-01"]);
    assert.equal(parsed["trade-01"].ticker, "Microsoft");
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. APPENDS A SECOND TRADE INTO THE SAME HOLDING FILE ........................................
  it("appends a second trade into the same holding file", async () => {
    const repository = await createTempRepository();
    const directory = temporaryDirectories[0]!;
    await repository.save(snapshot({ clientOrderId: "trade-01" }), "cid-file-002");
    await repository.save(
      snapshot({
        clientOrderId: "trade-02",
        quantity: 3,
        submittedAt: "2026-08-18T10:05:00.000Z",
      }),
      "cid-file-003",
    );

    const latest = await repository.findLatestByTicker("Microsoft", "paper", "cid-file-004");
    const filePath = path.join(directory, "paper", "Microsoft.json");
    const content = JSON.parse(await readFile(filePath, "utf8"));

    assert.deepEqual(Object.keys(content).sort(), ["trade-01", "trade-02"]);
    assert.equal(latest?.clientOrderId, "trade-02");
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. KEEPS PAPER AND LIVE FILES SEPARATE ......................................................
  it("keeps paper and live files separate", async () => {
    const repository = await createTempRepository();
    await repository.save(snapshot({ mode: "paper" }), "cid-file-005");
    await repository.save(snapshot({ mode: "live", clientOrderId: "trade-live-01" }), "cid-file-006");

    const paperSnapshots = await repository.listAll("paper", "cid-file-007");
    const liveSnapshots = await repository.listAll("live", "cid-file-008");

    assert.equal(paperSnapshots.length, 1);
    assert.equal(liveSnapshots.length, 1);
    assert.equal(liveSnapshots[0]!.clientOrderId, "trade-live-01");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. RETURNS AN EMPTY LIST WHEN A MODE HAS NO FILES ...........................................
  it("returns an empty list when a mode has no files", async () => {
    const repository = await createTempRepository();
    const snapshots = await repository.listAll("paper", "cid-file-009");

    assert.deepEqual(snapshots, []);
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

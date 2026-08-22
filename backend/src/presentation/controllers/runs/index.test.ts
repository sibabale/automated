// [ BACKEND > PRESENTATION > CONTROLLERS > RUNS > TESTS ] ###########################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { runsController } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe("runsController", () => {
  it("rejects invalid pagination values", async () => {
    const res = { statusCode: 200, body: null as unknown, status(code: number) { this.statusCode = code; return this; }, json(body: unknown) { this.body = body; return this; } } as any;
    let error: unknown;
    await runsController(
      { query: { page: "0" }, app: { get: () => undefined }, correlationId: "cid" } as any,
      res,
      (value) => { error = value; },
    );

    assert.equal((error as { status: number }).status, 400);
  });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

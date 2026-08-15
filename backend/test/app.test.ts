// [ BACKEND > HTTP > APPLICATION > TESTS ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { once } from "node:events";
import { type AddressInfo } from "node:net";
import { type Server } from "node:http";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createApp } from "../src/app.js";
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ...................................................................................
describe("HTTP application", () => {
  // 1.3.1. SETUP ....................................................................................
  let server: Server;
  let baseUrl: string;

  before(async () => {
    server = createApp().listen(0);
    await once(server, "listening");

    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error === undefined) {
          resolve();
          return;
        }

        reject(error);
      });
    });
  });
  // 1.3.1. END ......................................................................................

  // 1.3.2. HEALTH ENDPOINT ..........................................................................
  it("reports that the service is healthy", async () => {
    const response = await fetch(`${baseUrl}/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  });
  // 1.3.2. END ......................................................................................

  // 1.3.3. UNKNOWN ROUTE ............................................................................
  it("returns the standard error response for an unknown route", async () => {
    const response = await fetch(`${baseUrl}/unknown`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), {
      error: {
        message: "Route GET /unknown was not found",
      },
    });
  });
  // 1.3.3. END ......................................................................................
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################

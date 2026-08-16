// [ BACKEND > HTTP > APPLICATION > TESTS ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { once } from "node:events";
import assert from "node:assert/strict";
import { type Server } from "node:http";
import { type AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { createApp } from "./app.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
// None required — exercises the assembled app over HTTP with no external doubles.
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("HTTP application", () => {
  // 1.4.1. SETUP ....................................................................................
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
  // 1.4.1. END ......................................................................................

  // 1.4.2. REPORTS THAT THE SERVICE IS HEALTHY ......................................................
  it("reports that the service is healthy", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as {
      status?: string;
      correlationId?: string;
    };

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. RETURNS THE STANDARD ERROR RESPONSE FOR ..................................................
  it("returns the standard error response for an unknown route", async () => {
    const response = await fetch(`${baseUrl}/unknown`);
    const body = (await response.json()) as {
      correlationId?: string;
      error?: { message?: string };
    };

    assert.equal(response.status, 404);
    assert.equal(body.error?.message, "Route GET /unknown was not found");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. REUSES AN INBOUND CORRELATION ID AND .....................................................
  it("reuses an inbound correlation id and echoes it on the response", async () => {
    const correlationId = "test-correlation-id";
    const response = await fetch(`${baseUrl}/health`, {
      headers: { "x-correlation-id": correlationId },
    });
    const body = (await response.json()) as { correlationId?: string };

    assert.equal(response.headers.get("x-correlation-id"), correlationId);
    assert.equal(body.correlationId, correlationId);
  });
  // 1.4.4. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

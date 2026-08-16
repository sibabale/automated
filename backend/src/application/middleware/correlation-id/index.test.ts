// [ BACKEND > APPLICATION > MIDDLEWARE > CORRELATION ID > TESTS ] ###################################
//
// Tests for the correlationId middleware. Targets the branches Stryker found
// untested: generating an id when absent, reusing a non-empty inbound header,
// rejecting whitespace-only headers, and echoing the id on the response.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import express from "express";
import { once } from "node:events";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { correlationId } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/**
 * Builds a minimal Express app wired with the correlationId middleware. A log
 * stub is attached first because the middleware calls request.log.child().
 */
function buildTestApp(
  configureRoutes: (app: ReturnType<typeof express>) => void,
): ReturnType<typeof express> {
  const app = express();

  const makeLogStub = (): Record<string, unknown> => {
    const stub: Record<string, unknown> = {
      error: () => {},
      warn: () => {},
      info: () => {},
      debug: () => {},
    };
    stub.child = () => stub;
    return stub;
  };

  app.use((req, _res, next) => {
    (req as any).log = makeLogStub();
    next();
  });

  app.use(correlationId);
  configureRoutes(app);

  return app;
}

async function startServer(app: ReturnType<typeof express>): Promise<{
  baseUrl: string;
  close: () => Promise<void>;
}> {
  const server: Server = app.listen(0);
  await once(server, "listening");
  const { port } = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("correlationId middleware", () => {
  // 1.4.1. GENERATE ID WHEN ABSENT ..................................................................
  it("generates a UUID when no x-correlation-id header is provided", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", (req, res) => {
        res.json({ correlationId: (req as any).correlationId });
      });
    });
    const { baseUrl, close } = await startServer(app);

    const res = await fetch(`${baseUrl}/test`);
    const body = (await res.json()) as { correlationId?: string };

    await close();

    assert.ok(typeof body.correlationId === "string");
    assert.match(body.correlationId!, /^[0-9a-f-]{36}$/);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. REUSE INBOUND ID .........................................................................
  it("reuses a non-empty inbound x-correlation-id header", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", (req, res) => {
        res.json({ correlationId: (req as any).correlationId });
      });
    });
    const { baseUrl, close } = await startServer(app);

    const inbound = "my-trace-id-123";
    const res = await fetch(`${baseUrl}/test`, {
      headers: { "x-correlation-id": inbound },
    });
    const body = (await res.json()) as { correlationId?: string };

    await close();

    assert.equal(body.correlationId, inbound);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. REJECT WHITESPACE ID .....................................................................
  it("generates a new UUID when the inbound header is whitespace only", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", (req, res) => {
        res.json({ correlationId: (req as any).correlationId });
      });
    });
    const { baseUrl, close } = await startServer(app);

    const res = await fetch(`${baseUrl}/test`, {
      headers: { "x-correlation-id": "   " },
    });
    const body = (await res.json()) as { correlationId?: string };

    await close();

    assert.notEqual(body.correlationId, "   ");
    assert.ok(typeof body.correlationId === "string" && body.correlationId.length > 0);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. ECHO ID ON RESPONSE ......................................................................
  it("echoes the correlation id on the response header", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", (_req, res) => {
        res.json({});
      });
    });
    const { baseUrl, close } = await startServer(app);

    const inbound = "echo-me-456";
    const res = await fetch(`${baseUrl}/test`, {
      headers: { "x-correlation-id": inbound },
    });

    await close();

    assert.equal(res.headers.get("x-correlation-id"), inbound);
  });
  // 1.4.4. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

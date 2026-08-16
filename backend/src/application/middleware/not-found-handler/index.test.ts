// [ BACKEND > APPLICATION > MIDDLEWARE > NOT FOUND HANDLER > TESTS ] ################################
//
// Tests for the notFoundHandler middleware. It runs behind the errorHandler so
// the generated 404 is rendered into the standard error body; the assertions
// confirm the method and path are surfaced in the message.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import express from "express";
import { once } from "node:events";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { describe, it } from "node:test";
import type { AddressInfo } from "node:net";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { notFoundHandler } from "./index.js";
import { errorHandler } from "../error-handler/index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/**
 * Builds a minimal Express app where notFoundHandler catches unmatched routes
 * and errorHandler renders the resulting HttpError. A log stub is attached so
 * errorHandler can call request.log.* without throwing.
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

  configureRoutes(app);
  app.use(notFoundHandler);
  app.use(errorHandler);

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
describe("notFoundHandler middleware", () => {
  // 1.4.1. UNMATCHED ROUTE ..........................................................................
  it("returns 404 with the method and path in the message", async () => {
    const app = buildTestApp(() => {});
    const { baseUrl, close } = await startServer(app);

    const res = await fetch(`${baseUrl}/some/path/that/does/not/exist`);
    const body = (await res.json()) as { error?: { message?: string } };

    await close();

    assert.equal(res.status, 404);
    assert.ok(body.error?.message?.includes("GET"));
    assert.ok(body.error?.message?.includes("/some/path/that/does/not/exist"));
  });
  // 1.4.1. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

// [ BACKEND > APPLICATION > MIDDLEWARE > ERROR HANDLER > TESTS ] ####################################
//
// Tests for the errorHandler middleware. Targets the branches Stryker found
// untested: error type discrimination, status-code thresholds, message masking,
// and the correlationId echoed into every error body. Both HTTP-level tests and
// direct unit calls are used so the log-level branch is exercised precisely.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import express from "express";
import { once } from "node:events";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { describe, it } from "node:test";
import type { AddressInfo } from "node:net";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { errorHandler } from "./index.js";
import { correlationId } from "../correlation-id/index.js";
import { HttpError } from "../../../errors/http-error/index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
/**
 * Builds a minimal Express app wired with correlationId and errorHandler. A log
 * stub is attached first so both middleware can call request.log.* safely.
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

/**
 * Builds stub request/response objects so errorHandler can be called directly,
 * recording the log level used and capturing the status and body written.
 */
function makeStubs() {
  const logCalls: Array<{ level: string }> = [];
  const req: any = {
    correlationId: "test-cid",
    log: {
      error: (..._a: unknown[]) => logCalls.push({ level: "error" }),
      warn: (..._a: unknown[]) => logCalls.push({ level: "warn" }),
      info: (..._a: unknown[]) => logCalls.push({ level: "info" }),
      debug: (..._a: unknown[]) => logCalls.push({ level: "debug" }),
    },
  };
  let capturedStatus = 0;
  let capturedBody: unknown = null;
  const res: any = {
    status(code: number) { capturedStatus = code; return this; },
    json(body: unknown) { capturedBody = body; return this; },
  };
  const next: any = () => {};
  return { req, res, logCalls, getStatus: () => capturedStatus, getBody: () => capturedBody, next };
}
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("errorHandler middleware", () => {
  // 1.4.1. HTTP ERROR PASSED THROUGH ................................................................
  it("returns the HttpError's status code and message verbatim", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", () => {
        throw new HttpError(422, "Validation failed");
      });
    });
    const { baseUrl, close } = await startServer(app);

    const res = await fetch(`${baseUrl}/test`);
    const body = (await res.json()) as { error?: { message?: string }; correlationId?: string };

    await close();

    assert.equal(res.status, 422);
    assert.equal(body.error?.message, "Validation failed");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. 400 MESSAGE NOT MASKED ...................................................................
  it("returns 400 for a 400 HttpError without masking the message", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", (_req, _res, next) => {
        next(new HttpError(400, "Bad request: ticker is required"));
      });
    });
    const { baseUrl, close } = await startServer(app);

    const res = await fetch(`${baseUrl}/test`);
    const body = (await res.json()) as { error?: { message?: string } };

    await close();

    assert.equal(res.status, 400);
    assert.equal(body.error?.message, "Bad request: ticker is required");
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. 404 MESSAGE NOT MASKED ...................................................................
  it("returns 404 for a 404 HttpError", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", (_req, _res, next) => {
        next(new HttpError(404, "Not found"));
      });
    });
    const { baseUrl, close } = await startServer(app);

    const res = await fetch(`${baseUrl}/test`);
    const body = (await res.json()) as { error?: { message?: string } };

    await close();

    assert.equal(res.status, 404);
    assert.equal(body.error?.message, "Not found");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. UNEXPECTED ERROR MASKED ..................................................................
  it("returns 500 with a generic message for an unexpected Error", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", () => {
        throw new Error("Database connection refused — internal detail");
      });
    });
    const { baseUrl, close } = await startServer(app);

    const res = await fetch(`${baseUrl}/test`);
    const body = (await res.json()) as { error?: { message?: string }; correlationId?: string };

    await close();

    assert.equal(res.status, 500);
    assert.equal(body.error?.message, "Internal server error");
    assert.equal(typeof body.correlationId, "string");
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. THROWN STRING MASKED .....................................................................
  it("returns 500 for a thrown string (non-Error unexpected failure)", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", (_req, _res, next) => {
        next("plain string error");
      });
    });
    const { baseUrl, close } = await startServer(app);

    const res = await fetch(`${baseUrl}/test`);
    const body = (await res.json()) as { error?: { message?: string } };

    await close();

    assert.equal(res.status, 500);
    assert.equal(body.error?.message, "Internal server error");
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. CORRELATION ID IN ERROR BODY .............................................................
  it("includes correlationId in every error response", async () => {
    const app = buildTestApp((a) => {
      a.get("/test", () => {
        throw new HttpError(503, "Service unavailable");
      });
    });
    const { baseUrl, close } = await startServer(app);

    const correlationIdValue = "err-trace-abc";
    const res = await fetch(`${baseUrl}/test`, {
      headers: { "x-correlation-id": correlationIdValue },
    });
    const body = (await res.json()) as { correlationId?: string };

    await close();

    assert.equal(body.correlationId, correlationIdValue);
    assert.equal(res.headers.get("x-correlation-id"), correlationIdValue);
  });
  // 1.4.6. END ......................................................................................
});

describe("errorHandler log-level branching (direct unit tests)", () => {
  // 1.4.7. ERROR LEVEL FOR 5XX ......................................................................
  it("calls log.error for status >= 500 (kills EqualityOperator >= vs >)", () => {
    const { req, res, logCalls, next } = makeStubs();
    const error = new HttpError(500, "Internal");
    errorHandler(error, req, res, next);
    assert.ok(logCalls.some((c) => c.level === "error"), "status 500 must log at error level");
    assert.ok(!logCalls.some((c) => c.level === "warn"), "status 500 must NOT log at warn level");
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. WARN LEVEL BELOW THRESHOLD ...............................................................
  it("calls log.warn (not log.error) for status 499 — just below the >= 500 threshold", () => {
    const { req, res, logCalls, next } = makeStubs();
    const error = new HttpError(499, "Client closed");
    errorHandler(error, req, res, next);
    assert.ok(logCalls.some((c) => c.level === "warn"), "status 499 must log at warn level");
    assert.ok(!logCalls.some((c) => c.level === "error"), "status 499 must NOT log at error level");
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. NON-HTTP ERROR MASKED ....................................................................
  it("sets status 500 and masks message for non-HttpError (kills isExpected ConditionalExpression)", () => {
    const { req, res, getStatus, getBody, next } = makeStubs();
    errorHandler(new Error("internal secret"), req, res, next);
    assert.equal(getStatus(), 500);
    assert.equal((getBody() as any).error?.message, "Internal server error");
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. HTTP ERROR STATUS VERBATIM ..............................................................
  it("sets the HttpError's status code verbatim for expected errors (kills isExpected branch)", () => {
    const { req, res, getStatus, getBody, next } = makeStubs();
    errorHandler(new HttpError(422, "Unprocessable"), req, res, next);
    assert.equal(getStatus(), 422);
    assert.equal((getBody() as any).error?.message, "Unprocessable");
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. CORRELATION ID FROM REQUEST .............................................................
  it("includes correlationId in the response body from req.correlationId (kills ObjectLiteral)", () => {
    const { req, res, getBody, next } = makeStubs();
    errorHandler(new HttpError(400, "Bad"), req, res, next);
    assert.equal((getBody() as any).correlationId, "test-cid");
  });
  // 1.4.11. END .....................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

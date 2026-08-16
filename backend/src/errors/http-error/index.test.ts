// [ BACKEND > ERRORS > HTTP ERROR > TESTS ] #########################################################
//
// Tests for HttpError. The single mutation survivor was the StringLiteral
// "HttpError" in this.name — we assert it explicitly here alongside the
// other observable properties so every field is under test.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { HttpError } from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
// No external boundaries — HttpError is a pure value class.
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("HttpError", () => {
  // 1.4.1. SETS NAME TO EXACTLY HTTPERROR ...........................................................
  it("sets name to exactly 'HttpError' (kills the StringLiteral survivor)", () => {
    const error = new HttpError(404, "Not found");
    assert.equal(error.name, "HttpError");
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. EXPOSES THE STATUSCODE PASSED TO THE .....................................................
  it("exposes the statusCode passed to the constructor", () => {
    const error = new HttpError(422, "Unprocessable entity");
    assert.equal(error.statusCode, 422);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. EXPOSES THE MESSAGE PASSED TO THE ........................................................
  it("exposes the message passed to the constructor", () => {
    const error = new HttpError(503, "Service unavailable");
    assert.equal(error.message, "Service unavailable");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. IS AN INSTANCE OF ERROR SO ...............................................................
  it("is an instance of Error so it propagates as a standard error", () => {
    const error = new HttpError(500, "Internal");
    assert.ok(error instanceof Error);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. IS AN INSTANCE OF HTTPERROR FOR ..........................................................
  it("is an instance of HttpError for instanceof checks in middleware", () => {
    const error = new HttpError(400, "Bad request");
    assert.ok(error instanceof HttpError);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. PRESERVES DIFFERENT STATUS CODES WITHOUT CONFLATION ......................................
  it("preserves different status codes without conflation", () => {
    const e1 = new HttpError(400, "Bad request");
    const e2 = new HttpError(503, "Unavailable");
    assert.equal(e1.statusCode, 400);
    assert.equal(e2.statusCode, 503);
    assert.notEqual(e1.statusCode, e2.statusCode);
  });
  // 1.4.6. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

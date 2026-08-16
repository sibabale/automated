// [ BACKEND > SERVER > TESTS ] ######################################################################
//
// Tests for getPort — the only exported function from server.ts.
// server.ts has top-level startup side effects so we import only the named
// export; the rest of the module never executes in test context.
//
// Stryker survivors targeted:
//   ConditionalExpression — value === undefined, !isInteger || < 1 || > 65_535
//   EqualityOperator      — port < 1 (vs <= 1), port > 65_535 (vs >= 65_535)
//   LogicalOperator       — || chains in the validation condition
//   StringLiteral         — the error message text

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { getPort } from "./server.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
// None required — getPort is a pure function with no external dependencies.
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("getPort", () => {
  // 1.4.1. RETURNS 3001 WHEN NO VALUE IS ............................................................
  it("returns 3001 when no value is provided (default port)", () => {
    // undefined triggers the early-return branch — kills ConditionalExpression
    assert.equal(getPort(undefined), 3001);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. RETURNS 3001 WHEN PORT ENV VAR ...........................................................
  it("returns 3001 when PORT env var is unset at call time", () => {
    const saved = process.env.PORT;
    delete process.env.PORT;
    assert.equal(getPort(), 3001);
    if (saved !== undefined) process.env.PORT = saved;
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. PARSES A NORMAL PORT STRING CORRECTLY ....................................................
  it("parses a normal port string correctly", () => {
    assert.equal(getPort("8080"), 8080);
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. ACCEPTS PORT 1 ...........................................................................
  it("accepts port 1 — the lower boundary (kills < 1 vs <= 1)", () => {
    // If Stryker changes port < 1 to port <= 1, this test throws and kills the mutant
    assert.equal(getPort("1"), 1);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. ACCEPTS PORT 65535 .......................................................................
  it("accepts port 65535 — the upper boundary (kills > 65535 vs >= 65535)", () => {
    // If Stryker changes port > 65_535 to port >= 65_535, this throws and kills it
    assert.equal(getPort("65535"), 65_535);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. THROWS FOR PORT 0 ........................................................................
  it("throws for port 0 — below minimum (kills EqualityOperator on < 1)", () => {
    // Combined with the port=1 success test above, this nails the < 1 boundary
    assert.throws(
      () => getPort("0"),
      (err: Error) => {
        assert.equal(err.message, "PORT must be an integer between 1 and 65535");
        return true;
      },
    );
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. THROWS FOR PORT 65536 ....................................................................
  it("throws for port 65536 — above maximum (kills EqualityOperator on > 65535)", () => {
    assert.throws(
      () => getPort("65536"),
      (err: Error) => {
        assert.equal(err.message, "PORT must be an integer between 1 and 65535");
        return true;
      },
    );
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. THROWS FOR A NON INTEGER DECIMAL .........................................................
  it("throws for a non-integer decimal (kills !Number.isInteger branch)", () => {
    // 3.14 is a finite number but NOT an integer — exercises the isInteger check
    assert.throws(() => getPort("3.14"), Error);
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. THROWS FOR A NON NUMERIC STRING ..........................................................
  it("throws for a non-numeric string (NaN is not an integer)", () => {
    // NaN is never an integer — ensures the || chain is tested with isInteger=false
    // and the rest of the chain is irrelevant (kills LogicalOperator survivors)
    assert.throws(() => getPort("not-a-number"), Error);
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. THROWS FOR AN EMPTY STRING ..............................................................
  it("throws for an empty string (Number('') === 0, below minimum)", () => {
    assert.throws(() => getPort(""), Error);
  });
  // 1.4.10. END .....................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

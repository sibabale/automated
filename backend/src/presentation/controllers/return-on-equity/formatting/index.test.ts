// [ BACKEND > PRESENTATION > CONTROLLERS > RETURN ON EQUITY > FORMATTING > TESTS ] ##################
//
// Table-driven unit tests for the pure formatting helpers. Every case asserts
// an EXACT string or numeric result and covers both sides of each boundary and
// both directions of each branch, so Stryker's arithmetic, equality/boundary,
// conditional, string-literal, and object-literal mutants all die here rather
// than surviving behind indirect HTTP assertions.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
  formatPercent,
  formatCurrency,
  parsePercentValue,
  calculateConsolidatedSummary,
} from "./index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
// None required — the functions under test are pure and depend only on their inputs.
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("formatPercent", () => {
  // 1.4.1. FORMATS TO EXACTLY ONE DECIMAL AND .......................................................
  it("formats to exactly one decimal and appends '%' (kills StringLiteral '%')", () => {
    assert.equal(formatPercent(12.34), "12.3%");
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. ROUNDS UP AT THE FIRST DECIMAL ...........................................................
  it("rounds up at the first-decimal boundary", () => {
    assert.equal(formatPercent(12.36), "12.4%");
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. KEEPS THE TRAILING ZERO FOR A ............................................................
  it("keeps the trailing zero for a whole number (kills toFixed digit assumptions)", () => {
    assert.equal(formatPercent(100), "100.0%");
  });
  // 1.4.3. END ......................................................................................

  // 1.4.4. FORMATS ZERO AS 0 0 ......................................................................
  it("formats zero as '0.0%'", () => {
    assert.equal(formatPercent(0), "0.0%");
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. FORMATS A NEGATIVE PERCENTAGE WITH ITS ...................................................
  it("formats a negative percentage with its sign preserved", () => {
    assert.equal(formatPercent(-5.5), "-5.5%");
  });
  // 1.4.5. END ......................................................................................
});

describe("formatCurrency", () => {
  // 1.4.6. FORMATS A CLEAR BILLIONS VALUE AS ........................................................
  it("formats a clear billions value as '$X.XXB' (kills StringLiteral 'B' and division)", () => {
    assert.equal(formatCurrency(96_990_000_000), "$96.99B");
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. FORMATS EXACTLY 1E9 AS BILLIONS ..........................................................
  it("formats exactly 1e9 as billions — lower boundary of the B branch (kills >= to >)", () => {
    assert.equal(formatCurrency(1_000_000_000), "$1.00B");
  });
  // 1.4.7. END ......................................................................................

  // 1.4.8. FORMATS JUST BELOW 1E9 AS MILLIONS .......................................................
  it("formats just below 1e9 as millions, not billions (kills boundary negation)", () => {
    assert.equal(formatCurrency(999_999_999), "$1000.0M");
  });
  // 1.4.8. END ......................................................................................

  // 1.4.9. FORMATS A CLEAR MILLIONS VALUE AS ........................................................
  it("formats a clear millions value as '$X.XM' (kills StringLiteral 'M')", () => {
    assert.equal(formatCurrency(2_500_000), "$2.5M");
  });
  // 1.4.9. END ......................................................................................

  // 1.4.10. FORMATS EXACTLY 1E6 AS MILLIONS .........................................................
  it("formats exactly 1e6 as millions — lower boundary of the M branch (kills >= to >)", () => {
    assert.equal(formatCurrency(1_000_000), "$1.0M");
  });
  // 1.4.10. END .....................................................................................

  // 1.4.11. FORMATS JUST BELOW 1E6 AS RAW ...........................................................
  it("formats just below 1e6 as raw dollars, not millions (kills boundary negation)", () => {
    assert.equal(formatCurrency(999_999), "$999999");
  });
  // 1.4.11. END .....................................................................................

  // 1.4.12. FORMATS A SMALL VALUE AS RAW ............................................................
  it("formats a small value as raw whole dollars with the '$' prefix", () => {
    assert.equal(formatCurrency(500_000), "$500000");
  });
  // 1.4.12. END .....................................................................................

  // 1.4.13. FORMATS ZERO AS 0 .......................................................................
  it("formats zero as '$0'", () => {
    assert.equal(formatCurrency(0), "$0");
  });
  // 1.4.13. END .....................................................................................

  // 1.4.14. FORMATS A NEGATIVE BILLIONS VALUE WITH ..................................................
  it("formats a negative billions value with the sign preserved (magnitude picks the suffix)", () => {
    assert.equal(formatCurrency(-2_500_000_000), "$-2.50B");
  });
  // 1.4.14. END .....................................................................................

  // 1.4.15. FORMATS A NEGATIVE MILLIONS VALUE WITH ..................................................
  it("formats a negative millions value with the sign preserved", () => {
    assert.equal(formatCurrency(-2_500_000), "$-2.5M");
  });
  // 1.4.15. END .....................................................................................
});

describe("parsePercentValue", () => {
  // 1.4.16. PARSES A WELL FORMED PERCENTAGE STRING ..................................................
  it("parses a well-formed percentage string back to its number", () => {
    assert.equal(parsePercentValue("12.3%"), 12.3);
  });
  // 1.4.16. END .....................................................................................

  // 1.4.17. PARSES A NEGATIVE PERCENTAGE STRING .....................................................
  it("parses a negative percentage string", () => {
    assert.equal(parsePercentValue("-5.5%"), -5.5);
  });
  // 1.4.17. END .....................................................................................

  // 1.4.18. RETURNS 0 FOR A NON NUMERIC .............................................................
  it("returns 0 for a non-numeric string (kills the NaN ternary true-branch)", () => {
    assert.equal(parsePercentValue("abc%"), 0);
  });
  // 1.4.18. END .....................................................................................

  // 1.4.19. RETURNS THE PARSED NUMBER FOR A .........................................................
  it("returns the parsed number for a valid string (kills the NaN ternary false-branch)", () => {
    assert.equal(parsePercentValue("42.0%"), 42);
  });
  // 1.4.19. END .....................................................................................
});

describe("calculateConsolidatedSummary", () => {
  // 1.4.20. RETURNS THE PLACEHOLDER SUMMARY FOR AN ..................................................
  it("returns the placeholder summary for an empty list (kills conditional false-branch)", () => {
    assert.deepEqual(calculateConsolidatedSummary([]), {
      values: [],
      result: "—",
      denominator: "0",
    });
  });
  // 1.4.20. END .....................................................................................

  // 1.4.21. AVERAGES MULTIPLE VALUES AND FORMATS THE ................................................
  it("averages multiple values and formats the result (kills addition and division mutants)", () => {
    assert.deepEqual(calculateConsolidatedSummary(["10.0%", "20.0%", "30.0%"]), {
      values: ["10.0%", "20.0%", "30.0%"],
      result: "20.0%",
      denominator: "3",
    });
  });
  // 1.4.21. END .....................................................................................

  // 1.4.22. COMPUTES THE MEAN OF TWO VALUES .........................................................
  it("computes the mean of two values (distinguishes '+' from '-' and '/' from '*')", () => {
    assert.deepEqual(calculateConsolidatedSummary(["10.0%", "20.0%"]), {
      values: ["10.0%", "20.0%"],
      result: "15.0%",
      denominator: "2",
    });
  });
  // 1.4.22. END .....................................................................................

  // 1.4.23. HANDLES A SINGLE VALUE WITHOUT DIVIDING .................................................
  it("handles a single value without dividing incorrectly (kills conditional true-branch)", () => {
    assert.deepEqual(calculateConsolidatedSummary(["15.0%"]), {
      values: ["15.0%"],
      result: "15.0%",
      denominator: "1",
    });
  });
  // 1.4.23. END .....................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

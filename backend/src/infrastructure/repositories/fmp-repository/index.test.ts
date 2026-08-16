// [ BACKEND > INFRASTRUCTURE > REPOSITORIES > FMP REPOSITORY > TESTS ] ##############################
//
// Direct table-driven tests for the shared row-reading helpers. The join and
// fetch behaviour of the generic repository is exercised end-to-end by each
// concrete adapter's own tests (financial-data and cash-flow-data); here we pin
// the boundaries of readNumber and readFiscalYear so Stryker's equality,
// boundary, and conditional mutants die against explicit inputs.

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import assert from "node:assert/strict";
import { describe, it } from "node:test";
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { readNumber, readFiscalYear } from "./index.js";
import type { FmpRecord } from "../../clients/fmp-client/index.js";
// 1.2. END ..........................................................................................

// 1.3. MOCKS ........................................................................................
// None required — the helpers are pure functions over a plain record.
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe("readNumber", () => {
  // 1.4.1. RETURNS A FINITE NUMBER UNCHANGED ........................................................
  it("returns a finite number unchanged, including zero and negatives", () => {
    assert.equal(readNumber({ value: 42 } as FmpRecord, "value"), 42);
    assert.equal(readNumber({ value: 0 } as FmpRecord, "value"), 0);
    assert.equal(readNumber({ value: -7 } as FmpRecord, "value"), -7);
  });
  // 1.4.1. END ......................................................................................

  // 1.4.2. REJECTS NON FINITE NUMBERS ...............................................................
  it("returns null for Infinity and NaN (kills the Number.isFinite guard)", () => {
    assert.equal(readNumber({ value: Infinity } as FmpRecord, "value"), null);
    assert.equal(readNumber({ value: NaN } as FmpRecord, "value"), null);
  });
  // 1.4.2. END ......................................................................................

  // 1.4.3. REJECTS NON NUMERIC TYPES ................................................................
  it("returns null for string, null, and missing keys (kills the typeof guard)", () => {
    assert.equal(readNumber({ value: "42" } as FmpRecord, "value"), null);
    assert.equal(readNumber({ value: null } as unknown as FmpRecord, "value"), null);
    assert.equal(readNumber({} as FmpRecord, "value"), null);
  });
  // 1.4.3. END ......................................................................................
});

describe("readFiscalYear", () => {
  // 1.4.4. READS AN EXPLICIT FISCAL YEAR ............................................................
  it("reads an explicit numeric fiscalYear field", () => {
    assert.equal(readFiscalYear({ fiscalYear: "2023" } as FmpRecord), 2023);
  });
  // 1.4.4. END ......................................................................................

  // 1.4.5. REJECTS A FISCAL YEAR AT OR BELOW THE 1900 FLOOR .........................................
  it("rejects an explicit fiscal year of 1900 and below (kills > to >= boundary)", () => {
    assert.equal(readFiscalYear({ fiscalYear: "1900" } as FmpRecord), null);
    assert.equal(readFiscalYear({ fiscalYear: "1901", date: "" } as FmpRecord), 1901);
  });
  // 1.4.5. END ......................................................................................

  // 1.4.6. FALLS BACK TO THE YEAR FROM THE DATE .....................................................
  it("falls back to the leading year of the reporting date when fiscalYear is absent", () => {
    assert.equal(readFiscalYear({ date: "2022-09-30" } as FmpRecord), 2022);
  });
  // 1.4.6. END ......................................................................................

  // 1.4.7. RETURNS NULL WHEN NEITHER SOURCE IS USABLE ...............................................
  it("returns null when there is neither a usable fiscalYear nor a usable date", () => {
    assert.equal(readFiscalYear({ fiscalYear: "bad" } as FmpRecord), null);
    assert.equal(readFiscalYear({ date: "not-a-date" } as FmpRecord), null);
    assert.equal(readFiscalYear({} as FmpRecord), null);
  });
  // 1.4.7. END ......................................................................................
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################

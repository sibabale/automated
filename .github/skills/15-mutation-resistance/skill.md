---
name: mutation-resistance
description: >
  Proactively write source and tests that survive Stryker mutation testing.
  Stryker's mutators are a fixed, documented, mechanical set, so every mutant
  is predictable and can be pre-empted. Use this whenever writing or reviewing
  backend logic and its tests, and before running the mutation suite.
---

# Mutation Resistance

## Purpose

Stryker does not mutate code randomly. It applies a **fixed, documented catalog
of mechanical mutators**. Because the transformation for every construct is
known in advance, a surviving mutant is never a surprise — it is a specific
assertion we failed to write, or a piece of code that should not have been
mutable in the first place.

This skill makes us proactive: for every construct we write, we already know
which mutants Stryker will generate and we pre-write the assertion that kills
each one. The goal is **zero killable survivors from the first run**, not a
guess-and-rerun loop against a 30-minute suite.

---

## The Two Levers

Every improvement to the mutation score comes from exactly one of these. Use
both — most teams only use the first.

1. **Strengthen tests** so each mutant breaks a specific, exact assertion.
2. **Shrink the mutable surface** so there are fewer mutants to kill at all
   (fewer literals, fewer branches, fewer inline magic numbers, no dead code).

---

## Mutator → Kill Map

For each mutator family: what Stryker does to the code, and the test discipline
that guarantees the mutant dies. This table is the checklist — every new unit
of logic must be reviewed against the rows that apply to it.

| Mutator family | What Stryker does | How to guarantee a kill |
| -------------- | ----------------- | ----------------------- |
| **Equality / boundary** (`<`↔`<=`, `>`↔`>=`, `==`↔`!=`, `===`↔`!==`) | Shifts or negates every comparison, including off-by-one boundary swaps | Test **both sides of every boundary**: the exact threshold value *and* one step below/above (e.g. `1_000_000_000` vs `999_999_999`, port `1` vs `0`). One-sided tests always leave a boundary survivor. |
| **Conditional expression** (`if (x)` → `if (true)` / `if (false)`; same for `?:` and loops) | Forces each branch to be always-taken and always-skipped | Provide **one case that only passes when the branch runs and one that only passes when it is skipped**. Every `if`, ternary, and `&&`/`??` short-circuit needs both. |
| **Logical operator** (`&&`↔`\|\|`, `??`→`&&`) | Flips how guard operands combine | Test each operand's effect **independently**: a case where the left is falsy, a case where the right is falsy, and the true path. |
| **Boolean literal / Not removal** (`true`↔`false`, `!(x)`→`x`) | Inverts flags and negations | Assert the observable effect in **both** boolean states; never assert only the default. |
| **String literal** (→ `""` or `"Stryker was here"`) | Blanks or corrupts messages, URL paths, header names, keys, suffixes | Assert **exact** strings — full error messages, the exact request path/URL, header names, `%`/`$`/`B`/`M` suffixes. Never `includes()` a fragment when the whole string is knowable. |
| **Object literal** (`{ a, b }` → `{}`) | Empties returned/config objects | Assert the object **field-by-field** (every property name and value), not just `typeof === "object"` or a length. For an object passed **into a collaborator** (log payload, request params, config), assert it via a **spy** on that collaborator — see "Side-Effect & Collaborator Calls". |
| **Array declaration** (`[1,2,3]` → `[]`) | Empties array literals | Assert array **length and each element**, so removing items fails. This also catches security config such as a logger `redact: […]` list — assert that a secret field is actually scrubbed from emitted output. |
| **Arithmetic / Update** (`+`↔`-`, `*`↔`/`, `%`→`*`, `++`↔`--`) | Corrupts every calculation | Assert **exact numeric outputs** of the computation (formatted values, averages, counters) with fixed inputs — table-driven cases. When the arithmetic is a **sort comparator** (`a - b`), a swap only shows on **out-of-order input** — see "Side-Effect & Collaborator Calls". |
| **Method expression** (`startsWith`↔`endsWith`, `min`↔`max`, `slice`/`filter`/`sort`/`reverse`/`charAt` removal, `toUpperCase`↔`toLowerCase`) | Swaps or deletes a stdlib call | Assert on **content, order, and casing** of the result — a case where the swapped/removed method produces a visibly different value. |
| **Optional chaining** (`a?.b` → `a.b`) | Removes null-safety | Add a test where the receiver is **null/undefined** so removing `?.` throws and fails. |
| **Unary operator** (`-x`↔`+x`, `~x`) | Flips sign / bitwise unary | Assert exact signed results, including negative inputs. |
| **Assignment operator** (`+=`↔`-=`, etc.) | Mirrors arithmetic mutations on compound assignment | Assert the accumulated result after the assignment, with inputs that make the wrong operator visible. |
| **Block statement** (empties a function/loop body) | Deletes all side-effects in a block | Assert the block's **observable side-effect**: a value returned, a log emitted, a header set, a callback invoked. |
| **Regex** (mutates the pattern) | Alters matching behavior | Test a string that matches and one that must **not** match, so a widened/narrowed pattern fails. |

---

## Side-Effect & Collaborator Calls (the #1 survivor class)

A line can be **100% covered and still survive** because coverage proves the
line *ran*, not that its *result was asserted*. In our own suite this pattern
produced the single largest cluster of survivors — every `ObjectLiteral`/
`StringLiteral` mutant on a logging or outgoing call, plus sort comparators and
guard branches whose outcome nobody checked. Reaching a line is table stakes;
**pin its observable effect** or the mutant lives.

- **Logging is an observable side-effect here — assert it.** Our own
  correlation-id discipline declares every log line part of the contract, so a
  `logger.debug({ correlationId, ticker }, "…")` whose payload Stryker blanks to
  `{}` or whose message it blanks to `""` must fail a test. Spy on the logger and
  assert **the message and the bound fields** (at minimum `correlationId`):

  ```ts
  const debug = mock.method(logger, "debug");
  await analyseReturnOnEquity("AAPL", repo, "cid-1");
  assert.deepEqual(debug.mock.calls[0].arguments, [
    { correlationId: "cid-1", ticker: "AAPL" },
    "Analysing return on equity",
  ]);
  ```

  If a given log line is genuinely not worth asserting, it is a **documented
  equivalent mutant** — treat it under "Equivalent Mutants", do not leave it as a
  silent survivor.
- **Assert the arguments passed *into* every collaborator, not just that it was
  called.** A mocked repository or client called with a mutated params object
  (`{ symbol, period, limit }` → `{}`) or a mutated count (`HORIZONS.length *
  YEARS_PER_HORIZON` → something else) survives unless the test inspects the call
  arguments. Assert the exact request params, the exact `limit`/`years`, and the
  endpoint — `assert.deepEqual(getAnnualFinancials.mock.calls[0].arguments, ["AAPL", 12, "cid"])`.
- **Sort comparators need out-of-order input.** `ArrowFunction → () => undefined`
  and `a - b → a + b` on a `.sort()` comparator are invisible when the fixture is
  already ordered — the array looks correct either way. Feed a **deliberately
  shuffled** fixture and assert the fully ordered result so removing or corrupting
  the comparator reorders it.
- **A guard that is reached must have its *outcome* asserted on both sides.**
  `ConditionalExpression → true/false` survives whenever a test enters the branch
  but never asserts the branch-specific result. For every `if`/`?:`/`&&`/`??`,
  write one case that is only correct when the branch runs and one that is only
  correct when it is skipped — e.g. a row with a missing figure must be **absent**
  from the output, a missing header must yield a **generated** id, an equal
  newest/oldest pair must read `"up"`.

---

## Shrinking the Mutable Surface (Lever 2)

- **Centralize literals.** One named, exported constant (error messages, URL
  paths, numeric thresholds) tested once — instead of the same literal mutated
  independently in several places.
- **Extract pure functions.** Move calculation and formatting out of handlers
  into small, **exported** pure functions. Exported pure functions can be
  tested directly with exhaustive table-driven cases, which kills far more
  mutants per test than an indirect HTTP assertion.
- **Delete dead / unreachable defensive code.** Unreachable branches and
  fallbacks produce *equivalent mutants* — survivors you can never kill. Either
  make them reachable and test them, or remove them.
- **Remove guards an upstream invariant already guarantees.** If a value is
  typed `number` and the producer drops rows with missing figures, a downstream
  `x ?? 0` can never take its right side — it is an equivalent-mutant surface.
  Delete it rather than papering over it, and rely on the type + the producer's
  guarantee (verify that guarantee in the producer's own tests). *Real example:*
  the ROE service's `ttmYear.netIncome ?? 0` / `?? 0` on already-numeric domain
  fields were removed once the FMP repository was confirmed to skip null rows.
- **Do not duplicate a default across layers (DRY).** A fallback encoded in both
  the composition root *and* a consumer means the consumer's copy is unreachable
  whenever the root always resolves it — an untestable branch and a second
  source of truth. Keep one owner. *Real example:* `createApp` always sets
  `repositoryFactory`, so the controller's duplicate
  `?? createFmpFinancialDataRepository` was dead; the controller now reads the
  single value the composition root guarantees.
- **Eliminate redundant stdlib calls.** A call that cannot change the result for
  any real input is pure mutable surface. *Real example:* `parseFloat` already
  stops at the first non-numeric char, so `.replace("%", "")` before it was
  dead; removing it deleted two `StringLiteral` survivors outright.
- **Prefer a single well-scoped implementation** over duplicated branching, so
  there is less branching for the conditional/boundary mutators to attack.

---

## Equivalent Mutants

Some survivors are **equivalent mutants**: the mutation cannot change any
observable behavior (e.g. a cosmetic log level, a defensive default that a type
already guarantees). These are not test gaps and must not be chased with fake
tests.

**Prefer elimination over suppression.** The best response to an equivalent
mutant is almost always to *remove the mutable surface* (delete the redundant
guard, dead `.replace`, or duplicated fallback — see "Shrinking the Mutable
Surface"). A deleted construct produces zero mutants and needs no annotation,
zero maintenance, and no reviewer trust. Reach for a disable comment only when
the construct genuinely must stay.

**A disable comment is a last resort, and it is fragile here.** With Stryker's
**command test runner** (this repo's setup), `// Stryker disable next-line`
keys off Stryker's own line numbering, which can be off by one from the file
on disk — so the directive silently lands on the wrong line and the mutant
still **survives** (observed on `parsePercentValue`'s `.replace`). If you must
suppress, verify with a scoped `--reporters clear-text` run that the mutant is
reported `Ignored`, not `Survived`; if it still survives, eliminate the surface
instead.

When a disable comment is truly warranted, it **must** state the mutator and the
reason. "I couldn't kill it" is not a reason; "it is provably equivalent" is:

```ts
// Stryker disable next-line ConditionalExpression: guard is unreachable — `kind` is exhaustive per the union type.
```

---

## Workflow (fast feedback, not a 30-minute guess)

1. **Coverage first, as a prefilter.** Run `pnpm coverage:gate` (c8) to **100%**
   line + branch coverage *before* Stryker. Mutating an un-covered line is
   guaranteed wasted time. Coverage is necessary but **not** sufficient — a
   covered line with a weak assertion still survives. Exclude type-only files
   (interfaces, ports, `.d.ts`) from c8: they compile to zero JS and read as 0%,
   which can never reach the gate (see the Testing skill).
2. **Scope to one file** while hardening it:
   `npx stryker run ./stryker.conf.cjs --mutate <file>`. A scoped run finishes in
   ~1 minute versus 30+ for the whole suite; iterate there before going wide.
3. **Keep the suite fast via config, not `--incremental`.** This repo pins
   **Stryker 4.6.0**, where `--incremental` / `--since` do **not** exist. Speed
   comes from `stryker.conf.cjs`: raise `concurrency`, keep `timeoutMS` tight
   (~15s — the command runner cold-starts nothing so mutants are quick), and
   point the `command` runner straight at the test binary
   (`./node_modules/.bin/tsx --test 'src/**/*.test.ts'`) rather than `pnpm test`.
   The command runner cannot do `coverageAnalysis: 'perTest'`; leave it `off`.
4. **Read survivors from `clear-text` or the JSON report.** The reliable way to
   see every survivor with its exact diff is `--reporters clear-text`. The JSON
   report is now written to `reports/mutation.json` (a sibling of the HTML dir —
   see `jsonReporter.fileName` in `stryker.conf.cjs`) so it is no longer deleted
   by the HTML reporter's baseDir cleanup; parse it for scripted analysis. Treat
   each survivor as a row: read the printed `- original` / `+ replacement`, map it
   to the mutator→kill table, and either write the exact assertion that kills it
   **or** remove the mutable surface.
5. **Never run Stryker while another Stryker run is active**, and never install
   packages or run tests mid-run — it corrupts the sandbox and reports false
   survivors.
6. **Gate in CI** with `thresholds.break` once green, so the score cannot
   regress.

---

## Checklist

Before considering any backend logic "tested":

- [ ] Every comparison is tested on **both** sides of its boundary.
- [ ] Every branch (`if`, `?:`, `&&`, `??`) has a taken-case and a skipped-case.
- [ ] Every user-visible string is asserted **exactly**, not by fragment.
- [ ] Every returned object/array is asserted **field-by-field / element-by-element**.
- [ ] Every object passed **into a collaborator** (log payload, request params,
      config) is asserted via a **spy on that collaborator** — exact fields and
      values, not just that the call happened.
- [ ] Every side-effect **log line** is asserted (message + bound `correlationId`
      / fields), or is a documented equivalent mutant — never a silent survivor.
- [ ] Every `.sort()` comparator is tested with **out-of-order** input so a
      removed/corrupted comparator visibly reorders the result.
- [ ] Every reached guard has its **outcome asserted on both sides** — a covered
      line whose branch-specific result is unchecked is a guaranteed survivor.
- [ ] Every calculation is asserted with **exact** expected numbers, including
      negatives and boundary inputs, via table-driven cases.
- [ ] Every `?.` has a null/undefined case that would throw if removed.
- [ ] Every stdlib method call whose swap/removal changes output is covered by a
      distinguishing value.
- [ ] Calculation/formatting logic lives in **exported pure functions** with
      direct unit tests, not only indirect HTTP assertions.
- [ ] Literals are centralized where duplicated; dead branches, redundant guards
      an upstream invariant already guarantees, and defaults duplicated across
      layers are **removed**, not annotated.
- [ ] Every **reachable** defensive branch has a test: error/`next(error)`
      fallthroughs, empty-collection fallbacks, parse-failure `catch` blocks,
      missing-config/env fallbacks, and injected-override seams.
- [ ] Any remaining survivor is a **documented equivalent mutant** — eliminated
      at the source where possible, otherwise carrying a justified
      `// Stryker disable` comment that a scoped `clear-text` run confirms is
      reported `Ignored` (not `Survived`) — never an untested gap.
- [ ] c8 line + branch coverage is 100% for the file **before** running Stryker.

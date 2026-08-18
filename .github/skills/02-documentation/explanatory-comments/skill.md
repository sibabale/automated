---
name: explanatory-comments
description: Explain non-trivial code in plain layman's English. Once a block crosses a complexity threshold, it must carry a short comment describing what it does and why, so a reader never has to decode the mechanics.
---

# Explanatory Comments

## Purpose

Apply this skill whenever writing or modifying code. Self-documenting names are
the first line of clarity, but names alone cannot explain **why** a block exists
or **how** several interacting statements achieve one outcome. Once code crosses
a threshold of complexity, it must carry a short, plain-English comment so the
next reader understands it without mentally executing it.

This complements — it does not replace — good naming. Simple, obvious code stays
uncommented; the goal is signal, not noise.

---

## The Complexity Threshold

Add a plain-English comment to a block, function, or section when **any** of the
following is true:

- **Non-obvious control flow** — `try` / `catch` / `finally`, retries, early
  returns that guard a subtle case, or branching whose intent is not obvious
  from the condition alone.
- **Concurrency or lifecycle coordination** — timers, `AbortController`, signals,
  locks, debouncing, or anything where *ordering* or *cleanup* matters.
- **Multi-step transformation** — three or more interacting statements that only
  make sense together (building a request, normalising a payload, assembling a
  result).
- **Failure mapping** — translating low-level errors (network, parsing, status
  codes) into domain meaning.
- **Dense expressions** — regular expressions, bitwise math, non-trivial
  arithmetic, or clever one-liners.
- **Side-effect or order sensitivity** — code whose correctness depends on the
  sequence of operations.

Below this threshold — a single assignment, an obvious guard, a self-named call
— **do not** add a comment. Commenting the obvious is a defect, not a virtue.

---

## How To Write The Comment

- **Plain layman's English.** Assume the reader knows the language but not this
  code or its domain. Avoid jargon and internal abbreviations.
- **Explain the *why* and the *outcome*, not the literal syntax.** Describe the
  intent and the effect, not a line-by-line narration of what each token does.
- **Place it above the block** it describes (a leading `//` comment for an inline
  block, or a JSDoc `/** ... */` for a function or exported member).
- **Keep it short** — one to four sentences is usually enough.
- **Keep it true.** When the code changes, update the comment in the same edit
  (see the documentation-maintenance skill).

```ts
// Good — explains intent and outcome in plain English.
// Build the full URL with the ticker and optional filters, then attach the
// secret key last. A timer is armed so a slow call is aborted after the
// configured timeout instead of hanging; the timer is always cleared so it can
// never fire late.
const url = new URL(`${baseUrl}/${endpoint}`);
// ...

// Bad — restates the syntax, adds no understanding.
// Create a new URL and set search params.
const url = new URL(`${baseUrl}/${endpoint}`);
```

---

## Consistency Within A File

If one section of a file explains its complex code (for example a CONFIGURATION
or CLIENT section) and an equally complex sibling section (for example a REQUEST
section) does not, that is an inconsistency to fix. Comparable complexity
deserves comparable explanation.

For backend tests in this repository, preserve the same section separation used
in the incumbent suite: a `TEST CASES` section, then a short headline comment
above each `it(...)` block, followed by a matching `END` line after the block.
This keeps tests scannable and aligned with the rest of the backend files even
when the individual test body is small.

---

## Common Mistakes

Avoid:

- Narrating trivial or self-evident lines.
- Comments that repeat the code in words instead of explaining intent.
- Domain jargon a newcomer could not follow.
- Leaving a complex block uncommented because a simpler sibling was commented.
- Comments that drift out of date after the code changes.

---

## Definition of Done

- [ ] Every block that crosses the complexity threshold has a plain-English
      comment describing what it does and why.
- [ ] Trivial, self-evident code is left uncommented.
- [ ] Comments explain intent and outcome, not literal syntax.
- [ ] Comparable complexity across a file is documented comparably.
- [ ] Comments are accurate for the current code.

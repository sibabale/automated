---
name: object-key-ordering
description: Treat JavaScript object property order as a first-class, observable feature. A backend-only pre-commit script auto-sorts objects marked `@sort-keys`; never mark an object whose order carries meaning.
---

# Object Key Ordering

## Purpose

Apply this skill whenever writing or modifying an **object literal** in
`backend/`. In JavaScript, object property order is **not** cosmetic — the
ECMAScript specification guarantees a defined order (integer-like keys first in
ascending numeric order, then string keys in **insertion order**, then symbols),
and many mechanisms read that order back out. Because order is observable,
reordering it can silently change behaviour.

A backend pre-commit script (`scripts/validate-object-order.js`) can canonically
re-sort object properties, but **only when you explicitly opt in**. This skill
tells you when opting in is safe and when it would introduce a bug.

---

## The Script

- **Location:** `scripts/validate-object-order.js`, run by `.husky/pre-commit`.
- **Scope:** staged `.ts/.tsx/.js/.jsx` files under `backend/` only. Files
  outside `backend/` are never touched.
- **Opt-in marker:** it reorders an object **only** if a `@sort-keys` marker
  appears on the opener line or on a comment / JSDoc line directly above it.
- **Ordering rule:** shortest **key** first; ties broken by shortest **value**
  first; further ties keep original order (stable).
- **Safety guard:** even when marked, it skips any block that is not a plain
  single-line `key: scalar,` map (nested objects, arrays, calls, spreads,
  methods, comments, or `;`-terminated interface/type members are all skipped).

Because the sort runs **at commit time**, any order you rely on at runtime will
be overwritten if the object is marked. Treat marking as a promise that the
order is meaningless.

---

## Rule 1 — Order is first-class; default to leaving it alone

Do **not** add `@sort-keys` by default. An unmarked object keeps exactly the
order you wrote. Only mark objects that are genuinely **order-insensitive lookup
maps** — a set of named constants where no consumer depends on sequence.

```ts
// Good — a pure lookup map, order is a convenience only.
// @sort-keys
export const FMP_ENDPOINTS = {
  profile: "profile",
  keyMetrics: "key-metrics",
  incomeStatement: "income-statement",
} as const;
```

Placement: a `// @sort-keys` line immediately above the declaration, or a
`@sort-keys` line inside the object's JSDoc.

---

## Rule 2 — Never mark order-significant objects

If any of the following is true, the object's order carries meaning. **Do not
mark it**, and if a teammate or tool proposes marking it, override that decision
and explain why. These are all plain scalar maps, so the safety guard will not
protect them — only the absence of the marker will.

| Category | Why order matters | Example |
|---|---|---|
| **CSS-in-JS / style objects** | Shorthand vs longhand override follows source order | `{ margin: "0", marginTop: "10px" }` — reordering flips the cascade |
| **ORM `orderBy` clauses** | Defines SQL sort *precedence* | `{ createdAt: "desc", id: "asc" }` — reordering changes results |
| **Signed / hashed JSON** | `JSON.stringify` output is byte-compared (HMAC, webhook signatures, ETags, cache keys, canonical JSON) | reordering breaks the signature |
| **Iteration-driven output** | `Object.keys/entries/values`, `for...in`, `{...spread}` emit in order | table columns, CSV headers, form fields, `<select>` options |
| **Destructuring with dependent defaults** | A later default references an earlier binding | `const { a: x = 1, b: y = x } = ...` |
| **Fixtures / snapshots** | Snapshot tests compare serialized order | reordering fails the snapshot |

When in doubt, **do not mark it**. The cost of leaving an order-insensitive
object unsorted is nil; the cost of sorting an order-significant one is a silent
bug.

---

## Rule 3 — When you add a marker, verify no consumer depends on order

Before adding `@sort-keys`, confirm the object is never:

- serialized and signed/hashed/compared as a string,
- iterated to produce ordered output,
- used as an ORM sort or CSS declaration,
- destructured with defaults that reference earlier keys.

If all of those are false, the object is a safe lookup map and may be marked.

---

## Checklist

Before finishing any change that adds or edits an object literal in `backend/`:

- [ ] The object is left **unmarked** unless it is a pure, order-insensitive
      lookup map.
- [ ] No `@sort-keys` marker sits on a CSS object, `orderBy`, signed payload,
      iteration-ordered map, or destructuring pattern.
- [ ] If a marker was added, every consumer was checked and none depends on
      insertion order.
- [ ] The marker is placed on a line comment above the declaration or inside its
      JSDoc.

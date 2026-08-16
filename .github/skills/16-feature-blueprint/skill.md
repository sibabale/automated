---
name: feature-blueprint
description: >
  The canonical recipe for building a company financial-metric analysis feature
  end to end, from the Financial Modeling Prep data source through the backend
  layers to the rendered detail page. Return on equity is the reference
  implementation. Use this whenever adding a new metric endpoint (for example
  free cash flow, return on invested capital, gross margin) so every feature is
  produced the same way, by a person or an autonomous agent.
---

# Feature Blueprint

## Purpose

A "feature" in this repository is one **financial-metric analysis**: the user
enters a stock ticker, the backend fetches the company's reported figures from
the external provider, computes the metric across time horizons, and the
frontend renders it on a detail page. Return on equity is the first, fully
built example — this blueprint turns it into a repeatable pattern so the next
metric is assembled by filling in a formula and copy, not by inventing
architecture.

This skill is the **map**. It names every file a feature touches, the three
seams that wire it in, what is shared versus written per feature, the order to
build in, and the automated checks that define "done". Follow it top to bottom
and the result matches the reference feature by construction.

The reference feature to copy from, at every layer:

- Backend: `backend/src/**/return-on-equity/**`, plus the FMP client, the
  financial-data repository, and the domain entity/port.
- Frontend: `frontend/redux/slices/return-on-equity.slice.ts`, its selectors,
  the `/api/analysis/return-on-equity` route, and the `/details/[metric]` page.

---

## The Feature Contract

Every metric feature honours the same request and response contract. Do not
invent a new shape; a new metric only changes the numbers and the field names
inside `data`.

- **Request:** `GET /analysis/<metric-slug>?ticker=SYMBOL` (backend), proxied by
  the same-origin `GET /api/analysis/<metric-slug>?ticker=SYMBOL` (frontend).
- **Success response body:**

  ```jsonc
  {
    "correlationId": "…",
    "data": {
      "ticker": "AAPL",
      "horizons": [
        { "label": "…", "range": "…", "value": "…",
          "breakdown": [{ "period": "2023", "value": "…" }],
          "trend": "up" }
      ],
      "consolidatedSummary": { "values": ["…"], "denominator": "…", "result": "…" },
      "trailingTwelveMonthsActuals": { /* metric-specific labelled figures */ }
    }
  }
  ```

- **Errors:** the controller maps provider failures to HTTP status codes
  (`not-found → 404`, `rate-limit → 429`, `timeout → 504`, otherwise `502`) and
  missing input to `400`. The frontend thunk maps those back to a
  `kind`/`message` pair for the UI. Keep this mapping identical across metrics.

The **only** part of `data` that varies per metric is `trailingTwelveMonthsActuals`
(its labelled figures reflect the formula's inputs) and the numbers themselves.
`horizons` and `consolidatedSummary` are metric-agnostic.

---

## Shared Platform vs. Per-Feature

Build the per-feature column; never rewrite the shared column.

| Concern | Shared (reuse as-is) | Per feature (write new) |
| --- | --- | --- |
| Data transport | `infrastructure/clients/fmp-client` | — |
| Domain record | `domain/entities/financial-year.entity.ts`, `domain/repositories/financial-data.repository.ts` | new reported fields the formula needs (extend the entity/port) |
| Data adapter | the FMP fetch/guard mechanics | the statement + field mapping for this metric's inputs |
| Business logic | the horizon-grouping / averaging / trend / consolidation engine | the **pure formula** for one year, and the metric's required-field list |
| HTTP edge | `errors/http-error`, error-status mapping, correlation id | the controller DTO shaping + formatting for this metric |
| App wiring | middleware, logger, `createApp` | one route-registration line |
| Frontend shell | theme, redux store, atoms/molecules/organisms, `[metric]` page shell | slice, selectors, api route, registry entry |
| Verification | c8 gate, Stryker, pact harness, Playwright | the metric's tests, fixtures, and contract |

If a "per feature" item starts to look identical across two metrics, that is a
signal to **promote it into the shared column** (see "Generalisation Rule").

---

## Backend File Manifest

For metric slug `<metric>` (kebab-case, e.g. `free-cash-flow`):

1. `domain/entities/financial-year.entity.ts` — **shared.** Confirm it already
   carries the reported figures the formula needs; if not, add the new numeric
   fields here (reported facts only, never derived metrics).
2. `domain/repositories/financial-data.repository.ts` — **shared** port. Extend
   only if a metric needs a genuinely new fetch shape.
3. `infrastructure/clients/fmp-client/index.ts` — **shared.** Add a new entry to
   `FMP_ENDPOINTS` only when the metric's inputs come from a statement not
   already fetched (e.g. the cash-flow statement).
4. `infrastructure/repositories/fmp-financial-data/index.ts` — map the provider
   rows for this metric's inputs into `FinancialYear`, excluding malformed rows.
5. `application/services/<metric>/index.ts` — the **pure formula** for a single
   year plus the horizon analysis, reusing the shared engine. This is the heart
   of the feature and must be exhaustively unit-tested.
6. `presentation/controllers/<metric>/index.ts` and
   `presentation/controllers/<metric>/formatting/index.ts` — translate the
   numeric analysis into the response contract and map provider errors.
7. `app.ts` — **seam:** register `app.get("/analysis/<metric>", <metric>Controller)`.
8. Colocated `index.test.ts` next to every file above (and
   `formatting/index.test.ts`).
9. `test/` — a consumer contract test and fixtures when the metric introduces a
   new provider endpoint.

## Frontend File Manifest

1. `app/api/analysis/<metric>/route.ts` — same-origin proxy to
   `/analysis/<metric>` (copy the ROE route; only the path changes).
2. `redux/slices/<metric>.slice.ts` — status/data/error state, the fetch thunk,
   and the reducers (copy the ROE slice; rename and adjust the metric-specific
   `actuals` fields).
3. `redux/selectors/<metric>.selectors.ts` — status, data, empty, and error
   selectors.
4. `data/financial-metrics.ts` — **seam:** add the registry entry (slug, label,
   copy, formula/education content).
5. `app/details/[metric]/page.tsx` — **seam:** map the slug to this metric's
   thunk and selectors (see the page's registry mapping).
6. Reused organisms/molecules: `formula-section`, `consolidation-summary`,
   `detail-lead-section`, `educational-section`, `horizon-card` (+ its loading,
   empty, error states). Do not fork these; drive them with props.

---

## The Three Seams

Wiring a feature in is exactly three edits. If adding a metric requires touching
more than these plus the per-feature files above, the abstraction has leaked —
fix the leak rather than copy-pasting around it.

1. **Backend route** — one line in `backend/src/app.ts`.
2. **Frontend registry** — one entry in `frontend/data/financial-metrics.ts`.
3. **Frontend page mapping** — one slug → slice/selectors entry in
   `frontend/app/details/[metric]/page.tsx`.

---

## Build Order

Build outside-in on the backend (data → domain → logic → edge → wire), then the
frontend, testing each layer as you go rather than at the end.

1. **Domain** — ensure the entity exposes the fields the formula consumes.
2. **Infrastructure** — ensure the adapter (and client endpoint) fetch those
   fields; add a contract test for any new endpoint.
3. **Application** — write the pure per-year formula, then feed it through the
   shared horizon engine. Unit-test the formula with table-driven cases first.
4. **Presentation** — shape the DTO and map errors; format at this edge only.
5. **Wire** the backend route seam.
6. **Frontend** — api route → slice → selectors → registry entry → page mapping.
7. **Verify** end to end with the Definition of Done below.

---

## Definition of Done

A feature is complete only when every gate below is green. These are the checks
an autonomous agent runs to self-approve before requesting human review.

- [ ] Every new backend file follows the template structure (banner, sections,
      `// END FILE`) and passes the pre-commit validators.
- [ ] Backend tests pass and cover this feature's success **and** unhappy paths
      (see the Testing skill): malformed rows excluded, provider errors mapped,
      boundaries asserted.
- [ ] `pnpm coverage:gate` is a green **100%** for the changed backend files.
- [ ] `pnpm mutation` meets the break threshold; new survivors are killed or
      documented as equivalent (see the Mutation Resistance skill).
- [ ] The consumer contract (`pnpm verify-pacts`) passes for any new provider
      endpoint.
- [ ] Frontend slice and selectors are unit-tested, including the error kinds.
- [ ] `/details/<metric>` renders with loading, empty, and error states verified
      in a browser (see the UI Verification skill).
- [ ] The change is committed as small, focused commits (see the Commit Size and
      Conventional Commits skills).

---

## Generalisation Rule

The blueprint stays cheap to follow only if the shared column keeps absorbing
what repeats. When you build the **second** consumer of any pattern and find
yourself copying more than names and copy:

- Extract the repeated logic into the shared column (a shared engine, a base
  proxy, a slice factory) and make both metrics consume it.
- Prove the abstraction with two real consumers, never one — the second metric
  is the cheapest place to discover a wrong seam.
- Update this blueprint and the three-seam list if the seams move.

Do not pre-generalise a pattern that has only one consumer; wait for the second.

---

## Related Skills

- **Scaffolding** — never write a new file from scratch; copy the template.
- **Testing the Public Interface** and **Mutation Resistance** — the testing bar
  every layer must clear.
- **Component Craft**, **Component States**, **Surface Integrity** — the
  frontend rendering standards for the detail page and its sections.
- **Commit Size** and **Conventional Commits** — how to land the work.

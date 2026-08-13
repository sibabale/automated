# Feedback Learning Log

Accepted lessons are reusable project knowledge. Candidates require more
evidence; superseded lessons are retained for traceability.

## Preserve visible loader boundaries

- **Status:** accepted
- **Confidence:** explicit
- **Trigger:** When a component with a visible card, quote, table, or nested
  control boundary renders a loading state.
- **Rule:** Reuse the loaded boundary or render an equivalent themed boundary
  in the loader so loading and loaded layouts preserve the same structure.
- **Original request:** Build loading states that approximate their rendered
  components across responsive viewports.
- **Corrective feedback:** Content loaders initially omitted visible
  horizon-card and educational quote boundaries; feedback explicitly required
  those borders to remain present.
- **Applies to:** `component-states`, `component-craft`, and UI loading-state
  implementations.
- **Does not apply to:** Components without a visible boundary, or a user
  request to intentionally simplify a loading state.

---
name: component-states
description: >
  Defines the required colocated loading, empty, and error components for
  asynchronous or collection-driven user interfaces.
---

# Component States

## Purpose

Loading, empty, and error experiences are public component behavior. Model them
as colocated components so they stay aligned with the primary component rather
than becoming page-specific fallbacks.

## Required Files

For a component at `components/<layer>/example-card/example-card.tsx`, create:

- `example-card.loading.tsx`
- `example-card.empty.tsx`
- `example-card.error.tsx`

These files share the primary component's existing:

- `example-card.styles.ts`
- `example-card.test.tsx`

Do not create `*.loading.styles.ts`, `*.empty.styles.ts`, `*.error.styles.ts`,
or state-specific test files.

## Required Workflow

1. Read the primary component, its styles, and its test suite.
2. Read the matching state template and worked example in
   `components/templates/components/`.
3. Scaffold the three state files from their canonical templates, preserving
   the header and every section marker.
4. Add shared state primitives only to the primary component's `*.styles.ts`.
5. Extend the primary component's `*.test.tsx` with public-interface coverage
   for each supported state.

## State Contracts

### Loading

- Use `react-content-loader` for SVG skeletons; do not hand-roll skeleton
  animations with CSS.
- Match the primary component's content hierarchy rather than using a generic
  spinner.
- Render loading states within the same responsive container, grid, and gutters
  as the loaded component. The loading state must preserve the loaded
  component's width and height at every breakpoint so replacing it causes no
  layout shift.
- Place skeleton shapes where the loaded labels, headings, values, dividers,
  and body copy will render. Approximate each visible element's width, height,
  row position, gaps, and responsive reflow; do not use a generic skeleton
  arrangement inside an otherwise correctly sized container.
- Treat responsive approximation as part of constructing the loader, not a
  later polish pass. Define skeleton geometry for every supported viewport at
  the same time as the loaded component: each breakpoint must mirror its own
  loaded columns, rows, ordering, wrapping, and element positions.
- When skeletons stand in for text, size their height and line placement from
  the loaded component's viewport-specific typography so typography scaling and
  loader approximation stay aligned.
- Provide a descriptive loader title and a `role="status"` container.
- Use a stable `uniqueKey` to avoid server/client SVG identifier mismatches.
- Read loader colors from the styled-components theme.
- At each supported viewport, compare the loaded component and its loader in
  the browser using their bounding rectangles. Verify that corresponding
  regions preserve their left/top position, width, height, and column ratio;
  correct the loader’s grid, flex basis, or absolute placement when those
  measurements diverge. Do not approve approximation from skeleton content
  alone.
- When a loader’s viewBox is narrower than its responsive container, set
  `preserveAspectRatio="none"` so its skeleton uses the full available width
  instead of centering in the card.

### Empty

- State clearly what is unavailable and what the user can do next.
- Render an optional action only when both its label and callback are supplied.
- Reuse the primary component's shared state container and typography styles.

### Error

- Use `role="alert"` so failures are announced to assistive technology.
- Provide a concise, recovery-oriented message.
- Render a retry button only when a retry callback is available.
- Keep technical error details out of the default user-facing copy.

## Testing

State coverage belongs in the main component test file:

- Loading: verify the status container and accessible loading description.
- Empty: verify explanatory text and any supplied action.
- Error: verify the alert role, recovery text, and retry callback.

Use stable component-prefixed test IDs. Test visible behavior, not generated SVG
paths, styled-components class names, or implementation details.

## Checklist

- [ ] State file names use `<component>.loading.tsx`, `<component>.empty.tsx`,
      and `<component>.error.tsx`.
- [ ] The state files import shared styles from `<component>.styles.ts`.
- [ ] Loading uses `react-content-loader`.
- [ ] Loading and loaded content have matching responsive dimensions.
- [ ] Skeleton shape positions approximate the loaded element geometry.
- [ ] Each supported viewport has skeleton geometry matching that viewport's
      loaded layout and reflow.
- [ ] Empty and error actions are optional and callback-gated.
- [ ] Accessible status and alert semantics are present.
- [ ] Tests are added to the primary component test file.

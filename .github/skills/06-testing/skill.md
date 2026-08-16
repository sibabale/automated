---
name: testing-public-interface
description: >
  Requires tests to verify user-observable public interfaces rather than
  implementation details. All new tests must use the canonical test template
  and example in components/templates/tests/.
---

# Testing the Public Interface

## Purpose

Tests must verify behavior a user or consuming component can observe through a
public interface. A test should remain valid when internals are refactored,
provided the user-facing behavior and supported API do not change.

---

## Required Workflow

Before writing a new test:

1. Read `components/templates/tests/index.test.temaplate.ts`.
2. Read `components/templates/tests/index.test.example.ts`.
3. Copy the template as the test-file skeleton, preserving its section markers.
4. Identify the unit's public interface: props, accessible output, user
   interactions, callbacks, and observable side effects.
5. Write assertions only against that interface.

When a component has colocated loading, empty, and error components, keep their
coverage in the primary component's test file. Verify loading status semantics,
empty-state copy and actions, error alert semantics, and retry callbacks.
Inspect loading states at every supported breakpoint with the available browser
tooling as part of implementing the loader, not after it is otherwise complete.
Confirm each viewport's container, skeleton geometry, ordering, and reflow
approximate that viewport's loaded component without layout shift.

Inspect responsive typography at every supported viewport alongside layout:
font size, line-height, wrapping, and hierarchy must scale proportionally and
keep text readable without clipping, overflow, or unintended composition
changes.

For a grid or table with variable-length values, validate the longest
presentation-ready value at compact, tablet, and desktop widths. Treat clipped,
overlapping, or low-contrast values as a failed responsive-content case. Verify
that table body values use the theme's readable primary text token unless a
separate, documented semantic color token is intentionally applied.

Use `@testing-library/react` and prefer `userEvent` for realistic interactions.
Use `fireEvent` only when `userEvent` cannot represent the required browser
event.

---

## Stable Test Attributes

Every HTML element that a test targets must have a stable `data-testid`
attribute in component JSX. These attributes are the component's test
interface: they remain unchanged when copy, styles, accessible labels, roles,
or surrounding markup change.

- Use lowercase, hyphenated, component-prefixed names:
  `header-menu-toggle`, `header-mobile-navigation`.
- Add a test ID to the component container when the container itself is tested:
  `data-testid="header"`.
- Add test IDs to each nested element that a test targets.
- Use `getByTestId`, `queryByTestId`, or `within(...).getByTestId` as the
  primary locator.
- Assert roles, labels, and ARIA attributes separately when accessibility is
  part of the behavior being tested.

---

## What Is Public

For a React component, public behavior includes:

- Rendered text, elements, and accessible roles, names, and states.
- Props and callback contracts.
- Keyboard, pointer, and form interactions.
- Navigation and externally observable side effects.
- User-visible state changes, including error, loading, and empty states.

It does **not** include:

- React state variables or setter functions.
- Internal helper functions.
- Hook ordering or implementation.
- Styled-components class names or generated CSS hashes.
- DOM nesting used only for layout.
- Private component composition.

---

## Negative, Boundary, and Responsive-Content Cases

Every component test suite must cover relevant user-visible exceptions and
boundary conditions, not only the default success path. Prioritize cases that
would otherwise make the interface unusable, misleading, clipped, or
unreadable.

For content-driven components, include representative adverse values such as:

- Long titles, labels, names, and descriptions.
- Long classifications, categories, or metadata.
- Large but presentation-ready values, such as `$289.45B`.
- Empty, unavailable, error, or loading values when the component supports
  them.

Text wrapping, clipping, and overlap at small viewports are public behavior.
When a component can receive variable-length content, test that each
user-visible value remains exposed through its own stable test element. Where
layout behavior is in scope, also inspect the component at the smallest
supported viewport using the repository's available browser tooling.

Do not write a unit test that claims a specific line break occurred: JSDOM does
not perform browser layout. Instead, test the long-content public contract in
the component suite and validate the real responsive layout in a browser.

---

## Good Examples

### Assert accessible output

```tsx
render(<Header />);

expect(
    screen.getByTestId('header-menu-toggle'),
).toBeVisible();
```

### Test a user interaction and its visible result

```tsx
const user = userEvent.setup();

render(<Header />);

await user.click(
    screen.getByTestId('header-menu-toggle'),
);

expect(
    screen.getByTestId('header-mobile-create-account'),
).toBeVisible();
expect(
    screen.getByTestId('header-menu-toggle'),
).toHaveAttribute('aria-expanded', 'true');
```

### Test a callback contract

```tsx
const onSave = vi.fn();
const user = userEvent.setup();

render(<ProfileForm onSave={onSave} />);

await user.click(screen.getByRole('button', { name: /save profile/i }));

expect(onSave).toHaveBeenCalledWith(expectedProfile);
```

---

## Bad Examples

### Do not inspect private state

```tsx
// Bad: isMobileMenuOpen is an implementation detail.
expect(wrapper.state('isMobileMenuOpen')).toBe(true);
```

Instead, click the public control and verify the visible menu and accessible
expanded state.

### Do not assert generated styling implementation

```tsx
// Bad: generated class names are not a public contract.
expect(screen.getByText('Pricing')).toHaveClass('sc-gtcAsU');
```

Instead, assert the item is visible, accessible, or responds to interaction as
the user expects.

### Do not call private helpers directly

```tsx
// Bad: toggleMobileMenu is not a consumer-facing API.
component.toggleMobileMenu();
```

Instead, invoke the button that exposes the behavior to users.

### Do not test only the default content

```tsx
// Bad: this verifies only the easiest input and misses the responsive risk.
render(<ReportHeader companyName="Apple Inc." />);
expect(screen.getByTestId('report-header-title')).toHaveTextContent('Apple Inc.');
```

Instead, provide a realistic long value and assert every affected public
element remains available:

```tsx
render(
    <ReportHeader
        companyName="International Business Machines Corporation"
        sector="Information Technology Services and Consulting"
        valuation="$289.45B"
    />,
);

expect(screen.getByTestId('report-header-title')).toHaveTextContent(
    'International Business Machines Corporation',
);
expect(screen.getByTestId('report-header-sector')).toBeVisible();
expect(screen.getByTestId('report-header-valuation')).toHaveTextContent(
    '$289.45B',
);
```

---

## Query Strategy

Use a stable `data-testid` as the primary locator. Use accessibility queries
and assertions when testing the accessibility contract itself.

1. `getByTestId` for a stable component or nested-element target.
2. `getByRole` with an accessible name when validating role or name behavior.
3. `getByLabelText` when validating a form-control label.
4. `getByText` when text content itself is the behavior under test.

Never use generated class names, CSS selectors, or component instance methods
as test selectors.

---

## Mutation Resistance

Public-interface tests must also be **mutation-resistant**: a test that passes
against the real code but also passes against a mechanically-broken version of
it is a weak test. Backend logic is verified with Stryker mutation testing,
whose mutators are a fixed, documented set, so every mutant is predictable and
can be pre-empted.

Before running the mutation suite, apply the **Mutation Resistance** skill
(`.github/skills/15-mutation-resistance/skill.md`) and its mutator→kill map.
The core disciplines it requires:

- Assert **exact** strings, numbers, and object shapes — never a fragment,
  a length, or a `typeof` check where the full value is knowable.
- Test **both sides of every boundary** and **both directions of every branch**.
- Put calculation/formatting logic in **exported pure functions** with
  table-driven unit tests, not only indirect HTTP assertions.
- Gate to **100%** c8 line + branch coverage **before** running Stryker;
  coverage is the cheap prefilter, mutation is the real check.

### Reaching 100% coverage without gaming it

The gate is 100% for a reason: the last few percent are exactly where the
defensive branches Stryker attacks live. Close them with real tests, not by
lowering the threshold.

- **Test reachable defensive branches, do not just eyeball them.** Each of these
  is a real branch and a real test:
  - error mapping — a repository/service that throws a **generic** `Error`
    (not the typed domain error) must exercise the `next(error)` / 500
    fallthrough, distinct from the mapped typed-error paths;
  - empty-collection fallbacks — an empty input list must exercise the
    zero/placeholder fallback (e.g. empty financials → TTM actuals of `0`);
  - parse-failure `catch` — a `response.json()` that rejects needs a source of
    genuinely malformed bytes (spin up an inline server that returns an invalid
    JSON body; structured mocks that `JSON.stringify` can never trigger it);
  - missing-config fallbacks — an unset env var must hit its default; cover it
    through observable behavior (e.g. unset `FMP_BASE_URL` **and** the API key so
    the pre-fetch guard fires) rather than making a real network call.
- **Exercise every injection seam.** If production code accepts an injected
  factory/override (a test seam), the default-path tests do **not** cover the
  injected branch. Add a test that passes an injected double — both a succeeding
  one and a throwing one — so the seam and the code that reads it are covered.
  *Real gap:* `createApp`'s `repositoryFactory` option was never passed a real
  factory, leaving the assembly branch uncovered until a test injected one.
- **Exclude type-only files from coverage — never write tests for a type.**
  `export interface` files (domain entities, repository ports) and `.d.ts`
  compile to **zero JavaScript**, so c8 reports them as 0% and the 100% gate can
  never go green while they are counted. Add them to `.c8rc.json`'s `exclude`
  with a one-line justification. Before excluding a 0% file, confirm it has **no
  runtime code** (`grep` for `const|function|class` — a pure interface has
  none); exclude the specific files, not whole directories, so future runtime
  code is not silently hidden.

### Unhappy paths and exception handling are first-class, not afterthoughts

The happy path is the smallest part of the contract. Most surviving mutants and
most production incidents live on the paths that reject, skip, fall back, or
throw — so **every** such path needs its own test that asserts the *outcome*,
not merely that the line executed.

- **Assert the excluded/fallback outcome, both directions.** A parser that drops
  malformed rows must be tested with a malformed row and asserted **absent** from
  the result, and with a valid row asserted **present**. A fiscal-year fallback
  that reads `date` when `fiscalYear` is missing needs a row with each shape, and
  a boundary case at the exact threshold (`year > 1900` → test `1900` and
  `1901`). *Real gap:* the FMP repository's `readNumber`/`readFiscalYear` guards
  and the row-skip loops were 100% covered yet never asserted the exclusion, so
  every branch and boundary mutant survived.
- **Every `catch` / error branch asserts the mapped error, exactly.** For each
  thrown or mapped failure, assert the error **type, `name`, `kind`/`code`, and
  message** — a blanked message (`StringLiteral → ""`) or a dropped `this.name`
  must fail. Map each status boundary explicitly (test `400`, not just `>= 400`)
  and cover the "unsupported shape" / default `throw` at the end of a
  discriminating chain with an input that reaches it (e.g. a primitive body, not
  an object or array).
- **Assert what you send to collaborators, not just what you return.** When a
  repository or client is mocked, assert the **arguments** it was called with —
  exact request params (`{ symbol, period, limit }`), the exact `limit`/`years`,
  the endpoint. A mutated outgoing object (`→ {}`) is invisible to a test that
  only checks the return value. Use a spy and assert its recorded call.
- **Assert security-relevant configuration through behavior.** Redaction lists,
  disabled fingerprinting headers, and body-size limits are contract. Assert that
  a secret header is **scrubbed** from emitted logs (`redact: […] → []` must
  fail), that `x-powered-by` is **absent** from responses, and that an oversized
  body is rejected — do not leave these as unasserted config literals.
- **Assert side-effect logs.** Where the correlation-id discipline applies, a log
  call is observable output: spy on the logger and assert the message and bound
  `correlationId`, or record it as a documented equivalent mutant. See the
  Mutation Resistance skill's "Side-Effect & Collaborator Calls".

---

## Checklist

- [ ] Test file was scaffolded from the canonical template.
- [ ] The worked example was read before implementation.
- [ ] Every tested HTML element has a stable, component-prefixed `data-testid`.
- [ ] Assertions target public, observable behavior.
- [ ] Interactions use the same controls a user would use.
- [ ] Tests avoid internal state, helpers, generated classes, and layout-only DOM.
- [ ] The test covers success and relevant user-visible failure or empty states.
- [ ] The test covers relevant negative, boundary, or adverse-content cases.
- [ ] Variable-length content is tested with realistic long values.
- [ ] Responsive-content risks are checked at the smallest supported viewport
      with available browser tooling.
- [ ] Backend logic is mutation-resistant per the Mutation Resistance skill:
      exact assertions, both-sided boundaries, both-directional branches, and
      pure calculation logic tested directly.
- [ ] Reachable defensive branches are tested: generic-error/`next(error)`
      fallthroughs, empty-input fallbacks, parse-failure `catch` blocks, and
      missing-config/env fallbacks.
- [ ] Unhappy paths assert the **outcome** both ways: excluded/malformed inputs
      are asserted **absent**, valid inputs **present**, and each guard boundary
      is tested at its exact threshold.
- [ ] Every `catch`/error branch asserts the mapped error exactly (type, `name`,
      `kind`/`code`, message), and each status/shape boundary reaches its own
      branch (test `400`, the primitive-body default `throw`, etc.).
- [ ] Arguments sent to mocked collaborators are asserted (request params,
      `limit`/`years`, endpoint), not only the returned value.
- [ ] Security config is asserted through behavior: secrets scrubbed from logs,
      `x-powered-by` absent, oversized bodies rejected.
- [ ] Side-effect log lines are asserted (message + bound `correlationId`) or
      documented as equivalent mutants.
- [ ] Every injection seam is exercised with an injected double (both a
      succeeding and a throwing one), not only the default path.
- [ ] Type-only files (interfaces, ports, `.d.ts`) are excluded from c8 with
      justification — never tested as if they were runtime code — and the c8
      gate is a green **100%** before Stryker runs.

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

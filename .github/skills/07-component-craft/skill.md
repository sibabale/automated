---
name: component-craft
description: >
  Defines the repository's component authoring standard: simple, readable JSX;
  isolated styled-components; theme-driven style props; and public-interface
  tests. Use the Header molecule as the concrete reference implementation.
---

# Component Craft

## Purpose

Build components that are simple to read, reuse, and maintain. Prefer
vanilla React and declarative JSX over abstractions, indirection, or
JavaScript-heavy render logic.

The reference implementation is the Header molecule:

- `components/molecules/header/header.tsx`
- `components/molecules/header/header.styles.ts`
- `components/molecules/header/header.test.tsx`

Follow its organization unless the component's requirements genuinely differ.

---

## Required Workflow

When creating or modifying a component:

1. Read the relevant files in the Header reference implementation.
2. Read and scaffold from the canonical component, styles, and test templates
   in `components/templates/`.
3. Keep component markup in `<ComponentName>.tsx`.
4. Keep styled-components in the component's dedicated
   `<component-name>.styles.ts` file.
5. Write or update public-interface tests using the Header test as the
   behavioral reference.
6. For asynchronous or collection-driven content, scaffold
   `<component-name>.loading.tsx`, `<component-name>.empty.tsx`, and
   `<component-name>.error.tsx`. Each state component shares the primary
   component's styles and test suite.
7. Loading states must reuse the primary component's responsive container and
   layout dimensions so they do not shift the page when content resolves.
   Their skeleton shapes must also approximate each loaded element's position,
   dimensions, spacing, and breakpoint-specific reflow. Build and validate
   this approximation across all supported viewports alongside the loaded
   component; responsive loader geometry is not a follow-up task.
8. Before implementation, write a concise requirement inventory from the user
   request and supplied reference. It must identify required content,
   responsive behavior, explicit exclusions, and existing components that may
   be reused. Do not add visualizations, controls, sections, copy, or
   interactions that are not supported by that inventory.

---

## Component Rules

- Use familiar JSX that reads like HTML: semantic elements, direct props, and
  explicit children.
- Keep the render section predominantly JSX.
- Put only the smallest necessary state, event handlers, and local values
  before the render section.
- Keep components close to vanilla React. Use `useState`, props, and simple
  functions before introducing custom hooks, context, reducers, factories, or
  render-prop patterns.
- Use semantic HTML first: `button` for actions, `nav` for navigation, `ul`
  and `li` for lists, and headings for headings.
- Keep public component props small, descriptive, and typed.
- Use `type I<ComponentName> = Record<never, never>` for a no-props typed
  component rather than an empty interface, which violates the repository lint
  rules.
- Extract a child component only when it has a distinct responsibility or is
  reused.
- When that boundary is uncertain, validate the decision against the current
  caller, likely reuse, public props, and testability. Ask the user when the
  choice materially changes the surface or API rather than extracting or
  inlining by assumption.

### Test Attributes

- Add a stable, component-prefixed `data-testid` to every HTML element that is
  targeted by a test.
- Treat test IDs as a public test interface. Do not rename them when changing
  copy, styling, roles, or layout.
- Name test IDs in lowercase hyphenated form, such as `header-menu-toggle` and
  `header-mobile-navigation`.
- Add a test ID to the component container when the container is tested.

### Good

```tsx
const Menu: React.FC<IMenu> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav>
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
            >
                Menu
            </button>
            {isOpen && (
                <ul>
                    {items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}
        </nav>
    );
};
```

### Avoid

```tsx
// Avoid: render logic is hidden behind unnecessary helpers and indirection.
return renderMenu(createMenuState(props, context, handlers));
```

```tsx
// Avoid: complex conditional JavaScript obscures the component's markup.
return condition ? buildPrimaryView() : buildFallbackView();
```

Prefer clear JSX branches when needed:

```tsx
return (
    <section>
        {isLoading ? <p>Loading</p> : <Content />}
    </section>
);
```

---

## Style Rules

- Place visual styling in the dedicated `*.styles.ts` file, not inline style
  objects or long `className` strings in component JSX.
- Use `styled-components` for styles.
- Read design values from `theme` in style interpolations. Do not import a
  static theme object into a component style file.
- Use only typed theme tokens for colors, typography, spacing, and available
  size values. Literal color values and raw `font-size` declarations are not
  permitted in application styles. If the system lacks a semantic token,
  extend the typed theme deliberately before consuming it.
- Use typed, transient style props (for example, `$isOpen`) only when a style
  varies by component state or a public prop.
- Do not put layout-only or visual logic in the component file.
- Define typography mobile-first. Base styles must use the smallest appropriate
  `theme.fontSizes` token, then use `media.up(...)` overrides to increase type
  only when larger viewports have room. Do not preserve desktop-sized type on
  small devices without a deliberate readability requirement.
- Treat typography scaling as part of responsive layout construction, not a
  final polish pass. Define each text role's size, line-height, and wrapping
  behavior for every supported viewport alongside the component layout. Reduce
  type proportionally on narrower viewports when necessary to preserve
  hierarchy, readable measures, and the intended composition without overflow.
- Treat tablet as a first-class composition, not a scaled desktop. Define grid
  column counts, value sizing, and wrapping for compact, tablet, and desktop
  widths independently. Validate the longest supported value before increasing
  a grid's density.

### Good

```tsx
export const Menu = styled.ul<{ $isOpen: boolean }>`
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    gap: ${({ theme }) => theme.spacing.ss};
    color: ${({ theme }) => theme.text.primary};
`;
```

### Avoid

```tsx
// Avoid: bypasses ThemeProvider and duplicates a design token.
export const Menu = styled.ul`
    padding: 16px;
    color: #111827;
`;
```

---

## Motion Design

- Motion is part of component design, not final polish.
- Read `.github/skills/motion/skill.md` before adding or changing animation.
- Follow the Header mobile-menu pattern: use `AnimatePresence` for mounted
  state, Motion variants for entry and exit, and styled Motion elements for
  visual styling.
- Keep variants in the component's data section so JSX stays declarative.
- Wrap animated components in `MotionConfig reducedMotion="user"`.
- Use motion only to explain state, hierarchy, continuity, or feedback.

---

## Test Rules

- Use the Header test as the example for rendering providers and exercising
  user-visible behavior.
- Test what a user can see or do: rendered text, roles, labels, callbacks,
  menu state, and visible outcomes.
- Use `userEvent` for user interactions.
- Query by role and accessible name first.
- Do not test React state, implementation helpers, styled-components class
  names, or layout-only DOM structure.

---

## Simplicity Checklist

- [ ] The component render is understandable as JSX without tracing helpers.
- [ ] Styles are isolated in the component's styles file.
- [ ] Theme values are accessed through styled-component props.
- [ ] No abstraction exists without a current, clear need.
- [ ] Public props and state names explain their intent.
- [ ] Tests verify public behavior using the canonical test template and
      Header test pattern.

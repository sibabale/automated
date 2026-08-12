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
- Extract a child component only when it has a distinct responsibility or is
  reused.

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
- Use typed, transient style props (for example, `$isOpen`) only when a style
  varies by component state or a public prop.
- Do not put layout-only or visual logic in the component file.

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

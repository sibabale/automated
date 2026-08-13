---
name: scaffolding
description: >
  Enforces the use of canonical template files as the mandatory skeleton for
  all new components, styles, and tests. Every new file must be scaffolded
  from the templates in components/templates/ — never written from scratch.
---

# Scaffolding

## Purpose

This skill ensures that **all new files** are created by copying the canonical
template skeletons that live in `components/templates/`. This guarantees
consistent structure, comment conventions, and section ordering across the
entire codebase.

---

## Mandatory Templates

All templates are located at `components/templates/`. There is one template and
one worked example for each file type.

| File type      | Template                                          | Example                                            |
|----------------|---------------------------------------------------|----------------------------------------------------|
| Component      | `components/templates/components/component.template.tsx` | `components/templates/components/component.example.tsx` |
| Loading state  | `components/templates/components/component.loading.template.tsx` | `components/templates/components/component.loading.example.tsx` |
| Empty state    | `components/templates/components/component.empty.template.tsx` | `components/templates/components/component.empty.example.tsx` |
| Error state    | `components/templates/components/component.error.template.tsx` | `components/templates/components/component.error.example.tsx` |
| Styles         | `components/templates/styles/index.styles.template.ts`   | `components/templates/styles/index.styles.example.ts`   |
| Test           | `components/templates/tests/index.test.temaplate.ts`     | `components/templates/tests/index.test.example.ts`      |

---

## Rules

### 1. Always start from the template

When creating a **new component**, **new style file**, or **new test file**:

1. Read the corresponding template file in `components/templates/`.
2. Use it verbatim as the skeleton for the new file.
3. Fill in only what is needed — do not remove sections, reorder them, or
   invent new top-level sections.

When a component supports asynchronous or collection-driven content, scaffold
its colocated loading, empty, and error components from the matching state
templates. These state files reuse the primary component's style and test files.
Loading skeletons must approximate the loaded component's responsive dimensions
and the position, width, height, and spacing of its visible elements at every
supported viewport. Design each breakpoint's loader geometry alongside the
loaded component; never defer responsive approximation until after the base
loader is complete.

When scaffolding responsive components, define mobile-first typography using
the smallest appropriate theme token and scale it proportionally at larger
breakpoints. Font size, line-height, and wrapping are responsive layout inputs,
not post-implementation refinements.

### 2. Preserve every section marker

Every template contains labelled section markers in the form:

```
// 1.1. EXTERNAL DEPENDENCIES ......................................................................
// 1.1. END ........................................................................................
```

These markers **must be preserved** in every file that is created from a
template. Do not collapse, rename, or omit them.

### 3. File header comment

The first line of every file must be the descriptive breadcrumb comment that
identifies where the file lives in the component hierarchy:

```
// [ COMPONENTS > MOLECULES > COUNTER ] ############################################################
```

Replace the breadcrumb segments with the actual atomic design layer and
component name.

### 4. Component conventions

When scaffolding a new component file:

- The interface is named `I<ComponentName>` (e.g. `ICounter`).
- The component is a typed `React.FC<I<ComponentName>>`.
- The component is the **default export**.
- Use standard HTML/JSX elements (`div`, `p`, `button`, `span`, etc.) — **not**
  React Native primitives (`View`, `Text`, `Pressable`).
- Event handlers use the React DOM convention: `onClick`, `onChange`, etc. —
  **not** `onPress`.

### 5. Style file conventions

When scaffolding a new style file:

- Import from `styled-components` — **not** `styled-components/native`.
- Keep all styled component exports inside the `// 1.6. STYLES` section.

### 6. Test file conventions

When scaffolding a new test file:

- Import from `@testing-library/react` — **not**
  `@testing-library/react-native`.
- Use DOM queries (`screen.getByText`, `screen.getByRole`, etc.).
- Use `fireEvent` or `userEvent` from `@testing-library/react` for
  interaction.
- All test cases live inside the `// 1.3. TEST CASES` section.

---

## Quick Reference — Scaffold Checklist

When creating any new file, verify:

- [ ] Skeleton copied verbatim from the correct template in
      `components/templates/`.
- [ ] File header breadcrumb comment is present and accurate.
- [ ] All section markers are present and in order.
- [ ] No React Native primitives or imports are present.
- [ ] Default export is a typed `React.FC` (components only).
- [ ] Imports match the web equivalents (styled-components, @testing-library/react).

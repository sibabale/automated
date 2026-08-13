---
name: ui-verification
description: >
  Verifies user interfaces with a token-conserving DOM-first browser workflow
  for routes, responsiveness, accessibility, themes, and visual decisions.
---

# UI Verification

## Purpose

Use this skill when a task changes a user-visible interface, including layout,
responsive behavior, theme tokens, animation, loading states, navigation, and
accessibility.

The objective is to reduce correction cycles without turning every UI change
into an expensive screenshot-analysis loop.

## Required Context

Before verification, apply:

1. `ai-operating-principles`
2. `feedback-learning`
3. Every task-specific UI skill, such as `component-states`, `component-craft`,
   `motion`, `motion-design`, or `surface-integrity`
4. This skill

Read applicable accepted entries from `feedback-learning/learning-log.md`.
Those lessons refine verification criteria; they do not replace direct evidence.

## Verification Scale

Use the lowest sufficient level. Do not skip a lower level to capture a
screenshot.

| Level | Evidence | Use when |
| --- | --- | --- |
| 0 | Vitest public-interface test | Component output or interaction is sufficient |
| 1 | Playwright DOM and accessibility snapshot | Route, semantics, state, navigation, or persistence is in scope |
| 2 | Playwright responsive viewport assertion | Reflow, visibility, touch targets, or content clipping is in scope |
| 3 | Scoped axe scan | Accessibility semantics or contrast may be affected |
| 4 | One current screenshot | Appearance, spatial alignment, or visual hierarchy cannot be proven structurally |
| 5 | Visual regression baseline | A stable, approved visual contract requires ongoing protection |

## DOM-First, Screenshot-Last Policy

1. Use stable `data-testid` selectors for project-owned targets; use roles and
   accessible names to verify accessibility contracts.
2. Use Playwright assertions and accessibility snapshots for semantics,
   visibility, state, navigation, and interaction.
3. Capture a screenshot only when the decision depends on pixels: alignment,
   proportions, responsive composition, color perception, or visual hierarchy.
4. Capture at most one fresh screenshot per route, state, viewport, and theme
   decision. Reuse it while the page state is unchanged.
5. Do not use screenshots to check text, roles, labels, URLs, loading status,
   or other information available in the DOM.
6. Do not run screenshot loops. After a visual mismatch, inspect the DOM and
   computed layout first; capture a replacement screenshot only after an edit
   changes the visual state.

If visual evidence is needed, capture the smallest relevant element rather than
the whole page. Keep only the current screenshot in agent context; use
Playwright traces and stored test artifacts for historical debugging.

## Browser Workflow

1. Start with the smallest relevant Playwright spec or interactive CLI session.
2. Navigate to the affected route and verify the public DOM contract.
3. Set only the viewports and theme modes affected by the change.
4. Run a scoped axe check when accessibility-relevant markup, color, or
   interaction changes.
5. Escalate to an element screenshot only if structural evidence cannot answer
   the visual question.
6. Add or update a browser regression spec when the behavior is reusable.

Use Chromium for routine local feedback. Add Firefox or WebKit only for a
browser-specific defect or a deliberate cross-browser release check.

## Playwright CLI

Use the project-local Playwright CLI for exploratory agent work:

```bash
pnpm exec playwright-cli open http://localhost:3000
pnpm exec playwright-cli snapshot
pnpm exec playwright-cli find "Theme"
```

Prefer `snapshot`, `find`, and targeted actions. Use `screenshot` only under
the screenshot policy above. Do not install Storybook, a cloud visual platform,
or an MCP server as part of routine verification without an explicit decision.

## Required UI Matrix

For every UI change, record the applicable cases before completing:

- route and user state
- target component state: loaded, loading, empty, or error
- affected viewport: compact, tablet, desktop
- color mode: light, dark
- reduced-motion behavior, when animation changes
- keyboard and screen-reader contract, when interaction changes

Validate only affected cells. State why a cell is out of scope instead of
running the entire matrix by default.

## Completion Checklist

- [ ] DOM-first verification covered the requested behavior.
- [ ] Browser checks used stable project selectors and accessible contracts.
- [ ] Screenshots were used only for unresolved visual questions.
- [ ] Screenshot count stayed within the current-state budget.
- [ ] Relevant viewport, theme, motion, and loading cases were checked.
- [ ] Browser failures retain traces and screenshots for debugging.

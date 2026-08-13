---
name: ui-introspection
description: >
  Probes completed UI features and bounded application flows for interaction,
  state, layout, responsive, and DOM-side-effect regressions.
---

# UI Introspection

## Purpose

Use this skill after implementing or materially changing a user-visible feature.
It challenges the assumption that a rendered interface works in every meaningful
state by exercising it as a user would.

The goal is to find UI bugs before handoff: inert or obscured controls, broken
hover, focus, or pressed feedback, incorrect loading transitions, layout shifts,
lost focus, overflow, navigation mistakes, console errors, and unintended DOM
changes.

This skill supplements `ui-verification`; it does not replace public-interface
tests, accessibility checks, or visual-regression baselines.

## Required Context

Before probing, apply:

1. `ai-operating-principles`
2. `feedback-learning` and applicable accepted lessons
3. Task-specific skills, including `component-states`, `motion`,
   `motion-design`, `surface-integrity`, and `testing-public-interface`
4. `ui-verification`
5. This skill

Identify the completed feature's route, user-visible controls, intended states,
and allowed side effects. Do not infer controls or flows outside that scope.

## Modes

Choose the narrowest mode that can expose the relevant risk.

| Mode | Scope | Use when |
| --- | --- | --- |
| Feature probe | One feature and its direct route or flow | Default after a UI change |
| Flow probe | A named multi-step user journey | Navigation, persistence, or state crosses components |
| Application sweep | The route inventory and primary safe interactions | A release candidate, broad UI refactor, or explicit request |

An application sweep is bounded exploration, not an unbounded crawler. Define
the route inventory, user state, viewport set, and interaction budget before
starting. Split large applications into route groups rather than attempting a
single exhaustive session.

## Safe Exploration Boundary

Explore only reversible, non-destructive interactions by default:

- links, navigation, menus, disclosure controls, tabs, pagination, search,
  filter, theme, and layout controls
- non-submitting form input when it does not write user data
- loading, empty, error, and retry states that are locally controllable

Do not submit forms, delete data, change account settings, trigger payments,
send messages, or call irreversible external actions without explicit approval.
Do not bypass authentication, rate limits, confirmation dialogs, or access
controls. Record blocked paths as untested rather than working around them.

## Feature Probe Workflow

### 1. Build an interaction inventory

From the affected route's public DOM, list the feature's:

- buttons, links, inputs, selects, tabs, menus, dialogs, and keyboard shortcuts
- loaded, loading, empty, error, disabled, and unavailable states
- viewport, color-mode, and reduced-motion variants affected by the change
- expected navigation, persistence, callback, or visible-output effects

Use stable project `data-testid` selectors for owned controls. Verify
accessibility names, roles, and state separately.

### 2. Exercise each control

For every inventoried interactive control, where applicable:

1. Confirm it is visible, enabled when expected, unobscured, and reachable by
   pointer and keyboard.
2. Capture the structural pre-action state: URL, focused element, visible
   feature region, and relevant ARIA state.
3. Exercise the normal action once. Do not repeat actions merely to increase
   coverage.
4. Confirm its public result: navigation, visible state change, loading state,
   persisted preference, callback effect, or recovery state.
5. Verify focus moves or remains where the interaction contract requires.
6. Return the application to a known state before testing the next branch.

For toggle controls, verify both directions. For overlays and menus, verify
opening, closing, Escape behavior where supported, and that focus does not
remain trapped after dismissal. For navigation, verify the destination and the
return path. For loading flows, verify the status is announced and the final
content does not cause an avoidable layout shift.

### 3. Inspect interaction feedback

Check hover, focus-visible, active or pressed, disabled, selected, and loading
feedback only when the control supports that state.

- Use DOM, ARIA state, and computed values first.
- A hover or pressed state must remain perceivable without relying solely on
  color when it communicates a change of state.
- Treat a control that responds to a pointer but cannot receive keyboard focus
  as a defect unless it is intentionally non-interactive.
- Do not require a visual state that the component contract does not define.

Capture one element-level screenshot only when pixel evidence is needed to
answer whether the feedback is visible, aligned, or coherent. Follow the
`ui-verification` screenshot budget.

### 4. Check stability and side effects

Before and after each meaningful action, inspect the affected region for:

- unexpected element removal, duplication, or text changes
- overlay or stacking interference that blocks another control
- viewport, horizontal-scroll, clipping, or scroll-position regressions
- unexpected focus loss or focus escaping a dialog
- console errors, uncaught page errors, and failed first-party requests
- unintended changes outside the feature's declared state boundary

When layout stability is relevant, compare the affected region's bounding
rectangle before, during, and after a loading or interactive transition.
Allow intentional changes required by the interaction; investigate unplanned
movement, reflow, or scroll jumps.

## Responsive and Environment Probes

Test only the affected matrix cells from `ui-verification`:

- compact, tablet, or desktop viewport when the feature reflows
- light and dark mode when theme tokens or contrast change
- reduced motion when animation is introduced or changed
- realistic long content when labels, values, or descriptions are variable

Browser zoom is exploratory evidence, not a substitute for responsive checks.
Use it only when the available browser tooling supports it reliably; otherwise
test the equivalent layout pressure through supported viewport and content
cases. Never claim a zoom level was verified without evidence.

## Application Sweep Workflow

Use this mode only after defining a compact route-and-flow manifest:

1. Group routes by shared shell, feature area, and risk rather than probing
   every route independently.
2. On each route, inspect primary safe controls, one representative loading or
   asynchronous state, and route-local keyboard navigation.
3. Traverse each primary navigation path once, then confirm return navigation
   and state cleanup.
4. Run compact and desktop checks for layout-changing routes; add theme and
   reduced-motion checks only where affected.
5. Stop when the defined interaction budget is met. Expand the manifest only
   for evidence of a cross-route defect.

Avoid random clicking. Each action must test a stated public hypothesis.

## Evidence and Escalation

Use the lowest-cost evidence that proves or disproves a hypothesis:

1. Stable DOM assertions, URL, role, accessible state, and focus checks
2. Playwright CLI snapshot and targeted interaction
3. Scoped axe scan for affected semantics, interaction, or contrast
4. Bounding rectangles and computed layout data for suspected shift or overflow
5. One scoped screenshot for a question the DOM cannot answer
6. Trace, failure screenshot, and console output for a reproducible failure

Do not turn exploratory screenshots into visual baselines. Add a Phase 4
visual-regression baseline only after the visual contract is stable and approved.

## Findings and Fixes

Classify each result as:

- **Verified:** the observed public behavior matches the feature contract.
- **Defect:** reproducible behavior violates the contract or creates a user
  risk.
- **Observation:** a potential inconsistency that requires product or design
  direction.
- **Out of scope:** intentionally untested due to the safe boundary, missing
  environment, or excluded matrix cell.

When explicitly asked for fix-first work, make minimal safe fixes for
high-confidence defects and rerun the smallest reproducing probe. Otherwise,
report defects with the route, precondition, action, observed result, expected
result, and evidence. Do not silently broaden a feature change into an
application refactor.

Turn a reproduced defect into a durable regression test when it has a stable
public contract. Use `testing-public-interface` for component coverage and
Playwright for route-level behavior. Record a `feedback-learning` lesson only
when later corrective feedback proves an execution mismatch or explicit
project preference.

## Token and Runtime Budget

- Start with a feature probe; do not run an application sweep by default.
- Reuse one browser session, route state, and DOM snapshot while unchanged.
- Perform one purposeful action per hypothesis.
- Use screenshots only for unresolved visual questions and retain only current
  image context.
- Preserve traces and failure artifacts for debugging instead of repeatedly
  replaying the same flow.
- Stop investigating when the configured scope is verified or a reproducible
  defect has enough evidence to fix or report.

## Completion Checklist

- [ ] The mode and route or flow scope were stated before exploration.
- [ ] Safe exploration boundaries excluded destructive actions.
- [ ] Every relevant control was tested through its public interface.
- [ ] Applicable hover, focus, pressed, disabled, selected, and loading states
      were checked.
- [ ] Relevant layout stability, focus, overflow, and DOM side effects were
      inspected.
- [ ] Applicable viewport, theme, motion, and long-content cases were covered.
- [ ] Console and first-party request failures were examined for the probed flow.
- [ ] Evidence distinguishes verified behavior, defects, observations, and
      excluded scope.
- [ ] Reproduced defects have focused regression coverage or a documented reason
      it cannot yet be added.

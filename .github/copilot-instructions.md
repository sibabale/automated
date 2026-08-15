# GitHub Copilot Instructions

These instructions apply to **every engineering task** in this repository.

## General Behaviour

Before performing any task:

1. Apply the **AI Operating Principles** skill as the baseline for all reasoning and implementation.
2. Load and apply any additional skills relevant to the task (e.g. Documentation, Engineering Principles, Code Review, Language, Framework, Domain).
3. If multiple skills apply, follow the most specific guidance while remaining consistent with the AI Operating Principles.

## Skill Priority

When multiple skills are relevant, apply them in the following order:

1. AI Operating Principles
2. Engineering Principles
3. Scaffolding (always applied when creating any new component, style, or test file)
4. Component Craft (always applied when creating or modifying components)
5. Surface Integrity (always applied when creating or materially changing a page or page-level section)
6. Component States (always applied when creating or modifying asynchronous or collection-driven components)
7. Motion Design (always applied when creating or modifying animated UI)
8. Testing Public Interfaces (always applied when creating or modifying tests)
9. Observability / Correlation IDs (always applied when logging, returning responses, handling errors, or calling the backend)
10. Object Key Ordering (always applied when writing or modifying object literals in `backend/`)
11. Repository Standards (Documentation, Code Review, Testing, Security)
12. Language-specific Skills
13. Framework-specific Skills
14. Domain-specific Skills

## Expectations

Copilot should:

- Follow established repository conventions.
- Make the smallest change necessary.
- Reuse existing patterns before introducing new ones.
- Never invent project-specific details.
- Ask for clarification when requirements are ambiguous.
- Keep changes maintainable, readable, and production-ready.
- Update documentation when required by repository standards.
- **Always scaffold new components, style files, and test files from the
  canonical templates in `components/templates/`** — never write these files
  from scratch (see the Scaffolding skill).
- **Always apply the Testing Public Interfaces skill when writing or modifying
  tests.** Read both `components/templates/tests/index.test.temaplate.ts` and
  `components/templates/tests/index.test.example.ts`, then test observable
  public behavior rather than implementation details. Include relevant
  negative, boundary, and responsive-content cases rather than testing only
  the happy path.
- **Always apply the Component Craft skill when creating or modifying
  components.** Use the Header molecule as the repository reference for
  simple JSX, isolated styled-components, theme props, and test structure.
- **Always apply the Surface Integrity skill when creating or materially
  changing a page or page-level section.** Inspect incumbent compositions and
  the typed theme before implementation; preserve explicit exclusions; use no
  literal colors or raw font sizes; and define compact, tablet, and desktop
  compositions around the longest supported values. Validate each
  page-versus-component responsibility decision; when it is materially
  ambiguous, ask the user rather than assuming extraction or inlining is
  correct.
- **Always apply the Component States skill when creating or modifying
  asynchronous or collection-driven components.** Scaffold colocated
  `<component>.loading.tsx`, `<component>.empty.tsx`, and
  `<component>.error.tsx` files from the canonical templates. Their styles and
  tests belong to the primary component's existing `*.styles.ts` and
  `*.test.tsx` files. Loading containers must preserve the loaded component's
  responsive width and height to prevent layout shift. Skeleton shapes must
  also approximate the loaded elements' positions, dimensions, gaps, and
  responsive reflow. Build this approximation for every supported viewport
  alongside the loaded component; responsive loader geometry is never an
  afterthought.
- **Treat typography as responsive layout.** Define mobile-first font sizes,
  line-heights, and wrapping with theme tokens, then scale type proportionally
  at larger viewports. Validate each text role across supported viewports while
  building the component; typography must not be deferred as visual polish.
- **Always apply the Motion Design skill when creating or modifying animated
  UI.** Motion is a runtime dependency and transitions must be purposeful,
  reduced-motion aware, and implemented using the repository motion pattern.
- **Always apply the Correlation IDs skill when logging, returning a response,
  handling an error, or calling the backend.** Every backend log line must
  carry a `correlationId`; services receive it as a `string` parameter; success
  and error responses include it; and clients must send the `x-correlation-id`
  header on every request. Reuse the canonical middleware in
  `backend/src/middleware/correlation-id.ts` — never bare `console.*`.
- **Always apply the Explanatory Comments skill.** Once a block of code crosses
  a complexity threshold — non-obvious control flow, concurrency or lifecycle
  coordination, multi-step transformations, failure mapping, or dense
  expressions — document it with a short, plain-English comment describing what
  it does and why. Leave trivial, self-evident code uncommented, and keep
  comparable complexity documented comparably within a file.
- **Always apply the Object Key Ordering skill when writing or modifying object
  literals in `backend/`.** Object property order is a first-class, observable
  feature of JavaScript. A backend-only pre-commit script
  (`scripts/validate-object-order.js`) re-sorts objects **only** when they are
  explicitly marked `@sort-keys`. Add that marker only to order-insensitive
  lookup maps; never mark CSS-in-JS objects, ORM `orderBy` clauses, signed or
  hashed JSON payloads, iteration-ordered maps, or destructuring patterns, and
  override any proposal to mark them.

The AI Operating Principles are the foundation for all engineering tasks and should guide every response and code change.
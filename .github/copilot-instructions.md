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
5. Motion Design (always applied when creating or modifying animated UI)
6. Testing Public Interfaces (always applied when creating or modifying tests)
7. Repository Standards (Documentation, Code Review, Testing, Security)
8. Language-specific Skills
9. Framework-specific Skills
10. Domain-specific Skills

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
  public behavior rather than implementation details.
- **Always apply the Component Craft skill when creating or modifying
  components.** Use the Header molecule as the repository reference for
  simple JSX, isolated styled-components, theme props, and test structure.
- **Always apply the Motion Design skill when creating or modifying animated
  UI.** Motion is a runtime dependency and transitions must be purposeful,
  reduced-motion aware, and implemented using the repository motion pattern.

The AI Operating Principles are the foundation for all engineering tasks and should guide every response and code change.
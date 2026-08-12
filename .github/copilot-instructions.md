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
4. Repository Standards (Documentation, Code Review, Testing, Security)
5. Language-specific Skills
6. Framework-specific Skills
7. Domain-specific Skills

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

The AI Operating Principles are the foundation for all engineering tasks and should guide every response and code change.
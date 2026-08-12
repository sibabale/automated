---
name: conventional-commits
description: Create commit messages that follow the Conventional Commits specification while providing sufficient context for future maintainers.
---

# Conventional Commits

## Purpose

Apply this skill whenever creating a Git commit.

Commit messages are part of the project's documentation. They should communicate the intent of the change, explain why it was made, and provide enough context for engineers who may be unfamiliar with the repository.

---

# Commit Structure

Every commit should contain:

1. A title (required)
2. A body (required)
3. A footer (optional)

Use the following structure:

```text
<type>(<optional-scope>): <description>

<body>

[optional footer(s)]
```

---

## Commit Title

The title should:

- Follow the Conventional Commits specification.
- Describe the primary purpose of the change.
- Be concise.
- Use the imperative mood.
- Be understandable by engineers outside the team.

Example:

```text
refactor(accounts): simplify account balance calculation
```

---

## Commit Body

 **Organization Standard**

 The Conventional Commits specification makes the commit body optional.

 This organization requires every commit to include a body explaining:

 - Why the change was necessary.
 - What was changed.

 The body must contain at least two bullet points.

Example:

```text
refactor(accounts): simplify account balance calculation

- Simplified the balance calculation by extracting shared business rules into a reusable service.
- Removed duplicate validation logic to improve maintainability and reduce future defects.
```

---

## Commit Footer

Footers are optional.

Use a footer only when additional context is required.

Examples include:

- Breaking changes
- Linked work items
- Regulatory references
- Security advisories
- Issue references
- Co-authors

Examples:

```text
BREAKING CHANGE: The legacy balance endpoint has been removed.

Refs: #1234

Co-authored-by: Jane Doe <jane@example.com>
```

Avoid using footers when the information belongs in the commit body.

---

# Commit Types

Choose the commit type that best represents the **primary purpose** of the change.

---

## feat

Use when introducing new functionality or user-visible capabilities.

Examples:

- Adding a new API endpoint.
- Adding a new feature.
- Adding support for a new integration.

Do **not** use for bug fixes or refactoring.

---

## fix

Use when correcting incorrect behaviour or resolving defects.

Examples:

- Fixing a null reference exception.
- Correcting validation logic.
- Resolving an authentication issue.

Do **not** use when adding new functionality.

---

## docs

Use when **only documentation** changes.

Examples:

- Updating README files.
- Improving API documentation.
- Adding architecture documentation.
- Improving code comments.

Do **not** use if production code also changes.

---

## style

Use for changes that do **not** affect application behaviour.

Examples:

- Formatting.
- Whitespace.
- Import ordering.
- Naming consistency.
- Style corrections.

Do **not** use for refactoring.

---

## refactor

Use when improving the internal structure without changing behaviour.

Examples:

- Extracting methods.
- Simplifying logic.
- Renaming private members.
- Improving maintainability.
- Removing duplication.

Do **not** use if functionality changes.

---

## perf

Use when improving performance without changing behaviour.

Examples:

- Optimising database queries.
- Reducing memory allocations.
- Improving algorithm efficiency.
- Adding caching.
- Reducing network calls.

---

## test

Use when adding or modifying automated tests.

Examples:

- Unit tests.
- Integration tests.
- Contract tests.
- Performance tests.

Do **not** use if production code changes significantly.

---

## build

Use for changes affecting the build system or project dependencies.

Examples:

- NuGet package updates.
- MSBuild configuration.
- Docker build changes.
- Build scripts.

---

## ci

Use for Continuous Integration and Continuous Delivery changes.

Examples:

- GitHub Actions.
- Azure DevOps pipelines.
- Build validation.
- Release workflows.

---

## chore

Use for repository maintenance that does not affect application behaviour.

Examples:

- Updating tooling.
- Repository cleanup.
- Development scripts.
- Dependency maintenance.
- Repository configuration.

---

## revert

Use when reverting a previous commit.

The commit message should reference the commit being reverted.

Example:

```text
revert: revert "feat(authentication): add OAuth login"
```

---

## Breaking Changes

Breaking changes must be indicated using one of the following Conventional Commits mechanisms:

1. Append `!` after the type or optional scope.

Examples:

feat!: remove legacy authentication

feat(api)!: replace customer endpoint

2. Include a footer beginning with:

BREAKING CHANGE:

Example:

BREAKING CHANGE: The legacy customer endpoint has been removed.

When both are appropriate, prefer using `!` in the header and include a `BREAKING CHANGE:` footer describing the impact and migration path.

# Communication Standards

Write commit messages for engineers who may have no prior knowledge of the repository, team, or business domain.

Commit messages should remain understandable years after they are written.

Prefer:

- Plain English over technical jargon.
- Complete words over acronyms.
- Business terminology over internal abbreviations.
- Explaining the intent rather than the implementation.
- Clear, concise language.

Avoid:

- Team-specific terminology.
- Internal abbreviations.
- Unexplained acronyms.
- Vague descriptions such as:
  - "Updated stuff"
  - "Fix"
  - "Changes"
  - "Misc"
  - "WIP"

Use universally recognised acronyms only, such as:

- API
- HTTP
- HTTPS
- JSON
- SQL
- REST
- OAuth
- AWS
- CI
- CD

If an acronym is specific to the organisation or business domain, write it in full.

---

# Before Creating a Commit

Verify the following.

## Commit Structure

- [ ] The commit contains one logical change.
- [ ] The correct commit type has been selected.
- [ ] The scope improves clarity where appropriate.
- [ ] The title follows the Conventional Commits specification.
- [ ] The title is concise and written in the imperative mood.

## Commit Body

- [ ] The body explains why the change was required.
- [ ] The body explains what changed.
- [ ] The body contains at least two bullet points.

## Communication

- [ ] Plain English has been used.
- [ ] Technical jargon has been minimised.
- [ ] Organisation-specific acronyms have been avoided.
- [ ] The message can be understood by engineers outside the team.

## Footer

- [ ] A footer has only been included when additional context is required.

---

# Common Mistakes

Avoid:

- Combining multiple logical changes in one commit.
- Choosing the wrong commit type.
- Missing commit bodies.
- One-line commits.
- Vague descriptions.
- Team-specific jargon.
- Unexplained acronyms.
- Describing implementation without explaining intent.
- Using a footer for information that belongs in the body.

---

# Definition of Done

Before considering the commit complete:

- [ ] The commit follows the Conventional Commits specification.
- [ ] The correct commit type has been selected.
- [ ] The title clearly describes the purpose of the change.
- [ ] The body explains why the change was necessary.
- [ ] The body explains what changed.
- [ ] The body contains at least two bullet points.
- [ ] Plain English has been used.
- [ ] The message can be understood without additional context.
- [ ] The commit is suitable for long-term project history.
---
name: commit-size
description: Keep Git commits focused, reviewable, and easy to understand.
---

# Commit Size

## Purpose

Apply this skill whenever preparing Git commits.

Small, focused commits improve code reviews, debugging, deployment, and rollback. Every commit should represent the smallest independently reviewable unit of work.

This skill complements the **conventional-commits** skill by defining **what belongs in a commit**, while the Conventional Commits skill defines **how the commit should be written**.

---

# Commit Granularity

Commits should be as small as reasonably practical.

Prefer:

- One file per commit where practical.
- One logical change per commit.
- One business objective per commit.
- One reason for change per commit.

Avoid:

- Multiple unrelated files in the same commit.
- Multiple features in the same commit.
- Combining bug fixes with new features.
- Combining refactoring with feature work.
- Combining formatting with functional changes.
- Large "catch-all" commits.

Multiple files may be committed together only when they represent a single inseparable logical change.

Examples include:

- A controller and its interface.
- A model and its corresponding database migration.
- A service and the tests required to validate it.
- A public API and the documentation required to support it.

---

# Commit Content

Every commit should clearly communicate:

- What changed.
- Why the change was necessary.
- The impact of the change.

The commit message should explain the intent of the change rather than simply describing the implementation.

All commit messages must follow the **conventional-commits** skill.

---

# Communication Standards

Commit messages should be understandable by any engineer, regardless of their team, domain knowledge, or familiarity with the repository.

Assume the reader has no prior knowledge of the project or business domain.

Prefer:

- Plain English over technical jargon.
- Complete words over acronyms.
- Business terminology over internal abbreviations.
- Explaining the business intent rather than implementation details.
- Language that will remain understandable years after the commit was created.

Unless an acronym is universally recognised (for example API, HTTP, JSON, SQL, REST, OAuth or AWS), write the term in full or define it the first time it appears.

---

## Good Examples

### Single File

```text
fix(authentication): prevent expired passwords from being accepted

- Corrected password validation to reject expired credentials before authentication.
- Prevents users from successfully logging in after their password has expired.
```

---

### Small Multi-file Change

```text
feat(accounts): add account nickname support

- Added nickname support to customer accounts.
- Updated the account API contract and validation to support the new field.
```

---

### Documentation Only

```text
docs(readme): improve local development instructions

- Added missing prerequisites for running the application locally.
- Clarified environment variable configuration for new developers.
```

---

## Avoid

Avoid commits such as:

```text
fix: stuff

- Fixed things.
```

```text
feat: update API

- Updated API.
- Miscellaneous improvements.
```

```text
refactor: cleanup

- Refactored code.
- Minor fixes.
```

```text
chore: misc

- Updated files.
- General improvements.
```

These examples fail because they:

- Do not explain why the change was necessary.
- Use vague language.
- Do not communicate business intent.
- Cannot be understood without reading the code.

---

# Before Creating a Commit

Verify the following.

## Scope

- [ ] The commit contains one logical change.
- [ ] The commit supports one business objective.
- [ ] Unrelated changes have been excluded.
- [ ] Formatting-only changes have been separated.
- [ ] Refactoring has been separated from feature work where practical.
- [ ] Generated files have only been included when necessary.

## Granularity

- [ ] The commit modifies only one file where practical.
- [ ] If multiple files are included, they are required to implement a single logical change.
- [ ] Every modified file contributes to the same objective.
- [ ] The commit can be reviewed independently.
- [ ] The commit can be reverted independently.

## Communication

- [ ] The commit follows the **conventional-commits** skill.
- [ ] The title clearly communicates the purpose of the change.
- [ ] The body explains **why** the change was necessary.
- [ ] The body explains **what** changed.
- [ ] The body contains at least two bullet points.
- [ ] Plain English has been used.
- [ ] Technical jargon has been minimised.
- [ ] Unnecessary acronyms have been avoided.
- [ ] An engineer from another team could understand the purpose of the change without reading the code.

## Quality

- [ ] The project builds successfully.
- [ ] Relevant tests pass.
- [ ] The commit is ready to be merged independently.

---

# Common Mistakes

Avoid:

- Catch-all commits.
- Large commits spanning multiple unrelated files.
- Multiple business objectives in one commit.
- Combining bug fixes with new features.
- Combining refactoring with functional changes.
- Mixing formatting with implementation changes.
- Vague commit titles.
- Commit bodies that only describe implementation.
- Missing explanations of why the change was made.
- Team-specific terminology.
- Internal acronyms that are not universally understood.

---

# Definition of Done

Before considering the commit complete:

- [ ] The commit represents the smallest independently reviewable unit of work.
- [ ] The commit follows the **conventional-commits** skill.
- [ ] The purpose of the change is immediately clear.
- [ ] The reason for the change is documented.
- [ ] The commit can be reviewed independently.
- [ ] The commit can be reverted independently.
- [ ] The commit contributes to a clean and understandable project history.
---
name: dry
description: Eliminate duplication by reusing existing implementations and maintaining a single source of truth.
---

# DRY (Don't Repeat Yourself)

## Purpose

Apply this skill whenever creating, modifying, or refactoring code to reduce duplication and improve maintainability.

The goal is to ensure that each piece of knowledge, business rule, or behaviour exists in one place.

---

## Before Starting

Verify the following:

- [ ] Similar implementations have been searched for.
- [ ] Existing utilities, services, or helpers have been reviewed.
- [ ] Existing interfaces or abstractions can be reused.
- [ ] The duplication is intentional if it exists.

---

## Before Finishing

Verify the following:

### Business Logic

- [ ] Business rules are implemented only once.
- [ ] Similar workflows reuse shared logic.
- [ ] Domain logic has not been copied between services.

### Validation

- [ ] Validation rules are centralised where appropriate.
- [ ] Validation is not duplicated across controllers, services, and repositories.

### Shared Code

- [ ] Existing helper methods have been reused.
- [ ] Existing extension methods have been reused.
- [ ] Existing shared libraries have been considered before creating new ones.

### Configuration

- [ ] Configuration values are defined in one location.
- [ ] Constants are not duplicated.
- [ ] Magic strings and magic numbers have been eliminated.

### Data Models

- [ ] Duplicate DTOs or models have not been introduced without justification.
- [ ] Existing contracts have been reused where appropriate.

---

## Common Mistakes

Avoid:

- Copying and modifying existing code.
- Duplicate validation logic.
- Duplicate error handling.
- Duplicate business rules.
- Multiple implementations of the same behaviour.
- Duplicated constants or configuration values.

---

## Definition of Done

Before considering the task complete, verify:

- [ ] Similar implementations were reviewed.
- [ ] Existing code was reused where possible.
- [ ] No unnecessary duplication exists.
- [ ] Shared functionality has been extracted where appropriate.
- [ ] The codebase has a single source of truth for the implemented behaviour.
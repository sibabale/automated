---
name: ddd
description: Apply Domain-Driven Design principles to ensure business logic is modelled clearly and remains isolated from technical concerns.
---

# Domain-Driven Design (DDD)

## Purpose

Apply this skill whenever implementing or modifying business functionality.

The goal is to keep business rules within the domain and ensure the software reflects the business language.

---

## Before Starting

Verify the following:

- [ ] The business problem is understood.
- [ ] The relevant bounded context has been identified.
- [ ] Existing domain models have been reviewed.
- [ ] The ubiquitous language is understood.

---

## Before Finishing

### Domain Model

- [ ] Business terminology matches the ubiquitous language.
- [ ] Domain models express business concepts clearly.
- [ ] Business rules are encapsulated within the domain.

### Layering

- [ ] Domain logic is not implemented in controllers.
- [ ] Domain logic is not implemented in repositories.
- [ ] Infrastructure concerns remain outside the domain layer.

### Bounded Contexts

- [ ] Changes remain within the correct bounded context.
- [ ] Business concepts are not duplicated across contexts.
- [ ] Cross-context communication follows established integration patterns.

### Aggregates

- [ ] Aggregate boundaries are respected.
- [ ] Invariants are enforced within the aggregate.
- [ ] Aggregate roots control state changes.

### Value Objects & Entities

- [ ] Value Objects are immutable where appropriate.
- [ ] Entities represent identity.
- [ ] Behaviour is placed with the model rather than external services where appropriate.

---

## Common Mistakes

Avoid:

- Anemic domain models.
- Business logic inside controllers.
- Business logic inside repositories.
- Sharing domain models across unrelated bounded contexts.
- Using technical terminology instead of business terminology.

---

## Definition of Done

Before considering the task complete, verify:

- [ ] Business rules remain in the domain.
- [ ] The ubiquitous language is used consistently.
- [ ] Layer boundaries have been respected.
- [ ] Aggregate rules have not been violated.
- [ ] The design reflects the business domain rather than the underlying technology.
---
name: composition-over-inheritance
description: Prefer composition over inheritance to improve flexibility, maintainability, and testability.
---

# Composition Over Inheritance

## Purpose

Apply this skill whenever designing relationships between classes or components.

Prefer composition unless inheritance provides a clear and justifiable benefit.

---

## Before Starting

Verify the following:

- [ ] Existing abstractions have been reviewed.
- [ ] Composition has been considered before inheritance.

---

## Before Finishing

Verify the following:

- [ ] Inheritance is used only where an "is-a" relationship genuinely exists.
- [ ] Composition is used for reusable behaviour.
- [ ] Deep inheritance hierarchies have been avoided.
- [ ] Components remain loosely coupled.
- [ ] Behaviour can be tested independently.

---

## Common Mistakes

Avoid:

- Deep inheritance trees.
- Base classes with unrelated responsibilities.
- Using inheritance solely for code reuse.
- Tight coupling between parent and child classes.

---

## Definition of Done

- [ ] Composition has been preferred where appropriate.
- [ ] Inheritance is justified.
- [ ] The design remains flexible and maintainable.
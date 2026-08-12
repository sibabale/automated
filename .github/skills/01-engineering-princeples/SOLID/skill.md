---
name: solid
description: Apply the SOLID principles to create maintainable, extensible, and testable software.
---

# SOLID Principles

## Purpose

Apply this skill whenever designing, implementing, or refactoring classes and components.

The goal is to produce software that is easy to understand, extend, test, and maintain.

---

## Before Starting

Verify the following:

- [ ] The responsibilities of the component are clearly understood.
- [ ] Existing abstractions have been reviewed.
- [ ] The proposed design aligns with the existing architecture.

---

## Before Finishing

### Single Responsibility Principle (SRP)

- [ ] Each class has one primary responsibility.
- [ ] Each method performs one logical operation.
- [ ] Business logic is separated from infrastructure concerns.

### Open/Closed Principle (OCP)

- [ ] Existing behaviour has not been modified unnecessarily.
- [ ] New functionality extends the design rather than rewriting it where practical.

### Liskov Substitution Principle (LSP)

- [ ] Derived implementations can safely replace their abstractions.
- [ ] Implementations do not introduce unexpected behaviour.

### Interface Segregation Principle (ISP)

- [ ] Interfaces expose only the members consumers require.
- [ ] Large "god interfaces" have been avoided.

### Dependency Inversion Principle (DIP)

- [ ] High-level components depend on abstractions.
- [ ] Dependency Injection is used where appropriate.
- [ ] Concrete implementations are hidden behind interfaces where appropriate.

---

## Common Mistakes

Avoid:

- God classes.
- Fat interfaces.
- Tight coupling.
- Static dependencies that prevent testing.
- Mixing business logic with infrastructure.

---

## Definition of Done

Before considering the task complete, verify:

- [ ] Responsibilities are clearly separated.
- [ ] Dependencies are loosely coupled.
- [ ] The design is easy to extend.
- [ ] The implementation is easy to test.
- [ ] The solution follows SOLID where it improves maintainability.
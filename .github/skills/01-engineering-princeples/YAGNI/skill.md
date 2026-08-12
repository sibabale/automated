---
name: yagni
description: Apply the YAGNI (You Aren't Gonna Need It) principle to avoid unnecessary complexity and speculative development.
---

# YAGNI (You Aren't Gonna Need It)

## Purpose

Apply this skill whenever implementing new functionality or refactoring existing code.

The goal is to build only what is required today, avoiding speculative features and unnecessary abstractions.

---

## Before Starting

Verify the following:

- [ ] The current requirements are clearly understood.
- [ ] The implementation solves a real business need.
- [ ] Future requirements are not being assumed.

---

## Before Finishing

Verify the following:

- [ ] Every class has a current purpose.
- [ ] Every method has a current purpose.
- [ ] Every abstraction solves an existing problem.
- [ ] No extension points were introduced without justification.
- [ ] No unused configuration was added.
- [ ] No speculative APIs were created.
- [ ] The solution focuses only on today's requirements.

---

## Common Mistakes

Avoid:

- Designing for unknown future requirements.
- Adding configuration "just in case."
- Creating unnecessary interfaces.
- Introducing unused extension points.
- Overengineering simple problems.

---

## Definition of Done

- [ ] The implementation solves only the requested problem.
- [ ] No speculative functionality exists.
- [ ] The solution remains simple and maintainable.
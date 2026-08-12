---
name: incremental-changes
description: Deliver changes in small, reviewable increments that minimise risk and simplify testing.
---

# Incremental Changes

## Purpose

Apply this skill whenever implementing features, fixes, or refactoring.

Small changes reduce risk, simplify reviews, and improve deployment confidence.

---

## Before Starting

Verify the following:

- [ ] The work can be broken into logical steps.
- [ ] Each step delivers measurable value.
- [ ] Dependencies between steps are understood.

---

## Before Finishing

Verify the following:

- [ ] The change is focused on a single concern.
- [ ] Unrelated changes have not been included.
- [ ] The implementation is easy to review.
- [ ] The implementation is easy to test.
- [ ] The implementation could be safely rolled back if necessary.

---

## Common Mistakes

Avoid:

- Large pull requests.
- Mixing refactoring with new features.
- Mixing bug fixes with unrelated cleanup.
- Large-scale rewrites without justification.

---

## Definition of Done

- [ ] The change is focused.
- [ ] The implementation is low risk.
- [ ] The change is easy to review.
- [ ] The change is easy to deploy.
- [ ] Future work has been separated into subsequent changes where appropriate.
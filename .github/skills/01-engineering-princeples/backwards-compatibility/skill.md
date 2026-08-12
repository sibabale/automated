---
name: backwards-compatibility
description: Preserve compatibility with existing consumers unless breaking changes are explicitly approved.
---

# Backwards Compatibility

## Purpose

Apply this skill whenever modifying existing functionality, APIs, contracts, or schemas.

---

## Before Starting

Verify the following:

- [ ] Existing consumers have been considered.
- [ ] Public contracts have been identified.
- [ ] Breaking changes are understood.

---

## Before Finishing

Verify the following:

- [ ] Existing APIs remain compatible.
- [ ] Existing contracts remain valid.
- [ ] Database migrations are backward compatible where possible.
- [ ] Deprecated functionality has not been removed without approval.
- [ ] Breaking changes are documented.

---

## Common Mistakes

Avoid:

- Renaming public APIs.
- Removing fields.
- Changing response formats.
- Breaking existing integrations.
- Incompatible database changes.

---

## Definition of Done

- [ ] Existing consumers continue to function.
- [ ] Breaking changes are documented and intentional.
- [ ] Compatibility has been preserved wherever practical.
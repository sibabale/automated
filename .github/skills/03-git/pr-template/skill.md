---
name: pr-template
description: Standard Pull Request template and formatting guidelines for all repositories.
---

# Pull Request Template

## Purpose

Apply this skill whenever creating a Pull Request.

A Pull Request should communicate the purpose of the change before the reviewer reads the code.

The reviewer should understand:

- Why the change exists.
- What changed.
- The impact.
- How it was tested.

---

# Pull Request Title

The Pull Request title should:

- Use plain English.
- Describe the business outcome.
- Be concise.
- Avoid technical jargon.
- Match the primary Conventional Commit.

Prefer the following format:

<type>(<scope>): <description>

## Good Examples

✓ `feat(authentication): add account lockout after repeated failed logins`

✓ `fix(accounts): prevent duplicate account creation`

✓ `docs(api): document customer onboarding endpoint`

## Avoid

✗ `Update stuff`

✗ `Changes`

✗ `PR fixes`

✗ `Authentication updates`

✗ `Final changes`

---

# Pull Request Body

Use the following template.

```markdown
## Summary

Describe the business outcome.

## Why

Explain why this change was required.

## What Changed

- Item 1
- Item 2
- Item 3

## Impact

State which systems are affected.

If none:

No external impact.

## Risk

Low | Medium | High

Explain why.

## Testing

Describe how the change was verified.

```

---

# Good Example

```markdown
## Summary

Adds account lockout after repeated failed login attempts.

## Why

Customers could repeatedly attempt invalid passwords without restriction.

## What Changed

- Added account lockout after five failed attempts.
- Added audit logging.
- Updated authentication configuration.

## Impact

Authentication API only.

No external integrations affected.

## Risk

Low

Validation behaviour has changed without modifying existing contracts.

## Testing

- Added unit tests.
- Existing integration tests pass.
- Manually verified successful and failed login scenarios.
```

---

# Avoid

```markdown
## Summary

Updated authentication.

## Why

Business requested it.

## What Changed

Updated code.

## Impact

Authentication.

## Testing

Done.
```

Why this is poor:

- Does not explain the business problem.
- Uses vague language.
- Does not explain the impact.
- Provides no useful testing information.

---

# Mandatory Testing Checklist

Every Pull Request must include the following checklist.

## Testing

- [ ] The solution builds successfully.
- [ ] Existing automated tests pass.
- [ ] New tests have been added where appropriate.
- [ ] Manual testing has been completed where required.
- [ ] Edge cases have been considered.
- [ ] No existing functionality has been unintentionally affected.

If any item is not applicable, explain why in the Pull Request.

---

# Before Creating the Pull Request

Verify the following:

- [ ] The title follows the organizational naming standard.
- [ ] The Summary explains the business outcome.
- [ ] The Why section explains the business reason.
- [ ] The What Changed section summarises the solution.
- [ ] The Impact section identifies affected systems.
- [ ] Risk has been assessed.
- [ ] Testing has been documented.
- [ ] Plain English has been used.
- [ ] Technical jargon has been minimised.

---

# Definition of Done

The Pull Request is complete when:

- [ ] A reviewer can understand the change without reading the code.
- [ ] The business purpose is clear.
- [ ] The implementation summary is clear.
- [ ] Testing provides confidence in the change.
- [ ] Deployment and rollback are understood.
- [ ] The Pull Request is ready to merge without requiring clarification from the author.
---
name: feedback-learning
description: >
  Learns durable, project-specific preferences from confirmed corrections to
  prior work without treating unrelated refactors, deletions, or scope changes
  as permanent instructions.
---

# Feedback Learning

## Purpose

This skill turns confirmed execution mistakes into narrow, reusable project
knowledge. It must not treat every follow-up edit as evidence that the prior
implementation was wrong.

Apply this skill when a user asks to refactor, delete, replace, or correct work
that was implemented in response to an earlier request.

## Required Context

Before classifying feedback:

1. Apply `ai-operating-principles`.
2. Load every skill relevant to the original work and the correction.
3. Read `learning-log.md`.
4. Compare the original request, implemented behavior, corrective feedback, and
   any supplied visual or test evidence.

The feedback-learning skill supplements domain skills; it never overrides
them. When a lesson affects a domain rule, apply both this skill and the
relevant domain skill.

## Feedback Classification

Classify the correction before changing the learning log.

| Classification | Meaning | Record a lesson? |
| --- | --- | --- |
| Execution mismatch | The implementation did not satisfy the original request. | Yes, if evidenced. |
| Explicit preference | The user states a stable project preference that was not in the original request. | Yes, as an explicit preference. |
| Scope change | The requested outcome has changed. | No. |
| Unrelated refactor or deletion | The change improves or removes prior work for a reason unrelated to the original request. | No. |
| Ambiguous correction | The reason for the correction cannot be established. | No; ask before learning. |

Never infer an execution mismatch merely because the user asked for a
refactor or deletion. The user must identify the mismatch, or the original
requirement and observed behavior must prove it.

## Fix-First Learning Loop

1. **Trace** the correction to the original request and implementation.
2. **Classify** it using the table above.
3. **Fix** the current behavior with the smallest safe change.
4. **Validate** the correction using the relevant domain skill.
5. **Record** a lesson only when its classification permits it.
6. **Consult** matching accepted lessons before implementing similar work later.

Do not postpone a safe correction to write a lesson. The learning record exists
to prevent recurrence, not to replace delivery.

## Accepted Lesson Gate

An entry may be marked `accepted` in `learning-log.md` only when all of the
following are true:

- The original requirement is identifiable.
- The corrective feedback or evidence identifies the actual mismatch.
- The lesson is scoped to an observable trigger and outcome.
- The correction has been validated.
- The rule does not conflict with an existing accepted lesson.

If a condition is missing, do not mark the lesson accepted. Explain the
uncertainty or ask the user for clarification when it affects future behavior.

Candidate observations may be recorded only when they identify an original
request and corrective feedback, but lack sufficient validation or recurrence
to become accepted. Candidates must not change future implementation behavior.

## Writing Lessons

Use this structure:

```md
## [Short lesson title]

- **Status:** accepted | candidate | superseded
- **Confidence:** explicit | evidenced
- **Trigger:** When...
- **Rule:** Do...
- **Original request:** The requirement that was not met
- **Corrective feedback:** The later instruction or evidence identifying the mismatch
- **Applies to:** Named skills or component areas
- **Does not apply to:** Explicit exclusions or counterexamples
```

Rules must be specific, testable, and narrow. Avoid absolute language unless
the user explicitly requires it.

## Promotion and Maintenance

- Add an accepted lesson to the relevant domain skill only when the user states
  it as a project-wide rule or the same lesson recurs.
- Mark outdated lessons `superseded`; retain the evidence rather than deleting
  history.
- Consolidate duplicate or conflicting lessons every ten accepted entries, or
  when a conflict appears.
- Ask the user to resolve a conflict between two accepted preferences.

## Completion Checklist

- [ ] Relevant existing skills were loaded before the correction was assessed.
- [ ] The correction was classified before recording a lesson.
- [ ] Unrelated refactors and scope changes were not learned.
- [ ] Any new lesson passes the acceptance gate.
- [ ] Candidate observations are not treated as implementation rules.
- [ ] The lesson is scoped and names the skills it affects.
- [ ] The current correction was validated independently of the learning log.

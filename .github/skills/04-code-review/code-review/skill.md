---
name: code-review
description: Review code for correctness, maintainability, security, performance, and testing. Produce a complete review with prioritized, actionable feedback.
---

# Code Review

## Purpose

Apply this skill whenever reviewing code, generating Pull Request feedback, or evaluating proposed changes.

The objective is to improve the quality of the code while helping the author understand the reasoning behind each recommendation.

---

## Review Priorities

Review the code in the following order:

1. Correctness
2. Security
3. Breaking changes
4. Maintainability
5. Performance
6. Testing
7. Documentation

Do not comment on formatting or style if automated tooling already enforces it.

---

## Review Principles

Always:

- Review the complete change before providing feedback.
- Prioritize issues by severity.
- Explain why an issue exists.
- Suggest a practical solution.
- Use plain English.
- Be respectful and constructive.
- Praise good design decisions where appropriate.

Never:

- Make assumptions without evidence.
- Comment on personal coding preferences.
- Recommend changes without explaining the benefit.
- Repeat the same feedback multiple times.

---

## Severity

### 🔴 Blocker

The change should not be merged.

Examples:

- Security vulnerability
- Data corruption
- API contract break
- Authentication or authorization flaw
- Missing validation
- Race condition
- Production outage risk

---

### 🟡 Recommendation

The change is correct but could be improved.

Examples:

- Duplication
- Maintainability
- Missing tests
- Performance
- Readability
- Documentation

---

### 💭 Observation

Optional improvements.

Examples:

- Better naming
- Simplification
- Additional documentation
- Alternative implementation

---

## Review Format

For every issue provide:

### Severity

🔴 Blocker

### Finding

Describe the issue.

### Why

Explain why it matters.

### Recommendation

Explain the preferred solution.

---

## Example

### 🔴 Blocker

**Finding**

User input is concatenated directly into the SQL query.

**Why**

This introduces a SQL Injection vulnerability.

**Recommendation**

Use parameterized queries.

---

## Before Completing the Review

Verify:

- [ ] The entire change has been reviewed.
- [ ] Feedback has been prioritised.
- [ ] Every recommendation explains why.
- [ ] Every blocker includes a suggested solution.
- [ ] Positive observations have been included where appropriate.
- [ ] The review uses plain English.
- [ ] Technical jargon has been minimised.

---

## Definition of Done

The review enables the author to understand:

- What should change.
- Why it should change.
- How to improve the implementation.

without requiring additional clarification.
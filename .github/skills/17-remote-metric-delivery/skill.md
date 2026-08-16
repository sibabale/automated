---
name: remote-metric-delivery
description: >
  Package the repository know-how required for a remote or autonomous agent to
  build a financial-metric feature the same way free cash flow was built:
  loading the right skills, studying the right references, preserving the
  backend and frontend architecture, and clearing the required validation gates
  before asking for review.
---

# Remote Metric Delivery

## Purpose

Free cash flow succeeded because the agent had more than a scaffold. It had the
repo's rules, the return-on-equity reference, the live frontend and backend
patterns, and the validations that define "done".

This skill turns that know-how into an **explicit operating contract** for
remote or autonomous metric work. Use it whenever an agent is asked to add or
extend a financial-metric feature without a human steering every step.

---

## Load This Skill Stack First

Before touching code, the agent must load the skills that govern the work. The
point is not to know these skills exist — it is to actively run under them.

### Always load

1. **AI Operating Principles**
2. **Feature Blueprint**
3. **Documentation Maintenance**
4. **Testing the Public Interface**
5. **Mutation Resistance**
6. **Backwards Compatibility**

### Load when the backend is touched

1. **DDD**
2. **Correlation IDs**
3. **Explanatory Comments**
4. **Object Key Ordering**
5. **DRY**
6. **KISS**

### Load when the frontend is touched

1. **Component Craft**
2. **Surface Integrity**
3. **Component States**
4. **UI Verification**

If the task spans both backend and frontend, load both sets.

---

## Mandatory Reference Files

Do not invent structure from memory. Read the reference feature files first and
build the new metric by analogy.

### Backend references

- `backend/src/application/services/return-on-equity/index.ts`
- `backend/src/application/services/free-cash-flow/index.ts`
- `backend/src/infrastructure/repositories/fmp-financial-data/index.ts`
- `backend/src/infrastructure/repositories/fmp-cash-flow-data/index.ts`
- `backend/src/presentation/controllers/return-on-equity/index.ts`
- `backend/src/presentation/controllers/free-cash-flow/index.ts`
- `backend/src/app.ts`
- `backend/src/middleware/correlation-id.ts`
- `backend/src/application/services/horizon-analysis/index.ts`
- `backend/src/presentation/formatting/index.ts`

### Frontend references

- `frontend/app/api/analysis/return-on-equity/route.ts`
- `frontend/app/api/analysis/free-cash-flow/route.ts`
- `frontend/redux/slices/return-on-equity.slice.ts`
- `frontend/redux/slices/free-cash-flow.slice.ts`
- `frontend/redux/selectors/return-on-equity.selectors.ts`
- `frontend/redux/selectors/free-cash-flow.selectors.ts`
- `frontend/app/details/[metric]/page.tsx`
- `frontend/data/financial-metrics.ts`
- `frontend/redux/store.ts`

### UI references when a new section or component is needed

- `components/templates/`
- the Header molecule reference named by the Component Craft skill
- the reused detail-page organisms already consumed by `frontend/app/details/[metric]/page.tsx`

---

## Non-Negotiable Repository Rules

### 1. Preserve the backend layering

Metric work in this repository follows a DDD-style split:

- **domain** — reported facts and ports only
- **infrastructure** — provider fetching and row mapping
- **application** — pure metric formula and horizon analysis
- **presentation** — controller DTO shaping and formatting

Do not collapse these layers into a single file or let controllers own business
logic.

### 2. Reuse the shared seams

Every metric should wire in through the same three seams:

1. `backend/src/app.ts`
2. `frontend/data/financial-metrics.ts`
3. `frontend/app/details/[metric]/page.tsx`

If the work needs more than the feature files plus those seams, stop and check
whether a shared abstraction should be extracted instead.

### 3. Treat ROE and FCF as the canonical examples

Return on equity is the first full example. Free cash flow is the second real
consumer that proves the pattern generalises.

A new metric should look like "the next sibling of ROE and FCF", not like a new
mini-architecture.

### 4. Respect the frontend shell

- Reuse the existing metric detail page shell.
- Reuse Redux Toolkit slices and Reselect selectors.
- Reuse theme tokens; do not introduce literal colors or raw typography values.
- Keep loading, empty, and error behavior consistent with the existing page flow.
- Prefer driving existing molecules and organisms with props over forking them.

### 5. Treat observability as part of the feature contract

- Backend logs must carry `correlationId`.
- Services receive `correlationId` as a `string`.
- Success and error responses include `correlationId`.
- Frontend/backend requests use the `x-correlation-id` header.

### 6. Do not skip the repo's existing skills

The repo already contains strong opinions about tests, components, motion,
documentation, commits, and maintainability. Remote agents must obey those
skills, not approximate them.

---

## Delivery Workflow

1. **Read the blueprint and this skill first.**
2. **Inspect ROE and FCF before coding.** Do not rely on memory.
3. **Scaffold the feature** with `pnpm new:metric -- --slug <slug> --label "<Label>"`.
4. **Map the metric inputs deliberately.** Confirm which provider statement and
   which reported fields the formula actually needs.
5. **Implement backend from the inside out**:
   - provider mapping
   - pure per-year formula
   - horizon analysis
   - controller formatting
   - backend route seam
6. **Implement frontend through the existing shell**:
   - proxy route
   - slice
   - selectors
   - registry entry
   - page mapping seam
7. **Update the copy and education content** so the registry entry is not left as
   TODO text.
8. **Run the required validations** before claiming completion.

---

## Remote Agent Kickoff Contract

When delegating a metric to a remote agent, the kickoff must include:

1. the metric slug and label;
2. the instruction to load the required skills listed above;
3. the instruction to read the ROE and FCF reference files before editing;
4. the requirement to preserve the DDD layers and the three seams;
5. the required validations for backend and frontend;
6. the instruction not to claim success while placeholder TODOs remain.

If any of those are missing, the delegation is underspecified.

---

## Done Means More Than "Code Was Written"

A remote metric task is complete only when:

- the new metric follows the same repo structure as ROE and FCF;
- the feature-specific TODO placeholders have been replaced with real logic or
  explicitly scoped follow-up work;
- the backend and frontend tests relevant to the change pass;
- the coverage and mutation expectations for the touched backend logic are met;
- the browser-visible metric page behavior is checked for loading, empty, and
  error states when the UI changed;
- the documentation that teaches future agents has been updated when the
  pattern moved.

If those conditions are not true, the task is still in progress.

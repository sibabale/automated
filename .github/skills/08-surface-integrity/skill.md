---
name: surface-integrity
description: >
  Prevents new pages and page-level sections from drifting from the established
  design system, user-approved scope, and responsive composition.
---

# Surface Integrity

## Purpose

New surfaces must extend the existing product rather than invent parallel
patterns. This skill makes the design-system, scope, token, and responsive
checks explicit before a page-level implementation begins.

## Required Workflow

Before creating or materially changing a page or page-level section:

1. Read the user request and supplied references, then list required elements,
   explicit exclusions, and required viewport behavior.
2. Inspect at least one existing page and one reusable component with a similar
   responsibility. Identify likely responsibility boundaries, then validate
   whether each belongs in the page or a reusable component. Reuse an existing
   composition when it fits and extract only a distinct, independently
   meaningful responsibility with a credible reuse path.
3. Inspect the typed theme before styling. Use its colors, type, spacing,
   weights, borders, and sizes; add a typed semantic token only when the
   existing system cannot express a required value.
4. Define compact, tablet, and desktop compositions before writing styles.
   Specify grid density, text roles, longest-value behavior, ordering, and
   controls for each viewport.
5. Build only the approved inventory. An omitted element is a requirement, not
   an invitation to substitute a plausible feature.
6. Validate the implementation at compact, tablet, and desktop widths with the
   longest visible data values. Check readability, overflow, contrast, touch
   targets, and control behavior before completion.

When the extraction boundary, user intent, visual authority, or responsive
behavior is materially unclear, ask the user a focused question before
committing to an implementation. Do not use plausible assumptions as a
substitute for validation.

## Token Rules

- Do not add literal color values, raw `font-size` values, or duplicate token
  values in application styles.
- Use the theme's primary text token for readable body and data values.
  Secondary and tertiary tokens are reserved for supporting metadata only.
- Do not use color alone to encode meaning unless the typed theme defines an
  accessible semantic token for that state.
- Keep page geometry token-based where a spacing or size token exists.

## Responsive Data Rules

- Never promote a summary grid to more columns until the longest supported
  value fits without clipping, overlap, or forced single-character wrapping.
- Treat tablet as its own composition; it can have different column counts,
  ordering, and value sizes from both compact and desktop views.
- Tables may switch to cards on compact screens, but all primary data must
  remain readable and discoverable.

## Scope Rules

- Preserve explicit omissions from the request.
- Do not add charts, graphs, controls, sections, or copy because they seem
  typical for the page category.
- When an interpretation is materially ambiguous, ask before building rather
  than filling the gap with an invented feature.

## Checklist

- [ ] Existing equivalent page and component were inspected.
- [ ] Each potential extraction has a deliberate page-versus-component
      decision, validated against responsibility and credible reuse.
- [ ] Required and excluded content is identified.
- [ ] Every new visual value comes from the typed theme.
- [ ] Compact, tablet, and desktop layouts are intentionally defined.
- [ ] Longest values remain readable at every supported viewport.
- [ ] No unrequested surface or interaction was added.

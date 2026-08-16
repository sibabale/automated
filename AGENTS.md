# Building features in this repository

This repository builds one thing repeatedly: **financial-metric analysis
features**. A user enters a stock ticker, the backend fetches the company's
reported figures, computes a metric across time horizons, and the frontend
renders it on a detail page. **Return on equity** is the complete reference
implementation.

Before adding or changing a metric feature, read
**`.github/skills/16-feature-blueprint/skill.md`**. It is the canonical recipe:
the full backend and frontend file manifest, the three wiring seams, what is
shared versus written per feature, the build order, and the automated
Definition of Done. Follow it so every feature — whether written by a person or
an autonomous agent — matches the reference by construction.

The skills in `.github/skills/` are mandatory, not advisory. In particular:
scaffolding (copy templates, never write files from scratch), testing and
mutation resistance (the testing bar), commit size and conventional commits
(how to land work), and the frontend craft/state/surface skills (rendering
standards). When multiple skills apply, the more specific one wins.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

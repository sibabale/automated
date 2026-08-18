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

When the work will be done by a remote or autonomous agent, also read
**`.github/skills/17-remote-metric-delivery/skill.md`** before coding. It is the
repository's operating contract for metric delivery: which skills must be
loaded, which ROE and free-cash-flow files must be inspected first, how the DDD
layers and frontend seams must be preserved, and which validations an agent
must clear before claiming the feature is complete.

The skills in `.github/skills/` are mandatory, not advisory. In particular:
scaffolding (copy templates, never write files from scratch), testing and
mutation resistance (the testing bar), commit size and conventional commits
(how to land work), and the frontend craft/state/surface skills (rendering
standards). When multiple skills apply, the more specific one wins.

## AI commit discipline

AI sessions must enforce the `commit-size` and `conventional-commits` skills as
first-class operating rules, not as optional suggestions and not as something
left to Git hooks to catch later.

Before creating any commit, an AI agent must:

- Split the work into the smallest independently reviewable commit or commits
  that still make sense together.
- Avoid title-only commits and avoid a single catch-all commit for a multi-step
  change.
- Write a Conventional Commit title with a required body.
- Include at least two bullet points in the commit body explaining why the
  change was needed and what changed.
- Prefer multiple small commits over one broad commit when the changes can be
  reviewed or reverted independently.

Git hooks and Husky are validation layers only. They do not replace the AI's
responsibility to choose proper commit boundaries and write compliant commit
messages up front.

## Git commit hook note

This repository uses Husky's custom hooks path (`core.hooksPath=.husky/_`).
Keep the AI-attribution stripping logic wired under the active Husky path so it
applies consistently in future sessions. The intended behavior is to remove AI
co-author trailers such as
`Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>` and
similar generated footer lines from commit messages.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Changelog

All notable changes to this project will be documented in this file.

The format follows Keep a Changelog and this repository uses Conventional Commits
to keep release history consistent.

## [Unreleased]

### Added

- Added versioned backend API surfaces under `/api/v1/...` and `/api/v2/...`.
- Added version-aware frontend API paths so the client can target one backend
  API generation explicitly.
- Added versioned automated decision ledgers under `backend/data/v1/` and
  `backend/data/v2/`.
- Added a version manifest and a pre-commit validation script that keeps
  version-sensitive changes coupled to changelog updates.

### Changed

- Preserved the original hard-coded free-cash-flow threshold as API `v1`.
- Introduced an initial API `v2` ruleset that lowers the free-cash-flow strong
  threshold to create a clear behavioural contrast from `v1`.
- Bumped the backend release version to `0.1.1` after aligning the compiler,
  type configuration, and runtime typing fixes required for Railway builds.
- Bumped the backend release version to `0.1.2` after adding overview
  qualitative analysis support and the corresponding client rendering states.

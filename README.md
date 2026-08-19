# Automated

This repository now contains a versioned frontend and backend for investment
analysis.

```text
frontend/  Standalone Next.js application and same-origin API proxy
backend/   Express backend with versioned API behaviour
```

## Frontend

The frontend is an independent pnpm project. Run all frontend commands from
`frontend/`.

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Quality checks

```bash
pnpm lint
pnpm test
pnpm test:ui
pnpm build
```

## Backend

The backend is a separate pnpm project. Run backend commands from `backend/`.

```bash
cd backend
pnpm install
pnpm dev
```

The backend now exposes explicit API generations:

- `/api/v1/...` preserves the original investment-analysis thresholds
- `/api/v2/...` starts the next generation with a lower free-cash-flow
  threshold

The original unversioned routes still map to `v1` for compatibility while the
rest of the codebase finishes migrating.

Automated decision ledgers are stored by API version:

- `backend/data/v1/decisions.json`
- `backend/data/v2/decisions.json`

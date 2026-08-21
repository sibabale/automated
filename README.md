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

## Railway deployment

Deploy this repository to Railway as one project with two environments:

- `production`
- `non-production` (for staging or development)

Create two Railway services per environment and point each service at its
nested package root:

- `frontend` → `frontend`
- `backend` → `backend`

Both package roots now include a `nixpacks.toml` file so Railway can install,
build, and start each service without a repo-wide workspace wrapper.

### Health checks

- Backend health check path: `/health`
- Frontend health check path: `/api/health`

### Frontend Railway variables

Set these on the `frontend` service:

- `BACKEND_URL` — the backend's Railway private URL
- `NEXT_PUBLIC_API_VERSION` — optional, defaults to `v1`

### Backend Railway variables

Set these on the `backend` service:

- `FMP_API_KEY`
- `FMP_BASE_URL`
- `FMP_TIMEOUT_MS`
- `FMP_MIN_INTERVAL_MS`
- `FMP_RATE_LIMIT_RETRIES`
- `ALPACA_PAPER_API_KEY`
- `ALPACA_PAPER_API_SECRET`
- `ALPACA_PAPER_API_BASE_URL`
- `ALPACA_LIVE_ENABLED`
- `ALPACA_LIVE_API_KEY`
- `ALPACA_LIVE_API_SECRET`
- `ALPACA_LIVE_API_BASE_URL`
- `LIVE_TRADE_PASSPHRASE`
- `MAX_TRADE_AMOUNT`
- `PORTFOLIO_BASE_DIRECTORY`
- `TICKER_SOURCE_DIRECTORY`
- `AUTOMATED_INVESTMENT_DECISIONS_FILE`
- `AUTOMATION_CRON_ENABLED`
- `AUTOMATION_CRON_INTERVAL_MS`
- `AUTOMATION_CRON_INITIAL_DELAY_MS`
- `INTERNAL_API_BASE_URL`
- `AUTOMATION_RUN_PASSPHRASE`
- `LOG_LEVEL`

### Persistent volume

The backend reads and writes local files for ticker batches, portfolio
snapshots, and automated decision ledgers. Railway's ephemeral filesystem is
not enough for that data, so attach a persistent volume to the backend service
and point these variables into the mounted path:

- `PORTFOLIO_BASE_DIRECTORY=/data/portfolio`
- `TICKER_SOURCE_DIRECTORY=/data/tickers`
- `AUTOMATED_INVESTMENT_DECISIONS_FILE=/data/automation/decisions.json`

Seed `/data/tickers` with the batch JSON files you want the automation runner
to process before enabling the cron job.

### Environment recommendations

For `non-production`:

- keep `ALPACA_LIVE_ENABLED=false`
- keep `AUTOMATION_CRON_ENABLED=false` until smoke tests pass
- use paper trading credentials only

For `production`:

- keep paper trading available for safe smoke tests
- enable live-trading variables only when you are ready to use them
- enable `AUTOMATION_CRON_ENABLED=true` only after the ticker volume has been
  seeded and the backend has passed manual verification

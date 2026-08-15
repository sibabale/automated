# Automated

This repository separates the frontend from future backend code.

```text
frontend/  Standalone Next.js application
backend/   Reserved for the backend application
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

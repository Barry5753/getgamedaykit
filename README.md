# getgamedaykit

A matchday poster + social caption generator for World Cup 2026 matchdays.

## Overview

- Official group-stage fixture selection
- Live poster preview before authentication
- Offer text and venue details for social promo output
- Caption generation with explicit sign-in gate
- One-click PNG poster download

## Requirements

- Node.js 20+
- PostgreSQL (for production auth/copy persistence)

## Run Locally

```bash
npm run dev
```

`npm run dev` uses `scripts/dev.sh` for the local Next.js webpack setup.

## Validation

```bash
npm run typecheck
npm run test
npm run build
```

## Configuration

Copy `.env.example` to `.env.local` and fill in the required values:

- `DATABASE_URL`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APIMART_API_KEY`
- `APIMART_BASE_URL`
- `APIMART_MODEL`

Optional:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Deployment Checklist

- Run migration: `db/migrations/0001_initial.sql`
- Ensure Google OAuth redirect is configured for `https://getgamedaykit.com`
- Confirm `/robots.txt`, `/sitemap.xml`, `/opengraph-image` are reachable
- Confirm poster preview works before sign-in and caption generation requires auth

Use `sh scripts/launch-check.sh https://getgamedaykit.com` for a quick production smoke test.

For a full launch checklist, see `docs/launch-e2e-runbook.md`.

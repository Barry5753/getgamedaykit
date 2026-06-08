# GameDayKit

World Cup 2026 matchday poster and social caption generator for bars, pubs,
restaurants, and venues.

## Local Development

```bash
npm run dev
```

The dev script uses `scripts/dev.sh`, which runs Next with webpack for this
local environment.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

## Required Environment

Copy `.env.example` to `.env.local` and provide real values before deployment.

- `DATABASE_URL`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APIMART_API_KEY`
- `APIMART_BASE_URL`
- `APIMART_MODEL`

OpenAI can be used as the fallback copy provider with `OPENAI_API_KEY` and
`OPENAI_MODEL`.

## Database Setup

Apply `db/migrations/0001_initial.sql` to the production Postgres database
before enabling Google sign-in or caption generation.

## Launch Checklist

- Apply `db/migrations/0001_initial.sql` to the production database.
- Confirm `BETTER_AUTH_URL` matches the production domain.
- Confirm Google OAuth redirect URLs include
  `https://getgamedaykit.com/api/auth/callback/google`.
- Confirm `/robots.txt`, `/sitemap.xml`, and `/opengraph-image` return `200`.
- Confirm `/api/og` returns `200 image/png` for a sample poster URL.
- Confirm the homepage has one clear H1 and no invented testimonials, usage
  numbers, ratings, or media logos.
- Confirm poster preview works before login and caption generation requires
  login.

For the full production flow, use `docs/launch-e2e-runbook.md`.

Run static launch URL checks with:

```bash
sh scripts/launch-check.sh https://getgamedaykit.com
```

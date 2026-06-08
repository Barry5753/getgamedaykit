# getgamedaykit Launch E2E Runbook

Use this checklist after production environment variables are configured. Do
not mark launch ready until each section has been verified against the deployed
domain.

## 1. Required Production Config

Set these in the deployment platform:

- `DATABASE_URL`
- `BETTER_AUTH_URL=https://getgamedaykit.com`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APIMART_API_KEY`
- `APIMART_BASE_URL=https://api.apimart.ai/v1`
- `APIMART_MODEL=gpt-5-mini`

Optional OpenAI fallback:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## 2. Database Setup

Apply the initial migration to the production Postgres database:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_initial.sql
```

Verify these tables exist:

- `user`
- `session`
- `account`
- `verification`
- `generated_content`

## 3. Google OAuth Setup

In Google Cloud Console, add this authorized redirect URI:

```text
https://getgamedaykit.com/api/auth/callback/google
```

For local OAuth testing, also add the local callback that matches
`BETTER_AUTH_URL`, for example:

```text
http://localhost:3002/api/auth/callback/google
```

## 4. Static Launch URL Checks

Run:

```bash
sh scripts/launch-check.sh https://getgamedaykit.com
```

Expected:

- `/` returns `200`
- `/robots.txt` returns `200`
- `/sitemap.xml` returns `200`
- `/opengraph-image` returns `200 image/png`
- `/api/og?...` returns `200 image/png`
- `/api/auth/get-session` returns `200`

## 5. Browser Flow Checks

Open `https://getgamedaykit.com` on desktop and mobile.

Verify:

- Poster preview is visible before sign-in.
- Team A and Team B select values are visible.
- Changing teams, background, venue, or offer updates the poster preview.
- Download produces a PNG.
- Clicking Generate while signed out opens Google sign-in.
- Google sign-in succeeds and returns to `/`.
- Clicking Generate while signed in creates a caption.
- Copy button appears only after caption generation.
- Copy button copies the generated caption.
- Invalid fixtures show a clear blocked state.

## 6. Database Write Check

After one successful generation, confirm one row is written:

```sql
select user_id, team_a, team_b, mode, style, offer_text, generated_copy, created_at
from generated_content
order by created_at desc
limit 1;
```

Expected:

- `user_id` is present.
- `team_a` and `team_b` match the selected fixture.
- `generated_copy` is not empty.

## 7. Known Local-Only Behavior

If auth/database config is missing, these local responses are expected:

- `/api/auth/get-session` returns `200 null`
- `/api/generate-copy` returns `503`

Those responses prove fail-fast handling, not production readiness.

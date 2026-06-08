DO $$
BEGIN
  CREATE TYPE poster_mode AS ENUM ('business', 'creator');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE poster_style AS ENUM ('neon', 'retro', 'grid');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  image text,
  credits integer NOT NULL DEFAULT 1,
  is_vip boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_email_unique ON "user" (email);

CREATE TABLE IF NOT EXISTS "session" (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  token text NOT NULL,
  expires_at timestamp NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS session_token_unique ON "session" (token);
CREATE INDEX IF NOT EXISTS session_user_id_index ON "session" (user_id);

CREATE TABLE IF NOT EXISTS "account" (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  access_token text,
  refresh_token text,
  access_token_expires_at timestamp,
  refresh_token_expires_at timestamp,
  scope text,
  id_token text,
  password text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS account_user_id_index ON "account" (user_id);

CREATE TABLE IF NOT EXISTS "verification" (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "generated_content" (
  id serial PRIMARY KEY,
  user_id text REFERENCES "user" (id),
  team_a text NOT NULL,
  team_b text NOT NULL,
  mode poster_mode NOT NULL,
  style poster_style NOT NULL,
  offer_text text,
  prediction_text text,
  generated_copy text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_content_user_id_index
  ON "generated_content" (user_id);

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to connect to PostgreSQL. Expected a Supabase or Postgres connection string, but received an empty value.",
  );
}

const client = postgres(databaseUrl);

export const db = drizzle(client, { schema });

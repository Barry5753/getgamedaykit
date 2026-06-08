import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const initialMigrationSql = readFileSync(
  new URL("../../db/migrations/0001_initial.sql", import.meta.url),
  "utf8",
);

describe("database launch migration", () => {
  it("creates the auth and generated content tables used by the app", () => {
    expect(initialMigrationSql).toContain('CREATE TABLE IF NOT EXISTS "user"');
    expect(initialMigrationSql).toContain('CREATE TABLE IF NOT EXISTS "session"');
    expect(initialMigrationSql).toContain('CREATE TABLE IF NOT EXISTS "account"');
    expect(initialMigrationSql).toContain(
      'CREATE TABLE IF NOT EXISTS "verification"',
    );
    expect(initialMigrationSql).toContain(
      'CREATE TABLE IF NOT EXISTS "generated_content"',
    );
  });

  it("creates the poster enums required by generated content records", () => {
    expect(initialMigrationSql).toContain(
      "CREATE TYPE poster_mode AS ENUM ('business', 'creator')",
    );
    expect(initialMigrationSql).toContain(
      "CREATE TYPE poster_style AS ENUM ('neon', 'retro', 'grid')",
    );
  });
});

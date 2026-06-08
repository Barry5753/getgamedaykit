import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const envExampleText = readFileSync(
  new URL("../../.env.example", import.meta.url),
  "utf8",
);

const requiredEnvKeys = [
  "DATABASE_URL",
  "BETTER_AUTH_URL",
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "APIMART_API_KEY",
] as const;

describe(".env.example", () => {
  it("lists each required launch variable on its own line", () => {
    const envLines = envExampleText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    for (const key of requiredEnvKeys) {
      expect(envLines.some((line) => line.startsWith(`${key}=`))).toBe(true);
    }
  });
});

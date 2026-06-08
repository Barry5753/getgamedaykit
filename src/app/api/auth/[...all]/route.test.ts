import { describe, expect, it } from "vitest";

import { GET } from "./route";

const authConfigKeys = [
  "DATABASE_URL",
  "BETTER_AUTH_URL",
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

describe("auth route runtime configuration", () => {
  it("fails fast for auth endpoints when required runtime config is missing", async () => {
    await withAuthRuntimeConfig({}, async () => {
      const response = await GET(
        new Request("https://getgamedaykit.com/api/auth/session"),
      );

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({
        error:
          "Better Auth is not configured. Expected DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in the environment.",
      });
    });
  });

  it("returns a null session for the client session hook when auth is unconfigured", async () => {
    await withAuthRuntimeConfig({}, async () => {
      const response = await GET(
        new Request("https://getgamedaykit.com/api/auth/get-session"),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBeNull();
    });
  });

  it("requires BETTER_AUTH_URL before loading Better Auth", async () => {
    await withAuthRuntimeConfig(
      {
        DATABASE_URL: "postgres://user:pass@example.com:5432/app",
        BETTER_AUTH_SECRET: "test-secret",
        GOOGLE_CLIENT_ID: "google-client-id",
        GOOGLE_CLIENT_SECRET: "google-client-secret",
      },
      async () => {
        const response = await GET(
          new Request("https://getgamedaykit.com/api/auth/session"),
        );

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toEqual({
          error:
            "Better Auth is not configured. Expected DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in the environment.",
        });
      },
    );
  });
});

async function withAuthRuntimeConfig(
  config: Partial<Record<(typeof authConfigKeys)[number], string>>,
  runAssertion: () => Promise<void>,
) {
  const previousConfig = new Map(
    authConfigKeys.map((key) => [key, process.env[key]]),
  );

  for (const key of authConfigKeys) {
    const configValue = config[key];

    if (configValue === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = configValue;
    }
  }

  try {
    await runAssertion();
  } finally {
    for (const [key, previousValue] of previousConfig) {
      if (previousValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previousValue;
      }
    }
  }
}

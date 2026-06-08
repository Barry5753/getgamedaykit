import { describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

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

  it("returns 403 for sign-up requests without turnstile token", async () => {
    await withAuthRuntimeConfig(
      {
        DATABASE_URL: "postgres://user:pass@example.com:5432/app",
        BETTER_AUTH_URL: "http://localhost:3000",
        BETTER_AUTH_SECRET: "test-secret",
        GOOGLE_CLIENT_ID: "google-client-id",
        GOOGLE_CLIENT_SECRET: "google-client-secret",
      },
      async () => {
        const originalFetch = globalThis.fetch;
        const mockedFetch = vi.fn();

        globalThis.fetch = mockedFetch;
        const previousTurnstileSecret = process.env.TURNSTILE_SECRET_KEY;

        try {
          process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret";

          const response = await POST(
            new Request("https://getgamedaykit.com/api/auth/sign-up/email", {
              method: "POST",
              body: JSON.stringify({ email: "a@example.com", password: "pwd" }),
            }),
          );

          expect(response.status).toBe(403);
          await expect(response.json()).resolves.toEqual({
            error: "人机验证失败，请重试",
          });
          expect(mockedFetch).not.toHaveBeenCalled();
        } finally {
          globalThis.fetch = originalFetch;

          if (previousTurnstileSecret === undefined) {
            delete process.env.TURNSTILE_SECRET_KEY;
          } else {
            process.env.TURNSTILE_SECRET_KEY = previousTurnstileSecret;
          }
        }
      },
    );
  });

  it("returns 403 for invalid turnstile token", async () => {
    await withAuthRuntimeConfig(
      {
        DATABASE_URL: "postgres://user:pass@example.com:5432/app",
        BETTER_AUTH_URL: "http://localhost:3000",
        BETTER_AUTH_SECRET: "test-secret",
        GOOGLE_CLIENT_ID: "google-client-id",
        GOOGLE_CLIENT_SECRET: "google-client-secret",
      },
      async () => {
        const originalFetch = globalThis.fetch;
        const mockedFetch = vi.fn(async () => {
          return new Response(
            JSON.stringify({
              success: false,
              "error-codes": ["invalid-input-response"],
            }),
            { status: 200 },
          );
        });

        globalThis.fetch = mockedFetch;
        const previousTurnstileSecret = process.env.TURNSTILE_SECRET_KEY;

        try {
          process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret";

          const response = await POST(
            new Request("https://getgamedaykit.com/api/auth/sign-up/email", {
              method: "POST",
              body: JSON.stringify({
                email: "a@example.com",
                password: "pwd",
                turnstileToken: "invalid-token",
              }),
            }),
          );

          expect(response.status).toBe(403);
          await expect(response.json()).resolves.toEqual({
            error: "人机验证失败，请重试",
          });

          expect(mockedFetch).toHaveBeenCalledWith(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                secret: "test-turnstile-secret",
                response: "invalid-token",
              }),
            },
          );
        } finally {
          globalThis.fetch = originalFetch;

          if (previousTurnstileSecret === undefined) {
            delete process.env.TURNSTILE_SECRET_KEY;
          } else {
            process.env.TURNSTILE_SECRET_KEY = previousTurnstileSecret;
          }
        }
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

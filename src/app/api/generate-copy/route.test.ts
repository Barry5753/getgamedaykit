import { describe, expect, it } from "vitest";

import {
  buildCopyMessages,
  createGenerateCopyHandler,
  getChatClientSettings,
  parseGenerateCopyPayload,
  trimToWordLimit,
} from "./copy";
import { POST as generateCopyRoutePost } from "./route";

const runtimeConfigKeys = [
  "DATABASE_URL",
  "BETTER_AUTH_URL",
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

const businessPayload = {
  teamA: "Mexico",
  teamB: "South Africa",
  mode: "business",
  style: "neon",
  timeZone: "America/New_York",
  venueName: "Corner Pub",
  offerText: "$5 Pints During The Game",
  predictionText: "",
} as const;

const creatorPayload = {
  teamA: "France",
  teamB: "Senegal",
  mode: "creator",
  style: "grid",
  timeZone: "America/Los_Angeles",
  venueName: "",
  offerText: "",
  predictionText: "Late winner incoming",
} as const;

const businessPromptPayload = {
  ...businessPayload,
  matchDate: "11 JUN 2026",
  kickoffTime: "15:00",
} as const;

const creatorPromptPayload = {
  ...creatorPayload,
  matchDate: "16 JUN 2026",
  kickoffTime: "12:00",
} as const;

describe("parseGenerateCopyPayload", () => {
  it("accepts the business payload", () => {
    expect(parseGenerateCopyPayload(businessPayload)).toEqual(businessPayload);
  });

  it("rejects invalid mode values", () => {
    expect(() =>
      parseGenerateCopyPayload({
        ...businessPayload,
        mode: "fan",
      }),
    ).toThrow(
      "Invalid generate-copy request: mode must be either business or creator; received fan.",
    );
  });

  it("requires venue and offer fields for business copy", () => {
    expect(() =>
      parseGenerateCopyPayload({
        ...businessPayload,
        venueName: "",
        offerText: "",
      }),
    ).toThrow(
      "Invalid generate-copy request: business mode requires venueName and offerText.",
    );
  });
});

describe("buildCopyMessages", () => {
  it("builds a business prompt focused on foot traffic", () => {
    const messages = buildCopyMessages(businessPromptPayload);

    expect(messages[1]?.content).toContain("drive foot traffic");
    expect(messages[1]?.content).toContain("11 JUN 2026 at 15:00 local time");
    expect(messages[1]?.content).toContain("$5 Pints During The Game");
    expect(messages[1]?.content).toContain("#WorldCup2026");
  });

  it("builds a creator prompt focused on viral hooks", () => {
    const messages = buildCopyMessages(creatorPromptPayload);

    expect(messages[1]?.content).toContain("viral social hooks");
    expect(messages[1]?.content).toContain("Late winner incoming");
    expect(messages[1]?.content).toContain("#WorldCup2026");
  });
});

describe("trimToWordLimit", () => {
  it("keeps output under the requested word limit", () => {
    const copy = Array.from({ length: 140 }, (_, index) => `word${index}`).join(
      " ",
    );

    expect(trimToWordLimit(copy, 120).split(/\s+/)).toHaveLength(120);
  });
});

describe("getChatClientSettings", () => {
  it("prefers APIMart when APIMART_API_KEY is present", () => {
    expect(
      getChatClientSettings({
        APIMART_API_KEY: "apimart_key",
      }),
    ).toEqual({
      apiKey: "apimart_key",
      baseURL: "https://api.apimart.ai/v1",
      model: "gpt-5-mini",
      providerName: "APIMart",
    });
  });

  it("allows APIMart base URL and model overrides", () => {
    expect(
      getChatClientSettings({
        APIMART_API_KEY: "apimart_key",
        APIMART_BASE_URL: "https://api.apimart.ai/api/v1",
        APIMART_MODEL: "gemini-2.5-flash",
      }),
    ).toEqual({
      apiKey: "apimart_key",
      baseURL: "https://api.apimart.ai/api/v1",
      model: "gemini-2.5-flash",
      providerName: "APIMart",
    });
  });

  it("keeps OpenAI as a fallback provider", () => {
    expect(
      getChatClientSettings({
        OPENAI_API_KEY: "openai_key",
      }),
    ).toEqual({
      apiKey: "openai_key",
      baseURL: undefined,
      model: "gpt-4o-mini",
      providerName: "OpenAI",
    });
  });

  it("fails fast when no provider API key is configured", () => {
    expect(() => getChatClientSettings({})).toThrow(
      "APIMART_API_KEY or OPENAI_API_KEY is required to generate matchday copy.",
    );
  });
});

describe("createGenerateCopyHandler", () => {
  it("returns unauthorized when the request has no valid session", async () => {
    const handler = createGenerateCopyHandler({
      getSession: async () => null,
      generateCopy: async () => "unused",
      saveGeneratedContent: async () => undefined,
    });

    const response = await handler(
      new Request("https://getgamedaykit.com/api/generate-copy", {
        method: "POST",
        body: JSON.stringify(businessPayload),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Sign in with Google before generating matchday copy.",
    });
  });

  it("generates and stores copy for an authenticated user", async () => {
    const savedCopy: string[] = [];
    const handler = createGenerateCopyHandler({
      getSession: async () => ({ user: { id: "user_123" } }),
      generateCopy: async () => "Tonight is huge. Join us. #WorldCup2026",
      saveGeneratedContent: async ({ generatedCopy }) => {
        savedCopy.push(generatedCopy);
      },
    });

    const response = await handler(
      new Request("https://getgamedaykit.com/api/generate-copy", {
        method: "POST",
        body: JSON.stringify(businessPayload),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      copy: "Tonight is huge. Join us. #WorldCup2026",
    });
    expect(savedCopy).toEqual(["Tonight is huge. Join us. #WorldCup2026"]);
  });

  it("rejects team pairings that are not official group-stage fixtures", async () => {
    const handler = createGenerateCopyHandler({
      getSession: async () => ({ user: { id: "user_123" } }),
      generateCopy: async () => "unused",
      saveGeneratedContent: async () => undefined,
    });

    const response = await handler(
      new Request("https://getgamedaykit.com/api/generate-copy", {
        method: "POST",
        body: JSON.stringify({
          ...businessPayload,
          teamA: "Argentina",
          teamB: "Brazil",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error:
        "No official FIFA 2026 group-stage fixture found for Argentina vs Brazil. Choose a valid matchup from the official schedule.",
    });
  });
});

describe("generate-copy route runtime configuration", () => {
  it("fails fast when auth and database runtime config is missing", async () => {
    await withRuntimeConfig({}, async () => {
      const response = await generateCopyRoutePost(
        new Request("https://getgamedaykit.com/api/generate-copy", {
          method: "POST",
          body: JSON.stringify(businessPayload),
        }),
      );

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({
        error:
          "Caption generation is not configured. Expected DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in the environment.",
      });
    });
  });

  it("requires BETTER_AUTH_URL before loading the auth and database handler", async () => {
    await withRuntimeConfig(
      {
        DATABASE_URL: "postgres://user:pass@example.com:5432/app",
        BETTER_AUTH_SECRET: "test-secret",
        GOOGLE_CLIENT_ID: "google-client-id",
        GOOGLE_CLIENT_SECRET: "google-client-secret",
      },
      async () => {
        const response = await generateCopyRoutePost(
          new Request("https://getgamedaykit.com/api/generate-copy", {
            method: "POST",
            body: JSON.stringify(businessPayload),
          }),
        );

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toEqual({
          error:
            "Caption generation is not configured. Expected DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in the environment.",
        });
      },
    );
  });
});

async function withRuntimeConfig(
  config: Partial<Record<(typeof runtimeConfigKeys)[number], string>>,
  runAssertion: () => Promise<void>,
) {
  const previousConfig = new Map(
    runtimeConfigKeys.map((key) => [key, process.env[key]]),
  );

  for (const key of runtimeConfigKeys) {
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

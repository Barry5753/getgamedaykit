import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { getMatchSchedule } from "../../../lib/matchday";
import type { PosterMode, PosterStyle } from "../og/poster";

type GenerateCopyPayload = {
  teamA: string;
  teamB: string;
  mode: PosterMode;
  style: PosterStyle;
  timeZone: string;
  venueName: string;
  offerText: string;
  predictionText: string;
};

type GenerateCopyInput = GenerateCopyPayload & {
  matchDate: string;
  kickoffTime: string;
};

type GenerateCopySession = {
  user: {
    id: string;
  };
};

type GeneratedContentInput = GenerateCopyPayload & {
  userId: string;
  generatedCopy: string;
};

type GenerateCopyDependencies = {
  getSession: (request: Request) => Promise<GenerateCopySession | null>;
  generateCopy: (input: GenerateCopyInput) => Promise<string>;
  saveGeneratedContent: (input: GeneratedContentInput) => Promise<void>;
};

class GenerateCopyRequestError extends Error {}

type ChatClientSettings = {
  apiKey: string;
  baseURL?: string;
  model: string;
  providerName: "APIMart" | "OpenAI";
};

type ChatClientEnvironment = {
  APIMART_API_KEY?: string;
  APIMART_BASE_URL?: string;
  APIMART_MODEL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL?: string;
};

export const POST = createGenerateCopyHandler({
  getSession: getCurrentSession,
  generateCopy,
  saveGeneratedContent,
});

export function createGenerateCopyHandler({
  getSession,
  generateCopy,
  saveGeneratedContent,
}: GenerateCopyDependencies) {
  return async function generateCopyHandler(request: Request) {
    const session = await getSession(request);

    if (!session) {
      return Response.json(
        {
          error: "Sign in with Google before generating matchday copy.",
        },
        { status: 401 },
      );
    }

    let payload: GenerateCopyPayload;

    try {
      payload = parseGenerateCopyPayload(await request.json());
    } catch (error) {
      if (error instanceof GenerateCopyRequestError) {
        return Response.json({ error: error.message }, { status: 400 });
      }

      throw error;
    }

    const matchSchedule = getMatchSchedule(
      payload.teamA,
      payload.teamB,
      payload.timeZone,
    );

    if (!matchSchedule) {
      return Response.json(
        {
          error: `No official FIFA 2026 group-stage fixture found for ${payload.teamA} vs ${payload.teamB}. Choose a valid matchup from the official schedule.`,
        },
        { status: 400 },
      );
    }

    const generatedCopy = trimToWordLimit(
      await generateCopy({
        ...payload,
        matchDate: matchSchedule.matchDate,
        kickoffTime: matchSchedule.kickoffTime,
      }),
      120,
    );

    await saveGeneratedContent({
      ...payload,
      userId: session.user.id,
      generatedCopy,
    });

    return Response.json({ copy: generatedCopy });
  };
}

export function parseGenerateCopyPayload(value: unknown): GenerateCopyPayload {
  if (!isRecord(value)) {
    throw new GenerateCopyRequestError(
      "Invalid generate-copy request: expected a JSON object body.",
    );
  }

  const mode = getMode(value.mode);
  const venueName = getOptionalString(value.venueName);
  const offerText = getOptionalString(value.offerText).slice(0, 40);

  if (mode === "business" && (!venueName || !offerText)) {
    throw new GenerateCopyRequestError(
      "Invalid generate-copy request: business mode requires venueName and offerText.",
    );
  }

  return {
    teamA: getRequiredString(value.teamA, "teamA"),
    teamB: getRequiredString(value.teamB, "teamB"),
    mode,
    style: getStyle(value.style),
    timeZone: getTimeZone(value.timeZone),
    venueName,
    offerText,
    predictionText: getOptionalString(value.predictionText).slice(0, 140),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new GenerateCopyRequestError(
      `Invalid generate-copy request: ${fieldName} must be a non-empty string; received ${String(value)}.`,
    );
  }

  return value.trim();
}

function getOptionalString(value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new GenerateCopyRequestError(
      `Invalid generate-copy request: optional text fields must be strings; received ${typeof value}.`,
    );
  }

  return value.trim();
}

function getMode(value: unknown): PosterMode {
  if (value === "business" || value === "creator") {
    return value;
  }

  throw new GenerateCopyRequestError(
    `Invalid generate-copy request: mode must be either business or creator; received ${String(value)}.`,
  );
}

function getStyle(value: unknown): PosterStyle {
  if (value === "neon" || value === "retro" || value === "grid") {
    return value;
  }

  throw new GenerateCopyRequestError(
    `Invalid generate-copy request: style must be neon, retro, or grid; received ${String(value)}.`,
  );
}

export function buildCopyMessages(
  payload: GenerateCopyInput,
): ChatCompletionMessageParam[] {
  const sharedRule =
    "Keep the answer under 120 words, write clear English, use contextual sports emojis, and include #WorldCup2026 exactly once.";

  if (payload.mode === "business") {
    return [
      {
        role: "system",
        content:
          "You are a sharp social media copywriter for overseas sports bars, Irish pubs, and restaurants.",
      },
      {
        role: "user",
        content: `Write a high-conversion Instagram and X caption for ${payload.teamA} vs ${payload.teamB} on ${payload.matchDate} at ${payload.kickoffTime} local time. Optimize it to drive foot traffic to ${payload.venueName || "the venue"} and make the promotion feel urgent: "${payload.offerText || "Live match screening"}". ${sharedRule}`,
      },
    ];
  }

  return [
    {
      role: "system",
      content:
        "You are a high-energy football creator who writes punchy social captions that invite replies.",
    },
    {
      role: "user",
      content: `Write a caption for ${payload.teamA} vs ${payload.teamB} on ${payload.matchDate} at ${payload.kickoffTime} local time. Optimize for viral social hooks, match hype, and replies around this prediction or thought: "${payload.predictionText || "This match is going to be chaos"}". ${sharedRule}`,
    },
  ];
}

export function trimToWordLimit(copy: string, maxWords: number) {
  const words = copy.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return copy.trim();
  }

  return words.slice(0, maxWords).join(" ");
}

export async function getCurrentSession(request: Request) {
  const { auth } = await import("../../../lib/auth");

  return auth.api.getSession({
    headers: request.headers,
  }) as Promise<GenerateCopySession | null>;
}

function getTimeZone(value: unknown) {
  const timeZone = getOptionalString(value) || "UTC";

  try {
    Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
  } catch {
    throw new GenerateCopyRequestError(
      `Invalid generate-copy request: timeZone must be a valid IANA time zone; received ${timeZone}.`,
    );
  }

  return timeZone;
}

export function getChatClientSettings(
  env: ChatClientEnvironment = process.env as unknown as ChatClientEnvironment,
): ChatClientSettings {
  if (env.APIMART_API_KEY) {
    return {
      apiKey: env.APIMART_API_KEY,
      baseURL: env.APIMART_BASE_URL ?? "https://api.apimart.ai/v1",
      model: env.APIMART_MODEL ?? "gpt-5-mini",
      providerName: "APIMart",
    };
  }

  if (env.OPENAI_API_KEY) {
    return {
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL,
      model: env.OPENAI_MODEL ?? "gpt-4o-mini",
      providerName: "OpenAI",
    };
  }

  throw new Error(
    "APIMART_API_KEY or OPENAI_API_KEY is required to generate matchday copy. Expected an API key in the environment, but received an empty value.",
  );
}

export async function generateCopy(payload: GenerateCopyInput) {
  const chatClientSettings = getChatClientSettings();

  const client = new OpenAI({
    apiKey: chatClientSettings.apiKey,
    baseURL: chatClientSettings.baseURL,
  });
  const completion = await client.chat.completions.create({
    model: chatClientSettings.model,
    messages: buildCopyMessages(payload),
    temperature: 0.8,
    max_tokens: 180,
    stream: false,
  });

  const generatedCopy = completion.choices[0]?.message.content?.trim();

  if (!generatedCopy) {
    throw new Error(
      `${chatClientSettings.providerName} returned an empty caption. Expected non-empty generated text in choices[0].message.content.`,
    );
  }

  return generatedCopy;
}

export async function saveGeneratedContent(input: GeneratedContentInput) {
  const [{ db }, { generatedContent }] = await Promise.all([
    import("../../../db"),
    import("../../../db/schema"),
  ]);

  await db.insert(generatedContent).values({
    userId: input.userId,
    teamA: input.teamA,
    teamB: input.teamB,
    mode: input.mode,
    style: input.style,
    offerText: input.offerText || null,
    predictionText: input.predictionText || null,
    generatedCopy: input.generatedCopy,
  });
}

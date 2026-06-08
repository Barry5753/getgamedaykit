import { toNextJsHandler } from "better-auth/next-js";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_ERROR_TEXT = "人机验证失败，请重试";

function isAuthConfigured() {
  return Boolean(
    process.env.DATABASE_URL &&
      process.env.BETTER_AUTH_URL &&
      process.env.BETTER_AUTH_SECRET &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET,
  );
}

function isRegistrationRequest(request: Request) {
  const pathname = new URL(request.url).pathname;

  return pathname.endsWith("/sign-up/email") || pathname.endsWith("/sign-up");
}

async function verifyTurnstileForRegistration(
  request: Request,
): Promise<Response | null> {
  if (!isRegistrationRequest(request)) {
    return null;
  }

  if (!process.env.TURNSTILE_SECRET_KEY) {
    return Response.json(
      { error: "Turnstile 配置缺失，请联系管理员" },
      { status: 500 },
    );
  }

  let requestBody: {
    turnstileToken?: unknown;
    additionalData?: { turnstileToken?: unknown };
  };

  try {
    requestBody = (await request.clone().json()) as {
      turnstileToken?: unknown;
      additionalData?: { turnstileToken?: unknown };
      [key: string]: unknown;
    };
  } catch {
    return Response.json(
      { error: TURNSTILE_ERROR_TEXT },
      { status: 403 },
    );
  }

  const tokenFromBody =
    typeof requestBody.turnstileToken === "string"
      ? requestBody.turnstileToken
      : requestBody.additionalData?.turnstileToken;

  if (typeof tokenFromBody !== "string" || !tokenFromBody.trim()) {
    return Response.json({ error: TURNSTILE_ERROR_TEXT }, { status: 403 });
  }

  try {
    const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Cloudflare token 仅可校验一次；超时未用会失效（约 5 分钟）。
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: tokenFromBody,
      }),
    });

    const verifyResult = (await verifyResponse.json()) as {
      success?: boolean;
    };

    if (!verifyResult.success) {
      return Response.json({ error: TURNSTILE_ERROR_TEXT }, { status: 403 });
    }
  } catch {
    return Response.json({ error: TURNSTILE_ERROR_TEXT }, { status: 403 });
  }

  return null;
}

function getUnconfiguredAuthResponse(request: Request) {
  if (new URL(request.url).pathname.endsWith("/get-session")) {
    return Response.json(null);
  }

  return Response.json(
    {
      error:
        "Better Auth is not configured. Expected DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in the environment.",
    },
    { status: 503 },
  );
}

async function getAuthHandlers() {
  const { auth } = await import("../../../../lib/auth");
  return toNextJsHandler(auth);
}

export async function GET(request: Request) {
  if (!isAuthConfigured()) {
    return getUnconfiguredAuthResponse(request);
  }

  const handlers = await getAuthHandlers();
  return handlers.GET(request);
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return getUnconfiguredAuthResponse(request);
  }

  const turnstileResponse = await verifyTurnstileForRegistration(request);

  if (turnstileResponse) {
    return turnstileResponse;
  }

  const handlers = await getAuthHandlers();
  return handlers.POST(request);
}

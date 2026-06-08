import { toNextJsHandler } from "better-auth/next-js";

function isAuthConfigured() {
  return Boolean(
    process.env.DATABASE_URL &&
      process.env.BETTER_AUTH_URL &&
      process.env.BETTER_AUTH_SECRET &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET,
  );
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

  const handlers = await getAuthHandlers();
  return handlers.POST(request);
}

import { POST as generateCopyPost } from "./copy";

function isGenerateCopyConfigured() {
  return Boolean(
    process.env.DATABASE_URL &&
      process.env.BETTER_AUTH_URL &&
      process.env.BETTER_AUTH_SECRET &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET,
  );
}

function getUnconfiguredGenerateCopyResponse() {
  return Response.json(
    {
      error:
        "Caption generation is not configured. Expected DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in the environment.",
    },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  if (!isGenerateCopyConfigured()) {
    return getUnconfiguredGenerateCopyResponse();
  }

  return generateCopyPost(request);
}

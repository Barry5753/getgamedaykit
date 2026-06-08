import type { PosterFormState } from "@/lib/matchday";
import {
  canRetryGenerateCopy,
  getGenerateCopyErrorMessage,
} from "@/lib/matchday-flow";

type GenerateCopyResponse = {
  copy?: string;
  error?: string;
};

type GenerateMatchdayCopyInput = {
  formState: PosterFormState;
  timeZone: string;
};

type GenerateMatchdayCopyResult =
  | {
      ok: true;
      copy: string;
    }
  | {
      ok: false;
      canRetry: boolean;
      message: string;
    };

export async function generateMatchdayCopy({
  formState,
  timeZone,
}: GenerateMatchdayCopyInput): Promise<GenerateMatchdayCopyResult> {
  try {
    const response = await fetch("/api/generate-copy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamA: formState.teamA,
        teamB: formState.teamB,
        mode: "business",
        style: "neon",
        timeZone,
        venueName: formState.venueName,
        offerText: formState.offerText,
        predictionText: "",
      }),
    });
    const body = await readGenerateCopyResponse(response);

    if (!response.ok) {
      const serverError = body.error ?? "";

      return {
        ok: false,
        canRetry: canRetryGenerateCopy(response.status, serverError),
        message: getGenerateCopyErrorMessage(response.status, serverError),
      };
    }

    if (!body.copy) {
      return {
        ok: false,
        canRetry: true,
        message: "The caption service returned no copy. Try again in a moment.",
      };
    }

    return {
      ok: true,
      copy: body.copy,
    };
  } catch {
    return {
      ok: false,
      canRetry: true,
      message: "Unable to generate matchday copy.",
    };
  }
}

async function readGenerateCopyResponse(response: Response) {
  try {
    return (await response.json()) as GenerateCopyResponse;
  } catch {
    return {};
  }
}

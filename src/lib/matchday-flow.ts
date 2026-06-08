import {
  getMatchSchedule,
  getScheduleWarning,
  type PosterFormState,
} from "./matchday";

export type PreviewPanel = "image" | "copy";

type GenerateReadinessInput = {
  formState: PosterFormState;
  timeZone: string;
};

export function getGenerateReadiness({
  formState,
  timeZone,
}: GenerateReadinessInput) {
  if (!getMatchSchedule(formState.teamA, formState.teamB, timeZone)) {
    return {
      canGenerate: false,
      message: getScheduleWarning(formState.teamA, formState.teamB),
    };
  }

  if (!formState.venueName.trim() || !formState.offerText.trim()) {
    return {
      canGenerate: false,
      message:
        "Add your venue name and matchday offer before generating the caption.",
    };
  }

  return {
    canGenerate: true,
    message: "",
  };
}

export function getPreviewPanelAfterFeedback(
  currentPanel: PreviewPanel,
  generatedCopy: string,
  errorMessage: string,
): PreviewPanel {
  if (generatedCopy.trim() || errorMessage.trim()) {
    return "copy";
  }

  return currentPanel;
}

export function getGenerateCopyErrorMessage(
  statusCode: number,
  serverError: string,
) {
  const trimmedServerError = serverError.trim();

  if (statusCode === 503 && trimmedServerError.includes("not configured")) {
    return "Caption generation is temporarily unavailable while auth and database setup is being finished. You can still preview and download the poster.";
  }

  if (statusCode === 401 && trimmedServerError) {
    return trimmedServerError;
  }

  return (
    trimmedServerError || "Unable to generate matchday copy. Try again in a moment."
  );
}

export function canRetryGenerateCopy(statusCode: number, serverError: string) {
  return !(statusCode === 503 && serverError.includes("not configured"));
}

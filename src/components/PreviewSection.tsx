"use client";

import {
  AlertTriangle,
  Check,
  Clipboard,
  Download,
  Image as ImageIcon,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  MessageSquare,
  WandSparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { PosterFormState } from "@/lib/matchday";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getMatchSchedule } from "@/lib/matchday";
import {
  getPreviewPanelAfterFeedback,
  type PreviewPanel,
} from "@/lib/matchday-flow";
import { getTeamFlagEmoji, getTeamFlagSrc } from "@/lib/team-flags";

type PreviewSectionProps = {
  formState: PosterFormState;
  posterImageUrl: string;
  generatedCopy: string;
  errorMessage: string;
  canRetryGeneration: boolean;
  scheduleWarning: string;
  timeZone: string;
  isGenerating: boolean;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  onRetry: () => void;
};

export function PreviewSection({
  formState,
  posterImageUrl,
  generatedCopy,
  errorMessage,
  canRetryGeneration,
  scheduleWarning,
  timeZone,
  isGenerating,
  isAuthenticated,
  onAuthRequired,
  onRetry,
}: PreviewSectionProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [downloadState, setDownloadState] = useState<
    "idle" | "downloading" | "downloaded" | "failed"
  >("idle");
  const [activePanel, setActivePanel] = useState<PreviewPanel>("image");
  const matchSchedule = getMatchSchedule(
    formState.teamA,
    formState.teamB,
    timeZone,
  );

  useEffect(() => {
    setActivePanel((currentPanel) =>
      getPreviewPanelAfterFeedback(
        currentPanel,
        generatedCopy,
        errorMessage,
      ),
    );
  }, [errorMessage, generatedCopy]);

  async function copyGeneratedText() {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    if (!generatedCopy) {
      return;
    }

    await navigator.clipboard.writeText(generatedCopy);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  async function downloadPoster() {
    setDownloadState("downloading");

    try {
      const response = await fetch(posterImageUrl);

      if (!response.ok) {
        throw new Error(
          `Poster download failed: expected 200, received ${response.status}.`,
        );
      }

      const posterBlob = await response.blob();
      const posterBlobUrl = URL.createObjectURL(posterBlob);
      const posterLink = document.createElement("a");

      posterLink.href = posterBlobUrl;
      posterLink.download = `${formState.teamA}-vs-${formState.teamB}-matchday-poster.png`;
      document.body.appendChild(posterLink);
      posterLink.click();
      posterLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(posterBlobUrl), 1000);
      setDownloadState("downloaded");
      window.setTimeout(() => setDownloadState("idle"), 1800);
    } catch {
      setDownloadState("failed");
    }
  }

  function changeActivePanel(value: string) {
    if (value === "image" || value === "copy") {
      setActivePanel(value);
    }
  }

  return (
    <section className="md:sticky md:top-24">
      <Card className="overflow-hidden">
        <CardHeader className="gap-3 p-5 sm:gap-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                Preview
              </p>
              <CardTitle className="mt-2 text-2xl sm:text-3xl">
                {formState.teamA} vs {formState.teamB}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Local time: {timeZone}
              </p>
            </div>
            <span className="rounded-full border border-border bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
              LIVE
            </span>
          </div>

          <Tabs value={activePanel} onValueChange={changeActivePanel}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">
                <ImageIcon />
                <span className="sm:hidden">Poster</span>
                <span className="hidden sm:inline">Image Poster</span>
              </TabsTrigger>
              <TabsTrigger value="copy">
                <MessageSquare />
                <span className="sm:hidden">Copy</span>
                <span className="hidden sm:inline">Social Copy</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
          <Tabs value={activePanel} onValueChange={changeActivePanel}>
            <TabsContent value="image">
              {scheduleWarning ? (
                <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  {scheduleWarning}
                </p>
              ) : null}

              <div className="relative overflow-hidden rounded-xl border border-border bg-background p-1">
                <PosterPreviewArtwork
                  formState={formState}
                  matchDate={matchSchedule?.matchDate ?? "Fixture not found"}
                  kickoffTime={matchSchedule?.kickoffTime ?? "--:--"}
                />
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 backdrop-blur-sm">
                    <LoaderCircle className="size-10 animate-spin text-accent" />
                    <div className="space-y-2 text-center">
                      <p className="text-sm font-semibold text-foreground">
                        Building caption
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Keeping the poster preview in place.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 lg:hidden">
                <Button
                  variant="outline"
                  onClick={downloadPoster}
                  disabled={downloadState === "downloading"}
                >
                  {downloadState === "downloading" ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Download />
                  )}
                  {getDownloadButtonLabel(downloadState)}
                </Button>
                <Button
                  onClick={onRetry}
                  disabled={isGenerating || Boolean(scheduleWarning)}
                >
                  {isGenerating ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <WandSparkles />
                  )}
                  {isGenerating ? "Generating" : "Generate"}
                </Button>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button
                  className="sm:flex-1"
                  variant="outline"
                  onClick={downloadPoster}
                  disabled={downloadState === "downloading"}
                >
                  {downloadState === "downloading" ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Download />
                  )}
                  {getDownloadButtonLabel(downloadState)}
                </Button>
                <Button
                  className="sm:flex-1"
                  onClick={onRetry}
                  disabled={isGenerating || Boolean(scheduleWarning)}
                >
                  <WandSparkles />
                  {isGenerating ? "Generating" : "Generate"}
                </Button>
              </div>

              {downloadState === "failed" ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  Poster download failed. Open the preview again after the page
                  finishes loading.
                </p>
              ) : null}
            </TabsContent>

            <TabsContent value="copy">
              <div className="min-h-60 rounded-xl border border-border bg-background p-4 text-sm leading-7 text-foreground">
                {generatedCopy ? (
                  <div className="space-y-3">
                    <p className="inline-flex rounded-sm border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-primary">
                      Ready to post
                    </p>
                    <p className="whitespace-pre-wrap text-foreground">
                      {generatedCopy}
                    </p>
                  </div>
                ) : (
                  <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    {isAuthenticated ? (
                      <MessageSquare className="size-8 text-accent" />
                    ) : (
                      <LockKeyhole className="size-8 text-accent" />
                    )}
                    <p className="max-w-sm text-sm leading-6">
                      <span className="sm:hidden">
                        Generated caption appears here after sign-in.
                      </span>
                      <span className="hidden sm:inline">
                        Your Instagram and X caption will appear here after you
                        generate the matchday kit. Use the poster preview to
                        refine the fixture, venue, and offer first.
                      </span>
                    </p>
                    {isAuthenticated ? (
                      <Button
                        className="mt-1 w-full max-w-xs"
                        onClick={onRetry}
                        disabled={isGenerating || Boolean(scheduleWarning)}
                      >
                        <WandSparkles />
                        {isGenerating ? "Generating..." : "Generate copy"}
                      </Button>
                    ) : (
                      <Button
                        className="mt-1 w-full max-w-xs"
                        onClick={onAuthRequired}
                      >
                        <LogIn />
                        Sign in to generate
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {errorMessage ? (
                <div className="mt-3 rounded-md border border-destructive/60 bg-destructive/10 p-3 text-sm text-destructive">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                  {canRetryGeneration ? (
                    <Button
                      className="mt-3 w-full"
                      variant="outline"
                      onClick={onRetry}
                      disabled={isGenerating || Boolean(scheduleWarning)}
                    >
                      <LoaderCircle
                        className={isGenerating ? "animate-spin" : ""}
                      />
                      {isGenerating ? "Trying again..." : "Try again"}
                    </Button>
                  ) : (
                <p className="mt-3 rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                      You can keep editing the poster and download it without
                      waiting for caption generation.
                    </p>
                  )}
                </div>
              ) : null}

              {generatedCopy ? (
                <Button className="mt-4 w-full" onClick={copyGeneratedText}>
                  {copyState === "copied" ? <Check /> : <Clipboard />}
                  {copyState === "copied" ? "Copied!" : "Copy generated caption"}
                </Button>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}

function getDownloadButtonLabel(
  downloadState: "idle" | "downloading" | "downloaded" | "failed",
) {
  if (downloadState === "downloading") {
    return "Preparing";
  }

  if (downloadState === "downloaded") {
    return "Ready";
  }

  return "Download";
}

function PosterPreviewArtwork({
  formState,
  matchDate,
  kickoffTime,
}: {
  formState: PosterFormState;
  matchDate: string;
  kickoffTime: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${formState.teamA} vs ${formState.teamB} matchday poster preview`}
      className="relative aspect-video w-full overflow-hidden rounded-lg bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0.68)), url(${formState.bgUrl})`,
      }}
    >
      <div className="absolute inset-x-0 top-[18%] text-center font-mono text-[10px] text-white/90 sm:text-xs">
        {matchDate}
      </div>

      <div className="absolute inset-x-0 top-[32%] flex items-center justify-center gap-1.5 px-3 text-white lg:gap-4 lg:px-4">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 lg:gap-2">
          <div className="min-w-0 truncate text-right text-xs font-medium leading-none sm:text-sm lg:text-xl">
            {formState.teamA}
          </div>
          <TeamFlag teamName={formState.teamA} />
        </div>
        <div className="shrink-0 font-mono text-lg font-semibold tabular-nums sm:text-xl lg:text-4xl">
          {kickoffTime}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-start gap-1.5 lg:gap-2">
          <TeamFlag teamName={formState.teamB} />
          <div className="min-w-0 truncate text-left text-xs font-medium leading-none sm:text-sm lg:text-xl">
            {formState.teamB}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-3 bottom-[13%] text-center text-white lg:inset-x-4">
        <div className="text-xs font-medium leading-none lg:text-sm">
          {formState.venueName || "Your venue"}
        </div>
        <div className="mt-1.5 text-sm font-semibold leading-none sm:text-base lg:mt-3 lg:text-2xl">
          {formState.offerText || "Live match screening"}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-[9px] font-bold text-white/90 lg:text-[10px]">
        getgamedaykit.com · 2026 World Cup Edition
      </div>
    </div>
  );
}

function TeamFlag({ teamName }: { teamName: string }) {
  const [hasImageError, setHasImageError] = useState(false);
  const flagSrc = getTeamFlagSrc(teamName);
  const flagEmoji = getTeamFlagEmoji(teamName);

  if (!flagSrc && !flagEmoji) {
    return null;
  }

  return (
    <span className="flex h-5 w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white/95 p-0.5 lg:h-8 lg:w-11">
      {flagSrc && !hasImageError ? (
        <img
          alt={`${teamName} flag`}
          className="h-full w-full rounded-[2px] object-cover"
          decoding="async"
          height={32}
          loading="lazy"
          onError={() => setHasImageError(true)}
          src={flagSrc}
          width={44}
        />
      ) : (
        <span
          aria-label={`${teamName} flag`}
          className="text-sm leading-none lg:text-2xl"
          role="img"
        >
          {flagEmoji}
        </span>
      )}
    </span>
  );
}

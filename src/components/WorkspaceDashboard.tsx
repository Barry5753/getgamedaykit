"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";

import {
  buildPosterImageUrl,
  getScheduleWarning,
  getUserTimeZone,
  initialPosterFormState,
  type PosterFormState,
} from "@/lib/matchday";
import { getGenerateReadiness } from "@/lib/matchday-flow";
import { authClient } from "@/lib/auth-client";
import { generateMatchdayCopy } from "@/lib/generate-copy-client";
import { AuthDialog } from "@/components/AuthDialog";
import { FormSection } from "@/components/FormSection";
import { HeroSection } from "@/components/HeroSection";
import { LaunchNotes } from "@/components/LaunchNotes";
import { Navbar } from "@/components/Navbar";
import { PreviewSection } from "@/components/PreviewSection";

export function WorkspaceDashboard() {
  const [formState, setFormState] = useState<PosterFormState>(
    initialPosterFormState,
  );
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [canRetryGeneration, setCanRetryGeneration] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState("UTC");
  const { data: session } = authClient.useSession();
  const isAuthenticated = Boolean(session);
  const scheduleWarning = useMemo(
    () => getScheduleWarning(formState.teamA, formState.teamB),
    [formState.teamA, formState.teamB],
  );

  const posterImageUrl = useMemo(
    () => buildPosterImageUrl(formState, userTimeZone),
    [formState, userTimeZone],
  );
  const generateReadiness = useMemo(
    () =>
      getGenerateReadiness({
        formState,
        timeZone: userTimeZone,
      }),
    [formState, userTimeZone],
  );

  useEffect(() => {
    setUserTimeZone(getUserTimeZone());
  }, []);

  function updateForm<Key extends keyof PosterFormState>(
    key: Key,
    value: PosterFormState[Key],
  ) {
    setGeneratedCopy("");
    setErrorMessage("");
    setCanRetryGeneration(false);
    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  }

  async function generateMatchdayKit() {
    if (!generateReadiness.canGenerate) {
      setErrorMessage(generateReadiness.message);
      setCanRetryGeneration(false);
      return;
    }

    if (!isAuthenticated) {
      setErrorMessage("");
      setCanRetryGeneration(false);
      setIsAuthDialogOpen(true);
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setCanRetryGeneration(false);
    setGeneratedCopy("");

    try {
      const copyResult = await generateMatchdayCopy({
        formState,
        timeZone: userTimeZone,
      });

      if (!copyResult.ok) {
        setErrorMessage(copyResult.message);
        setCanRetryGeneration(copyResult.canRetry);
        return;
      }

      setGeneratedCopy(copyResult.copy);
      setCanRetryGeneration(false);
    } finally {
      setIsGenerating(false);
    }
  }

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <HeroSection />

        <section className="grid gap-5 md:grid-cols-2 md:items-start md:gap-8">
          <div className="order-2 md:order-1">
            <FormSection
              formState={formState}
              scheduleWarning={scheduleWarning}
              generateBlockMessage={generateReadiness.message}
              isGenerating={isGenerating}
              onChange={updateForm}
              onGenerate={generateMatchdayKit}
            />
          </div>
          <div className="order-1 md:order-2">
            <PreviewSection
              formState={formState}
              posterImageUrl={posterImageUrl}
              generatedCopy={generatedCopy}
              errorMessage={errorMessage}
              canRetryGeneration={canRetryGeneration}
              scheduleWarning={scheduleWarning}
              timeZone={userTimeZone}
              isGenerating={isGenerating}
              isAuthenticated={isAuthenticated}
              onAuthRequired={() => setIsAuthDialogOpen(true)}
              onRetry={generateMatchdayKit}
            />
          </div>
        </section>

        <LaunchNotes />

        <footer className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>GameDayKit for World Cup 2026 matchday venue promos.</p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" />
            Preview first. Sign in only when generating copy.
          </p>
        </footer>
      </main>

      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onSignIn={signInWithGoogle}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, PencilRuler, WandSparkles } from "lucide-react";

import {
  POSTER_BACKGROUNDS,
  WORLD_CUP_TEAMS,
  type PosterFormState,
} from "@/lib/matchday";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FormSectionProps = {
  formState: PosterFormState;
  scheduleWarning: string;
  generateBlockMessage: string;
  isGenerating: boolean;
  onChange: <Key extends keyof PosterFormState>(
    key: Key,
    value: PosterFormState[Key],
  ) => void;
  onGenerate: () => void;
};

export function FormSection({
  formState,
  scheduleWarning,
  generateBlockMessage,
  isGenerating,
  onChange,
  onGenerate,
}: FormSectionProps) {
  const isGenerateDisabled = isGenerating || Boolean(generateBlockMessage);

  return (
    <Card id="matchday-workspace">
      <CardHeader className="gap-3 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            Builder
          </CardDescription>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            Edit
          </span>
        </div>
        <h2 className="text-xl font-semibold leading-none text-foreground sm:text-3xl">
          <span className="sm:hidden">Build the poster.</span>
          <span className="hidden sm:inline">
            Choose the fixture, offer, and poster look.
          </span>
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Start with an official group-stage matchup, add your venue offer, and
          preview the matchday creative before generating the caption.
        </p>
      </CardHeader>

      <CardContent className="relative flex flex-col gap-4 p-5 pt-0 sm:gap-5 sm:p-6 sm:pt-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <TeamSelect
            label="Team A"
            value={formState.teamA}
            onChange={(value) => onChange("teamA", value)}
          />
          <TeamSelect
            label="Team B"
            value={formState.teamB}
            onChange={(value) => onChange("teamB", value)}
          />
        </div>

        {scheduleWarning ? (
          <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {scheduleWarning}
          </p>
        ) : null}

        <fieldset className="grid gap-2 sm:gap-3">
          <legend className="mb-1 flex items-center gap-2 text-xs font-medium text-foreground sm:text-sm">
            <PencilRuler className="size-3.5 text-primary" />
            Poster background
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {POSTER_BACKGROUNDS.map((background) => (
              <button
                key={background.id}
                type="button"
                aria-label={`Select ${background.name} background`}
                aria-pressed={formState.bgUrl === background.src}
                onClick={() => onChange("bgUrl", background.src)}
                className={cn(
                  "group relative min-h-16 overflow-hidden rounded-lg border bg-background transition-all duration-200 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:min-h-28",
                  formState.bgUrl === background.src
                    ? "border-primary/80"
                    : "border-border/50 hover:border-primary/50",
                )}
              >
                <span
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${background.src})` }}
                />
                {formState.bgUrl === background.src ? (
                  <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full border border-primary/60 bg-muted sm:right-2 sm:top-2 sm:size-6">
                    <Check className="size-3.5 shrink-0 text-primary sm:size-4" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </fieldset>

        <PosterTextFields formState={formState} onChange={onChange} />

        <Button className="w-full" onClick={onGenerate} disabled={isGenerateDisabled}>
          <WandSparkles />
          {isGenerating ? "Generating..." : "Generate matchday kit"}
        </Button>
        {generateBlockMessage && !scheduleWarning ? (
          <p className="rounded-md border border-border bg-background p-3 text-center text-sm text-muted-foreground">
            {generateBlockMessage}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TeamSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [teamFilter, setTeamFilter] = useState("");
  const visibleTeams = WORLD_CUP_TEAMS.filter((team) =>
    team.toLowerCase().includes(teamFilter.toLowerCase()),
  );

  return (
    <label className="grid gap-1.5 sm:gap-2">
      <span className="text-xs font-medium text-foreground sm:text-sm">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <span className="truncate text-left">{value}</span>
        </SelectTrigger>
        <SelectContent>
          <div className="p-1">
            <Input
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              placeholder="Search team..."
              className="h-10"
            />
          </div>
          {visibleTeams.map((team) => (
            <SelectItem key={team} value={team}>
              {team}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function PosterTextFields({
  formState,
  onChange,
}: {
  formState: PosterFormState;
  onChange: <Key extends keyof PosterFormState>(
    key: Key,
    value: PosterFormState[Key],
  ) => void;
}) {
  return (
    <div className="grid gap-3 sm:gap-4">
      <label className="grid gap-1.5 sm:gap-2">
        <span className="flex items-center justify-between gap-3 text-xs font-medium text-foreground sm:text-sm">
          <span>Venue</span>
          <span className="text-xs text-muted-foreground">
            {formState.venueName.length}/40
          </span>
        </span>
        <Input
          value={formState.venueName}
          maxLength={40}
          onChange={(event) => onChange("venueName", event.target.value)}
          placeholder="e.g., Room by Le Kief"
        />
      </label>

      <label className="grid gap-1.5 sm:gap-2">
        <span className="flex items-center justify-between gap-3 text-xs font-medium text-foreground sm:text-sm">
          <span>Offer</span>
          <span className="text-xs text-muted-foreground">
            {formState.offerText.length}/40
          </span>
        </span>
        <Textarea
          value={formState.offerText}
          maxLength={40}
          onChange={(event) => onChange("offerText", event.target.value)}
          placeholder="e.g., $5 Guinness Pints!"
          className="min-h-16 sm:min-h-24"
        />
      </label>
    </div>
  );
}

import { ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const productHighlights = [
  "Official group-stage fixture timing",
  "Poster preview updates before login",
  "Copy generation ready in seconds",
];

export function HeroSection() {
  return (
    <section className="border border-border bg-card rounded-lg p-4 sm:p-8">
      <div className="grid gap-4 md:grid-cols-[1fr_300px] md:gap-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-muted bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3" />
            World Cup 2026 matchday poster studio
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            Create matchday posters and social captions.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Pick a fixture, add your venue offer, preview immediately, and generate
            copy after login.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild>
              <a href="#matchday-workspace">
                Start building
                <ArrowRight />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#matchday-workspace">Go to studio</a>
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <Clock3 className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Fast workflow</p>
                <p className="text-xs text-muted-foreground">
                  Preview poster first. Generate the caption after you confirm your
                  setup.
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
              <p className="text-xs text-muted-foreground">Workflow</p>
              <p className="mt-1 flex items-center gap-2 font-semibold">
                <span>Fixture</span>
                <span aria-hidden="true">→</span>
                <span>Poster</span>
                <span aria-hidden="true">→</span>
                <span>Caption</span>
              </p>
            </div>
          </div>

          <ul className="grid gap-2 text-sm text-muted-foreground">
            {productHighlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-400" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

import { CheckCircle2, TrendingUp } from "lucide-react";

const launchNotes = [
  "Preview the poster before login.",
  "Generate captions after Google sign-in.",
  "Invalid group-stage pairings are blocked for cleaner results.",
];

export function LaunchNotes() {
  return (
    <section className="mt-10 border-t border-border pt-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-lg font-semibold text-foreground">
            Launch notes
          </p>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5" />
            Beta ready
          </span>
        </div>
        <ul className="grid gap-2 md:grid-cols-2">
          {launchNotes.map((note) => (
            <li
              key={note}
              className="flex min-h-12 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

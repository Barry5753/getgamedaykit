"use client";

import { LogIn, LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = authClient.useSession();

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  }

  async function signOut() {
    await authClient.signOut();
  }

  return (
    <header className="border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a className="group flex min-w-0 items-center gap-3" href="#matchday-workspace">
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold">
            GK
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold leading-none text-foreground">
              GameDayKit
            </div>
            <div className="hidden text-xs text-muted-foreground sm:block">
              Matchday poster studio
            </div>
          </div>
        </a>

        {session ? (
          <div className="flex items-center gap-2">
            <span className="hidden max-w-44 truncate rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground sm:block">
              {session.user.name || session.user.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              <LogOut />
              Sign out
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={signInWithGoogle}>
            <LogIn />
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}

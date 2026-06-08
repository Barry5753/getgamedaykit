"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignIn: () => void;
};

export function AuthDialog({
  open,
  onOpenChange,
  onSignIn,
}: AuthDialogProps) {
  const [turnstileToken, setTurnstileToken] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isTurnstileRequired = Boolean(siteKey);
  const isSignInReady = isTurnstileRequired ? Boolean(turnstileToken) : true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Sign in to generate the caption
          </DialogTitle>
          <DialogDescription>
            Your poster preview is available before login. Sign in with Google
            when you are ready to generate the social copy for this matchday
            kit.
          </DialogDescription>
        </DialogHeader>
        {siteKey ? (
          <div className="pt-1">
            <Turnstile siteKey={siteKey} onSuccess={setTurnstileToken} />
          </div>
        ) : null}
        <Button className="w-full" onClick={onSignIn} disabled={!isSignInReady}>
          <LogIn />
          Continue with Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}

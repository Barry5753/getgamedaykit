"use client";

import { LogIn } from "lucide-react";

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
          <Button className="w-full" onClick={onSignIn}>
            <LogIn />
            Continue with Google
          </Button>
      </DialogContent>
    </Dialog>
  );
}

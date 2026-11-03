"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Settings error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto rounded-xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8 space-y-4 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row items-center gap-3 text-destructive">
        <AlertCircle className="size-6 shrink-0" />
        <h2 className="text-lg font-bold tracking-tight">
          Unable to load settings
        </h2>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {error.message || "An unexpected error occurred while loading your profile calibration and targets."}
      </p>

      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => reset()}
          className="gap-2 border-destructive/30 hover:bg-destructive/10 text-foreground cursor-pointer"
        >
          <RefreshCw className="size-3.5" />
          <span>Try again</span>
        </Button>
      </div>
    </div>
  );
}

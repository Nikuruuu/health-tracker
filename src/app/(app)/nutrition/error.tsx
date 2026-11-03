"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NutritionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="size-5" />
        <h2 className="text-base font-semibold">Error loading nutrition</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Could not load nutrition details.
      </p>
      <Button variant="outline" size="sm" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}


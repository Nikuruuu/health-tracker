"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { updatePreferencesAction } from "../actions";
import { cn } from "@/lib/utils";

interface PreferencesCardProps {
  initialUnits: "metric" | "imperial";
  initialTheme: "light" | "dark" | "system";
}

export function PreferencesCard({ initialUnits, initialTheme }: PreferencesCardProps) {
  const [isPending, startTransition] = useTransition();
  const [units, setUnits] = useState<"metric" | "imperial">(initialUnits);

  const handleUnitChange = (newUnits: "metric" | "imperial") => {
    if (newUnits === units) return;
    setUnits(newUnits);

    startTransition(async () => {
      try {
        await updatePreferencesAction({
          units: newUnits,
          theme: initialTheme,
        });
      } catch (err) {
        console.error("Failed to update unit preferences", err);
      }
    });
  };

  return (
    <Card className="rounded-xl border border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground">
          Preferences
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          Display units and application color scheme.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Units Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-foreground block">
              Measurement Units
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Database persists in kg · cm
            </span>
          </div>

          <div
            className="inline-flex p-1 rounded-lg bg-muted border border-border text-xs"
            role="group"
            aria-label="Unit preferences"
          >
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleUnitChange("metric")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer",
                units === "metric"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Metric (kg, cm)
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleUnitChange("imperial")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer",
                units === "imperial"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Imperial (lb, in)
            </button>
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
          <div>
            <span className="text-xs font-semibold text-foreground block">
              Color Theme
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Light, dark, or system preference
            </span>
          </div>

          <ThemeToggle variant="segmented" />
        </div>
      </CardContent>
    </Card>
  );
}


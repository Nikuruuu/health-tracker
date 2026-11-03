"use client";

import { useTransition, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, AlertCircle } from "lucide-react";
import { toggleMaintenanceAction } from "../actions";

interface MaintenanceCardProps {
  maintenanceMode: boolean;
  currentWeightKg: number | null;
  finalGoalWeightKg: number;
  kcalDeficit: number;
  kcalMaintenance: number;
}

export function MaintenanceCard({
  maintenanceMode,
  currentWeightKg,
  finalGoalWeightKg,
  kcalDeficit,
  kcalMaintenance,
}: MaintenanceCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Suggest maintenance if current weight is within 1 kg of the final goal
  const isWithinGoalProximity =
    currentWeightKg !== null &&
    Math.abs(currentWeightKg - finalGoalWeightKg) <= 1.0;

  const handleToggle = (checked: boolean) => {
    setError(null);
    startTransition(async () => {
      try {
        await toggleMaintenanceAction({ enable: checked });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to toggle maintenance mode.");
      }
    });
  };

  return (
    <Card className="rounded-xl border border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold text-foreground">
              Maintenance mode
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Switches to maintenance calories and a safe ±1.5 kg tolerance range.
            </CardDescription>
          </div>
          <Switch
            checked={maintenanceMode}
            onCheckedChange={handleToggle}
            disabled={isPending}
            aria-label="Toggle maintenance mode"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Suggestion banner when within 1 kg */}
        {isWithinGoalProximity && !maintenanceMode && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs">
            <Sparkles className="size-4 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold">Goal weight reached or near!</span> Current weight is within 1.0 kg of your final goal ({finalGoalWeightKg} kg). Ready to transition into Phase 4 Maintenance?
            </div>
          </div>
        )}

        {/* Mini stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Daily calories
            </span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">
              {maintenanceMode
                ? `~${kcalMaintenance.toLocaleString()} kcal`
                : `${kcalDeficit.toLocaleString()} kcal`}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block">
              Weight trend
            </span>
            <span className="text-sm font-bold text-foreground mt-0.5 block">
              {maintenanceMode ? "Flat (±1.5 kg)" : "Downward"}
            </span>
          </div>
        </div>

        {/* Trendline preview graphic matching settings.jpg */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
            <span className="font-medium">Trendline Preview</span>
            <span>
              {maintenanceMode
                ? `Band: ${finalGoalWeightKg - 1.5} – ${finalGoalWeightKg + 1.5} kg`
                : "Active deficit trajectory"}
            </span>
          </div>

          <div className="h-14 w-full relative flex items-center justify-center overflow-hidden">
            {maintenanceMode ? (
              // Flat ±1.5 kg maintenance band preview
              <svg
                viewBox="0 0 200 40"
                className="w-full h-full stroke-current"
                preserveAspectRatio="none"
              >
                {/* Upper boundary (+1.5kg) */}
                <line
                  x1="0"
                  y1="10"
                  x2="200"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-muted-foreground/40"
                />
                {/* Center target line */}
                <line
                  x1="0"
                  y1="20"
                  x2="200"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-primary"
                />
                {/* Lower boundary (-1.5kg) */}
                <line
                  x1="0"
                  y1="30"
                  x2="200"
                  y2="30"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-muted-foreground/40"
                />
              </svg>
            ) : (
              // Downward deficit slope matching settings.jpg
              <svg
                viewBox="0 0 200 40"
                className="w-full h-full stroke-current"
                preserveAspectRatio="none"
              >
                <path
                  d="M 10 10 L 190 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


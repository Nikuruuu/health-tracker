"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { DEFAULT_WEEKLY_WORKOUT_PLAN, type Weekday } from "@/domain/config";
import { updateWorkoutScheduleAction } from "../actions";

interface WorkoutScheduleItem {
  weekday: Weekday;
  sessionType: string;
}

interface WorkoutScheduleEditorProps {
  initialSchedule: WorkoutScheduleItem[];
}

const COMMON_SESSION_TYPES = [
  "Low-Impact Cardio",
  "Low-Impact HIIT",
  "Active Recovery",
  "60-min Brisk Walk",
  "Mobility & Core",
  "Rest",
];

const WEEKDAY_NAMES: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export function WorkoutScheduleEditor({ initialSchedule }: WorkoutScheduleEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize schedule ensuring all 7 days are represented
  const [schedule, setSchedule] = useState<WorkoutScheduleItem[]>(() => {
    return DEFAULT_WEEKLY_WORKOUT_PLAN.map((def) => {
      const existing = initialSchedule.find((item) => item.weekday === def.weekday);
      return {
        weekday: def.weekday,
        sessionType: existing ? existing.sessionType : def.sessionType,
      };
    });
  });

  const handleSessionChange = (weekday: Weekday, value: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.weekday === weekday ? { ...item, sessionType: value } : item))
    );
  };

  const handleResetToDefault = () => {
    setSchedule(
      DEFAULT_WEEKLY_WORKOUT_PLAN.map((d) => ({
        weekday: d.weekday,
        sessionType: d.sessionType,
      }))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await updateWorkoutScheduleAction({ schedule });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update workout schedule.");
      }
    });
  };

  return (
    <Card className="rounded-xl border border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Dumbbell className="size-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                Weekly Workout Schedule
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              Default weekly training split saved to your workout plan.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            title="Reset to default VitaPath routine"
            className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1.5"
          >
            <RotateCcw className="size-3" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={handleSave} className="space-y-3">
          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Workout schedule saved successfully.</span>
            </div>
          )}

          <div className="space-y-2">
            {schedule.map((item) => (
              <div
                key={item.weekday}
                className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/40 border border-border/50 text-xs"
              >
                <div className="w-24 sm:w-28 shrink-0 font-semibold text-foreground">
                  {WEEKDAY_NAMES[item.weekday]}
                </div>

                <div className="flex-1 max-w-xs sm:max-w-sm">
                  <Input
                    type="text"
                    list={`options-${item.weekday}`}
                    value={item.sessionType}
                    onChange={(e) => handleSessionChange(item.weekday, e.target.value)}
                    required
                    className="h-8 text-xs bg-background"
                  />
                  <datalist id={`options-${item.weekday}`}>
                    {COMMON_SESSION_TYPES.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? "Saving schedule..." : "Save Workout Schedule"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


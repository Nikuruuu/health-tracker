"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { targetsSchema } from "../schemas";
import { updateTargetsAction } from "../actions";

interface TargetsEditorProps {
  initialTargets: {
    kcalDeficit: number;
    kcalMaintenance: number;
    proteinMinG: number;
    proteinMaxG: number;
    fatPct: number;
    waterMl: number;
    stepsMin: number;
    stepsMax: number;
  };
}

export function TargetsEditor({ initialTargets }: TargetsEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form states
  const [kcalDeficit, setKcalDeficit] = useState(String(initialTargets.kcalDeficit));
  const [kcalMaintenance, setKcalMaintenance] = useState(String(initialTargets.kcalMaintenance));
  const [proteinMinG, setProteinMinG] = useState(String(initialTargets.proteinMinG));
  const [proteinMaxG, setProteinMaxG] = useState(String(initialTargets.proteinMaxG));
  const [fatPct, setFatPct] = useState(String(Math.round(initialTargets.fatPct * 100)));
  const [waterMl, setWaterMl] = useState(String(initialTargets.waterMl));
  const [stepsMin, setStepsMin] = useState(String(initialTargets.stepsMin));
  const [stepsMax, setStepsMax] = useState(String(initialTargets.stepsMax));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setServerError(null);
    setFieldErrors({});

    // Client-side Zod validation
    const fatDecimal = parseFloat(fatPct) / 100;
    const values = {
      kcalDeficit: parseFloat(kcalDeficit),
      kcalMaintenance: parseFloat(kcalMaintenance),
      proteinMinG: parseFloat(proteinMinG),
      proteinMaxG: parseFloat(proteinMaxG),
      fatPct: fatDecimal,
      waterMl: parseFloat(waterMl),
      stepsMin: parseFloat(stepsMin),
      stepsMax: parseFloat(stepsMax),
    };

    const parsed = targetsSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0]?.toString() || "form";
        errors[path] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      try {
        await updateTargetsAction(parsed.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Failed to update targets.");
      }
    });
  };

  return (
    <Card className="rounded-xl border border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground">
          Targets
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          Daily calorie, macronutrient, hydration, and movement targets.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Targets updated successfully.</span>
            </div>
          )}

          {/* Calories Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="kcalDeficit" className="text-xs font-semibold text-foreground">
                Deficit Calories (kcal)
              </Label>
              <Input
                id="kcalDeficit"
                type="number"
                min="1200"
                step="10"
                required
                value={kcalDeficit}
                onChange={(e) => setKcalDeficit(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.kcalDeficit && (
                <span className="text-[11px] text-destructive block">
                  {fieldErrors.kcalDeficit}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="kcalMaintenance" className="text-xs font-semibold text-foreground">
                Maintenance Calories (kcal)
              </Label>
              <Input
                id="kcalMaintenance"
                type="number"
                min="1200"
                step="10"
                required
                value={kcalMaintenance}
                onChange={(e) => setKcalMaintenance(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.kcalMaintenance && (
                <span className="text-[11px] text-destructive block">
                  {fieldErrors.kcalMaintenance}
                </span>
              )}
            </div>
          </div>

          {/* Protein Min/Max Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="proteinMinG" className="text-xs font-semibold text-foreground">
                Protein Min (g)
              </Label>
              <Input
                id="proteinMinG"
                type="number"
                min="30"
                step="1"
                required
                value={proteinMinG}
                onChange={(e) => setProteinMinG(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.proteinMinG && (
                <span className="text-[11px] text-destructive block">
                  {fieldErrors.proteinMinG}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="proteinMaxG" className="text-xs font-semibold text-foreground">
                Protein Max (g)
              </Label>
              <Input
                id="proteinMaxG"
                type="number"
                min="30"
                step="1"
                required
                value={proteinMaxG}
                onChange={(e) => setProteinMaxG(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.proteinMaxG && (
                <span className="text-[11px] text-destructive block">
                  {fieldErrors.proteinMaxG}
                </span>
              )}
            </div>
          </div>

          {/* Fat % & Water Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="fatPct" className="text-xs font-semibold text-foreground">
                Fat Ratio (%)
              </Label>
              <Input
                id="fatPct"
                type="number"
                min="10"
                max="60"
                step="1"
                required
                value={fatPct}
                onChange={(e) => setFatPct(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.fatPct && (
                <span className="text-[11px] text-destructive block">
                  {fieldErrors.fatPct}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="waterMl" className="text-xs font-semibold text-foreground">
                Hydration (ml)
              </Label>
              <Input
                id="waterMl"
                type="number"
                min="500"
                step="100"
                required
                value={waterMl}
                onChange={(e) => setWaterMl(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.waterMl && (
                <span className="text-[11px] text-destructive block">
                  {fieldErrors.waterMl}
                </span>
              )}
            </div>
          </div>

          {/* Steps Min/Max Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="stepsMin" className="text-xs font-semibold text-foreground">
                Steps Min
              </Label>
              <Input
                id="stepsMin"
                type="number"
                min="1000"
                step="500"
                required
                value={stepsMin}
                onChange={(e) => setStepsMin(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.stepsMin && (
                <span className="text-[11px] text-destructive block">
                  {fieldErrors.stepsMin}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="stepsMax" className="text-xs font-semibold text-foreground">
                Steps Max
              </Label>
              <Input
                id="stepsMax"
                type="number"
                min="1000"
                step="500"
                required
                value={stepsMax}
                onChange={(e) => setStepsMax(e.target.value)}
                className="h-9 text-xs"
              />
              {fieldErrors.stepsMax && (
                <span className="text-[11px] text-destructive block">
                  {fieldErrors.stepsMax}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? "Saving targets..." : "Save Targets"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


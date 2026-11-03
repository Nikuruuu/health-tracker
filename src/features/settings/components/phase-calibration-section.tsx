"use client";

import { useState, useTransition } from "react";
import { PhaseCard } from "./phase-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import {
  getPhaseStatus,
  getPhaseRecalibrationPreview,
  validateMilestones,
  type RecalibrationPreview,
} from "@/domain/phases";
import { switchPhaseAction, updateMilestonesAction } from "../actions";

interface PhaseData {
  id: string;
  phaseNumber: number;
  name: string;
  mode: "deficit" | "maintenance";
  startDate: string;
  endDate: string | null;
  startWeightKg: number;
  goalWeightKg: number;
  windowLabel: string;
  description: string;
}

interface PhaseCalibrationSectionProps {
  userPhases: PhaseData[];
  activePhaseId: string;
  startWeightKg: number;
  finalGoalWeightKg: number;
  targets: {
    kcalDeficit: number;
    kcalMaintenance: number;
  };
}

export function PhaseCalibrationSection({
  userPhases,
  activePhaseId,
  startWeightKg,
  finalGoalWeightKg,
  targets,
}: PhaseCalibrationSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Selected phase to confirm
  const [pendingPhase, setPendingPhase] = useState<PhaseData | null>(null);
  const [previewData, setPreviewData] = useState<RecalibrationPreview | null>(null);

  // Milestone editing modal state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [p1Milestone, setP1Milestone] = useState<string>(() => {
    const p1 = userPhases.find((p) => p.phaseNumber === 1);
    return p1 ? String(p1.goalWeightKg) : "81.7";
  });
  const [p2Milestone, setP2Milestone] = useState<string>(() => {
    const p2 = userPhases.find((p) => p.phaseNumber === 2);
    return p2 ? String(p2.goalWeightKg) : "73.3";
  });
  const [p3Milestone, setP3Milestone] = useState<string>(() => {
    const p3 = userPhases.find((p) => p.phaseNumber === 3);
    return p3 ? String(p3.goalWeightKg) : String(finalGoalWeightKg);
  });
  const [milestoneError, setMilestoneError] = useState<string | null>(null);

  const activePhase =
    userPhases.find((p) => p.id === activePhaseId) ||
    userPhases.find((p) => p.phaseNumber === 1) ||
    userPhases[0];

  const activePhaseNumber = activePhase?.phaseNumber ?? 1;

  // Handles clicking on an inactive phase card
  const handleSelectPhase = (targetPhase: PhaseData) => {
    setError(null);
    if (!activePhase) return;

    const preview = getPhaseRecalibrationPreview(
      {
        phaseNumber: activePhase.phaseNumber,
        mode: activePhase.mode,
        startWeightKg: activePhase.startWeightKg,
        goalWeightKg: activePhase.goalWeightKg,
      },
      {
        phaseNumber: targetPhase.phaseNumber,
        mode: targetPhase.mode,
        startWeightKg: targetPhase.startWeightKg,
        goalWeightKg: targetPhase.goalWeightKg,
      },
      targets
    );

    setPreviewData(preview);
    setPendingPhase(targetPhase);
  };

  // Confirms the phase switch
  const handleConfirmSwitch = () => {
    if (!pendingPhase) return;
    setError(null);

    startTransition(async () => {
      try {
        await switchPhaseAction({ phaseId: pendingPhase.id });
        setPendingPhase(null);
        setPreviewData(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to switch phase.");
      }
    });
  };

  // Handles milestone weight form submission
  const handleSaveMilestones = (e: React.FormEvent) => {
    e.preventDefault();
    setMilestoneError(null);

    const m1 = parseFloat(p1Milestone);
    const m2 = parseFloat(p2Milestone);
    const m3 = parseFloat(p3Milestone);

    if (Number.isNaN(m1) || Number.isNaN(m2) || Number.isNaN(m3)) {
      setMilestoneError("All milestone weights must be valid numbers.");
      return;
    }

    const validation = validateMilestones(startWeightKg, finalGoalWeightKg, {
      phase1GoalKg: m1,
      phase2GoalKg: m2,
      phase3GoalKg: m3,
    });

    if (!validation.isValid) {
      setMilestoneError(validation.error || "Invalid milestone progression.");
      return;
    }

    startTransition(async () => {
      try {
        await updateMilestonesAction({
          phase1GoalKg: m1,
          phase2GoalKg: m2,
          phase3GoalKg: m3,
        });
        setIsMilestoneModalOpen(false);
      } catch (err) {
        setMilestoneError(err instanceof Error ? err.message : "Failed to update milestones.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Active phase
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Choosing a phase recalibrates calories, macros and trendlines.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2x2 Phase cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {userPhases.map((phase) => {
          const isActive = phase.id === activePhaseId;
          const status = getPhaseStatus(phase.phaseNumber, activePhaseNumber);

          const caloriesLabel =
            phase.mode === "maintenance"
              ? `~${targets.kcalMaintenance.toLocaleString()} kcal`
              : `${targets.kcalDeficit.toLocaleString()} kcal`;

          const weightRangeLabel =
            phase.mode === "maintenance"
              ? `${finalGoalWeightKg} kg ± 1.5`
              : `${phase.startWeightKg} → ${phase.goalWeightKg} kg`;

          return (
            <PhaseCard
              key={phase.id}
              name={phase.name}
              windowLabel={phase.windowLabel}
              startDate={phase.startDate}
              endDate={phase.endDate}
              description={phase.description}
              caloriesLabel={caloriesLabel}
              weightRangeLabel={weightRangeLabel}
              isActive={isActive}
              status={status}
              isEditableMilestone={phase.mode === "deficit"}
              onSelect={() => handleSelectPhase(phase)}
              onEditMilestone={() => {
                setMilestoneError(null);
                setIsMilestoneModalOpen(true);
              }}
              disabled={isPending}
            />
          );
        })}
      </div>

      {/* Active Phase summary banner from settings.jpg */}
      {activePhase && (
        <div className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground">
          <Sparkles className="size-4 text-primary shrink-0" />
          <span>
            Daily goal set to{" "}
            <strong className="text-foreground font-semibold">
              {activePhase.mode === "maintenance"
                ? `~${targets.kcalMaintenance.toLocaleString()} kcal`
                : `${targets.kcalDeficit.toLocaleString()} kcal`}
            </strong>
            . Trendline targets{" "}
            <strong className="text-foreground font-semibold">
              {activePhase.mode === "maintenance"
                ? `flat ±1.5 kg band centered on ${finalGoalWeightKg} kg`
                : `${activePhase.startWeightKg} → ${activePhase.goalWeightKg} kg`}
            </strong>{" "}
            across this phase.
          </span>
        </div>
      )}

      {/* Phase Recalibration Confirmation Dialog */}
      <Dialog
        open={!!pendingPhase}
        onOpenChange={(open) => {
          if (!open) {
            setPendingPhase(null);
            setPreviewData(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch to {pendingPhase?.name}?</DialogTitle>
            <DialogDescription>
              Review the recalibrated targets and trendline range before activating this phase.
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="space-y-3 py-2">
              <div className="p-3 rounded-lg bg-muted border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Daily Calorie Target:</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-muted-foreground line-through">
                      {previewData.currentCalories}
                    </span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <span className="text-primary">{previewData.targetCalories}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Weight Target Range:</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-muted-foreground line-through">
                      {previewData.currentWeightRange}
                    </span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <span className="text-foreground">{previewData.targetWeightRange}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Expected Trendline:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span>{previewData.targetTrend}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Phase transitions are non-destructive: previous weight and nutrition logs remain tied to the phases active on their dates.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                setPendingPhase(null);
                setPreviewData(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={handleConfirmSwitch}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isPending ? "Recalibrating..." : "Confirm & Recalibrate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestone Edit Dialog */}
      <Dialog
        open={isMilestoneModalOpen}
        onOpenChange={(open) => setIsMilestoneModalOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Milestone Goal Weights</DialogTitle>
            <DialogDescription>
              Customise intermediate goal weights for deficit phases. Each milestone must decrease progressively and Phase 3 must end at {finalGoalWeightKg} kg.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMilestones} className="space-y-4 py-2">
            {milestoneError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{milestoneError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="p1Milestone" className="text-xs font-semibold text-foreground">
                    Phase 1 Goal (kg)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Start: {startWeightKg} kg
                  </span>
                </div>
                <Input
                  id="p1Milestone"
                  type="number"
                  step="0.1"
                  required
                  value={p1Milestone}
                  onChange={(e) => setP1Milestone(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p2Milestone" className="text-xs font-semibold text-foreground">
                  Phase 2 Goal (kg)
                </Label>
                <Input
                  id="p2Milestone"
                  type="number"
                  step="0.1"
                  required
                  value={p2Milestone}
                  onChange={(e) => setP2Milestone(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="p3Milestone" className="text-xs font-semibold text-foreground">
                    Phase 3 Goal (kg)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Final Goal: {finalGoalWeightKg} kg
                  </span>
                </div>
                <Input
                  id="p3Milestone"
                  type="number"
                  step="0.1"
                  required
                  value={p3Milestone}
                  onChange={(e) => setP3Milestone(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setIsMilestoneModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isPending ? "Saving..." : "Save Milestones"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

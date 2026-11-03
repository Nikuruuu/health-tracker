import {
  WEIGHT_CONFIG,
  calculateSuggestedPhaseMilestones,
  type PhaseMode,
} from "./config";

export interface SeededPhase {
  id: string;
  userId: string;
  name: string;
  mode: PhaseMode;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string | null;
  startWeightKg: number;
  goalWeightKg: number;
}

export interface PhaseDateWindow {
  startDate: string;
  endDate: string | null;
  windowLabel: string;
}

/**
 * Adds whole months to an ISO YYYY-MM-DD date string.
 */
export function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0];
  const month = parts[1] - 1; // 0-indexed
  const day = parts[2];

  const targetDate = new Date(Date.UTC(year, month + monthsToAdd, day));
  return targetDate.toISOString().slice(0, 10);
}

/**
 * Computes calendar date ranges for standard 4 phases from an initial start date.
 * Phase 1: Month 1 (Day 0 to +1 month)
 * Phase 2: Months 2–4 (+1 month to +4 months)
 * Phase 3: Months 5–7 (+4 months to +7 months)
 * Phase 4: Ongoing (+7 months onward)
 */
export function computePhaseDateWindows(baseStartDate: string): Record<number, PhaseDateWindow> {
  const p1End = addMonthsToDate(baseStartDate, 1);
  const p2End = addMonthsToDate(baseStartDate, 4);
  const p3End = addMonthsToDate(baseStartDate, 7);

  return {
    1: { startDate: baseStartDate, endDate: p1End, windowLabel: "Month 1" },
    2: { startDate: p1End, endDate: p2End, windowLabel: "Months 2–4" },
    3: { startDate: p2End, endDate: p3End, windowLabel: "Months 5–7" },
    4: { startDate: p3End, endDate: null, windowLabel: "Ongoing" },
  };
}

/**
 * Phase status (Completed / Current / Upcoming) comes from dates and the active phase,
 * never stored separately in the database.
 */
export type PhaseStatus = "completed" | "current" | "upcoming";

export function getPhaseStatus(
  phaseNumber: number,
  activePhaseNumber: number
): PhaseStatus {
  if (phaseNumber === activePhaseNumber) {
    return "current";
  }
  if (phaseNumber < activePhaseNumber) {
    return "completed";
  }
  return "upcoming";
}

/**
 * Seeds default phases for a user: an even milestone path from start weight
 * to final goal across phases 1-3 (deficit), plus phase 4 (maintenance).
 */
export function seedDefaultPhases(
  userId: string,
  startWeightKg: number = WEIGHT_CONFIG.startWeightKg,
  finalGoalWeightKg: number = WEIGHT_CONFIG.finalGoalWeightKg,
  startDate: string = new Date().toISOString().slice(0, 10)
): SeededPhase[] {
  const milestones = calculateSuggestedPhaseMilestones(startWeightKg, finalGoalWeightKg);
  const windows = computePhaseDateWindows(startDate);

  return [
    {
      id: `${userId}_phase_1`,
      userId,
      name: "Phase 1: Kickoff",
      mode: "deficit",
      startDate: windows[1].startDate,
      endDate: windows[1].endDate,
      startWeightKg,
      goalWeightKg: milestones.phase1GoalKg,
    },
    {
      id: `${userId}_phase_2`,
      userId,
      name: "Phase 2: Momentum",
      mode: "deficit",
      startDate: windows[2].startDate,
      endDate: windows[2].endDate,
      startWeightKg: milestones.phase1GoalKg,
      goalWeightKg: milestones.phase2GoalKg,
    },
    {
      id: `${userId}_phase_3`,
      userId,
      name: "Phase 3: Final Push",
      mode: "deficit",
      startDate: windows[3].startDate,
      endDate: windows[3].endDate,
      startWeightKg: milestones.phase2GoalKg,
      goalWeightKg: milestones.phase3GoalKg,
    },
    {
      id: `${userId}_phase_4`,
      userId,
      name: "Phase 4: Maintenance",
      mode: "maintenance",
      startDate: windows[4].startDate,
      endDate: windows[4].endDate,
      startWeightKg: finalGoalWeightKg,
      goalWeightKg: finalGoalWeightKg,
    },
  ];
}

export interface PhaseMilestonesInput {
  phase1GoalKg: number;
  phase2GoalKg: number;
  phase3GoalKg: number;
}

/**
 * Validates phase milestones per docs/domain.md:
 * - Decreasing across deficit phases (start > Phase 1 > Phase 2 > Phase 3)
 * - Never below the final goal
 * - Phase 3 ends exactly at the final goal
 */
export function validateMilestones(
  startWeightKg: number,
  finalGoalWeightKg: number,
  milestones: PhaseMilestonesInput
): { isValid: boolean; error?: string } {
  const { phase1GoalKg, phase2GoalKg, phase3GoalKg } = milestones;

  if (Math.abs(phase3GoalKg - finalGoalWeightKg) > 0.05) {
    return {
      isValid: false,
      error: `Phase 3 goal (${phase3GoalKg} kg) must end exactly at the final goal weight (${finalGoalWeightKg} kg).`,
    };
  }
  if (phase1GoalKg < finalGoalWeightKg) {
    return {
      isValid: false,
      error: `Phase 1 goal (${phase1GoalKg} kg) cannot be below final goal weight (${finalGoalWeightKg} kg).`,
    };
  }
  if (phase2GoalKg < finalGoalWeightKg) {
    return {
      isValid: false,
      error: `Phase 2 goal (${phase2GoalKg} kg) cannot be below final goal weight (${finalGoalWeightKg} kg).`,
    };
  }
  if (phase1GoalKg >= startWeightKg) {
    return {
      isValid: false,
      error: `Phase 1 goal (${phase1GoalKg} kg) must be less than starting weight (${startWeightKg} kg).`,
    };
  }
  if (phase2GoalKg >= phase1GoalKg) {
    return {
      isValid: false,
      error: `Phase 2 goal (${phase2GoalKg} kg) must be less than Phase 1 goal (${phase1GoalKg} kg).`,
    };
  }
  if (phase3GoalKg >= phase2GoalKg) {
    return {
      isValid: false,
      error: `Phase 3 goal (${phase3GoalKg} kg) must be less than Phase 2 goal (${phase2GoalKg} kg).`,
    };
  }

  return { isValid: true };
}

export interface RecalibrationPreview {
  currentPhaseNumber: number;
  targetPhaseNumber: number;
  currentCalories: string;
  targetCalories: string;
  currentTrend: string;
  targetTrend: string;
  currentWeightRange: string;
  targetWeightRange: string;
}

/**
 * Computes before/after comparison when switching phases.
 */
export function getPhaseRecalibrationPreview(
  currentPhase: { phaseNumber: number; mode: PhaseMode; startWeightKg: number; goalWeightKg: number },
  targetPhase: { phaseNumber: number; mode: PhaseMode; startWeightKg: number; goalWeightKg: number },
  targets: { kcalDeficit: number; kcalMaintenance: number }
): RecalibrationPreview {
  const currentCalories =
    currentPhase.mode === "maintenance"
      ? `~${targets.kcalMaintenance.toLocaleString()} kcal`
      : `${targets.kcalDeficit.toLocaleString()} kcal`;

  const targetCalories =
    targetPhase.mode === "maintenance"
      ? `~${targets.kcalMaintenance.toLocaleString()} kcal`
      : `${targets.kcalDeficit.toLocaleString()} kcal`;

  const currentTrend =
    currentPhase.mode === "maintenance"
      ? `Flat (±${WEIGHT_CONFIG.maintenanceBandKg} kg)`
      : `Downward (${currentPhase.startWeightKg} → ${currentPhase.goalWeightKg} kg)`;

  const targetTrend =
    targetPhase.mode === "maintenance"
      ? `Flat (±${WEIGHT_CONFIG.maintenanceBandKg} kg)`
      : `Downward (${targetPhase.startWeightKg} → ${targetPhase.goalWeightKg} kg)`;

  const currentWeightRange =
    currentPhase.mode === "maintenance"
      ? `${WEIGHT_CONFIG.finalGoalWeightKg} kg ± ${WEIGHT_CONFIG.maintenanceBandKg}`
      : `${currentPhase.startWeightKg} → ${currentPhase.goalWeightKg} kg`;

  const targetWeightRange =
    targetPhase.mode === "maintenance"
      ? `${WEIGHT_CONFIG.finalGoalWeightKg} kg ± ${WEIGHT_CONFIG.maintenanceBandKg}`
      : `${targetPhase.startWeightKg} → ${targetPhase.goalWeightKg} kg`;

  return {
    currentPhaseNumber: currentPhase.phaseNumber,
    targetPhaseNumber: targetPhase.phaseNumber,
    currentCalories,
    targetCalories,
    currentTrend,
    targetTrend,
    currentWeightRange,
    targetWeightRange,
  };
}

/**
 * Returns the deficit phase to activate when turning maintenance OFF.
 */
export function resolveDeficitPhaseOnMaintenanceOff(
  phasesList: Array<{ id: string; mode: string }>
): string {
  // Return the last deficit phase, usually phase 3, or first available deficit phase
  const deficitPhases = phasesList.filter((p) => p.mode === "deficit");
  if (deficitPhases.length === 0) {
    return phasesList[0]?.id ?? "";
  }
  return deficitPhases[deficitPhases.length - 1].id;
}

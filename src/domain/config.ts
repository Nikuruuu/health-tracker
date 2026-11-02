/**
 * Core Domain Configuration & Default Numerical Targets
 *
 * Source of truth for default onboarding targets, phase milestones,
 * and nutritional constants as defined in docs/domain.md.
 */

export type PhaseMode = "deficit" | "maintenance";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface PhaseDefinition {
  id: string;
  phaseNumber: number;
  name: string;
  window: string;
  mode: PhaseMode;
  startWeightKg: number;
  goalWeightKg: number;
  isSuggested: boolean;
}

export interface ScheduledWorkout {
  weekday: Weekday;
  dayName: string;
  sessionType: string;
  isRest: boolean;
}

export const WEIGHT_CONFIG = {
  startWeightKg: 90.0,
  finalGoalWeightKg: 65.0,
  maintenanceBandKg: 1.5,
  maintenancePromptThresholdKg: 1.0,
  maxDailyWeightDeltaWarningKg: 2.0,
} as const;

export const CALORIE_CONFIG = {
  deficitMinKcal: 1450,
  deficitMaxKcal: 1500,
  deficitDefaultKcal: 1500,
  maintenanceKcal: 1900,
  absoluteFloorKcal: 1200,
} as const;

export const MACRO_CONFIG = {
  proteinMinG: 110,
  proteinMaxG: 120,
  proteinDefaultG: 115,
  fatPercentage: 0.3, // 30% of kcal
  kcalPerGramProtein: 4,
  kcalPerGramCarb: 4,
  kcalPerGramFat: 9,
} as const;

export const HYDRATION_CONFIG = {
  goalMl: 3000, // 3.0 L
  tapMl: 500,
  tapsForGoal: 6,
} as const;

export const STEP_CONFIG = {
  minSteps: 7000,
  maxSteps: 8000,
  defaultGoalSteps: 8000,
  averageWindowDays: 7,
} as const;

export const TIMER_CONFIG = {
  workIntervalSec: 45,
  restIntervalSec: 15,
} as const;

export const DEFAULT_WEEKLY_WORKOUT_PLAN: readonly ScheduledWorkout[] = [
  { weekday: "mon", dayName: "Monday", sessionType: "Low-Impact Cardio", isRest: false },
  { weekday: "tue", dayName: "Tuesday", sessionType: "Low-Impact HIIT", isRest: false },
  { weekday: "wed", dayName: "Wednesday", sessionType: "Active Recovery", isRest: false },
  { weekday: "thu", dayName: "Thursday", sessionType: "Low-Impact Cardio", isRest: false },
  { weekday: "fri", dayName: "Friday", sessionType: "Low-Impact HIIT", isRest: false },
  { weekday: "sat", dayName: "Saturday", sessionType: "60-min Brisk Walk", isRest: false },
  { weekday: "sun", dayName: "Sunday", sessionType: "Rest", isRest: true },
] as const;

/**
 * Calculates evenly distributed milestone weights across 3 deficit phases.
 */
export function calculateSuggestedPhaseMilestones(
  startKg: number = WEIGHT_CONFIG.startWeightKg,
  goalKg: number = WEIGHT_CONFIG.finalGoalWeightKg
): { phase1GoalKg: number; phase2GoalKg: number; phase3GoalKg: number } {
  const totalDrop = startKg - goalKg;
  const step = totalDrop / 3;
  return {
    phase1GoalKg: Math.round((startKg - step) * 10) / 10,
    phase2GoalKg: Math.round((startKg - step * 2) * 10) / 10,
    phase3GoalKg: Math.round(goalKg * 10) / 10,
  };
}

export const DEFAULT_SUGGESTED_MILESTONES = calculateSuggestedPhaseMilestones();

export const DEFAULT_PHASES: readonly PhaseDefinition[] = [
  {
    id: "phase-1",
    phaseNumber: 1,
    name: "Phase 1",
    window: "Month 1",
    mode: "deficit",
    startWeightKg: WEIGHT_CONFIG.startWeightKg,
    goalWeightKg: DEFAULT_SUGGESTED_MILESTONES.phase1GoalKg,
    isSuggested: true,
  },
  {
    id: "phase-2",
    phaseNumber: 2,
    name: "Phase 2",
    window: "Months 2–4",
    mode: "deficit",
    startWeightKg: DEFAULT_SUGGESTED_MILESTONES.phase1GoalKg,
    goalWeightKg: DEFAULT_SUGGESTED_MILESTONES.phase2GoalKg,
    isSuggested: true,
  },
  {
    id: "phase-3",
    phaseNumber: 3,
    name: "Phase 3",
    window: "Months 5–7",
    mode: "deficit",
    startWeightKg: DEFAULT_SUGGESTED_MILESTONES.phase2GoalKg,
    goalWeightKg: DEFAULT_SUGGESTED_MILESTONES.phase3GoalKg,
    isSuggested: true,
  },
  {
    id: "phase-4",
    phaseNumber: 4,
    name: "Phase 4",
    window: "Ongoing",
    mode: "maintenance",
    startWeightKg: WEIGHT_CONFIG.finalGoalWeightKg,
    goalWeightKg: WEIGHT_CONFIG.finalGoalWeightKg,
    isSuggested: false,
  },
] as const;

export interface MacroBreakdown {
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  proteinKcal: number;
  fatKcal: number;
  carbsKcal: number;
}

/**
 * Calculates macro breakdown according to domain rules:
 * - Protein specified or default (110-120g range)
 * - Fat is fixed percentage of total kcal (default 30%)
 * - Carbs is remainder
 * - Enforces minimum 1,200 kcal floor
 */
export function calculateMacroBreakdown(
  calories: number = CALORIE_CONFIG.deficitDefaultKcal,
  proteinG: number = MACRO_CONFIG.proteinMinG,
  fatPct: number = MACRO_CONFIG.fatPercentage
): MacroBreakdown {
  const safeCalories = Math.max(calories, CALORIE_CONFIG.absoluteFloorKcal);
  const proteinKcal = proteinG * MACRO_CONFIG.kcalPerGramProtein;
  const fatKcal = Math.round(safeCalories * fatPct);
  const fatG = Math.round(fatKcal / MACRO_CONFIG.kcalPerGramFat);
  const carbsKcal = Math.max(0, safeCalories - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / MACRO_CONFIG.kcalPerGramCarb);

  return {
    calories: safeCalories,
    proteinG,
    fatG,
    carbsG,
    proteinKcal,
    fatKcal,
    carbsKcal,
  };
}

/**
 * Check whether a given weight is close enough to goal to prompt maintenance mode.
 */
export function shouldPromptMaintenance(
  currentWeightKg: number,
  finalGoalKg: number = WEIGHT_CONFIG.finalGoalWeightKg
): boolean {
  return Math.abs(currentWeightKg - finalGoalKg) <= WEIGHT_CONFIG.maintenancePromptThresholdKg;
}


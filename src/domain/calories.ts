import { CALORIE_CONFIG, type PhaseMode } from "./config";

export interface CalorieTargets {
  kcalDeficit: number;
  kcalMaintenance: number;
}

/**
 * Picks the daily calorie goal based on the active mode (deficit vs maintenance).
 * Enforces the domain floor: goal can never be < 1,200 kcal.
 *
 * @param mode The active mode ('deficit' | 'maintenance')
 * @param targets The user's stored calorie targets
 * @returns The resolved calorie target (>= 1,200 kcal)
 */
export function pickDailyCalorieGoal(
  mode: PhaseMode,
  targets?: CalorieTargets | null
): number {
  const fallback =
    mode === "maintenance"
      ? CALORIE_CONFIG.maintenanceKcal
      : CALORIE_CONFIG.deficitDefaultKcal;

  const rawGoal =
    mode === "maintenance"
      ? targets?.kcalMaintenance ?? fallback
      : targets?.kcalDeficit ?? fallback;

  return Math.max(rawGoal, CALORIE_CONFIG.absoluteFloorKcal);
}


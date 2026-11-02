import { describe, expect, it } from "vitest";
import {
  CALORIE_CONFIG,
  DEFAULT_PHASES,
  DEFAULT_WEEKLY_WORKOUT_PLAN,
  HYDRATION_CONFIG,
  STEP_CONFIG,
  WEIGHT_CONFIG,
  calculateMacroBreakdown,
  calculateSuggestedPhaseMilestones,
  shouldPromptMaintenance,
} from "./config";

describe("Domain Configuration & Defaults", () => {
  it("defines default start weight and goal weight correctly", () => {
    expect(WEIGHT_CONFIG.startWeightKg).toBe(90.0);
    expect(WEIGHT_CONFIG.finalGoalWeightKg).toBe(65.0);
    expect(WEIGHT_CONFIG.maintenanceBandKg).toBe(1.5);
    expect(WEIGHT_CONFIG.maintenancePromptThresholdKg).toBe(1.0);
  });

  it("calculates suggested phase milestones evenly across phases 1 to 3", () => {
    const milestones = calculateSuggestedPhaseMilestones(90.0, 65.0);
    expect(milestones.phase1GoalKg).toBe(81.7);
    expect(milestones.phase2GoalKg).toBe(73.3);
    expect(milestones.phase3GoalKg).toBe(65.0);
  });

  it("seeds 4 phases with the first 3 in deficit and 4th in maintenance", () => {
    expect(DEFAULT_PHASES).toHaveLength(4);
    expect(DEFAULT_PHASES[0].mode).toBe("deficit");
    expect(DEFAULT_PHASES[1].mode).toBe("deficit");
    expect(DEFAULT_PHASES[2].mode).toBe("deficit");
    expect(DEFAULT_PHASES[3].mode).toBe("maintenance");
    expect(DEFAULT_PHASES[3].goalWeightKg).toBe(65.0);
  });

  it("enforces calorie ranges and floor", () => {
    expect(CALORIE_CONFIG.deficitMinKcal).toBe(1450);
    expect(CALORIE_CONFIG.deficitMaxKcal).toBe(1500);
    expect(CALORIE_CONFIG.deficitDefaultKcal).toBe(1500);
    expect(CALORIE_CONFIG.maintenanceKcal).toBe(1900);
    expect(CALORIE_CONFIG.absoluteFloorKcal).toBe(1200);
  });

  it("calculates macro breakdown conforming to 30% fat and protein floor", () => {
    const breakdown = calculateMacroBreakdown(1500, 110, 0.3);
    expect(breakdown.calories).toBe(1500);
    expect(breakdown.proteinG).toBe(110);
    expect(breakdown.proteinKcal).toBe(440); // 110 * 4
    expect(breakdown.fatKcal).toBe(450); // 1500 * 0.3
    expect(breakdown.fatG).toBe(50); // 450 / 9
    expect(breakdown.carbsKcal).toBe(610); // 1500 - 440 - 450
    expect(breakdown.carbsG).toBe(153); // 610 / 4 rounded
  });

  it("clamps sub-1200 kcal requests to absolute floor of 1200 kcal", () => {
    const breakdown = calculateMacroBreakdown(1000, 110, 0.3);
    expect(breakdown.calories).toBe(1200);
  });

  it("correctly identifies maintenance prompt threshold", () => {
    expect(shouldPromptMaintenance(66.0, 65.0)).toBe(true);
    expect(shouldPromptMaintenance(64.2, 65.0)).toBe(true);
    expect(shouldPromptMaintenance(66.5, 65.0)).toBe(false);
    expect(shouldPromptMaintenance(70.0, 65.0)).toBe(false);
  });

  it("configures hydration and step goals according to domain specifications", () => {
    expect(HYDRATION_CONFIG.goalMl).toBe(3000);
    expect(HYDRATION_CONFIG.tapMl * HYDRATION_CONFIG.tapsForGoal).toBe(3000);
    expect(STEP_CONFIG.minSteps).toBe(7000);
    expect(STEP_CONFIG.maxSteps).toBe(8000);
  });

  it("defines all 7 days in the weekly workout plan with correct rest day", () => {
    expect(DEFAULT_WEEKLY_WORKOUT_PLAN).toHaveLength(7);
    const sun = DEFAULT_WEEKLY_WORKOUT_PLAN.find((d) => d.weekday === "sun");
    expect(sun?.isRest).toBe(true);
    expect(sun?.sessionType).toBe("Rest");
  });
});


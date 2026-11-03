import { describe, expect, it } from "vitest";
import { pickDailyCalorieGoal } from "./calories";

describe("pickDailyCalorieGoal", () => {
  it("picks deficit goal when mode is deficit", () => {
    const goal = pickDailyCalorieGoal("deficit", {
      kcalDeficit: 1500,
      kcalMaintenance: 1900,
    });
    expect(goal).toBe(1500);
  });

  it("picks maintenance goal when mode is maintenance", () => {
    const goal = pickDailyCalorieGoal("maintenance", {
      kcalDeficit: 1500,
      kcalMaintenance: 1950,
    });
    expect(goal).toBe(1950);
  });

  it("falls back to domain defaults when targets are not provided", () => {
    expect(pickDailyCalorieGoal("deficit", null)).toBe(1500);
    expect(pickDailyCalorieGoal("maintenance", null)).toBe(1900);
  });

  it("enforces the 1,200 kcal absolute minimum floor", () => {
    const lowTargets = {
      kcalDeficit: 1000,
      kcalMaintenance: 1100,
    };
    expect(pickDailyCalorieGoal("deficit", lowTargets)).toBe(1200);
    expect(pickDailyCalorieGoal("maintenance", lowTargets)).toBe(1200);
  });
});


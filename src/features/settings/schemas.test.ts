import { describe, expect, it } from "vitest";
import {
  profileSchema,
  targetsSchema,
  milestonesSchema,
  workoutScheduleSchema,
  preferencesSchema,
} from "./schemas";

describe("Settings Schemas Validation", () => {
  describe("profileSchema", () => {
    it("validates valid profile settings", () => {
      const valid = {
        units: "metric",
        theme: "system",
        timezone: "America/New_York",
        heightCm: 175,
        startWeightKg: 90.0,
        finalGoalWeightKg: 65.0,
        maintenanceMode: false,
      };
      const res = profileSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("rejects non-positive weights", () => {
      const invalid = {
        timezone: "UTC",
        startWeightKg: -10,
        finalGoalWeightKg: 65.0,
      };
      const res = profileSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("targetsSchema", () => {
    const validTargets = {
      kcalDeficit: 1500,
      kcalMaintenance: 1900,
      proteinMinG: 110,
      proteinMaxG: 120,
      fatPct: 0.3,
      waterMl: 3000,
      stepsMin: 7000,
      stepsMax: 8000,
    };

    it("validates standard domain targets", () => {
      const res = targetsSchema.safeParse(validTargets);
      expect(res.success).toBe(true);
    });

    it("rejects calorie goals under the 1,200 kcal floor", () => {
      const subFloorDeficit = {
        ...validTargets,
        kcalDeficit: 1199,
      };
      const res = targetsSchema.safeParse(subFloorDeficit);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain("1,200 kcal");
      }
    });

    it("rejects maintenance calories under 1,200 kcal", () => {
      const subFloorMaintenance = {
        ...validTargets,
        kcalMaintenance: 1000,
      };
      const res = targetsSchema.safeParse(subFloorMaintenance);
      expect(res.success).toBe(false);
    });

    it("rejects when proteinMin exceeds proteinMax", () => {
      const invalidRange = {
        ...validTargets,
        proteinMinG: 130,
        proteinMaxG: 120,
      };
      const res = targetsSchema.safeParse(invalidRange);
      expect(res.success).toBe(false);
    });

    it("rejects when stepsMin exceeds stepsMax", () => {
      const invalidSteps = {
        ...validTargets,
        stepsMin: 10000,
        stepsMax: 8000,
      };
      const res = targetsSchema.safeParse(invalidSteps);
      expect(res.success).toBe(false);
    });
  });

  describe("milestonesSchema", () => {
    it("validates positive milestone weights", () => {
      const res = milestonesSchema.safeParse({
        phase1GoalKg: 82.0,
        phase2GoalKg: 73.0,
        phase3GoalKg: 65.0,
      });
      expect(res.success).toBe(true);
    });

    it("rejects negative or invalid milestone weights", () => {
      const res = milestonesSchema.safeParse({
        phase1GoalKg: -5,
        phase2GoalKg: 73.0,
        phase3GoalKg: 65.0,
      });
      expect(res.success).toBe(false);
    });
  });

  describe("workoutScheduleSchema", () => {
    it("validates a full 7-day schedule", () => {
      const schedule = [
        { weekday: "mon", sessionType: "Low-Impact Cardio" },
        { weekday: "tue", sessionType: "Low-Impact HIIT" },
        { weekday: "wed", sessionType: "Active Recovery" },
        { weekday: "thu", sessionType: "Low-Impact Cardio" },
        { weekday: "fri", sessionType: "Low-Impact HIIT" },
        { weekday: "sat", sessionType: "60-min Brisk Walk" },
        { weekday: "sun", sessionType: "Rest" },
      ];
      const res = workoutScheduleSchema.safeParse({ schedule });
      expect(res.success).toBe(true);
    });

    it("rejects incomplete schedules with fewer than 7 days", () => {
      const schedule = [
        { weekday: "mon", sessionType: "Cardio" },
      ];
      const res = workoutScheduleSchema.safeParse({ schedule });
      expect(res.success).toBe(false);
    });
  });

  describe("preferencesSchema", () => {
    it("validates units and theme preferences", () => {
      const res = preferencesSchema.safeParse({
        units: "imperial",
        theme: "dark",
      });
      expect(res.success).toBe(true);
    });

    it("rejects invalid options", () => {
      const res = preferencesSchema.safeParse({
        units: "stone",
        theme: "blue",
      });
      expect(res.success).toBe(false);
    });
  });
});

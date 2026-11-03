import { describe, expect, it } from "vitest";
import { profileSchema, targetsSchema } from "./schemas";

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
});


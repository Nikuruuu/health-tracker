import { describe, expect, it } from "vitest";
import {
  seedDefaultPhases,
  computePhaseDateWindows,
  getPhaseStatus,
  validateMilestones,
  getPhaseRecalibrationPreview,
  resolveDeficitPhaseOnMaintenanceOff,
} from "./phases";

describe("domain/phases", () => {
  describe("seedDefaultPhases", () => {
    it("seeds 4 phases with correct modes and progression for default 90kg -> 65kg", () => {
      const phases = seedDefaultPhases("user_123", 90.0, 65.0, "2026-11-01");

      expect(phases).toHaveLength(4);

      // Phase 1
      expect(phases[0].id).toBe("user_123_phase_1");
      expect(phases[0].userId).toBe("user_123");
      expect(phases[0].mode).toBe("deficit");
      expect(phases[0].startWeightKg).toBe(90.0);
      expect(phases[0].goalWeightKg).toBe(81.7);
      expect(phases[0].startDate).toBe("2026-11-01");
      expect(phases[0].endDate).toBe("2026-12-01");

      // Phase 2
      expect(phases[1].id).toBe("user_123_phase_2");
      expect(phases[1].mode).toBe("deficit");
      expect(phases[1].startWeightKg).toBe(81.7);
      expect(phases[1].goalWeightKg).toBe(73.3);
      expect(phases[1].startDate).toBe("2026-12-01");
      expect(phases[1].endDate).toBe("2027-03-01");

      // Phase 3
      expect(phases[2].id).toBe("user_123_phase_3");
      expect(phases[2].mode).toBe("deficit");
      expect(phases[2].startWeightKg).toBe(73.3);
      expect(phases[2].goalWeightKg).toBe(65.0);
      expect(phases[2].startDate).toBe("2027-03-01");
      expect(phases[2].endDate).toBe("2027-06-01");

      // Phase 4
      expect(phases[3].id).toBe("user_123_phase_4");
      expect(phases[3].mode).toBe("maintenance");
      expect(phases[3].startWeightKg).toBe(65.0);
      expect(phases[3].goalWeightKg).toBe(65.0);
      expect(phases[3].startDate).toBe("2027-06-01");
      expect(phases[3].endDate).toBeNull();
    });

    it("is idempotent: multiple runs for the same user yield identical phase IDs and counts", () => {
      const run1 = seedDefaultPhases("user_test", 90.0, 65.0, "2026-11-02");
      const run2 = seedDefaultPhases("user_test", 90.0, 65.0, "2026-11-02");

      expect(run1).toEqual(run2);
      expect(run1.map((p) => p.id)).toEqual([
        "user_test_phase_1",
        "user_test_phase_2",
        "user_test_phase_3",
        "user_test_phase_4",
      ]);
    });
  });

  describe("computePhaseDateWindows", () => {
    it("computes accurate month boundaries for all 4 phases", () => {
      const windows = computePhaseDateWindows("2026-01-15");
      expect(windows[1]).toEqual({
        startDate: "2026-01-15",
        endDate: "2026-02-15",
        windowLabel: "Month 1",
      });
      expect(windows[2]).toEqual({
        startDate: "2026-02-15",
        endDate: "2026-05-15",
        windowLabel: "Months 2–4",
      });
      expect(windows[3]).toEqual({
        startDate: "2026-05-15",
        endDate: "2026-08-15",
        windowLabel: "Months 5–7",
      });
      expect(windows[4]).toEqual({
        startDate: "2026-08-15",
        endDate: null,
        windowLabel: "Ongoing",
      });
    });
  });

  describe("getPhaseStatus", () => {
    it("returns correct status based on active phase number", () => {
      // Active is Phase 2
      expect(getPhaseStatus(1, 2)).toBe("completed");
      expect(getPhaseStatus(2, 2)).toBe("current");
      expect(getPhaseStatus(3, 2)).toBe("upcoming");
      expect(getPhaseStatus(4, 2)).toBe("upcoming");

      // Active is Phase 4
      expect(getPhaseStatus(1, 4)).toBe("completed");
      expect(getPhaseStatus(2, 4)).toBe("completed");
      expect(getPhaseStatus(3, 4)).toBe("completed");
      expect(getPhaseStatus(4, 4)).toBe("current");
    });
  });

  describe("validateMilestones", () => {
    const startWeight = 90.0;
    const finalGoal = 65.0;

    it("accepts valid strictly decreasing milestones ending at final goal", () => {
      const result = validateMilestones(startWeight, finalGoal, {
        phase1GoalKg: 82.0,
        phase2GoalKg: 73.0,
        phase3GoalKg: 65.0,
      });
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects Phase 1 goal greater than or equal to start weight", () => {
      const result = validateMilestones(startWeight, finalGoal, {
        phase1GoalKg: 90.5,
        phase2GoalKg: 75.0,
        phase3GoalKg: 65.0,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must be less than starting weight");
    });

    it("rejects Phase 2 goal greater than or equal to Phase 1 goal", () => {
      const result = validateMilestones(startWeight, finalGoal, {
        phase1GoalKg: 80.0,
        phase2GoalKg: 82.0,
        phase3GoalKg: 65.0,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must be less than Phase 1 goal");
    });

    it("rejects Phase 3 goal not equal to final goal weight", () => {
      const result = validateMilestones(startWeight, finalGoal, {
        phase1GoalKg: 82.0,
        phase2GoalKg: 73.0,
        phase3GoalKg: 66.0, // Should be 65.0
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("must end exactly at the final goal weight");
    });

    it("rejects deficit milestones below final goal weight", () => {
      const result = validateMilestones(startWeight, finalGoal, {
        phase1GoalKg: 64.0,
        phase2GoalKg: 63.0,
        phase3GoalKg: 65.0,
      });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("cannot be below final goal weight");
    });
  });

  describe("getPhaseRecalibrationPreview", () => {
    it("formats before and after comparison between Phase 2 and Phase 4", () => {
      const preview = getPhaseRecalibrationPreview(
        { phaseNumber: 2, mode: "deficit", startWeightKg: 82.0, goalWeightKg: 73.0 },
        { phaseNumber: 4, mode: "maintenance", startWeightKg: 65.0, goalWeightKg: 65.0 },
        { kcalDeficit: 1500, kcalMaintenance: 1900 }
      );

      expect(preview.currentCalories).toBe("1,500 kcal");
      expect(preview.targetCalories).toBe("~1,900 kcal");
      expect(preview.currentTrend).toContain("Downward (82 → 73 kg)");
      expect(preview.targetTrend).toContain("Flat (±1.5 kg)");
      expect(preview.currentWeightRange).toBe("82 → 73 kg");
      expect(preview.targetWeightRange).toBe("65 kg ± 1.5");
    });
  });

  describe("resolveDeficitPhaseOnMaintenanceOff", () => {
    it("returns the last deficit phase from the list", () => {
      const phasesList = [
        { id: "p1", mode: "deficit" },
        { id: "p2", mode: "deficit" },
        { id: "p3", mode: "deficit" },
        { id: "p4", mode: "maintenance" },
      ];
      expect(resolveDeficitPhaseOnMaintenanceOff(phasesList)).toBe("p3");
    });
  });
});

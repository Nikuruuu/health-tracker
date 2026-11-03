import { describe, expect, it } from "vitest";
import { seedDefaultPhases } from "./phases";

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

    // Phase 2
    expect(phases[1].id).toBe("user_123_phase_2");
    expect(phases[1].mode).toBe("deficit");
    expect(phases[1].startWeightKg).toBe(81.7);
    expect(phases[1].goalWeightKg).toBe(73.3);

    // Phase 3
    expect(phases[2].id).toBe("user_123_phase_3");
    expect(phases[2].mode).toBe("deficit");
    expect(phases[2].startWeightKg).toBe(73.3);
    expect(phases[2].goalWeightKg).toBe(65.0);

    // Phase 4
    expect(phases[3].id).toBe("user_123_phase_4");
    expect(phases[3].mode).toBe("maintenance");
    expect(phases[3].startWeightKg).toBe(65.0);
    expect(phases[3].goalWeightKg).toBe(65.0);
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

    // Distinct phase IDs for different users
    const runUserB = seedDefaultPhases("user_other", 90.0, 65.0, "2026-11-02");
    expect(runUserB.map((p) => p.id)).toEqual([
      "user_other_phase_1",
      "user_other_phase_2",
      "user_other_phase_3",
      "user_other_phase_4",
    ]);
  });
});

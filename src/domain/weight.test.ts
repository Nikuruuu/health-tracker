import { describe, expect, it } from "vitest";
import { calculateTotalWeightLost } from "./weight";

describe("calculateTotalWeightLost", () => {
  it("calculates exact weight lost from start to current weight", () => {
    // Matches Maya's journey in the UI reference: 90.0 -> 83.4 = 6.6 kg
    expect(calculateTotalWeightLost(90.0, 83.4)).toBe(6.6);
  });

  it("handles decimal precision and rounding to 1 decimal place", () => {
    expect(calculateTotalWeightLost(90.0, 83.35)).toBe(6.7);
    expect(calculateTotalWeightLost(90.0, 83.34)).toBe(6.7);
    expect(calculateTotalWeightLost(90.0, 83.31)).toBe(6.7);
    expect(calculateTotalWeightLost(90.0, 83.29)).toBe(6.7);
  });

  it("returns 0 if start and current weights are identical", () => {
    expect(calculateTotalWeightLost(90.0, 90.0)).toBe(0);
  });

  it("returns negative values when weight is gained", () => {
    expect(calculateTotalWeightLost(90.0, 91.5)).toBe(-1.5);
  });

  it("handles NaN inputs gracefully", () => {
    expect(calculateTotalWeightLost(Number.NaN, 85)).toBe(0);
    expect(calculateTotalWeightLost(90, Number.NaN)).toBe(0);
  });
});


import { describe, expect, it } from "vitest";
import {
  cmToInches,
  formatWeight,
  inchesToCm,
  kgToLbs,
  lbsToKg,
} from "./units";

describe("Unit Conversions", () => {
  it("accurately converts lbs to kg", () => {
    // 198.42 lbs ≈ 90.0 kg
    expect(lbsToKg(198.42)).toBe(90.0);
    // 143.30 lbs ≈ 65.0 kg
    expect(lbsToKg(143.3)).toBe(65.0);
  });

  it("accurately converts kg to lbs", () => {
    expect(kgToLbs(90.0)).toBe(198.4);
    expect(kgToLbs(65.0)).toBe(143.3);
  });

  it("accurately converts inches to cm and vice-versa", () => {
    expect(inchesToCm(70)).toBe(177.8);
    expect(cmToInches(177.8)).toBe(70.0);
  });

  it("formats weight according to unit preference", () => {
    expect(formatWeight(90.0, "metric")).toBe("90 kg");
    expect(formatWeight(90.0, "imperial")).toBe("198.4 lbs");
  });

  it("handles 0 and NaN gracefully", () => {
    expect(lbsToKg(0)).toBe(0);
    expect(kgToLbs(0)).toBe(0);
    expect(lbsToKg(Number.NaN)).toBe(0);
    expect(kgToLbs(Number.NaN)).toBe(0);
  });
});


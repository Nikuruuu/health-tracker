/**
 * Pure unit conversion and formatting functions.
 * Weight in database is strictly stored in kg; height in cm.
 */

const LBS_PER_KG = 2.20462262185;
const CM_PER_INCH = 2.54;

/**
 * Converts pounds (lbs) to kilograms (kg).
 */
export function lbsToKg(lbs: number): number {
  if (Number.isNaN(lbs) || lbs < 0) return 0;
  return Math.round((lbs / LBS_PER_KG) * 100) / 100;
}

/**
 * Converts kilograms (kg) to pounds (lbs).
 */
export function kgToLbs(kg: number): number {
  if (Number.isNaN(kg) || kg < 0) return 0;
  return Math.round(kg * LBS_PER_KG * 10) / 10;
}

/**
 * Converts inches to centimeters (cm).
 */
export function inchesToCm(inches: number): number {
  if (Number.isNaN(inches) || inches < 0) return 0;
  return Math.round(inches * CM_PER_INCH * 10) / 10;
}

/**
 * Converts centimeters (cm) to inches.
 */
export function cmToInches(cm: number): number {
  if (Number.isNaN(cm) || cm < 0) return 0;
  return Math.round((cm / CM_PER_INCH) * 10) / 10;
}

/**
 * Formats weight for display according to chosen unit preference.
 */
export function formatWeight(kg: number, units: "metric" | "imperial" = "metric"): string {
  if (units === "imperial") {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${Math.round(kg * 10) / 10} kg`;
}


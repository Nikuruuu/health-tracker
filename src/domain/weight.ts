/**
 * Calculates total weight lost from the starting weight and the most recent entry.
 * Total lost = start - most recent entry (per docs/domain.md).
 *
 * @param startWeightKg The user's baseline weight in kg
 * @param currentWeightKg The latest weight entry in kg
 * @returns Total kg lost rounded to 1 decimal place (positive = loss, negative = gain)
 */
export function calculateTotalWeightLost(
  startWeightKg: number,
  currentWeightKg: number
): number {
  if (Number.isNaN(startWeightKg) || Number.isNaN(currentWeightKg)) {
    return 0;
  }
  const diff = startWeightKg - currentWeightKg;
  return Math.round(diff * 10) / 10;
}


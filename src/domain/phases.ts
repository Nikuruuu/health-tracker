import {
  WEIGHT_CONFIG,
  calculateSuggestedPhaseMilestones,
  type PhaseMode,
} from "./config";

export interface SeededPhase {
  id: string;
  userId: string;
  name: string;
  mode: PhaseMode;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string | null;
  startWeightKg: number;
  goalWeightKg: number;
}

/**
 * Seeds default phases for a user: an even milestone path from start weight
 * to final goal across phases 1-3 (deficit), plus phase 4 (maintenance).
 */
export function seedDefaultPhases(
  userId: string,
  startWeightKg: number = WEIGHT_CONFIG.startWeightKg,
  finalGoalWeightKg: number = WEIGHT_CONFIG.finalGoalWeightKg,
  startDate: string = new Date().toISOString().slice(0, 10)
): SeededPhase[] {
  const milestones = calculateSuggestedPhaseMilestones(startWeightKg, finalGoalWeightKg);

  return [
    {
      id: `${userId}_phase_1`,
      userId,
      name: "Phase 1: Kickoff",
      mode: "deficit",
      startDate,
      endDate: null,
      startWeightKg,
      goalWeightKg: milestones.phase1GoalKg,
    },
    {
      id: `${userId}_phase_2`,
      userId,
      name: "Phase 2: Momentum",
      mode: "deficit",
      startDate,
      endDate: null,
      startWeightKg: milestones.phase1GoalKg,
      goalWeightKg: milestones.phase2GoalKg,
    },
    {
      id: `${userId}_phase_3`,
      userId,
      name: "Phase 3: Final Push",
      mode: "deficit",
      startDate,
      endDate: null,
      startWeightKg: milestones.phase2GoalKg,
      goalWeightKg: milestones.phase3GoalKg,
    },
    {
      id: `${userId}_phase_4`,
      userId,
      name: "Phase 4: Maintenance",
      mode: "maintenance",
      startDate,
      endDate: null,
      startWeightKg: finalGoalWeightKg,
      goalWeightKg: finalGoalWeightKg,
    },
  ];
}


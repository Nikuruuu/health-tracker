"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { db, withTransaction } from "@/db";
import { profile, targets, phases, workoutPlan } from "@/db/schema/app";
import { eq, and } from "drizzle-orm";
import {
  CALORIE_CONFIG,
} from "@/domain/config";
import {
  validateMilestones,
  calculateMaintenanceToggleTransition,
  calculatePhaseSwitchTransition,
} from "@/domain/phases";
import {
  targetsSchema,
  type TargetsFormValues,
  milestonesSchema,
  type MilestonesFormValues,
  switchPhaseSchema,
  type SwitchPhaseInput,
  toggleMaintenanceSchema,
  type ToggleMaintenanceInput,
  workoutScheduleSchema,
  type WorkoutScheduleFormValues,
  preferencesSchema,
  type PreferencesFormValues,
} from "./schemas";

/**
 * Update daily nutritional and activity targets.
 * Hard rule: Enforces minimum 1,200 kcal floor on both deficit and maintenance goals.
 */
export async function updateTargetsAction(input: TargetsFormValues) {
  // 1. Zod validate input
  const parsed = targetsSchema.parse(input);

  // 2. Authoritative server check for 1,200 floor
  if (
    parsed.kcalDeficit < CALORIE_CONFIG.absoluteFloorKcal ||
    parsed.kcalMaintenance < CALORIE_CONFIG.absoluteFloorKcal
  ) {
    throw new Error(`Calorie goals cannot be less than ${CALORIE_CONFIG.absoluteFloorKcal} kcal.`);
  }

  // 3. Authoritative authentication check
  const session = await requireSession();
  const userId = session.user.id;

  const now = new Date();

  // 4. Update targets strictly scoped by session userId
  await db
    .insert(targets)
    .values({
      userId,
      kcalDeficit: parsed.kcalDeficit,
      kcalMaintenance: parsed.kcalMaintenance,
      proteinMinG: parsed.proteinMinG,
      proteinMaxG: parsed.proteinMaxG,
      fatPct: String(parsed.fatPct),
      waterMl: parsed.waterMl,
      stepsMin: parsed.stepsMin,
      stepsMax: parsed.stepsMax,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: targets.userId,
      set: {
        kcalDeficit: parsed.kcalDeficit,
        kcalMaintenance: parsed.kcalMaintenance,
        proteinMinG: parsed.proteinMinG,
        proteinMaxG: parsed.proteinMaxG,
        fatPct: String(parsed.fatPct),
        waterMl: parsed.waterMl,
        stepsMin: parsed.stepsMin,
        stepsMax: parsed.stepsMax,
        updatedAt: now,
      },
    });

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/nutrition");

  return { success: true };
}

/**
 * Update milestone goal weights across deficit phases.
 */
export async function updateMilestonesAction(input: MilestonesFormValues) {
  // 1. Zod validate input
  const parsed = milestonesSchema.parse(input);

  // 2. Authoritative authentication check
  const session = await requireSession();
  const userId = session.user.id;

  // 3. Fetch user baseline profile & existing phases
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });

  if (!userProfile) {
    throw new Error("Profile not found.");
  }

  const userPhases = await db.query.phases.findMany({
    where: eq(phases.userId, userId),
  });

  if (userPhases.length < 3) {
    throw new Error("Phases not properly initialized.");
  }

  const startWeightKg = parseFloat(userProfile.startWeightKg);
  const finalGoalWeightKg = parseFloat(userProfile.finalGoalWeightKg);

  // 4. Pure domain validation
  const validation = validateMilestones(startWeightKg, finalGoalWeightKg, {
    phase1GoalKg: parsed.phase1GoalKg,
    phase2GoalKg: parsed.phase2GoalKg,
    phase3GoalKg: parsed.phase3GoalKg,
  });

  if (!validation.isValid) {
    throw new Error(validation.error || "Invalid milestone progression.");
  }

  // 5. Update phases atomically
  await withTransaction(async (tx) => {
    // Sort or match by phase ID / name
    const p1 = userPhases.find((p) => p.name.includes("Phase 1") || p.id.endsWith("_phase_1"));
    const p2 = userPhases.find((p) => p.name.includes("Phase 2") || p.id.endsWith("_phase_2"));
    const p3 = userPhases.find((p) => p.name.includes("Phase 3") || p.id.endsWith("_phase_3"));

    if (p1) {
      await tx
        .update(phases)
        .set({ goalWeightKg: String(parsed.phase1GoalKg) })
        .where(and(eq(phases.userId, userId), eq(phases.id, p1.id)));
    }
    if (p2) {
      await tx
        .update(phases)
        .set({
          startWeightKg: String(parsed.phase1GoalKg),
          goalWeightKg: String(parsed.phase2GoalKg),
        })
        .where(and(eq(phases.userId, userId), eq(phases.id, p2.id)));
    }
    if (p3) {
      await tx
        .update(phases)
        .set({
          startWeightKg: String(parsed.phase2GoalKg),
          goalWeightKg: String(parsed.phase3GoalKg),
        })
        .where(and(eq(phases.userId, userId), eq(phases.id, p3.id)));
    }
  });

  revalidatePath("/settings");
  revalidatePath("/");

  return { success: true };
}

/**
 * Switch active phase with recalibration.
 */
export async function switchPhaseAction(input: SwitchPhaseInput) {
  // 1. Zod validate input
  const parsed = switchPhaseSchema.parse(input);

  // 2. Authoritative authentication check
  const session = await requireSession();
  const userId = session.user.id;

  // 3. Find user profile and target phase strictly scoped by session userId
  const [userProfile, userPhases] = await Promise.all([
    db.query.profile.findFirst({
      where: eq(profile.userId, userId),
    }),
    db.query.phases.findMany({
      where: eq(phases.userId, userId),
    }),
  ]);

  if (!userProfile) {
    throw new Error("User profile not found.");
  }

  const targetPhase = userPhases.find((p) => p.id === parsed.phaseId);
  if (!targetPhase) {
    throw new Error("Target phase not found.");
  }

  // 4. Calculate transition via pure domain function
  const transition = calculatePhaseSwitchTransition({
    targetPhaseId: targetPhase.id,
    activePhaseId: userProfile.activePhaseId,
    maintenanceMode: userProfile.maintenanceMode,
    lastDeficitPhaseId: userProfile.lastDeficitPhaseId,
    phases: userPhases,
  });

  // Authoritative check: ensure nextActivePhaseId belongs to signed-in user
  const activePhaseBelongsToUser = userPhases.some(
    (p) => p.id === transition.nextActivePhaseId
  );
  if (!activePhaseBelongsToUser) {
    throw new Error("Target phase does not belong to the user.");
  }

  // Authoritative check: ensure nextLastDeficitPhaseId belongs to signed-in user
  if (transition.nextLastDeficitPhaseId) {
    const lastDeficitBelongsToUser = userPhases.some(
      (p) => p.id === transition.nextLastDeficitPhaseId && p.mode === "deficit"
    );
    if (!lastDeficitBelongsToUser) {
      throw new Error("Invalid deficit phase for user.");
    }
  }

  // 5. Update profile active phase, maintenance linkage, and lastDeficitPhaseId
  await db
    .update(profile)
    .set({
      activePhaseId: transition.nextActivePhaseId,
      maintenanceMode: transition.nextMaintenanceMode,
      lastDeficitPhaseId: transition.nextLastDeficitPhaseId,
      updatedAt: new Date(),
    })
    .where(eq(profile.userId, userId));

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/nutrition");
  revalidatePath("/analytics");

  return { success: true };
}

/**
 * Toggle maintenance mode linked to Phase 4.
 */
export async function toggleMaintenanceAction(input: ToggleMaintenanceInput) {
  // 1. Zod validate input
  const parsed = toggleMaintenanceSchema.parse(input);

  // 2. Authoritative authentication check
  const session = await requireSession();
  const userId = session.user.id;

  // 3. Fetch user profile and phases strictly scoped by session userId
  const [userProfile, userPhases] = await Promise.all([
    db.query.profile.findFirst({
      where: eq(profile.userId, userId),
    }),
    db.query.phases.findMany({
      where: eq(phases.userId, userId),
    }),
  ]);

  if (!userProfile) {
    throw new Error("User profile not found.");
  }

  // 4. Calculate transition via pure domain function
  const transition = calculateMaintenanceToggleTransition({
    enable: parsed.enable,
    activePhaseId: userProfile.activePhaseId,
    lastDeficitPhaseId: userProfile.lastDeficitPhaseId,
    phases: userPhases,
  });

  // Authoritative check: ensure nextActivePhaseId belongs to signed-in user
  const activePhaseBelongsToUser = userPhases.some(
    (p) => p.id === transition.nextActivePhaseId
  );
  if (!activePhaseBelongsToUser) {
    throw new Error("Target phase does not belong to the user.");
  }

  // Authoritative check: ensure nextLastDeficitPhaseId belongs to signed-in user
  if (transition.nextLastDeficitPhaseId) {
    const lastDeficitBelongsToUser = userPhases.some(
      (p) => p.id === transition.nextLastDeficitPhaseId && p.mode === "deficit"
    );
    if (!lastDeficitBelongsToUser) {
      throw new Error("Invalid deficit phase for user.");
    }
  }

  // 5. Update profile
  await db
    .update(profile)
    .set({
      maintenanceMode: transition.nextMaintenanceMode,
      activePhaseId: transition.nextActivePhaseId,
      lastDeficitPhaseId: transition.nextLastDeficitPhaseId,
      updatedAt: new Date(),
    })
    .where(eq(profile.userId, userId));

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/nutrition");
  revalidatePath("/analytics");

  return { success: true };
}

/**
 * Update weekly workout schedule in workoutPlan table.
 */
export async function updateWorkoutScheduleAction(input: WorkoutScheduleFormValues) {
  // 1. Zod validate input
  const parsed = workoutScheduleSchema.parse(input);

  // 2. Authoritative authentication check
  const session = await requireSession();
  const userId = session.user.id;

  // 3. Upsert each weekday's workout plan
  await withTransaction(async (tx) => {
    for (const item of parsed.schedule) {
      const id = `${userId}_workout_${item.weekday}`;
      await tx
        .insert(workoutPlan)
        .values({
          id,
          userId,
          weekday: item.weekday,
          sessionType: item.sessionType,
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [workoutPlan.userId, workoutPlan.weekday],
          set: {
            sessionType: item.sessionType,
          },
        });
    }
  });

  revalidatePath("/settings");
  revalidatePath("/exercise");
  revalidatePath("/");

  return { success: true };
}

/**
 * Update units and theme preferences.
 */
export async function updatePreferencesAction(input: PreferencesFormValues) {
  // 1. Zod validate input
  const parsed = preferencesSchema.parse(input);

  // 2. Authoritative authentication check
  const session = await requireSession();
  const userId = session.user.id;

  // 3. Update profile units and theme
  await db
    .update(profile)
    .set({
      units: parsed.units,
      theme: parsed.theme,
      updatedAt: new Date(),
    })
    .where(eq(profile.userId, userId));

  revalidatePath("/settings");

  return { success: true };
}


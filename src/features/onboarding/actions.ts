"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { withTransaction } from "@/db";
import { profile, targets, phases } from "@/db/schema/app";
import {
  CALORIE_CONFIG,
  HYDRATION_CONFIG,
  MACRO_CONFIG,
  STEP_CONFIG,
} from "@/domain/config";
import { seedDefaultPhases } from "@/domain/phases";
import { inchesToCm, lbsToKg } from "@/lib/units";
import { onboardingInputSchema, type OnboardingInput } from "./schemas";

export async function completeOnboarding(input: OnboardingInput) {
  // 1. Zod validate input
  const parsed = onboardingInputSchema.parse(input);

  // 2. Authoritative authentication check
  const session = await requireSession();
  const userId = session.user.id;

  // 3. Unit normalization to metric (kg and cm) for database persistence
  const isImperial = parsed.units === "imperial";

  const startWeightKg = isImperial
    ? lbsToKg(parsed.startWeight)
    : Math.round(parsed.startWeight * 10) / 10;

  const finalGoalWeightKg = isImperial
    ? lbsToKg(parsed.finalGoalWeight)
    : Math.round(parsed.finalGoalWeight * 10) / 10;

  const heightCm = parsed.height
    ? isImperial
      ? inchesToCm(parsed.height)
      : Math.round(parsed.height * 10) / 10
    : null;

  const activePhaseId = `${userId}_phase_1`;
  const seeded = seedDefaultPhases(
    userId,
    startWeightKg,
    finalGoalWeightKg,
    parsed.startDate
  );

  // 4. Execute atomic transaction
  await withTransaction(async (tx) => {
    const now = new Date();

    // Upsert Profile
    await tx
      .insert(profile)
      .values({
        userId,
        units: parsed.units,
        theme: "system",
        timezone: parsed.timezone,
        heightCm: heightCm ? String(heightCm) : null,
        startWeightKg: String(startWeightKg),
        finalGoalWeightKg: String(finalGoalWeightKg),
        activePhaseId,
        maintenanceMode: false,
        onboardedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: profile.userId,
        set: {
          units: parsed.units,
          timezone: parsed.timezone,
          heightCm: heightCm ? String(heightCm) : null,
          startWeightKg: String(startWeightKg),
          finalGoalWeightKg: String(finalGoalWeightKg),
          activePhaseId,
          onboardedAt: now,
          updatedAt: now,
        },
      });

    // Upsert Nutritional & Activity Targets (seeded from domain config defaults)
    await tx
      .insert(targets)
      .values({
        userId,
        kcalDeficit: CALORIE_CONFIG.deficitDefaultKcal,
        kcalMaintenance: CALORIE_CONFIG.maintenanceKcal,
        proteinMinG: MACRO_CONFIG.proteinMinG,
        proteinMaxG: MACRO_CONFIG.proteinMaxG,
        fatPct: String(MACRO_CONFIG.fatPercentage),
        waterMl: HYDRATION_CONFIG.goalMl,
        stepsMin: STEP_CONFIG.minSteps,
        stepsMax: STEP_CONFIG.maxSteps,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: targets.userId,
        set: {
          kcalDeficit: CALORIE_CONFIG.deficitDefaultKcal,
          kcalMaintenance: CALORIE_CONFIG.maintenanceKcal,
          proteinMinG: MACRO_CONFIG.proteinMinG,
          proteinMaxG: MACRO_CONFIG.proteinMaxG,
          fatPct: String(MACRO_CONFIG.fatPercentage),
          waterMl: HYDRATION_CONFIG.goalMl,
          stepsMin: STEP_CONFIG.minSteps,
          stepsMax: STEP_CONFIG.maxSteps,
          updatedAt: now,
        },
      });

    // Upsert Seeded Phases (Idempotent: updates existing phase rows by deterministic ID)
    for (const phaseItem of seeded) {
      await tx
        .insert(phases)
        .values({
          id: phaseItem.id,
          userId,
          name: phaseItem.name,
          mode: phaseItem.mode,
          startDate: phaseItem.startDate,
          endDate: phaseItem.endDate,
          startWeightKg: String(phaseItem.startWeightKg),
          goalWeightKg: String(phaseItem.goalWeightKg),
        })
        .onConflictDoUpdate({
          target: phases.id,
          set: {
            name: phaseItem.name,
            mode: phaseItem.mode,
            startDate: phaseItem.startDate,
            endDate: phaseItem.endDate,
            startWeightKg: String(phaseItem.startWeightKg),
            goalWeightKg: String(phaseItem.goalWeightKg),
          },
        });
    }
  });

  revalidatePath("/", "layout");
  redirect("/");
}


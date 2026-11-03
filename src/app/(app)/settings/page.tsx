import "server-only";
import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { profile, targets, phases, workoutPlan, weightEntries } from "@/db/schema/app";
import { eq, desc } from "drizzle-orm";
import {
  CALORIE_CONFIG,
  MACRO_CONFIG,
  HYDRATION_CONFIG,
  STEP_CONFIG,
  DEFAULT_WEEKLY_WORKOUT_PLAN,
  type Weekday,
} from "@/domain/config";
import { computePhaseDateWindows } from "@/domain/phases";
import { PhaseCalibrationSection } from "@/features/settings/components/phase-calibration-section";
import { MaintenanceCard } from "@/features/settings/components/maintenance-card";
import { TargetsEditor } from "@/features/settings/components/targets-editor";
import { WorkoutScheduleEditor } from "@/features/settings/components/workout-schedule-editor";
import { PreferencesCard } from "@/features/settings/components/preferences-card";

const PHASE_DESCRIPTIONS: Record<number, string> = {
  1: "Gentle start, build habits",
  2: "Steady fat loss, HIIT added",
  3: "Final push to goal weight",
  4: "Hold weight within ±1.5 kg",
};

export default async function SettingsPage() {
  const session = await requireSession();
  const userId = session.user.id;

  // 1. Parallel authoritative queries strictly scoped by session userId
  const [
    userProfile,
    userTargets,
    userPhasesRaw,
    userWorkoutPlanRaw,
    latestWeightEntry,
  ] = await Promise.all([
    db.query.profile.findFirst({
      where: eq(profile.userId, userId),
    }),
    db.query.targets.findFirst({
      where: eq(targets.userId, userId),
    }),
    db.query.phases.findMany({
      where: eq(phases.userId, userId),
    }),
    db.query.workoutPlan.findMany({
      where: eq(workoutPlan.userId, userId),
    }),
    db.query.weightEntries.findFirst({
      where: eq(weightEntries.userId, userId),
      orderBy: [desc(weightEntries.date)],
    }),
  ]);

  if (!userProfile) {
    throw new Error("User profile not found. Please complete onboarding.");
  }

  // 2. Idempotently seed workout plan if none exists
  let currentWorkoutPlan = userWorkoutPlanRaw;
  if (!currentWorkoutPlan || currentWorkoutPlan.length === 0) {
    const seededRows = DEFAULT_WEEKLY_WORKOUT_PLAN.map((item) => ({
      id: `${userId}_workout_${item.weekday}`,
      userId,
      weekday: item.weekday,
      sessionType: item.sessionType,
      createdAt: new Date(),
    }));

    await db.insert(workoutPlan).values(seededRows).onConflictDoNothing();
    currentWorkoutPlan = seededRows;
  }

  // 3. Fallbacks and normalization
  const startWeightKg = parseFloat(userProfile.startWeightKg);
  const finalGoalWeightKg = parseFloat(userProfile.finalGoalWeightKg);
  const currentWeightKg = latestWeightEntry
    ? parseFloat(latestWeightEntry.weightKg)
    : startWeightKg;

  const userStartDate = userProfile.onboardedAt
    ? userProfile.onboardedAt.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const dateWindows = computePhaseDateWindows(userStartDate);

  // Map phases into structured PhaseData
  const structuredPhases = [1, 2, 3, 4].map((num) => {
    const existing = userPhasesRaw.find(
      (p) => p.name.includes(`Phase ${num}`) || p.id.endsWith(`_phase_${num}`)
    );
    const windowDef = dateWindows[num];

    const fallbackGoal =
      num === 1
        ? 81.7
        : num === 2
        ? 73.3
        : finalGoalWeightKg;

    const fallbackStart =
      num === 1
        ? startWeightKg
        : num === 2
        ? 81.7
        : num === 3
        ? 73.3
        : finalGoalWeightKg;

    return {
      id: existing ? existing.id : `${userId}_phase_${num}`,
      phaseNumber: num,
      name: `Phase ${num}`,
      mode: (num === 4 ? "maintenance" : "deficit") as "deficit" | "maintenance",
      startDate: existing?.startDate || windowDef.startDate,
      endDate: existing?.endDate || windowDef.endDate,
      startWeightKg: existing ? parseFloat(existing.startWeightKg) : fallbackStart,
      goalWeightKg: existing ? parseFloat(existing.goalWeightKg) : fallbackGoal,
      windowLabel: windowDef.windowLabel,
      description: PHASE_DESCRIPTIONS[num] || "Structured phase calibration",
    };
  });

  const activePhaseId =
    userProfile.activePhaseId || structuredPhases[0]?.id || `${userId}_phase_1`;

  const safeTargets = {
    kcalDeficit: userTargets?.kcalDeficit ?? CALORIE_CONFIG.deficitDefaultKcal,
    kcalMaintenance: userTargets?.kcalMaintenance ?? CALORIE_CONFIG.maintenanceKcal,
    proteinMinG: userTargets?.proteinMinG ?? MACRO_CONFIG.proteinMinG,
    proteinMaxG: userTargets?.proteinMaxG ?? MACRO_CONFIG.proteinMaxG,
    fatPct: userTargets ? parseFloat(userTargets.fatPct) : MACRO_CONFIG.fatPercentage,
    waterMl: userTargets?.waterMl ?? HYDRATION_CONFIG.goalMl,
    stepsMin: userTargets?.stepsMin ?? STEP_CONFIG.minSteps,
    stepsMax: userTargets?.stepsMax ?? STEP_CONFIG.maxSteps,
  };

  const scheduleItems = currentWorkoutPlan.map((wp) => ({
    weekday: wp.weekday as Weekday,
    sessionType: wp.sessionType,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header section matching settings.jpg */}
      <div className="space-y-1">
        <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Configure
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Settings & Phase Calibration
        </h1>
      </div>

      {/* Main 2-column layout matching settings.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Phase Calibration & Workout Schedule */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <PhaseCalibrationSection
            userPhases={structuredPhases}
            activePhaseId={activePhaseId}
            startWeightKg={startWeightKg}
            finalGoalWeightKg={finalGoalWeightKg}
            targets={{
              kcalDeficit: safeTargets.kcalDeficit,
              kcalMaintenance: safeTargets.kcalMaintenance,
            }}
          />

          <WorkoutScheduleEditor initialSchedule={scheduleItems} />
        </div>

        {/* Right column: Maintenance Mode, Targets & Preferences */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <MaintenanceCard
            maintenanceMode={userProfile.maintenanceMode}
            currentWeightKg={currentWeightKg}
            finalGoalWeightKg={finalGoalWeightKg}
            kcalDeficit={safeTargets.kcalDeficit}
            kcalMaintenance={safeTargets.kcalMaintenance}
          />

          <TargetsEditor initialTargets={safeTargets} />

          <PreferencesCard
            initialUnits={(userProfile.units as "metric" | "imperial") || "metric"}
            initialTheme={(userProfile.theme as "light" | "dark" | "system") || "system"}
          />
        </div>
      </div>

      {/* Short 'not medical advice' note (Rule 8) */}
      <div className="pt-4 border-t border-border/60 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          VitaPath is designed for fitness and lifestyle tracking. Always consult a healthcare professional before beginning any weight loss, nutrition, or exercise program. Not medical advice.
        </p>
      </div>
    </div>
  );
}

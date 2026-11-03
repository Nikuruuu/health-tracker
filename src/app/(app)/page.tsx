import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { profile, targets, phases } from "@/db/schema/app";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWeight } from "@/lib/units";

export default async function DashboardPage() {
  const session = await requireSession();
  const userId = session.user.id;

  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });

  const userTargets = await db.query.targets.findFirst({
    where: eq(targets.userId, userId),
  });

  const activePhase = userProfile?.activePhaseId
    ? await db.query.phases.findFirst({
        where: eq(phases.id, userProfile.activePhaseId),
      })
    : null;

  const units = (userProfile?.units as "metric" | "imperial") || "metric";
  const startWeightNum = Number(userProfile?.startWeightKg ?? 90);
  const goalWeightNum = Number(activePhase?.goalWeightKg ?? userProfile?.finalGoalWeightKg ?? 65);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{session.user.name ? `, ${session.user.name}` : ""}! This is your health & fitness overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
            <CardDescription>{activePhase?.name || "Phase 1: Kickoff"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatWeight(startWeightNum, units)} → {formatWeight(goalWeightNum, units)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active mode: {activePhase?.mode || "deficit"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Daily Calorie Target</CardTitle>
            <CardDescription>Deficit goal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userTargets?.kcalDeficit ? `${userTargets.kcalDeficit} kcal` : "1,500 kcal"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Floor: 1,200 kcal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Daily Hydration</CardTitle>
            <CardDescription>
              {userTargets?.waterMl ? `${(userTargets.waterMl / 1000).toFixed(1)} L goal` : "3.0 L goal"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0 / {userTargets?.waterMl ?? 3000} ml
            </div>
            <p className="text-xs text-muted-foreground mt-1">6 × 500 ml taps</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

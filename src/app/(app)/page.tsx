import { getSession } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{session?.user.name ? `, ${session.user.name}` : ""}! This is your health & fitness overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
            <CardDescription>Phase 1: Deficit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90.0 kg → 81.7 kg</div>
            <p className="text-xs text-muted-foreground mt-1">Starting target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Daily Calorie Target</CardTitle>
            <CardDescription>Deficit range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,500 kcal</div>
            <p className="text-xs text-muted-foreground mt-1">Floor: 1,200 kcal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Daily Hydration</CardTitle>
            <CardDescription>3.0 L goal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 / 3,000 ml</div>
            <p className="text-xs text-muted-foreground mt-1">6 × 500 ml taps</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome to VitaPath</CardTitle>
          <CardDescription>
            Onboarding configuration placeholder. In Step 3, you will configure your starting weight, targets, and phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Account created successfully. You are ready for onboarding setup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


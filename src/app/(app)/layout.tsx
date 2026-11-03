import "server-only";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { profile, phases } from "@/db/schema/app";
import { eq, and } from "drizzle-orm";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppBottomNav } from "@/components/shell/app-bottom-nav";
import { AppHeader } from "@/components/shell/app-header";

export default async function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await requireSession();
  const userId = session.user.id;

  // 1. Scoped profile query strictly by session userId
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, userId),
  });

  // Redirect users without onboardedAt to /onboarding
  if (!userProfile?.onboardedAt) {
    redirect("/onboarding");
  }

  // 2. Scoped active phase query strictly by session userId
  let activePhase = null;
  if (userProfile.activePhaseId) {
    activePhase = await db.query.phases.findFirst({
      where: and(
        eq(phases.userId, userId),
        eq(phases.id, userProfile.activePhaseId)
      ),
    });
  }

  const phasePillText = activePhase?.name
    ? `${activePhase.name}${activePhase.mode ? ` · ${activePhase.mode === "maintenance" ? "Ongoing" : "Deficit"}` : ""}`
    : "Phase 1";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop sidebar (>= 768px) */}
      <AppSidebar
        maintenanceMode={userProfile.maintenanceMode}
        phaseName={activePhase?.name || null}
      />

      {/* Main content canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          <AppHeader
            user={{
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
            }}
            phasePillText={phasePillText}
          />
          <main>{children}</main>
        </div>
      </div>

      {/* Mobile bottom navigation bar (< 768px) */}
      <AppBottomNav />
    </div>
  );
}

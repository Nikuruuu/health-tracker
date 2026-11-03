import "server-only";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { db } from "@/db";
import { profile } from "@/db/schema/app";
import { eq } from "drizzle-orm";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await requireSession();

  // If already onboarded, redirect directly to dashboard /
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, session.user.id),
  });

  if (userProfile?.onboardedAt) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f7f3] flex flex-col justify-center items-center px-4 py-12 sm:px-6">
      <OnboardingForm userEmail={session.user.email} />
    </div>
  );
}


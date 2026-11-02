import "server-only";
import { requireSession } from "@/lib/session";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { ReactNode } from "react";

export default async function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await requireSession();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            🌱
          </div>
          <span className="font-semibold text-lg tracking-tight">VitaPath</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {session.user.name || session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}


"use client";

import { useSyncExternalStore } from "react";
import { UserMenu } from "@/components/shell/user-menu";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  phasePillText?: string | null;
  className?: string;
}

function emptySubscribe() {
  return () => {};
}

let cachedDateInfo = { greeting: "Hello", formattedDate: "" };
let lastCheckedMinute = -1;

function getClientDateInfo() {
  const now = new Date();
  const currentMinute = now.getMinutes();
  if (currentMinute !== lastCheckedMinute) {
    lastCheckedMinute = currentMinute;
    const hour = now.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    let formattedDate = "";
    try {
      formattedDate = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(now);
    } catch {
      formattedDate = now.toDateString();
    }

    cachedDateInfo = { greeting, formattedDate };
  }
  return cachedDateInfo;
}

const serverDateInfo = { greeting: "Welcome", formattedDate: "" };
function getServerDateInfo() {
  return serverDateInfo;
}

export function AppHeader({ user, phasePillText, className }: AppHeaderProps) {
  const { greeting, formattedDate } = useSyncExternalStore(
    emptySubscribe,
    getClientDateInfo,
    getServerDateInfo
  );

  const firstName = user.name?.split(" ")[0] || user.email.split("@")[0] || "there";

  return (
    <header className={cn("w-full flex items-center justify-between pb-6 gap-4 select-none", className)}>
      {/* Date & Personalized Greeting */}
      <div className="flex flex-col">
        <span
          className="text-xs sm:text-sm font-medium text-muted-foreground min-h-[1.25rem]"
          suppressHydrationWarning
        >
          {formattedDate}
        </span>
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight"
          suppressHydrationWarning
        >
          {greeting}, {firstName}
        </h1>
      </div>

      {/* Right controls: Phase pill and User avatar dropdown */}
      <div className="flex items-center gap-3">
        {phasePillText && (
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card shadow-xs text-xs font-semibold text-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>{phasePillText}</span>
          </div>
        )}

        <UserMenu user={user} />
      </div>
    </header>
  );
}

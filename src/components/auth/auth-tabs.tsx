"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthTabsProps {
  activeTab: "sign-in" | "sign-up";
}

export function AuthTabs({ activeTab }: AuthTabsProps) {
  return (
    <div className="flex w-full rounded-xl bg-muted p-1 border border-border shadow-2xs mb-8">
      <Link
        href="/sign-in"
        className={cn(
          "flex-1 text-center py-2 text-sm rounded-lg transition-all",
          activeTab === "sign-in"
            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:text-foreground font-medium"
        )}
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className={cn(
          "flex-1 text-center py-2 text-sm rounded-lg transition-all",
          activeTab === "sign-up"
            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:text-foreground font-medium"
        )}
      >
        Create account
      </Link>
    </div>
  );
}


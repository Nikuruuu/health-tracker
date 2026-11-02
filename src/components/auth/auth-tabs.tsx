"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthTabsProps {
  activeTab: "sign-in" | "sign-up";
}

export function AuthTabs({ activeTab }: AuthTabsProps) {
  return (
    <div className="flex w-full rounded-xl bg-white p-1 border border-gray-200/90 shadow-2xs mb-8">
      <Link
        href="/sign-in"
        className={cn(
          "flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all",
          activeTab === "sign-in"
            ? "bg-[#185a37] text-white shadow-xs"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className={cn(
          "flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all",
          activeTab === "sign-up"
            ? "bg-[#185a37] text-white shadow-xs"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        Create account
      </Link>
    </div>
  );
}


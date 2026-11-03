"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  UtensilsCrossed,
  Dumbbell,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/",
    icon: Home,
  },
  {
    name: "Nutrition",
    href: "/nutrition",
    icon: UtensilsCrossed,
  },
  {
    name: "Exercise",
    href: "/exercise",
    icon: Dumbbell,
  },
  {
    name: "Weight",
    href: "/analytics",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: SlidersHorizontal,
  },
];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "min-h-[44px] min-w-[44px] flex-1 flex flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors select-none",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-all",
                  isActive ? "bg-brand-mint text-primary" : ""
                )}
              >
                <Icon className="size-5 shrink-0" />
              </div>
              <span className="text-[11px] leading-none tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


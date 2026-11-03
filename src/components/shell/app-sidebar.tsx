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
import { CALORIE_CONFIG } from "@/domain/config";

interface AppSidebarProps {
  maintenanceMode?: boolean | null;
  phaseName?: string | null;
}

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
    name: "Exercise & Activity",
    href: "/exercise",
    icon: Dumbbell,
  },
  {
    name: "Weight & Body",
    href: "/analytics",
    icon: TrendingUp,
  },
  {
    name: "Settings & Phases",
    href: "/settings",
    icon: SlidersHorizontal,
  },
];

export function AppSidebar({ maintenanceMode, phaseName }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-border bg-card p-5 h-screen sticky top-0 justify-between select-none">
      <div className="flex flex-col gap-6">
        {/* Logo and Subtitle */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c0 3.1 2.2 4.6 4 5 .4-.9.9-1.9 1.4-2.8C9.5 12 13.5 9 17 8z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-foreground leading-tight">
              VitaPath
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {phaseName || "Phase 1 · Habit Building"}
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
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
                  "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("size-4.5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pinned Bottom "Current Mode" Card */}
      <div className="mt-auto pt-6">
        <div className="rounded-2xl bg-brand-mint text-brand-mint-foreground border border-primary/10 p-4 transition-all">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-forest/90 dark:text-brand-mint-foreground/80">
            Current Mode
          </span>

          {maintenanceMode === true ? (
            <>
              <h2 className="mt-1 text-sm font-bold text-foreground">
                Maintenance Mode
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                ~{CALORIE_CONFIG.maintenanceKcal.toLocaleString()} kcal / day
              </p>
            </>
          ) : maintenanceMode === false ? (
            <>
              <h2 className="mt-1 text-sm font-bold text-foreground">
                Deficit Mode
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {CALORIE_CONFIG.deficitMinKcal.toLocaleString()}–{CALORIE_CONFIG.deficitMaxKcal.toLocaleString()} kcal / day
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-1 text-sm font-bold text-foreground">
                Calorie Target
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set in onboarding
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}


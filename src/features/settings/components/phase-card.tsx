"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhaseStatus } from "@/domain/phases";

interface PhaseCardProps {
  name: string;
  windowLabel: string;
  startDate: string;
  endDate: string | null;
  description: string;
  caloriesLabel: string;
  weightRangeLabel: string;
  isActive: boolean;
  status: PhaseStatus;
  isEditableMilestone: boolean;
  onSelect: () => void;
  onEditMilestone?: () => void;
  disabled?: boolean;
}

export function PhaseCard({
  name,
  windowLabel,
  startDate,
  endDate,
  description,
  caloriesLabel,
  weightRangeLabel,
  isActive,
  status,
  isEditableMilestone,
  onSelect,
  onEditMilestone,
  disabled,
}: PhaseCardProps) {
  // Format dates: e.g. "Nov 3 – Dec 3"
  const formattedDates = (() => {
    try {
      const s = new Date(startDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      if (!endDate) return `${s} · Ongoing`;
      const e = new Date(endDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return `${s} – ${e}`;
    } catch {
      return windowLabel;
    }
  })();

  const statusBadge = (() => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border">
            Completed
          </span>
        );
      case "current":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30">
            Current
          </span>
        );
      case "upcoming":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            Upcoming
          </span>
        );
    }
  })();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!disabled && !isActive) onSelect();
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled && !isActive) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative flex flex-col justify-between p-4 sm:p-5 rounded-xl border text-left transition-all outline-hidden cursor-pointer",
        isActive
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
          : "border-border bg-card hover:border-primary/50 hover:bg-muted/40",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <div>
        {/* Top header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-foreground tracking-tight">
                {name}
              </h3>
              {statusBadge}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {windowLabel} ({formattedDates})
            </p>
          </div>

          <div className="shrink-0 pt-0.5">
            {isActive ? (
              <CheckCircle2 className="size-5 text-primary fill-primary/20" />
            ) : (
              <Circle className="size-5 text-muted-foreground/40" />
            )}
          </div>
        </div>

        {/* Phase Description */}
        <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom specs row */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold">
        <span className="text-foreground">{caloriesLabel}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{weightRangeLabel}</span>
          {isEditableMilestone && onEditMilestone && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Edit milestone weight"
              onClick={(e) => {
                e.stopPropagation();
                onEditMilestone();
              }}
              className="size-6 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3" />
              <span className="sr-only">Edit milestone</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition, useEffect } from "react";
import { completeOnboarding } from "@/features/onboarding/actions";
import { type OnboardingInput } from "@/features/onboarding/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kgToLbs, lbsToKg, cmToInches, inchesToCm } from "@/lib/units";
import { Scale, Ruler, Calendar, Globe, ArrowRight } from "lucide-react";

export function OnboardingForm({
  userEmail,
}: {
  userEmail?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [startWeight, setStartWeight] = useState<string>("90.0");
  const [finalGoalWeight, setFinalGoalWeight] = useState<string>("65.0");
  const [height, setHeight] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [timezone, setTimezone] = useState<string>("UTC");

  // Detect browser timezone on mount
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected && detected !== "UTC") {
        queueMicrotask(() => {
          setTimezone(detected);
        });
      }
    } catch {
      // fallback to UTC
    }
  }, []);

  // Handle unit switching: smoothly convert existing numbers
  const handleUnitsChange = (newUnits: "metric" | "imperial") => {
    if (newUnits === units) return;

    if (newUnits === "imperial") {
      // metric -> imperial
      const sw = parseFloat(startWeight);
      if (!Number.isNaN(sw)) setStartWeight(String(kgToLbs(sw)));
      const gw = parseFloat(finalGoalWeight);
      if (!Number.isNaN(gw)) setFinalGoalWeight(String(kgToLbs(gw)));
      const h = parseFloat(height);
      if (!Number.isNaN(h)) setHeight(String(cmToInches(h)));
    } else {
      // imperial -> metric
      const sw = parseFloat(startWeight);
      if (!Number.isNaN(sw)) setStartWeight(String(lbsToKg(sw)));
      const gw = parseFloat(finalGoalWeight);
      if (!Number.isNaN(gw)) setFinalGoalWeight(String(lbsToKg(gw)));
      const h = parseFloat(height);
      if (!Number.isNaN(h)) setHeight(String(inchesToCm(h)));
    }
    setUnits(newUnits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const swNum = parseFloat(startWeight);
    const gwNum = parseFloat(finalGoalWeight);
    const hNum = height ? parseFloat(height) : null;

    if (Number.isNaN(swNum) || swNum <= 0) {
      setError("Please enter a valid starting weight.");
      return;
    }
    if (Number.isNaN(gwNum) || gwNum <= 0) {
      setError("Please enter a valid final goal weight.");
      return;
    }
    if (gwNum >= swNum) {
      setError("Goal weight should be lower than starting weight for multi-phase weight loss.");
      return;
    }

    const payload: OnboardingInput = {
      units,
      timezone,
      startWeight: swNum,
      finalGoalWeight: gwNum,
      height: hNum,
      startDate,
    };

    startTransition(async () => {
      try {
        await completeOnboarding(payload);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An error occurred during onboarding";
        // Next.js redirect throws a NEXT_REDIRECT digest which shouldn't be treated as an error
        if (typeof message === "string" && message.includes("NEXT_REDIRECT")) {
          return;
        }
        setError(message);
      }
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#185a37] flex items-center justify-center text-white shadow-md mb-3">
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c0 3.1 2.2 4.6 4 5 .4-.9.9-1.9 1.4-2.8C9.5 12 13.5 9 17 8z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome to VitaPath
        </h1>
        <p className="mt-1 text-sm text-gray-600 max-w-sm">
          {userEmail ? `${userEmail} · ` : ""}Let&apos;s personalize your multi-phase journey.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white border border-gray-200/90 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Unit System Segmented Toggle */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Unit System</Label>
            <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200/80">
              <button
                type="button"
                onClick={() => handleUnitsChange("metric")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  units === "metric"
                    ? "bg-white text-[#185a37] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Metric (kg, cm)
              </button>
              <button
                type="button"
                onClick={() => handleUnitsChange("imperial")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  units === "imperial"
                    ? "bg-white text-[#185a37] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Imperial (lbs, in)
              </button>
            </div>
          </div>

          {/* Weight Baseline Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startWeight" className="text-xs font-semibold text-gray-700">
                Starting Weight ({units === "metric" ? "kg" : "lbs"})
              </Label>
              <div className="relative">
                <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="startWeight"
                  type="number"
                  step="0.1"
                  required
                  placeholder={units === "metric" ? "90.0" : "198.4"}
                  value={startWeight}
                  onChange={(e) => setStartWeight(e.target.value)}
                  className="h-11 pl-10 rounded-lg bg-white border-gray-200 text-sm focus-visible:ring-[#185a37]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="finalGoalWeight" className="text-xs font-semibold text-gray-700">
                Final Goal ({units === "metric" ? "kg" : "lbs"})
              </Label>
              <div className="relative">
                <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="finalGoalWeight"
                  type="number"
                  step="0.1"
                  required
                  placeholder={units === "metric" ? "65.0" : "143.3"}
                  value={finalGoalWeight}
                  onChange={(e) => setFinalGoalWeight(e.target.value)}
                  className="h-11 pl-10 rounded-lg bg-white border-gray-200 text-sm focus-visible:ring-[#185a37]"
                />
              </div>
            </div>
          </div>

          {/* Height (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="height" className="text-xs font-semibold text-gray-700">
                Height ({units === "metric" ? "cm" : "inches"})
              </Label>
              <span className="text-[11px] text-gray-500">Optional</span>
            </div>
            <div className="relative">
              <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                id="height"
                type="number"
                step="0.5"
                placeholder={units === "metric" ? "e.g. 175" : "e.g. 69"}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="h-11 pl-10 rounded-lg bg-white border-gray-200 text-sm focus-visible:ring-[#185a37]"
              />
            </div>
          </div>

          {/* Start Date & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs font-semibold text-gray-700">
                Start Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 pl-10 rounded-lg bg-white border-gray-200 text-sm focus-visible:ring-[#185a37]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-xs font-semibold text-gray-700">
                Timezone
              </Label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="timezone"
                  type="text"
                  required
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-11 pl-10 rounded-lg bg-white border-gray-200 text-sm focus-visible:ring-[#185a37]"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 pt-1 leading-relaxed">
            VitaPath will initialize your 4 structured phases (Phases 1–3 deficit, Phase 4 maintenance) with evenly paced milestones and seed your 1,500 kcal baseline target.
          </p>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-lg bg-[#185a37] hover:bg-[#12452a] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <span>{isPending ? "Setting up your plan..." : "Complete onboarding"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}


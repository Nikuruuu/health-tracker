"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "segmented" | "dropdown-item";
}

export function ThemeToggle({ className, variant = "segmented" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-1 rounded-lg bg-muted text-muted-foreground border border-border",
          className
        )}
        role="group"
        aria-label="Theme selection"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-pressed={theme === "light"}
          title="Light theme"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
            theme === "light"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "hover:text-foreground"
          )}
        >
          <Sun className="size-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-pressed={theme === "dark"}
          title="Dark theme"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
            theme === "dark"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "hover:text-foreground"
          )}
        >
          <Moon className="size-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          aria-pressed={theme === "system"}
          title="System preference"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
            theme === "system"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "hover:text-foreground"
          )}
        >
          <Laptop className="size-3.5" />
          <span>System</span>
        </button>
      </div>
    );
  }

  // Segmented compact toggle for dropdowns or toolbars
  return (
    <div className={cn("flex items-center justify-between w-full text-sm", className)}>
      <span className="text-muted-foreground text-xs font-medium">Theme</span>
      <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border">
        <button
          type="button"
          onClick={() => setTheme("light")}
          title="Light"
          className={cn(
            "p-1 rounded transition-colors",
            theme === "light" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sun className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          title="Dark"
          className={cn(
            "p-1 rounded transition-colors",
            theme === "dark" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Moon className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          title="System"
          className={cn(
            "p-1 rounded transition-colors",
            theme === "system" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Laptop className="size-3.5" />
        </button>
      </div>
    </div>
  );
}


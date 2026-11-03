import { z } from "zod";

/**
 * Profile schema: validates user settings, body baseline, and timezone.
 */
export const profileSchema = z.object({
  units: z
    .enum(["metric", "imperial"], {
      errorMap: () => ({ message: "Units must be either metric or imperial" }),
    })
    .default("metric"),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  timezone: z.string().min(1, "Timezone is required"),
  heightCm: z.coerce
    .number()
    .positive("Height must be positive")
    .max(300, "Height must be under 300 cm")
    .optional()
    .nullable(),
  startWeightKg: z.coerce
    .number()
    .positive("Start weight must be positive")
    .min(30, "Start weight must be at least 30 kg")
    .max(500, "Start weight must be under 500 kg"),
  finalGoalWeightKg: z.coerce
    .number()
    .positive("Goal weight must be positive")
    .min(30, "Goal weight must be at least 30 kg")
    .max(500, "Goal weight must be under 500 kg"),
  activePhaseId: z.string().optional().nullable(),
  maintenanceMode: z.boolean().default(false),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * Targets schema: validates nutrition, hydration, and activity goals.
 * Hard rule: Enforces minimum 1,200 kcal floor on both deficit and maintenance goals.
 */
export const targetsSchema = z
  .object({
    kcalDeficit: z.coerce
      .number({ invalid_type_error: "Calorie deficit goal must be a number" })
      .int("Calorie deficit goal must be an integer")
      .min(1200, "Calorie goal cannot be less than 1,200 kcal")
      .max(10000, "Calorie goal cannot exceed 10,000 kcal"),
    kcalMaintenance: z.coerce
      .number({ invalid_type_error: "Maintenance calorie goal must be a number" })
      .int("Maintenance calorie goal must be an integer")
      .min(1200, "Calorie goal cannot be less than 1,200 kcal")
      .max(10000, "Calorie goal cannot exceed 10,000 kcal"),
    proteinMinG: z.coerce
      .number()
      .int("Protein minimum must be an integer")
      .positive("Protein minimum must be positive")
      .max(500, "Protein minimum cannot exceed 500 g"),
    proteinMaxG: z.coerce
      .number()
      .int("Protein maximum must be an integer")
      .positive("Protein maximum must be positive")
      .max(500, "Protein maximum cannot exceed 500 g"),
    fatPct: z.coerce
      .number()
      .min(0.1, "Fat percentage must be at least 10% (0.10)")
      .max(0.6, "Fat percentage cannot exceed 60% (0.60)"),
    waterMl: z.coerce
      .number()
      .int("Water goal must be an integer")
      .min(500, "Water goal must be at least 500 ml")
      .max(10000, "Water goal cannot exceed 10,000 ml"),
    stepsMin: z.coerce
      .number()
      .int("Minimum steps must be an integer")
      .min(0, "Minimum steps cannot be negative")
      .max(100000, "Minimum steps cannot exceed 100,000"),
    stepsMax: z.coerce
      .number()
      .int("Maximum steps must be an integer")
      .positive("Maximum steps must be positive")
      .max(100000, "Maximum steps cannot exceed 100,000"),
  })
  .refine((data) => data.proteinMinG <= data.proteinMaxG, {
    message: "Protein minimum cannot exceed protein maximum",
    path: ["proteinMinG"],
  })
  .refine((data) => data.stepsMin <= data.stepsMax, {
    message: "Minimum steps cannot exceed maximum steps",
    path: ["stepsMin"],
  });

export type TargetsFormValues = z.infer<typeof targetsSchema>;


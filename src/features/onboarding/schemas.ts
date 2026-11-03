import { z } from "zod";

export const onboardingInputSchema = z.object({
  units: z.enum(["metric", "imperial"]).default("metric"),
  timezone: z.string().min(1, "Timezone is required"),
  height: z.coerce
    .number()
    .positive("Height must be a positive number")
    .optional()
    .nullable(),
  startWeight: z.coerce
    .number()
    .positive("Start weight must be a positive number")
    .min(20, "Start weight must be at least 20")
    .max(1000, "Start weight must be under 1,000"),
  finalGoalWeight: z.coerce
    .number()
    .positive("Goal weight must be a positive number")
    .min(20, "Goal weight must be at least 20")
    .max(1000, "Goal weight must be under 1,000"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;


import {
  pgTable,
  text,
  timestamp,
  date,
  integer,
  numeric,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * 1. Profile: Core user settings, body baseline, and active state
 */
export const profile = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  units: text("units").notNull().default("metric"), // 'metric' | 'imperial'
  theme: text("theme").notNull().default("system"), // 'light' | 'dark' | 'system'
  timezone: text("timezone").notNull().default("UTC"),
  heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
  startWeightKg: numeric("start_weight_kg", { precision: 5, scale: 2 }).notNull(),
  finalGoalWeightKg: numeric("final_goal_weight_kg", { precision: 5, scale: 2 }).notNull(),
  activePhaseId: text("active_phase_id"),
  lastDeficitPhaseId: text("last_deficit_phase_id").references(() => phases.id, { onDelete: "set null" }),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 2. Targets: User nutritional, hydration, and step goals
 */
export const targets = pgTable("targets", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  kcalDeficit: integer("kcal_deficit").notNull(),
  kcalMaintenance: integer("kcal_maintenance").notNull(),
  proteinMinG: integer("protein_min_g").notNull(),
  proteinMaxG: integer("protein_max_g").notNull(),
  fatPct: numeric("fat_pct", { precision: 4, scale: 2 }).notNull(), // e.g. 0.30
  waterMl: integer("water_ml").notNull(),
  stepsMin: integer("steps_min").notNull(),
  stepsMax: integer("steps_max").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 3. Phases: Milestone weight loss stages & ongoing maintenance
 */
export const phases = pgTable(
  "phases",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    mode: text("mode").notNull(), // 'deficit' | 'maintenance'
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    startWeightKg: numeric("start_weight_kg", { precision: 5, scale: 2 }).notNull(),
    goalWeightKg: numeric("goal_weight_kg", { precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("phases_user_id_idx").on(table.userId),
  ]
);

/**
 * 4. Weight Entries: One entry per day tracking scale weight
 */
export const weightEntries = pgTable(
  "weight_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("weight_entries_user_date_idx").on(table.userId, table.date),
    index("weight_entries_user_date_lookup_idx").on(table.userId, table.date),
  ]
);

/**
 * 5. Meals: Food log entries by meal slot
 */
export const meals = pgTable(
  "meals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    slot: text("slot").notNull(), // 'breakfast' | 'lunch' | 'dinner' | 'snack'
    foodName: text("food_name").notNull(),
    source: text("source").notNull(), // 'usda' | 'openfoodfacts' | 'custom' | 'manual'
    servings: numeric("servings", { precision: 6, scale: 2 }).notNull().default("1"),
    kcal: integer("kcal").notNull(),
    proteinG: numeric("protein_g", { precision: 6, scale: 2 }).notNull(),
    carbsG: numeric("carbs_g", { precision: 6, scale: 2 }).notNull(),
    fatG: numeric("fat_g", { precision: 6, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("meals_user_date_idx").on(table.userId, table.date),
  ]
);

/**
 * 6. Custom Foods: User-saved nutritional items
 */
export const customFoods = pgTable(
  "custom_foods",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kcalPer100g: integer("kcal_per_100g").notNull(),
    proteinPer100g: numeric("protein_per_100g", { precision: 6, scale: 2 }).notNull(),
    carbsPer100g: numeric("carbs_per_100g", { precision: 6, scale: 2 }).notNull(),
    fatPer100g: numeric("fat_per_100g", { precision: 6, scale: 2 }).notNull(),
    servingG: numeric("serving_g", { precision: 6, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("custom_foods_user_idx").on(table.userId),
  ]
);

/**
 * 7. Water Entries: Individual hydration tap logs
 */
export const waterEntries = pgTable(
  "water_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    ml: integer("ml").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("water_entries_user_date_idx").on(table.userId, table.date),
  ]
);

/**
 * 8. Step Entries: Daily step counts (one per day)
 */
export const stepEntries = pgTable(
  "step_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    steps: integer("steps").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("step_entries_user_date_idx").on(table.userId, table.date),
    index("step_entries_user_date_lookup_idx").on(table.userId, table.date),
  ]
);

/**
 * 9. Workout Plan: Weekly scheduled training sessions (one per weekday)
 */
export const workoutPlan = pgTable(
  "workout_plan",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    weekday: text("weekday").notNull(), // 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
    sessionType: text("session_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("workout_plan_user_weekday_idx").on(table.userId, table.weekday),
    index("workout_plan_user_idx").on(table.userId),
  ]
);

/**
 * 10. Workouts: Logged exercise sessions
 */
export const workouts = pgTable(
  "workouts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    type: text("type").notNull(),
    durationMin: integer("duration_min").notNull(),
    intensity: text("intensity").notNull(), // 'low' | 'moderate' | 'high'
    kcal: integer("kcal").notNull(),
    source: text("source").notNull(), // 'plan' | 'manual'
    completed: boolean("completed").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("workouts_user_date_idx").on(table.userId, table.date),
  ]
);

/**
 * 11. Measurements: Tape measurements (waist, hip, chest - one per day)
 */
export const measurements = pgTable(
  "measurements",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    waistCm: numeric("waist_cm", { precision: 5, scale: 2 }),
    hipCm: numeric("hip_cm", { precision: 5, scale: 2 }),
    chestCm: numeric("chest_cm", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("measurements_user_date_idx").on(table.userId, table.date),
    index("measurements_user_date_lookup_idx").on(table.userId, table.date),
  ]
);

/**
 * 12. Photos: Progress photos
 */
export const photos = pgTable(
  "photos",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    storageKey: text("storage_key").notNull(),
    thumbKey: text("thumb_key"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("photos_user_date_idx").on(table.userId, table.date),
  ]
);


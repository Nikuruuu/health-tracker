CREATE TABLE "custom_foods" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"kcal_per_100g" integer NOT NULL,
	"protein_per_100g" numeric(6, 2) NOT NULL,
	"carbs_per_100g" numeric(6, 2) NOT NULL,
	"fat_per_100g" numeric(6, 2) NOT NULL,
	"serving_g" numeric(6, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"slot" text NOT NULL,
	"food_name" text NOT NULL,
	"source" text NOT NULL,
	"servings" numeric(6, 2) DEFAULT '1' NOT NULL,
	"kcal" integer NOT NULL,
	"protein_g" numeric(6, 2) NOT NULL,
	"carbs_g" numeric(6, 2) NOT NULL,
	"fat_g" numeric(6, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"waist_cm" numeric(5, 2),
	"hip_cm" numeric(5, 2),
	"chest_cm" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"mode" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_weight_kg" numeric(5, 2) NOT NULL,
	"goal_weight_kg" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"storage_key" text NOT NULL,
	"thumb_key" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"units" text DEFAULT 'metric' NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"height_cm" numeric(5, 2),
	"start_weight_kg" numeric(5, 2) NOT NULL,
	"final_goal_weight_kg" numeric(5, 2) NOT NULL,
	"active_phase_id" text,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "step_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"steps" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "targets" (
	"user_id" text PRIMARY KEY NOT NULL,
	"kcal_deficit" integer NOT NULL,
	"kcal_maintenance" integer NOT NULL,
	"protein_min_g" integer NOT NULL,
	"protein_max_g" integer NOT NULL,
	"fat_pct" numeric(4, 2) NOT NULL,
	"water_ml" integer NOT NULL,
	"steps_min" integer NOT NULL,
	"steps_max" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "water_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"ml" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weight_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"weight_kg" numeric(5, 2) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"weekday" text NOT NULL,
	"session_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"type" text NOT NULL,
	"duration_min" integer NOT NULL,
	"intensity" text NOT NULL,
	"kcal" integer NOT NULL,
	"source" text NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_foods" ADD CONSTRAINT "custom_foods_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phases" ADD CONSTRAINT "phases_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "step_entries" ADD CONSTRAINT "step_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "targets" ADD CONSTRAINT "targets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_entries" ADD CONSTRAINT "water_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan" ADD CONSTRAINT "workout_plan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_foods_user_idx" ON "custom_foods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "meals_user_date_idx" ON "meals" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "measurements_user_date_idx" ON "measurements" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "measurements_user_date_lookup_idx" ON "measurements" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "phases_user_id_idx" ON "phases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "photos_user_date_idx" ON "photos" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "step_entries_user_date_idx" ON "step_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "step_entries_user_date_lookup_idx" ON "step_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "water_entries_user_date_idx" ON "water_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "weight_entries_user_date_idx" ON "weight_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "weight_entries_user_date_lookup_idx" ON "weight_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_plan_user_weekday_idx" ON "workout_plan" USING btree ("user_id","weekday");--> statement-breakpoint
CREATE INDEX "workout_plan_user_idx" ON "workout_plan" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workouts_user_date_idx" ON "workouts" USING btree ("user_id","date");
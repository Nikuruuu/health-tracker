# Section Requirements

Visual references in `docs/design/`: Dashboard.jpg (Overview), Nutrition.jpg, Exercise.jpg, Weight.jpg, settings.jpg (match the real filenames). Desktop light only; layout and style references with placeholder content. Mobile and dark layouts are derived. Behavior rules in this file and `docs/domain.md` win over the images.

All sections: `loading.tsx` and `error.tsx`, usable at 360px, tap targets ≥ 44px, theme tokens only, check light and dark. Add empty, loading and error states beyond what the images show. Numbers and thresholds: `docs/domain.md`.

## 🏠 Overview `/`
- KPI row: Starting Weight, Current Weight, Current Phase Milestone Goal, Total Weight Lost. Add a pace indicator (on track / behind with kg/week needed).
- Rings: Calories (limit: amber at 90%, red over), Protein (minimum), Water, Steps; a check when met.
- Quick-log: +500 ml with undo, "Log weight" in the header, add-meal, add-steps.
- Today's workout card: larger high-contrast Mark Complete toggle (shared with Exercise), a completed state, and a rest-day version.
- Heatmap: real calendar, 7 rows (Mon–Sun) × 12 weeks, 5 distinct levels, today outlined, tooltip "Mon 3 Nov: 4 of 5 goals met".
- Maintenance variant of the milestone card: target ±1.5 kg range, in range / above / below chip.
- Fetch aggregates in parallel; stream slow widgets. First-run empty states.

## 🥗 Nutrition `/nutrition`
- Banner: active mode's kcal goal only, calorie progress bar, remaining = upper limit − eaten, over-limit state, macro meters (distinct macro colors).
- Date switcher (today by default; copy-yesterday depends on it).
- Search by text or barcode (`@zxing/browser`; manual-entry fallback when camera permission is denied). Debounce 300 ms. Call Open Food Facts (optional USDA) from a server action or route. Normalize to one `FoodItem` type with Zod; mapper unit-tested with fixtures. States: loading, empty, error, results.
- Meals: Breakfast, Lunch, Dinner, Snacks. "+ Add" on every meal, edit servings, delete per item, quick-add and custom foods, copy yesterday. Meal and day totals computed from items.
- Hydration: 500 ml bottle clicker + undo + custom ml, goal-met state, allow over 3.0 L.

## 🏋️ Exercise `/exercise`
- Weekly plan: day tiles with icon AND short label, completed check, today distinct from selected.
- Details panel: movement list (highlight the current movement, expandable cues and an easier option), interval timer with Start, Pause, Reset, Skip, Work/Rest/Done states, sound/vibration toggle, `aria-live` announcements. Duration shown matches the timer.
- Mark Complete toggle (shared with Overview).
- Manual logger: type, date, duration, intensity, editable kcal estimate. List of logged activities with edit and delete.
- Steps: input sets today's total, +1,000 chips, 7-day chart with a target line, average of the last 7 full days.

## 📈 Weight & Body `/analytics`
- "Log weight" button and entries list with edit and delete (upsert per day; warn on > 2 kg change).
- KPI cards: Today, 7-day change, vs expected trend, BMI ("Add height" if missing).
- Chart: actual vs expected phase trend, today marker, tooltips, optional 7-day average, flat ±1.5 kg band in maintenance, ranges 30d / 90d / 6mo / all (filter in SQL), text/table alternative.
- Measurements (cm/in): last-measured date and trend per item; neutral color, no bar without a target.
- Progress photos: pick two dates and compare side by side, plus a gallery. Downscale on the client, authenticated upload with type and size checks, private storage, short-lived signed URLs.

## ⚙️ Settings `/settings`
- Phase cards: name, window, description, kcal, weight range, real dates, Completed / Current / Upcoming badge. Selecting a phase shows a confirm step with before and after (calories, trendline), then applies.
- Milestone goal weights editable per phase (validated per `docs/domain.md`).
- Maintenance mode toggle linked to Phase 4 (see Phase and maintenance linkage). Show its ON state: maintenance calories and a flat band preview. Suggestion banner within 1 kg of the goal.
- Targets: editable (deficit kcal, maintenance kcal, protein min/max, fat %, water, steps min/max). Inline errors; 1,200 kcal floor enforced in the schema and the action.
- Weekly workout schedule editor.
- Units (kg/cm or lb/in) and theme (reuse the existing theme toggle).
- Account section (password, export JSON, delete account with typed confirmation) comes in a later step.
- "Not medical advice" note.
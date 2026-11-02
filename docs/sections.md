# Section Requirements

Desktop: left sidebar. Mobile: bottom tab bar. Each section has `loading.tsx` and `error.tsx`. Usable at 360px, tap targets ≥ 44px, light/dark theme. Numbers and thresholds: see `docs/domain.md`.

## 🏠 Overview `/`
- KPI row: Starting Weight, Current Weight, Current Phase Milestone Goal, Total Weight Lost.
- Progress rings: Calories, Protein, Water, Steps.
- Today's scheduled exercise card with **Mark Complete** (shared state with Exercise).
- Compliance streak heatmap (~12 weeks, scrollable on mobile).
- Fetch aggregates in parallel in the Server Component; stream slow widgets with Suspense.
- First-run empty states with a clear next action.

## 🥗 Nutrition `/nutrition`
- Banner: mode-aware kcal goal and protein/carb/fat meters.
- Food search by text or barcode (`@zxing/browser`, manual-entry fallback). Debounce 300 ms. Call Open Food Facts (optional USDA) from a server action or route so keys stay private and results can be cached.
- Normalize API results to one `FoodItem` type with Zod. Mappers unit-tested with fixtures.
- Meals: Breakfast, Lunch, Dinner, Snacks. Edit servings, delete, copy yesterday. Custom foods and quick-add kcal.
- Hydration 500 ml bottle clicker up to 3.0 L, optimistic with undo.

## 🏋️ Exercise `/exercise`
- Interactive weekly plan. Tapping a day opens details: movement guide, interval timer, counter.
- Manual workout logger; daily step logger with weekly average.

## 📈 Analytics `/analytics`
- Line chart: actual morning weigh-ins vs expected phase trendline(s); ±1.5 kg band in maintenance. Optional 7-day moving average.
- Range filters 30d / 90d / 6mo / all-time. Filter in SQL.
- Measurements (waist, hip, chest; cm/in) and progress photo compare.
- Photos: downscale on the client, upload through an authenticated endpoint that validates type and size, store privately, serve via short-lived signed URLs.
- Chart needs a text/table alternative.

## ⚙️ Settings `/settings`
- Phase selector and recalibration (recomputes targets and trendlines going forward).
- Maintenance mode toggle.
- Units, targets, workout schedule editor, theme.
- Account: profile, change password, sign out, **export data (JSON)**, **delete account** (typed confirmation; cascades all data and photos).
- "Not medical advice" note.

## UX notes
- One accent color per metric, consistent across rings, charts and meters.
- Optimistic updates with undo toasts for quick actions. Logging should take ≤ 3 taps from Overview where feasible.
- Timer announces progress via `aria-live`.

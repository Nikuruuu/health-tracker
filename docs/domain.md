# Domain Rules

Defaults below are seeded from `src/domain/config.ts` at onboarding and editable in Settings. Don't hardcode them elsewhere.

## Weight
- Start 90.0 kg, final goal ~65.0 kg. Store kg; convert for display in `lib/units.ts`.
- Total lost = start − most recent entry.
- BMI needs height (optional at onboarding). Without height, show "Add height" instead of a number.

## Phases
| Phase | Window | Mode |
|---|---|---|
| 1 | Month 1 | Deficit |
| 2 | Months 2–4 | Deficit |
| 3 | Months 5–7 | Deficit |
| 4 | Ongoing | Maintenance |

- Each phase has a user-editable milestone goal weight. Seed an even path from start weight to final goal across phases 1–3, labelled "suggested". **Phase 3 ends exactly at the final goal weight (65.0).**
- Milestone validation: each deficit phase's goal is below the previous one and at or above the final goal.
- Phase changes are non-destructive: old logs resolve to the phase active on their date.
- Phase status (Completed / Current / Upcoming) comes from dates and the active phase, never stored separately.

## Phase and maintenance linkage
- Selecting Phase 4 turns maintenance mode ON.
- Turning maintenance ON selects Phase 4.
- Turning maintenance OFF returns to the last active deficit phase (store it as `lastDeficitPhaseId`).
- Both are reversible and never rewrite history.

## Calories & macros
- Deficit 1,450–1,500 kcal. Maintenance ~1,900 kcal. Show only the active mode's target, not both.
- Calories are a LIMIT. **Remaining = upper limit − eaten.** Over the upper limit shows an "over" state.
- Exercise burn does NOT add to the calorie goal.
- Protein 110–120 g (a minimum; "met" at ≥ lower bound).
- Fat 30% of kcal, carbs = remainder. 4/4/9 kcal per g.
- Floor: goal can never be < 1,200 kcal (Zod schema and Server Action).
- Totals are always computed from logged items. Never hardcode or display a total that doesn't match the items.

## Hydration & steps
- Water goal 3.0 L, input as 500 ml taps (6 = goal), undo and custom ml. Allow going over the goal.
- Steps 7,000–8,000/day. The step input **sets today's total** (like a phone pedometer), with +1,000 quick chips. Weekly average = last 7 full days.

## Weekly plan (editable)
Mon Low-Impact Cardio · Tue Low-Impact HIIT · Wed Active Recovery · Thu Low-Impact Cardio · Fri Low-Impact HIIT · Sat 60-min Brisk Walk · Sun Rest.

- Interval timer default 45 s work / 15 s rest. Rounds are configurable, and the session duration shown = rounds × (work + rest) (plus warm-up/cool-down if set). Never show a duration that contradicts the timer. Compute from timestamps so background tabs stay accurate.
- Calorie burn: one MET table in `config.ts` (activity type × intensity). The plan card and the manual logger use the same function, `kcal = MET × weightKg × hours`.
- Manual log: type, duration, intensity (low/moderate/high), date, kcal (estimate, editable).
- All movements low-impact by default; guides are data in `features/exercise/data/movements.ts`.

## Maintenance mode
- Suggest it when current weight is within 1 kg of the final goal.
- ON: calorie goal → maintenance; downward trendline → **flat** ±1.5 kg band centered on the final goal weight; milestone card shows in range / above / below.

## Streaks
- Compliant day = user-configurable checklist. Default: calories within goal, protein ≥ min, water ≥ goal, scheduled workout done (or rest day), steps ≥ lower target.
- Heatmap shows partial compliance as 5 intensity levels.
- `domain/streaks.ts` is pure and tested, including timezone and day-boundary cases.

## Safety flags (warn, don't silently accept)
Calorie goal < 1,200 · weight change > 2 kg in a day · extreme step/duration values.

## Design images (docs/design/)
The images are layout and style references with placeholder content. Ignore: the "Made with UX Pilot" footer, sample names and avatars, 2024 dates, "Day 62", and any sample numbers. Real values always come from the database and the rules above. Where an image and these docs disagree, the docs win.

## Colors
Each metric keeps one color everywhere: calories coral, protein green, water blue, steps amber. Carbs and fats get their own distinct colors (not coral or amber). Never use color alone to show state; pair it with an icon or label.

## Open questions (use defaults and note the assumption)
- Default units (kg/cm or lb/in)?
- Hosting (Vercel assumed) and Neon plan/branches?
- Social login: Google only, or also Apple/GitHub?
- Require email verification before first sign-in?
- Photo storage: Vercel Blob (default), R2, or S3?
- USDA API key available, or Open Food Facts only?
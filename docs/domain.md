# Domain Rules

Defaults below are seeded from `src/domain/config.ts` at onboarding and editable in Settings. Don't hardcode them elsewhere.

## Weight
- Start 90.0 kg, final goal ~65.0 kg. Store kg; convert for display in `lib/units.ts`.
- Total lost = start − most recent entry.

## Phases
| Phase | Window | Mode |
|---|---|---|
| 1 | Month 1 | Deficit |
| 2 | Months 2–4 | Deficit |
| 3 | Months 5–7 | Deficit |
| 4 | Ongoing | Maintenance |

- Each phase has a user-editable milestone goal weight. Seed an even path from start to final goal across phases 1–3, labelled "suggested".
- Phase changes are non-destructive: old logs resolve to the phase active on their date.

## Calories & macros
- Deficit 1,450–1,500 kcal. Maintenance ~1,900 kcal.
- Protein 110–120 g (range; "met" at ≥ lower bound).
- Fat 30% of kcal, carbs = remainder. 4/4/9 kcal per g.
- Floor: goal can never be < 1,200 kcal (Zod schema and Server Action).

## Hydration & steps
- Water goal 3.0 L, input as 500 ml taps (6 = goal), with undo and custom ml.
- Steps 7,000–8,000/day, show 7-day average.

## Weekly plan (editable)
Mon Low-Impact Cardio · Tue Low-Impact HIIT · Wed Active Recovery · Thu Low-Impact Cardio · Fri Low-Impact HIIT · Sat 60-min Brisk Walk · Sun Rest.

- Interval timer 45 s work / 15 s rest, with round counter. Compute from timestamps, not tick counting, so background tabs stay accurate.
- Manual log: type, duration, intensity (low/moderate/high), kcal (MET estimate from current weight, editable).
- All movements low-impact by default; guides are data in `features/exercise/data/movements.ts`.

## Maintenance mode
- Toggle in Settings; suggest it when current weight is within 1 kg of the final goal.
- ON: calorie goal → maintenance; downward trendline → flat ±1.5 kg band around maintenance weight; milestone card shows in range / above / below.
- Reversible; never rewrites history.

## Streaks
- Compliant day = user-configurable checklist. Default: calories within goal, protein ≥ min, water ≥ goal, scheduled workout done (or rest day), steps ≥ lower target.
- Heatmap shows partial compliance as intensity.
- `domain/streaks.ts` is pure and tested, including timezone and day-boundary cases.

## Safety flags (warn, don't silently accept)
Calorie goal < 1,200 · weight change > 2 kg in a day · extreme step/duration values.

## Open questions (ask owner; otherwise use defaults and note the assumption)
- Milestone goal weight per phase?
- Default units (kg/cm or lb/in)?
- Is maintenance weight the final goal or the weight reached at switch time?
- Hosting (Vercel assumed) and Neon plan/branches?
- Social login: Google only, or also Apple/GitHub?
- Require email verification before first sign-in?
- Photo storage: Vercel Blob (default), R2, or S3?
- USDA API key available, or Open Food Facts only?

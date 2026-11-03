# AGENTS.md

Mobile-first Health & Fitness Dashboard: multi-phase weight loss (90 → ~65 kg), then maintenance. Per-user accounts, synced across devices.

**Stack:** Next.js (App Router) · TypeScript strict · Better Auth · Neon Postgres · Drizzle ORM · Tailwind + shadcn/ui · Zod · TanStack Query · Recharts · Vitest + Playwright.
Don't swap or add dependencies without stating why.

## Commands
```
npm run dev | build | typecheck | lint | test | test:e2e
npx @better-auth/cli@latest generate   # regenerates src/db/schema/auth.ts
npx drizzle-kit generate && npx drizzle-kit migrate
```
A task is done only when `typecheck`, `lint`, `test`, `build` pass.

## Read on demand (don't load all of these every time)
- `docs/domain.md` — phases, calorie/macro/water/step numbers, workout plan, maintenance mode, streaks, open questions
- `docs/sections.md` — requirements for the 5 tabs (Overview, Nutrition, Exercise, Analytics, Settings)
- `docs/data-model.md` — tables and constraints
- `docs/auth.md` — Better Auth setup, flows, security

Numeric targets live in `src/domain/config.ts`. Read that file, not prose, for current values.

## Layout
```
src/app/(auth)/   public auth pages
src/app/(app)/    protected app: /, /nutrition, /exercise, /analytics, /settings
src/features/*/   components, actions.ts, queries.ts, schemas.ts (no cross-feature imports)
src/domain/       pure logic, no React/DB, unit-tested
src/db/           Drizzle + Neon client, schema/auth.ts (generated), schema/app.ts
src/lib/          auth.ts, auth-client.ts, session.ts, env.ts, units.ts
```

## Hard rules
1. Every Server Action, Route Handler and query calls `requireSession()` and scopes by the session `userId`. Never accept `userId` from the client. The proxy cookie check is not authorization.
2. Business logic (targets, trendlines, streaks, phases) goes in `src/domain/` as pure functions with tests. Components don't calculate.
3. Never hand-edit `src/db/schema/auth.ts` or applied migrations. Show generated SQL in your summary.
4. Validate all input with Zod on the server, including the 1,200 kcal minimum calorie goal.
5. Default to Server Components; `"use client"` only for interactivity. Add `import "server-only"` to files touching secrets or the DB.
6. Daily logs are keyed by the user's local date (`YYYY-MM-DD`) using their stored timezone, never server time.
7. Secrets only in env; never `NEXT_PUBLIC_` for secrets. Never run experiments against the production Neon branch.
8. No medical claims in UI copy. Settings shows a "not medical advice" note.
9. Version-sensitive APIs (Next.js `proxy.ts` on 16+ vs `middleware.ts` on ≤15, Better Auth, Drizzle, Neon): check current docs and installed version; don't guess.
10. UI: use shadcn/ui components (Button, Card, Input, Dialog, Tabs, etc.) from src/components/ui. Add missing ones with `npx shadcn@latest add <name>`; don't hand-write equivalents or add another UI library. Style with Tailwind and theme CSS variables only.
11. No hardcoded colors (hex, bg-white, text-gray-*, etc.) anywhere outside globals.css. Use theme tokens, and check every new screen in both light and dark mode.

## Workflow
Plan briefly before multi-file work. Build in this order:
1. Scaffold, env validation, Neon + Drizzle, `domain/config.ts`
2. Better Auth + sign-up/in/out + route gate + `requireSession()`
3. App schema, onboarding, Settings (targets, phases, maintenance)
4. Weight logging + Analytics
5. Nutrition → Exercise → Overview
6. Photos, export/delete account, PWA, a11y pass


## Agent discipline
- Do exactly what the prompt scopes. No extra features, refactors, renames or new dependencies.
- Before writing code, state the plan and list the files you'll touch. If a file isn't on the list, ask first.
- Never claim something works without running it. Report the actual output of typecheck, lint, test and build.
- If a check fails, fix the cause. Don't delete or weaken tests, add ts-ignore, or loosen types to get green.
- Don't edit src/db/schema/auth.ts, applied migrations, or .env* files.
- Stop and ask when the docs and the request conflict, or when something is ambiguous.

Keep changes scoped. For UI work, check mobile (~390px) and desktop widths. End each task with: what changed, files, migrations, tests, follow-ups, assumptions.

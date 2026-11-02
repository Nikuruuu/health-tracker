# Authentication (Better Auth + Neon)

## Setup
- `src/lib/auth.ts` (`import "server-only"`): `betterAuth` with `drizzleAdapter(db, { provider: "pg" })`.
- Enable email + password. Enable Google OAuth only when `GOOGLE_CLIENT_ID/SECRET` are set.
- `nextCookies()` must be the **last** plugin so Server Actions set cookies correctly.
- Handler: `src/app/api/auth/[...all]/route.ts` → `export const { GET, POST } = toNextJsHandler(auth)`.
- Client: `src/lib/auth-client.ts` uses `createAuthClient` from `better-auth/react`. Base path must match the server.
- Schema: `npx @better-auth/cli@latest generate` → `src/db/schema/auth.ts`, then `drizzle-kit generate && migrate`. Re-run whenever auth config or plugins change.
- Set `trustedOrigins` from env (local, preview, production). Enable session cookie caching; session expiry 7–30 days, rolling.
- Email (password reset, optional verification) via Resend. Verification required or not is a config flag.

## Flows
1. Sign up (name, email, password) → session → `/onboarding`.
2. Onboarding (once): units, height (optional), start weight (default 90.0), final goal (default 65.0), start date, timezone. Seeds `profile`, `targets`, `phases` from `domain/config.ts`. Sets `onboardedAt`.
3. Sign in → return to the originally requested page, else `/`.
4. Sign out from the user menu and Settings.
5. Forgot / reset password via emailed link.
6. Settings: change name, change password, export data, delete account.

## Route protection (defence in depth)
1. **Optimistic gate** at the edge: redirect signed-out users from protected paths and signed-in users from auth pages using a cookie-presence check. File is `proxy.ts` on Next.js 16+, `middleware.ts` on ≤15; check the installed version. Exclude `/api/auth`, `_next`, static assets.
2. **Authoritative check**: `(app)/layout.tsx` and every Server Action, Route Handler and query calls `requireSession()` (`auth.api.getSession({ headers: await headers() })`), redirecting or throwing when absent.
3. **Ownership**: every DB read/write is scoped by session `userId`.

## Security
- Use Better Auth's password hashing and security defaults. Don't disable CSRF/origin checks. Don't write custom crypto.
- Rate-limit auth endpoints.
- Server Actions: Zod validate → `requireSession()` → DB → `revalidatePath/Tag` → return `{ ok: true, data } | { ok: false, error }`.
- Generic sign-in errors (don't reveal whether an email exists).
- Never log passwords, tokens, session IDs or health values.
- Account deletion cascades all user rows and stored photos. Data export returns JSON.

## Auth UI
Single centered card, inline validation, `autocomplete` attributes, show/hide password, submit disabled while pending, links between sign-in and sign-up, a plain-language privacy note on sign-up.

## Tests
- Unauthenticated calls to actions and queries are rejected.
- User A cannot read or write user B's rows.
- E2E: sign up → onboarding → log data → sign out → protected route redirects to sign-in.
- DB tests use a dedicated Neon test branch.

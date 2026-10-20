# 0002. Stay on the Next.js App Router with typed routes (D1, D2)

Status: Accepted

## Context

The reference architecture uses TanStack Router and Vite. Content Master is already a Next.js App Router application, and migrating away from Next was explicitly out of scope.

## Decision

Keep the Next.js App Router (Turbopack) and turn on `typedRoutes`, so a link to a page that does not exist fails typecheck. Vite is used only as the test runner (Vitest).

## Consequences

- No second router; link safety comes from `typedRoutes`.
- The session lives only in the browser (see ADR 0004), so pages that need the user are client components under `(protected)` and check access with `RequireAuth`; server components cannot see the session.

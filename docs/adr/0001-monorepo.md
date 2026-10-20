# 0001. pnpm workspaces and Turborepo monorepo

Status: Accepted

## Context

The application started as two separate projects, a Next.js frontend and an Express backend, with duplicated request and response shapes and no shared tooling. Changes that touched both sides had to be coordinated by hand.

## Decision

One repository with pnpm workspaces: `apps/api`, `apps/web`, `e2e` and shared packages in `packages/*`. Turborepo runs `build`, `typecheck`, `lint`, `circular`, `test`, `test:integration` and `test:e2e`; every task depends on `^build`, so shared packages are built before their consumers. Internal packages are referenced as `workspace:*`, versions are exact (`save-exact`), and syncpack enforces both.

## Consequences

- A contract change and its consumers land in one commit and are type-checked together.
- Shared configuration lives in `@cm/config-ts` and `@cm/config-eslint`.
- knip, dependency-cruiser and syncpack guard unused code, import cycles and dependency drift.
- Packages that ship code must be built (`dist/`) before consumers can typecheck; turbo handles this, running `tsc` by hand does not.

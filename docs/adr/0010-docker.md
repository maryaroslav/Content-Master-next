# 0010. Docker images for web and API (D11)

Status: Accepted

## Context

A reproducible way to run the whole stack is needed for deployment and for newcomers. Docker cannot be installed on the development machine, so the images can only be built and tested in CI.

## Decision

One multi-stage Dockerfile per app (`apps/api/Dockerfile`, `apps/web/Dockerfile`), built from the repository root, plus `docker-compose.yml` with MySQL 8.4.

- The first stage runs `turbo prune --docker`; dependencies are installed from the pruned `package.json` files and lockfile before the sources are copied, so the install layer is cached until a dependency changes. `--ignore-scripts` skips the root `postinstall` (code generation needs the sources), `pnpm rebuild` then builds the native modules.
- The final images contain only what runs: for the API `pnpm deploy --prod` (compiled `dist/`, production dependencies, `@cm/contracts` copied in), for the web app the standalone Next.js server (`NEXT_OUTPUT=standalone`, set only in the Dockerfile because `next start` does not support standalone output). Both run as the `node` user on `node:24-bookworm-slim`.
- The API container applies pending migrations and then starts the server (one instance, so no separate migration job). `GET /health` is the container health check.
- One web image works in every environment: public configuration is served at runtime (`/env.js`) and the API is proxied at request time (ADR 0018).
- CI (`docker` job) builds both images with the GitHub Actions layer cache, starts them with compose and runs the Playwright suite against the containers (`E2E_EXTERNAL=1`).

## Consequences

- A broken Dockerfile shows up only in CI. The steps can be reproduced without Docker: `turbo prune`, the install, `pnpm deploy` and the standalone server all run locally.
- In CI the API container runs with `NODE_ENV=test`, because the suite signs in more often than the auth rate limit allows from one address; everything else is the production image.
- Publishing the images to a registry is not set up yet; it belongs to the deployment.

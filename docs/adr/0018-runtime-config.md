# 0018. Runtime configuration: /env.js and a request-time API proxy

Status: Accepted

## Context

One build of the web app should run in every environment. `NEXT_PUBLIC_*` variables and `rewrites()` in `next.config.ts` are fixed at build time; the latter was confirmed when `next start` with another `API_ORIGIN` still called the old address.

## Decision

Public values (`API_URL`, `APP_ENV`, `REALTIME_URL`) are served per request as `window.__ENV__` from `/env.js` and read with `publicEnv()`. `src/proxy.ts` (Next 16 proxy) forwards `/api/v1/*` and `/uploads/*` to `API_ORIGIN`, read with `serverEnv()` on every request.

## Consequences

- The same build serves development, end-to-end tests on other ports and production.
- Browser code never reads `process.env`.

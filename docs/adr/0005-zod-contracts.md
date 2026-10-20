# 0005. zod contracts as the single source of truth, OpenAPI generated from them (D7)

Status: Accepted

## Context

Request and response shapes were declared separately in the frontend and the backend and drifted apart.

## Decision

`@cm/contracts` holds zod schemas for every request, response and Socket.IO event. The endpoint catalog (`endpoints.ts`, one `defineEndpoint` per route) drives the API (`mount()` adds auth, upload and validation and checks responses against the schema outside production) and is turned into `dist/openapi.json` at build time.

## Consequences

- Changing a contract updates the API, the generated client and the web app in one typecheck.
- The OpenAPI document is a build artifact, not committed.
- New request/response schemas get a name with `.meta({ id })` so the generated client has named types.

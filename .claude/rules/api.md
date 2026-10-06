# API rules (apps/api, @cm/api)

## Config
- Import `env` from config/env.ts. Never read process.env directly.
- New env variable: add to the zod schema in config/env.ts AND to .env.example.

## Database
- Schema is owned only by umzug migrations in db/migrations/NNNN-name.ts.
  Never use sequelize.sync().
- A migration exports `up` and `down` typed as `Migration`, using queryInterface.
  `down` must really revert `up`.
- Never edit a migration that is already applied; add a new one.
- DB columns and model attributes are snake_case (user_id, created_at).

## Models
- Class in models/*.ts with static initModel(sequelize) and static associate(models);
  register it in models/index.ts.
- Model files import each other with `import type` only. Runtime cycles fail
  dependency-cruiser.

## Request handling
- v1 routes (modules/*/routes.ts) are registered only with
  mount(router, endpoint, handler) from modules/mount.ts, using the endpoint from
  the @cm/contracts catalog (endpoints.ts). mount adds requireAuth, the image upload
  and withValidation from the endpoint definition and sets the response status; the
  handler returns the response body, typed by the contract (Date is allowed where the
  contract has a date string). In development and tests mount also checks the actual
  response against the schema. Never call router.get/post/... directly for v1.
- Legacy routes (routes/*.ts, mounted under /api) use withValidation({ params?, query?,
  body? }, handler) with schemas from @cm/contracts/legacy and must keep their response
  shapes (see routes/legacyFormat.ts); they are removed in migration phase 5.
- No inline zod schemas, no manual req.body parsing.
- Errors: throw AppError(status, code, message, details?). Do not build error
  responses by hand, do not wrap handlers in try/catch (Express 5 forwards
  async throws).
- Response shape must match the contract type; change the contract first.

## Auth
- Protected v1 endpoints set `auth: true` in their definition (legacy routes add
  requireAuth themselves); get the user with currentUserId(req).
- Access and 2FA challenge tokens share a key and differ by the `type` claim:
  always check `type` when verifying.
- Refresh tokens: rotating, httpOnly cm_refresh cookie scoped to /api/auth,
  stored as SHA-256 hashes, family-wide revocation on reuse. Do not change
  this flow without an explicit plan step.
- TOTP secrets are stored only via auth/secretBox.ts. Never log or return
  tokens, secrets, or password hashes.

## Realtime
- Socket handlers live in sockets/handlers/ and are registered in
  sockets/index.ts. Sockets are authenticated by socketAuthMiddleware;
  never trust a user id sent by the client.

## Logging and style
- Use `logger` from lib/logger.ts or `req.log`. No console.*.
- 4-space indent, single quotes.

## Checklists

New endpoint (v1):
1. Schemas + types in @cm/contracts and a `defineEndpoint` entry in endpoints.ts;
   register new named response schemas in openapi/document.ts `components`.
   Then `pnpm --filter @cm/contracts build` (also regenerates dist/openapi.json).
2. `mount(router, endpoint, handler)` in the module's routes.ts.
3. Handler throws AppError for every failure path.
4. Integration test in test/integration/, asserting the response with the contract schema.
5. Run `pnpm --filter @cm/api typecheck lint circular test test:integration`.

New migration:
1. Next NNNN number, file in db/migrations/.
2. Write up and down; update the model to match.
3. Run db:migrate, then db:rollback, then db:migrate again to prove down works.
4. New migration files are knip entry points: check `pnpm knip`.

Contract change:
1. List every consumer in apps/api and apps/web before editing.
2. Rebuild contracts, then typecheck both apps.
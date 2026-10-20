# Contributing

The detailed rules for the API are in [.claude/rules/api.md](.claude/rules/api.md); the overview of the code is in [CLAUDE.md](CLAUDE.md). This page is the short path for the common changes.

## Adding an API endpoint

1. In `packages/contracts`, add the request and response schemas (name new object schemas with `.meta({ id: 'Name' })`) and a `defineEndpoint` entry in `src/endpoints.ts`. Run `pnpm --filter @cm/contracts build`; the OpenAPI document is regenerated.
2. In the module's `routes.ts` in `apps/api`, register it with `mount(router, endpoint, handler)`. `mount` adds authentication, uploads and validation from the definition; the handler returns the response body. Throw `AppError(status, code, message)` for every failure.
3. Add an integration test in `apps/api/test/integration/` and assert the response with the contract schema.
4. The web app gets the hook automatically: the `generate` turbo task runs orval, and `@cm/api-client` exports `use<Tag><Operation>` and, for tests, `get<Tag><Operation>MockHandler` from `@cm/api-client/mocks`.

Changing an existing contract: list its consumers in `apps/api` and `apps/web` first, then rebuild the contracts and typecheck both apps.

## Adding a Socket.IO event

1. Add it to the catalog in `packages/contracts/src/realtime.ts`: `clientEvents` (payload and ack schemas) or `serverEvents` (payload schema).
2. On the server, register client events with `on(socket, event, handler)` from `apps/api/src/sockets/on.ts`; it validates the payload and turns errors into the ack. Never trust a user id from the client: use `socket.data.userId`.
3. In the web app, send with `useRealtime().emit(name, payload)` (resolves with the ack) and listen with `useRealtimeEvent(name, handler)`.

## Changing the database

Add a migration `apps/api/src/db/migrations/NNNN-name.ts` with `up` and a `down` that really reverts it, and update the model. Run `db:migrate`, `db:rollback` and `db:migrate` again. Never edit a migration that has been applied.

## User-facing text

Every string goes to both `apps/web/messages/en.json` and `cs.json` under the same key; a key missing in `cs.json` fails typecheck, and text written directly in JSX fails lint. Show errors with `useErrorText`, dates with `useDateText`.

## Tests

- Pure logic in a package: a unit test next to it (`test/`).
- API behaviour: an integration test.
- A component or hook in the web app: `apps/web/test/`, with `renderWithProviders` and MSW handlers from `@cm/api-client/mocks` with fixed data. Requests without a handler fail the test.
- A user journey across pages or users: a Playwright test in `e2e/tests/`; create users with `createUser` from `e2e/support/api.ts`.

## Before you push

```sh
pnpm turbo run typecheck lint circular test --filter="...[HEAD]"
pnpm knip
```

Comments explain only a non-obvious why. Code style: 4-space indentation and single quotes in TypeScript, snake_case database columns, camelCase in the contracts.

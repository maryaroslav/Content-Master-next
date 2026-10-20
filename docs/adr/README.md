# Architecture decision records

Each record states the context, the decision and its consequences. D1–D12 refer to the decisions made when the migration was planned.

| # | Decision | Status |
|---|---|---|
| 0001 | [pnpm workspaces and Turborepo monorepo](0001-monorepo.md) | Accepted |
| 0002 | [Stay on the Next.js App Router with typed routes (D1, D2)](0002-nextjs-app-router.md) | Accepted |
| 0003 | [Own JWT authentication with an OIDC-compatible client interface (D4)](0003-own-jwt-auth.md) | Accepted |
| 0004 | [Access token in memory, refresh token in an httpOnly cookie with rotation (D5)](0004-token-storage.md) | Accepted |
| 0005 | [zod contracts as the single source of truth, OpenAPI generated from them (D7)](0005-zod-contracts.md) | Accepted |
| 0006 | [Generate the API client with orval (D6)](0006-orval-client.md) | Accepted |
| 0007 | [Keep Sequelize, typed models and umzug migrations (D8)](0007-sequelize-migrations.md) | Accepted |
| 0008 | [Keep Socket.IO for realtime (D9)](0008-socketio.md) | Accepted |
| 0009 | [Versioned API under /api/v1, migrated route by route (D10)](0009-api-v1.md) | Accepted, completed |
| 0010 | [Docker images for web and API (D11)](0010-docker.md) | Accepted |
| 0011 | [GitHub Actions for CI (D12)](0011-github-actions.md) | Accepted |
| 0012 | [next-intl with English and Czech, no locale in the URL (D12)](0012-i18n.md) | Accepted |
| 0013 | [Defer the UI library and styling decision (D3)](0013-ui-library-deferred.md) | Accepted |
| 0014 | [Chat attachments as their own table](0014-chat-attachments.md) | Accepted |
| 0015 | [Socket.IO acknowledgements instead of separate result events](0015-socket-acks.md) | Accepted |
| 0016 | [One app-wide socket in @cm/realtime, transport only](0016-realtime-package.md) | Accepted |
| 0017 | [React Compiler with react-hook-form 8](0017-react-compiler-rhf8.md) | Accepted |
| 0018 | [Runtime configuration: /env.js and a request-time API proxy](0018-runtime-config.md) | Accepted |
| 0019 | [Testing strategy](0019-testing-strategy.md) | Accepted |

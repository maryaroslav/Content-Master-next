# 🛠️ Technology Stack

**Frontend**:
- Next + TS (App Router)
- React
- TanStack Query + generated API client (orval)
- Redux
- CSS
- Git LFS

**Backend**:
- Express + TS
- MySQL
- JWT (auth)
- CORS
- Sequelize

**Infrastructure**:
- pnpm workspaces + Turborepo (monorepo)
- ESLint, knip, syncpack, dependency-cruiser, husky
- GitHub Actions
- .env.local(frontend)
- .env(backend)
- REST API

# 📁 Repository structure

```
apps/
  web/                Next.js frontend (@cm/web)
  api/                Express backend (@cm/api)
packages/
  config-ts/          shared tsconfig presets (@cm/config-ts)
  config-eslint/      shared ESLint configs (@cm/config-eslint)
```

# 🛠️ Installation and startup

Requirements: Node.js 24 (see `.nvmrc`), pnpm (the version is pinned in `package.json`, enable it with `corepack enable`), MySQL 8.

## Set dependencies:
```
pnpm install
```

## Customize the .env files:

**apps/api/.env**
```
cp apps/api/.env.example apps/api/.env
```
Fill in the database credentials and `JWT_SECRET` (at least 32 characters, e.g. `openssl rand -hex 32`).
The variables are validated on startup: the backend refuses to start and lists what is wrong.

**apps/web/.env.local**
```
cp apps/web/.env.example apps/web/.env.local
```
`API_ORIGIN` is where the Next server proxies `/api/v1/*` and `/uploads/*`. `API_URL` and `APP_ENV` reach the browser through `/env.js` at request time, so a built frontend picks up new values on restart without a rebuild.

## Start the project:
```
pnpm dev
```
Starts the frontend on http://localhost:3000 and the backend on http://localhost:5001.
Pending database migrations are applied automatically before the backend starts.

## Database migrations
The schema is managed by migrations in `apps/api/src/db/migrations` (run in file name order).
```
pnpm --filter @cm/api db:migrate    # apply pending migrations
pnpm --filter @cm/api db:rollback   # revert the last migration
pnpm --filter @cm/api db:status     # list pending migrations
```
The backend refuses to start while migrations are pending.

## Checks
```
pnpm typecheck        # TypeScript
pnpm lint             # ESLint
pnpm circular         # circular dependencies
pnpm knip             # unused files, exports and dependencies
pnpm syncpack:check   # dependency versions
pnpm build
```
The pre-commit hook runs these checks for the changed packages only.

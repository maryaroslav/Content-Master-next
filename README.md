# 🛠️ Technology Stack

**Frontend**:
- Next + TS (App Router)
- React
- NextAuth (JWT)
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
DB_NAME=
DB_USER=
DB_PASS=
DB_HOST=
JWT_SECRET=a-string-secret-at-least-256-bits-long
```
`JWT_SECRET` is required, the backend does not start without it.

**apps/web/.env.local**
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=a-string-secret-at-least-256-bits-long
```

## Start the project:
```
pnpm dev
```
Starts the frontend on http://localhost:3000 and the backend on http://localhost:5001.

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

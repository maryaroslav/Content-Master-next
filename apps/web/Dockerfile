# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f apps/web/Dockerfile .

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM base AS prune
WORKDIR /repo
COPY . .
RUN pnpm dlx turbo@$(node -p "require('./package.json').devDependencies.turbo") prune @cm/web --docker

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT=standalone
WORKDIR /repo
# Dependencies first, so this layer is rebuilt only when a package.json or the lockfile changes.
COPY --from=prune /repo/out/json/ .
# --ignore-scripts skips the root postinstall (code generation needs the sources); native modules are built by rebuild.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts && pnpm rebuild --recursive --filter='!content-master'
COPY --from=prune /repo/out/full/ .
RUN pnpm turbo run build --filter=@cm/web

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

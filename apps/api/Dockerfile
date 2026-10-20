# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f apps/api/Dockerfile .

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM base AS prune
WORKDIR /repo
COPY . .
RUN pnpm dlx turbo@$(node -p "require('./package.json').devDependencies.turbo") prune @cm/api --docker

FROM base AS build
# Fallback for bcrypt when its prebuilt binary cannot be downloaded.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
# Dependencies first, so this layer is rebuilt only when a package.json or the lockfile changes.
COPY --from=prune /repo/out/json/ .
# --ignore-scripts skips the root postinstall (code generation needs the sources); native modules are built by rebuild.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts && pnpm rebuild --recursive --filter='!content-master'
COPY --from=prune /repo/out/full/ .
RUN pnpm turbo run build --filter=@cm/api
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @cm/api --prod --config.inject-workspace-packages=true deploy /prod/api

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=5001
ENV UPLOAD_DIR=/data/uploads
WORKDIR /app
COPY --from=build --chown=node:node /prod/api ./
RUN mkdir -p /data/uploads && chown node:node /data/uploads
USER node
EXPOSE 5001
CMD ["sh", "-c", "node dist/db/cli.js up && exec node dist/server.js"]

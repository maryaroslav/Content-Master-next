# 0010. Docker images for web and API (D11)

Status: Accepted, not implemented yet

## Context

A reproducible way to run the whole stack is needed for deployment and for newcomers.

## Decision

Multi-stage images for `web` and `api` plus `docker-compose` with MySQL. One web image must work in every environment, which is why public configuration is served at runtime (`/env.js`) and the API is proxied at request time (ADR 0018).

## Consequences

- There is no local Docker; images can only be built in CI.
- Implementation is pending (plan step 1.7).

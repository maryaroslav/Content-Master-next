# 0011. GitHub Actions for CI (D12)

Status: Accepted

## Context

Checks ran only on developer machines.

## Decision

GitHub Actions on every pull request and on `main`. The `verify` job runs typecheck, lint, circular, unit tests and build for affected packages, then integration tests against a `mysql:8.4` service, knip and syncpack. A parallel `e2e` job runs the Playwright suite against built apps. A husky pre-commit hook runs the fast checks locally.

## Consequences

- Secrets used in CI are throwaway values defined in the workflow.
- The Playwright report is uploaded when the e2e job fails.

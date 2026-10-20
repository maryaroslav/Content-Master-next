# 0017. React Compiler with react-hook-form 8

Status: Accepted

## Context

React Compiler 1.0 is stable in Next 16. Under the compiler, react-hook-form 7 kept stale form state (`reset()` did not clear the post input), confirmed by opting the component out with `'use no memo'`.

## Decision

Enable `reactCompiler` and move `@cm/forms` to react-hook-form 8 (beta), which supports the compiler. `@hookform/resolvers` still declares v7 as its peer; this is allowed explicitly in `pnpm-workspace.yaml`. Web component tests run through the same compiler, and the post form test fails on react-hook-form 7.

## Consequences

- Builds are about 1–2 s slower.
- When react-hook-form 8 and resolvers with a v8 peer are released, drop the `peerDependencyRules` entry.

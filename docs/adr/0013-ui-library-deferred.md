# 0013. Defer the UI library and styling decision (D3)

Status: Accepted

## Context

The reference uses Styletron and a shared UI package. Content Master has no design system yet, and Styletron with the App Router would need its own spike.

## Decision

Migrate the architecture first with the existing CSS (selectors scoped to their components). The UI library and the styling approach are phase 10.

## Consequences

- No `@cm/ui` package for now.
- Known accessibility gaps (for example `Field` labels that are not `<label>`) are collected for phase 10.

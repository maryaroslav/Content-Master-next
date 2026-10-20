# 0007. Keep Sequelize, typed models and umzug migrations (D8)

Status: Accepted

## Context

The backend used Sequelize with `sync()`, so the schema was whatever the models said at startup. Replacing the ORM was not a goal of the migration.

## Decision

Keep Sequelize with typed models (`InferAttributes`). The schema is owned only by umzug migrations (`db/migrations/NNNN-name.ts`) with a real `down`; `sync()` is never used. The dev server runs pending migrations first, and integration tests migrate a throwaway database.

## Consequences

- Schema changes are reviewed and reversible.
- Applied migrations are never edited; a change is a new migration.
- Data moves (image keys, attachments) happen inside migrations, both ways.

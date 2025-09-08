# SQL Migrations

Place your SQL migration files in this directory with the naming convention:
- `XXX_description.sql` (e.g., `001_initial_schema.sql`, `002_add_users_table.sql`)

## Migration File Structure

Each migration should be idempotent (safe to run multiple times) using:
- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`

## Rollback Files

For migrations that need rollback support, create a corresponding file in `rollbacks/`:
- `rollbacks/XXX_description.down.sql`

## Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Rollback a specific migration
npm run db:migrate rollback XXX_description
```
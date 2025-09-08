# Phase 2: Architecture Consolidation (Items 1, 2, 6, 7, 8)

Date: 2025-09-04
Owner: Platform/Architecture

## Goals
- Remove ambiguity from dual build systems (Vite vs Next.js).
- Establish a single source of truth for all database access.
- Complete the Next.js migration surface with a health check endpoint.
- Document ORM strategy and migration flow going forward.
- Implement and document a Neon connection pooling/concurrency strategy suitable for serverless.

---

## Item 1 — Clean up dual build systems

Decision: Standardize on Next.js scripts for dev/build/start. The `|| true` fallback was removed from the build script so CI fails on real build errors.

Current scripts of interest (package.json):
- dev: `next dev` (authoritative)
- build: `next build` (authoritative)
- start: `next start`
- Note: No legacy Vite scripts remain (dev:vite, preview, dev:legacy were removed in prior cleanup). No vite.config.ts in repo.

Guidance:
- Use `npm run dev` for development.
- If you still rely on a Vite preview workflow locally, open an issue; otherwise, consider any remaining Vite references in docs as legacy and ignore.

---

## Item 2 — Single Source of Truth (SSOT) for Database

Decision: Introduce a canonical Neon client used by all server-side code: `lib/db.js`.

Implementation:
- File: `lib/db.js`
- Exports: `sql` (shared Neon tagged template), `getSql()`, and `transaction(fn)`
- Ensures a singleton via `globalThis` for dev hot-reload safety.
- Configures Neon concurrency via `neonConfig.poolQueryLimit`.

Usage examples:
```ts
import { sql, transaction } from '@/lib/db';

// Simple query
const rows = await sql`SELECT * FROM clients LIMIT 10`;

// Transaction
await transaction(async (db) => {
  await db`BEGIN`;
  await db`UPDATE projects SET updated_at = NOW()`;
  // ...
});
```

Legacy server alignment:
- `server.mjs` updated to `import { getSql } from './lib/db.js'` and to use `const sql = getSql();` instead of creating its own client.

Client-side rule:
- Never access Neon from the browser. All DB access goes through API routes or server actions.

Environment:
- `DATABASE_URL` (required)
- `NEON_POOL_QUERY_LIMIT` (optional; default 10)

---

## Item 6 — ORM Strategy (Drizzle vs Prisma)

Decision: Standardize on Drizzle ORM.
- Rationale: Current codebase and migration scripts favor Drizzle; smaller footprint; good fit for SQL-first approach and serverless.
- Action: Keep Prisma packages for one more release to avoid breakage; plan removal in a follow-up cleanup PR after verifying no Prisma code paths are in use.

Planned follow-ups:
- Remove `prisma` and `@prisma/client` from devDependencies/dependencies.
- Remove stale Prisma schema/migrations if present.
- Add ADR-0001 documenting this decision and rollback plan.

---

## Item 7 — Unified Database Migration Flow (Drizzle)

Decision: Use existing Drizzle and Neon setup scripts as the single migration flow.
- Commands in package.json:
  - `db:setup`, `db:seed`, `db:validate`, `db:create-all`
  - `db:test:*` suites validate structure and connectivity

Guidance:
- CI should run `npm run db:validate` and basic connectivity smoke tests.
- All schema changes land via Drizzle migrations; no ad-hoc SQL against production.

---

## Item 8 — Next.js Health Endpoint

Decision: Provide a Next.js API route to report service and DB health.

Implementation:
- File: `app/api/health/route.ts`
- Behavior: Executes `SELECT NOW()` via the unified Neon client, returns a structured envelope.
- Response shape:
```json
{
  "success": true,
  "data": { "status": "healthy", "database": "connected", "timestamp": "2025-09-04T09:32:00.000Z" }
}
```
- On failure: HTTP 503 with `{ success: false, error: { code, message } }`.

---

## Neon Connection Pooling / Concurrency Strategy

Neon serverless driver uses HTTP connections. Traditional connection pooling is replaced by concurrency limiting and request-level reuse.

Configuration:
- `neonConfig.poolQueryLimit` set from `NEON_POOL_QUERY_LIMIT` env (default 10 in `lib/db.js`).
- For bursty workloads on Vercel/Node, recommended values: 5–20 depending on route QPS and p95 latency.
- API routes should default to Node runtime (`export const runtime = 'nodejs'`) when using the serverless driver.

Operational guidance:
- Monitor error rates and p95 latency; adjust `NEON_POOL_QUERY_LIMIT` conservatively.
- Prefer fewer, batched queries per request; wrap multi-statement operations in `transaction()`.

---

## Rollout Plan and Backward Compatibility
- Legacy Express server remains for local dev only; it now uses the same `lib/db.js` client. Consider gating startup behind `LEGACY_API_ENABLED=true` in a later change.
- Vite scripts remain but are deprecated; remove after a two-week deprecation window if unused.

---

## Checklist (Phase 2)
- [x] Single DB client (`lib/db.js`) with concurrency config
- [x] Health route (`app/api/health/route.ts`)
- [x] `next build` enforced without `|| true`
- [ ] Remove Prisma in follow-up PR after audit
- [ ] Remove Vite and legacy scripts after deprecation window
- [ ] Add ADR-0001: Drizzle over Prisma
- [ ] Add CI step for `db:validate` + connectivity smoke test

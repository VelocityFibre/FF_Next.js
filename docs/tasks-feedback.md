# Tasks Feedback and Implementation Guide

Purpose: Provide specific, discussion-ready guidance for each task in docs/tasks.md.
Legend: Effort — S (≤0.5d), M (1–2d), L (3d+). Risks list likely blockers.

---

1) Consolidate build tooling (Next.js only) — Effort: M
- Context: Dual scripts exist (Next + Vite). Next.js is authoritative per MIGRATION_STATUS.md.
- Current: package.json includes dev:vite, preview, dev:legacy; Next scripts are primary. build was fixed to “next build”.
- Do next: Audit usage of Vite scripts; if unused for 2 weeks, remove vite, vite preview, and legacy scripts. Update docs/INDEX.md and remove vite-specific docs.
- Risks: Hidden dev workflows relying on vite preview; ensure no vite-only plugins.

2) Decommission/gate legacy Express server — Effort: M
- Context: server.mjs exists for legacy/local use.
- Current: server.mjs uses unified lib/db.js; not fully gated by env in scripts.
- Do next: Gate startup via USE_LEGACY_SERVER=true and document. Ensure all endpoints have Next.js equivalents; if not, port remaining.
- Risks: Overlooked endpoints; double CORS/port conflicts in dev.

3) Replace development auth bypass in middleware — Effort: M
- Context: Ensure Clerk/middleware is enforced except when explicitly disabled in dev.
- Current: middleware.ts.disabled suggests prior auth bypass patterns.
- Do next: Re-enable middleware.ts with env gates (e.g., AUTH_BYPASS=true in dev only). Add unit tests around headers and route matching.
- Risks: Locking out devs locally; coordinate .env.local values.

4) Provide complete .env.example — Effort: S
- Context: Reduce setup friction and prevent secrets leakage.
- Current: No .env.example found at root; many scripts reference DATABASE_URL, NEON_POOL_QUERY_LIMIT.
- Do next: Add .env.example with DATABASE_URL, NEON_POOL_QUERY_LIMIT, NEXT_PUBLIC_* vars, USE_LEGACY_SERVER, feature flags. Reference in README/docs/INDEX.md.
- Risks: Accidentally committing real secrets; use placeholders.

5) Align documentation to current architecture — Effort: S
- Context: Docs still mention dual architectures and React Router in places.
- Current: INDEX.md largely updated; phase-2 doc added.
- Do next: Remove outdated references to Vite/React Router where not marked as legacy. Ensure single-arch narrative.
- Risks: Doc sprawl; keep changes incremental.

6) Decide and document ORM strategy (Drizzle vs Prisma) — Effort: M
- Context: Both dependencies present; Phase 2 decides Drizzle.
- Current: prisma packages in devDependencies, drizzle used in scripts.
- Do next: Confirm no Prisma runtime usage via depcheck/grep. Draft ADR-0001 documenting Drizzle choice and rollback.
- Risks: Hidden Prisma schema or generator usage; perform repo-wide search.

7) Unified database migration flow (Drizzle) — Effort: M
- Context: Ensure single path for schema changes.
- Current: package scripts: db:setup/seed/validate/test; scripts directory populated.
- Do next: Document runbooks in docs/data/01-database-models.md; add CI job to run db:validate and schema tests against Neon branch.
- Risks: CI lacks DB access; use ephemeral branch or Dockerized Postgres for schema checks.

8) Next.js API health endpoint — Effort: S
- Current: Implemented at app/api/health/route.ts using lib/db.js; runtime nodejs.
- Do next: Add a simple Playwright/axios test; expose /api/health in ops docs with expected JSON shape.
- Risks: None.

9) Standardize API error format — Effort: M
- Context: Consistent envelopes aid client UX.
- Current: Health route returns { success, data | error }; legacy server varied.
- Do next: Create a small helper (e.g., lib/apiResponse.ts) and use across API routes; define error codes catalog.
- Risks: Touches many routes; stage refactor by feature.

10) Structured logging server-side — Effort: M
- Context: Improve debuggability in prod.
- Current: console.log in server.mjs; no server API logger found.
- Do next: Add pino or consola wrapper with env LOG_LEVEL and redaction list; integrate in API handlers and scripts.
- Risks: Over-logging PII; implement redaction early.

11) Client-side error boundaries — Effort: S
- Context: Provide graceful fallbacks.
- Current: Not verified; Next.js supports error.tsx per route.
- Do next: Add app/error.tsx and feature-level error boundaries; log to telemetry.
- Risks: None.

12) Tighten TypeScript config — Effort: M
- Context: Increase correctness.
- Current: strict: true already; could enable noUncheckedIndexedAccess and exactOptionalPropertyTypes.
- Do next: Incrementally enable flags; fix surfaced issues; add type-check script in CI. Note: npm run type-check previously failed locally due to tsc not found in path; ensure it runs via npm scripts using devDependency typescript.
- Risks: Surfacing many errors; proceed module-by-module.

13) Request/response validation with Zod — Effort: M
- Context: Validate inputs/outputs.
- Current: zod dependency exists; not uniformly used in API routes.
- Do next: Introduce shared schemas folder; wrap route handlers with parse/validate; infer types to clients.
- Risks: Refactor effort across numerous routes.

14) Audit Zustand stores — Effort: M
- Context: Prevent unnecessary re-renders and implicit any state.
- Current: zustand dependency present.
- Do next: Ensure each store exports typed selectors; add unit tests for store actions; avoid exposing whole state to components.
- Risks: Subtle behavior changes in components relying on whole-state subscriptions.

15) React Query tuning — Effort: S
- Context: Better caching defaults.
- Current: @tanstack/react-query present.
- Do next: Create a QueryClient with sane defaults (staleTime, retry). Add a queryKeys module and prefetch in app/layout.tsx where valuable.
- Risks: Stale caches if too aggressive; coordinate with mutation flows.

16) Performance analysis tooling — Effort: S
- Context: Replace vite analyzers.
- Current: Next build supports analyzer via ANALYZE=true.
- Do next: Add @next/bundle-analyzer and doc usage; annotate heavy imports with dynamic(() => import(...)).
- Risks: None.

17) Optimize assets/images — Effort: S
- Context: Ensure next/image adoption.
- Current: Not audited.
- Do next: Replace <img> with next/image where applicable; set sizes/priority; compress large public/ assets.
- Risks: Layout shifts if not sized correctly.

18) Accessibility automation — Effort: M
- Context: Accessibility quality gates.
- Current: jest-axe is a devDependency; playwright present.
- Do next: Add a11y tests in unit and E2E; fix top violations (labels, headings, focus order).
- Risks: Test brittleness due to dynamic content.

19) Security headers — Effort: S
- Context: Improve baseline security.
- Current: No next-safe middleware configured.
- Do next: Add next-safe/middleware or custom headers in next.config.mjs; craft CSP suited to Next+images; test in staging.
- Risks: CSP breakage; start in report-only.

20) Rate limiting for API routes — Effort: S/M
- Context: Limit abuse.
- Current: No limiter found.
- Do next: Add Upstash Ratelimit or simple in-memory for dev; apply to sensitive endpoints.
- Risks: Stateless environments; choose provider accordingly.

21) CORS review — Effort: S
- Context: Align with Next single-origin.
- Current: cors used in legacy express; not needed for Next same-origin.
- Do next: Remove permissive CORS when decommissioning express; ensure Next routes don’t add CORS except where required.
- Risks: Breaking external integrations; audit consumers.

22) Secrets hygiene — Effort: S
- Context: Prevent leakage.
- Current: test-db-connection.js hardcodes a Neon connection string — high risk.
- Do next: Remove hardcoded secrets and read from env; add gitleaks to CI.
- Risks: Existing leaked key requires rotation.

23) CI pipeline — Effort: M
- Context: Automate quality gates.
- Current: Not present in repo (no .github/workflows).
- Do next: Add workflows for lint, type-check, unit, integration, e2e (with caching). Upload Playwright traces on failure.
- Risks: Flaky tests; quarantine and retry policy.

24) DB validation in CI — Effort: M
- Context: Catch schema drift.
- Current: Scripts exist: db:validate, db:test:suite.
- Do next: Run against Neon branch or local Postgres in CI; store connection via secrets.
- Risks: Cost/limits on Neon branches.

25) Deployment previews — Effort: S
- Context: Vercel previews with envs.
- Current: vercel.json present.
- Do next: Ensure Vercel project configured; add robots/basicauth for previews; document workflow.
- Risks: Exposing preview to search engines.

26) Documentation refresh — Effort: S
- Context: Keep truth aligned.
- Current: MIGRATION_STATUS.md shows complete; links to phase 2 doc.
- Do next: Remove TODO marker; add migration guide if still referenced.
- Risks: None.

27) ADRs — Effort: S
- Context: Institutionalize decisions.
- Current: No adr/ folder.
- Do next: Add docs/adrs/ and ADR-0001 for Drizzle decision; add template.
- Risks: None.

28) CODEOWNERS — Effort: S
- Context: Enforce reviews.
- Current: None.
- Do next: Add .github/CODEOWNERS mapping areas to owners.
- Risks: Slower merges; align with team availability.

29) CONTRIBUTING.md and PR template — Effort: S
- Context: Developer onboarding/quality.
- Current: Not present.
- Do next: Add CONTRIBUTING.md and .github/pull_request_template.md with checks.
- Risks: None.

30) ESLint policy hardening — Effort: M
- Context: Consistency and safety.
- Current: eslint deps present; config likely basic.
- Do next: Adopt eslint-config-next, add rules (import/order, no-explicit-any). Fix violations incrementally.
- Risks: Wide set of fixes; stage per folder.

31) Prettier consistency — Effort: S
- Context: Formatting across repo.
- Current: format scripts only target src/*; docs may be excluded.
- Do next: Extend to docs and configs; add format:check in CI.
- Risks: Large diff initially.

32) Enforce module boundaries — Effort: M
- Context: Maintainable architecture.
- Current: tsconfig path aliases exist; no boundary linting.
- Do next: Add eslint-plugin-boundaries and define layers (app, features, lib, ui). Update imports to @/ aliases consistently.
- Risks: Refactor ripple effects.

33) Unit test coverage — Effort: M
- Context: Raise to 70%+.
- Current: Vitest set up; coverage script exists.
- Do next: Target utils, mappers, hooks with deterministic tests. Track coverage in CI.
- Risks: Time investment.

34) Integration tests — Effort: M
- Context: API confidence.
- Current: scripts/test suites exist; Playwright installed.
- Do next: Add API integration tests against local Next server + test DB or MSW for isolation.
- Risks: Flaky external DB; prefer MSW for unit/integration.

35) E2E tests — Effort: M/L
- Context: Critical flows.
- Current: Playwright configured.
- Do next: Implement flows: auth gate, projects list, clients CRUD (409 on delete), SOW summary. Enable retries, trace on failure.
- Risks: Test data management; use seed/reset scripts.

36) Mocking strategy with MSW — Effort: S/M
- Context: Decouple client tests.
- Current: No MSW setup found.
- Do next: Add msw for node/browser; document handlers; integrate with Vitest.
- Risks: Divergence from real API if not maintained.

37) SOW import pipeline hardening — Effort: M/L
- Context: Robust bulk import.
- Current: Features/docs exist; validation strategy unclear.
- Do next: Add Zod schemas, streaming for large files, idempotency keys; improve user error reporting.
- Risks: File size/memory; test with real data samples.

38) Observability (Sentry/Otel) — Effort: M
- Context: Monitor errors and performance.
- Current: Not integrated.
- Do next: Add Sentry for client/server; set DSNs via env; capture API errors and traces.
- Risks: PII; review sampling and scrubbing.

39) Feature flags — Effort: S
- Context: Safer rollouts.
- Current: None centralized.
- Do next: Add a simple env-driven flag module; consider Unleash/ConfigCat for managed flags later.
- Risks: Flag sprawl; naming discipline needed.

40) Dependency hygiene — Effort: S
- Context: Keep surface minimal.
- Current: Puppeteer and Playwright both present; likely redundant.
- Do next: Remove puppeteer if unused; run depcheck and npm audit fix (reviewed).
- Risks: Hidden uses; search before removal.

41) PWA assessment — Effort: S
- Context: Clarify product goals.
- Current: No next-pwa configured.
- Do next: Decide to add next-pwa or explicitly drop PWA idea; remove legacy PWA configs if any.
- Risks: None.

42) Firebase deprecation — Effort: M
- Context: Move off Firebase unless needed for storage/etc.
- Current: firebase/ and src/lib/firebase.ts exist and were recently modified; Clerk is auth provider.
- Do next: Inventory Firebase usages; if only storage is required, wrap behind a service; else remove firebase entirely and adjust codepaths.
- Risks: Hidden runtime usage; perform static search and runtime checks.

43) Middleware cleanup — Effort: S
- Context: Remove dev-only header hacks.
- Current: middleware.ts.disabled present; indicates previous workarounds.
- Do next: Delete hacks; replace with explicit env-based dev modes and clear logs.
- Risks: Dev convenience lost; provide alternative toggles.

44) API consistency (response envelope) — Effort: M
- Context: Same as task 9 but emphasizes docs and enforcement.
- Current: Health route follows pattern.
- Do next: Create helpers and update docs/data/02-api-layer.md; add lint rule or unit tests for envelope shape.
- Risks: Broad refactor scope.

45) Release management — Effort: M
- Context: Changelogs and versioning.
- Current: None automated.
- Do next: Add Changesets or semantic-release; configure CI to publish notes and tags on merge to main.
- Risks: Requires process changes.

46) DB backups & runbooks — Effort: S/M
- Context: Ops readiness.
- Current: Not documented.
- Do next: Document Neon backup/restore, branching, and migration rollback in docs/operations/.
- Risks: Accuracy; validate with actual Neon project.

47) Data seeding — Effort: S/M
- Context: Consistent dev data.
- Current: scripts/demo-data.sql added; TS seeders also exist.
- Do next: Consolidate to TS seeders that can import SQL snippets; make idempotent (UPSERT) and environment-scoped.
- Risks: Conflicting seed sources.

48) Performance budget — Effort: S
- Context: Prevent regressions.
- Current: No budgets enforced.
- Do next: Define bundle size/route timings; enforce via Lighthouse CI and webpack analyzer budgets.
- Risks: Requires ongoing tuning.

49) Edge/runtime placement — Effort: S
- Context: Use node/edge appropriately.
- Current: Health route explicitly nodejs runtime.
- Do next: Review routes for edge suitability; annotate where beneficial; beware Neon driver constraints (nodejs runtime recommended).
- Risks: Incompatibility with some libs at edge.

50) Caching strategy — Effort: S/M
- Context: Better perf.
- Current: Not documented.
- Do next: Use revalidation in fetch/route handlers; set Cache-Control headers; optionally React Query persist for offline areas.
- Risks: Stale data if misconfigured.

51) File uploads — Effort: M
- Context: Consistent and secure handling.
- Current: Not standardized.
- Do next: Centralize upload utils, size limits, virus scanning hooks if applicable; consider presigned URLs to cloud storage.
- Risks: Security and cost.

52) Authorization model — Effort: M
- Context: Server-side enforcement.
- Current: Moving from Firebase to Clerk; ensure RBAC server-side.
- Do next: Add server-side guards in API routes; avoid trusting client-provided headers; codify roles/claims.
- Risks: Incomplete permissions matrix.

53) Error catalog — Effort: S
- Context: Consistent user messages.
- Current: Not centralized.
- Do next: Define canonical error codes/messages; map DB/validation/auth errors; add tests.
- Risks: Keeping mapping up-to-date.

54) i18n readiness — Effort: S
- Context: Optional future-proofing.
- Current: Not enabled.
- Do next: Add next-intl scaffold and demonstrate with a couple of strings.
- Risks: Overhead if no i18n plans.

55) DX tooling (Husky/lint-staged) — Effort: S
- Context: Pre-commit checks.
- Current: None configured.
- Do next: Add husky hooks for lint, type-check, tests; use lint-staged for staged files.
- Risks: Commit latency; keep fast.

56) Monitoring & alerts — Effort: S/M
- Context: Operational visibility.
- Current: None noted.
- Do next: Add uptime monitors for /api/health and Sentry alert rules for error spikes.
- Risks: Alert fatigue; tune thresholds.

57) Secrets rotation practice — Effort: S
- Context: Security hygiene.
- Current: Not documented.
- Do next: Document rotation cadence and procedures for Neon/third-party keys.
- Risks: Coordination with deployments.

58) Cleanup dead code — Effort: M
- Context: Reduce clutter.
- Current: FF_React_Archive exists; legacy pages and test-db-connection.js has hardcoded DSN.
- Do next: Validate archive content migrated; remove archive and dangerous scripts or neuter secrets.
- Risks: Losing reference code; back up in a tag.

59) Align doc generators (CODEBASE_MAP) — Effort: S
- Context: Keep docs current and owned.
- Current: CODEBASE_MAP.md present; index updated.
- Do next: Add owners and last updated date per section; ensure links resolve.
- Risks: None.

60) Final audit cadence — Effort: S
- Context: Sustainable maintenance.
- Current: No process documented.
- Do next: Schedule quarterly checklist reviews; log deltas in CHANGELOG and ADRs.
- Risks: Process drift; assign a DRI.

---

How to use this guide:
- Discuss each item with the suggested “Do next” bullets as your acceptance criteria.
- Use the Effort tag to plan sprints; tackle S and M items early to derisk.
- For risky items (noted), create spikes to validate assumptions before committing to full implementation.

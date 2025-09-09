# Enumerated Improvement Checklist

Note: Each item is a discrete, actionable task. Check off items as they are completed.

1
2. [ ] 
3. [ ] Reinstate auth middleware: enable middleware.ts (rename from middleware.ts.disabled) with AUTH_BYPASS allowed only in dev via env gate.

5. [
6. [ ] Add structured logging (pino or consola) for server/API with redaction and LOG_LEVEL; replace console.log in handlers and scripts.
7. [ ] Define request/response schemas using Zod; centralize schemas (e.g., src/lib/schemas/) and enforce parse/validate in all API routes.

9. [ ] Add /api/health automated test (Playwright/axios) and document expected JSON payload and status semantics.
10. [ ] Harden TypeScript: enable noUncheckedIndexedAccess and exactOptionalPropertyTypes; add npm run type-check and CI type-check step.
11. [ ] Audit Zustand stores: switch components to selector-based subscriptions; fully type state/actions; add unit tests for store logic.
12. [ ] Configure React Query QueryClient defaults (staleTime, retry) and create a queryKeys module; integrate provider in app/layout or top-level provider.
13. [ ] Add @next/bundle-analyzer and docs for ANALYZE=true; review bundles and annotate heavy imports with dynamic(() => import(...)).
14. [ ] Migrate images to next/image; set sizes/priority; compress oversized assets in public/.
15. [ ] Add route-level and app-level error boundaries (app/error.tsx and feature error.tsx) and wire client error reporting.
16. [ ] Configure security headers and CSP in next.config.mjs; review cookies, CORS, and CSRF requirements.
17. [ ] Enforce authorization: ensure protected routes/APIs check Clerk session/roles and return 401/403 appropriately.
18. [ ] Standardize linting/formatting: finalize ESLint + Prettier configs; add Husky pre-commit to run lint and format.
19. [ ] Improve test coverage: add unit/integration tests for critical components, API routes, and data flows; define coverage thresholds.
20. [ ] Add CI workflow (GitHub Actions): install, lint, type-check, test, build, and db validation jobs with caching.
21. [ ] Integrate error monitoring (e.g., Sentry) for API and client; scrub PII and link releases.
22. [ ] Normalize API route structure under app/api/* with route.ts; set runtime (edge/node) per handler needs; remove legacy pages/api/*.
23. [ ] Create a shared error code catalog and export constants for clients; document codes in docs.
24. [ ] Profile heavy components/hooks and introduce dynamic imports and memoization where beneficial.
25. [ ] Run depcheck and npm outdated; remove unused deps and upgrade risky/outdated packages after testing.
26. [ ] Document database models and relationships (docs/data/01-database-models.md) per CODEBASE_MAP guidance.
27. [ ] Document routing and navigation (docs/architecture/02-routing.md) reflecting the App Router; remove references to React Router.
28. [ ] Update README and docs/INDEX.md to reflect single-architecture Next.js narrative; archive or mark Vite/Express docs as legacy.
29. [ ] Publish a developer onboarding guide covering setup, env vars, scripts, and common workflows.
30. [ ] Catalog and document feature flags/env gates (AUTH_BYPASS, USE_LEGACY_SERVER) with defaults and safety checks.
31. [ ] Add API rate limiting and request body size limits for public endpoints where applicable.
32. [ ] Configure caching/revalidation strategies for data fetching; set Cache-Control headers in API where relevant.
33. [ ] Add automated accessibility checks (jest-axe or axe-playwright) and fix identified issues.
34. [ ] Optimize Neon/Postgres usage: confirm serverless driver settings and pool sizing via env; document best practices.
35. [ ] Remove archived/duplicated code (e.g., FF_React_Archive/) after verifying migration parity and capturing docs.
36. [ ] Add CODEOWNERS and PR templates; document code review standards and branching strategy.
37. [ ] Establish release/versioning (semver) and CHANGELOG; automate release notes in CI.
38. [ ] Define feature module boundaries and barrels; enforce import paths via tsconfig paths and eslint rules.
39. [ ] Align search/index documentation and scripts with current modules (see SEARCH_INDEXES_COMPLETE.md); add reindex runbook.
40. [ ] Document backup/restore and incident runbooks for database and file storage; test recovery procedures.
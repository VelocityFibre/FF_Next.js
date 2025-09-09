# 📜 FIBREFLOW NEXT.JS - GOLDEN RULES

## 🚨 RULE #1: UNIVERSAL MODULE STRUCTURE (HIGHEST PRIORITY)
**CREATE ONCE, USE EVERYWHERE**
- The CREATE form defines the ENTIRE module structure
- VIEW, EDIT, and DETAIL must use EXACT same fields
- Same order, same labels, same grouping
- NO EXCEPTIONS
- **PROVEN**: Projects module achieved 100% consistency (was 52.9%)
- **MANDATORY**: All modules MUST have 100% field consistency
- **REFERENCE**: See MODULE_FIELD_CONSISTENCY_STANDARD.md

### Enforcement:
```bash
# Before ANY module work:
1. Check CREATE form structure
2. Copy EXACT structure to View/Edit/Detail
3. NEVER add/remove/reorder fields
```

### Module Components (MANDATORY):
1. **[Module]Create.tsx** - THE MASTER TEMPLATE
2. **[Module]View.tsx** - Read-only version of Create
3. **[Module]Edit.tsx** - Create form with data
4. **[Module]List.tsx** - Table view
5. **[Module]Detail.tsx** - All fields displayed
6. **page.tsx** - Next.js App Router page component

## 🚨 RULE #2: ZERO TOLERANCE - CODE QUALITY

### TypeScript/Build Errors: 0️⃣
- NO TypeScript errors allowed
- NO build errors allowed
- NO 'any' types without explicit reason

### Linting: 0️⃣
- ZERO ESLint errors
- ZERO ESLint warnings
- Run: `npm run lint` before EVERY commit

### Testing: ✅
- Minimum 90% coverage
- All critical paths tested
- Run: `npm test` before commit

## 🚨 RULE #3: DATABASE CONSISTENCY

### Neon PostgreSQL (PRIMARY)
- ALL data operations through Neon serverless client
- Direct SQL queries with template literals (NO ORM)
- Use @neondatabase/serverless exclusively
- NO Drizzle, NO Prisma, NO Firebase

### Data Structure:
- Flat structure (SQL-style)
- Consistent field naming:
  - Snake_case in database
  - camelCase in frontend
  - Proper mapping in adapters

## 🚨 RULE #4: ANTIHALL VALIDATION

### Before suggesting ANY code:
```bash
npm run antihall:check "methodName"
```

### Required validations:
- Service methods
- Component names
- Hook names
- Routes

## 🚨 RULE #5: UI/UX CONSISTENCY

### Design System:
- Use existing components
- Follow color scheme
- Consistent spacing
- Same interaction patterns

### Table Views:
- Consistent column structure
- Action buttons in same position
- Filter/search in header
- Summary cards on top

## 🚨 RULE #6: GIT COMMIT STANDARDS

### Commit Format:
```
type: Brief description

- Detailed change 1
- Detailed change 2

[Module affected]
```

### Types:
- feat: New feature
- fix: Bug fix
- refactor: Code improvement
- docs: Documentation
- test: Testing
- style: Formatting

## 🚨 RULE #7: FILE STRUCTURE

### Module Organization (Next.js App Router):
```
/app/[module]/
├── page.tsx         # Main page component
├── components/      # Module components
├── types/          # Type definitions
└── api/            # API route handlers

/components/[module]/
├── [Module]Create.tsx
├── [Module]View.tsx
├── [Module]Edit.tsx
├── [Module]List.tsx
└── [Module]Detail.tsx

/lib/
├── hooks/          # Custom hooks
├── services/       # API services
└── db/             # Database utilities
```

## 🚨 RULE #8: PERFORMANCE

### Requirements:
- Page load < 1.5s
- API calls < 200ms
- Lazy load large components
- Optimize images

## 🚨 RULE #9: AUTHENTICATION & ROUTING

### Clerk Authentication (PRIMARY):
- ALL authentication through Clerk
- NO Firebase Auth (fully replaced)
- Use Clerk components: `<SignIn />`, `<UserButton />`, etc.
- Server-side auth with `auth()` in API routes
- Client-side auth with `useUser()` hook

### Next.js App Router:
- Use `app/` directory structure
- Server Components by default
- Client Components with "use client" directive
- Route handlers in `api/route.ts` files
- NO React Router (replaced by Next.js routing)

## 🚨 RULE #10: SECURITY

### Always:
- Validate inputs
- Sanitize outputs
- Use parameterized queries
- Check Clerk authentication in API routes
- NO secrets in code
- Environment variables for configuration

## 🚨 RULE #11: DOCUMENTATION

### Every module needs:
- README.md
- [MODULE]_STRUCTURE.md
- JSDoc comments
- Inline comments for complex logic

---

## ⚡ QUICK CHECKS BEFORE ANY WORK

```bash
# 1. Build check (Next.js)
npm run build

# 2. Lint check
npm run lint

# 3. Type check
npm run type-check

# 4. Test suite
npm test

# 5. Database validation
npm run db:validate

# 6. Run AntiHall validation
npm run antihall
```

## 🔴 VIOLATIONS = BLOCKED

Any violation of these rules = PR blocked
No exceptions, no overrides

---

**Last Updated**: 2025-09-08
**Version**: 2.0.0 - Next.js Migration Complete
**Authority**: System-wide, supersedes all other configs

---

## 🔄 MIGRATION NOTES

### ✅ Completed Migrations:
- React/Vite → Next.js 15.0 with App Router
- Firebase Auth → Clerk Authentication
- Express API → Next.js API Routes
- Client-side routing → Next.js App Router

### 📁 Legacy References:
- Previous React/Vite app archived for reference
- Migration scripts moved to archive
- All new development on Next.js stack only
# CLAUDE.md - AI Assistant Context Guide

## Project Overview
**FibreFlow Next.js** - A modern Next.js application for fiber network project management, successfully migrated from React/Vite.

### ✅ Migration Complete!
**Successfully migrated to Next.js with Clerk Authentication**
- Next.js 14+ with App Router now in production
- Clerk authentication fully integrated
- Previous React/Vite app archived for reference

## Essential Directory Structure

### Core Application
- `src/` - Main React application code
- `api/` - Backend API endpoints and server logic
- `public/` - Static assets and public files
- `scripts/` - Build scripts, database utilities, and tools
- `SOW/` - Statement of Work import functionality (active feature)

### Database & Infrastructure
- `drizzle/` - **Database ORM and migration system**
  - Uses Drizzle ORM for TypeScript-first database access
  - Contains migrations and schema definitions
  - Connects to Neon PostgreSQL database
  - Key commands: `db:generate`, `db:migrate`, `db:push`, `db:studio`
- `neon/` - Neon database configuration

### Development & Testing
- `tests/` - Test suites and e2e tests
- `docs/` - Documentation

### AI Assistant Helpers
- `.agent-os/` - AI agent configuration and project specs
- `.antihall/` - Anti-hallucination validation system (prevents AI from referencing non-existent code)

## Archived Content
Non-essential files have been moved to `../FF_React_Archive/` to keep the codebase clean:
- Migration scripts (one-time fixes)
- Temporary files and test outputs
- Legacy code (ForgeFlow-v2-FF2)

## Key Commands

### Development
```bash
npm run dev          # Start development server (Vite + API server)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Database
```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:push      # Push schema directly to database
npm run db:studio    # Open Drizzle Studio (database browser)
```

### Testing
```bash
npm test            # Run Vitest tests
npm run test:e2e    # Run Playwright e2e tests
```

### AI Validation
```bash
npm run antihall    # Run anti-hallucination validator
```

## Tech Stack

### Current Stack (Production) ✅
- **Framework**: Next.js 14+ with App Router
- **Frontend**: React 18, TypeScript, TailwindCSS
- **Authentication**: Clerk (complete integration)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **API**: Next.js API Routes (App Router)
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel (optimized SSR/ISR)

### Legacy Stack (Archived)
- **Framework**: React 18 + Vite (archived for reference)
- **Backend**: Express server (replaced by Next.js API routes)
- **Authentication**: Firebase Auth (replaced by Clerk)

## Important Notes for AI Assistants

### Migration Context ✅
- **Migration Complete**: Next.js app is now the production application
- **Clerk Integration**: All authentication uses Clerk (Firebase Auth fully replaced)
- **Single Codebase**: Next.js app is the active codebase
- **Legacy Reference**: Previous React/Vite app archived for reference only

### Development Guidelines
1. Always check existing code patterns before implementing new features
2. The database layer uses Drizzle ORM - don't use raw SQL or other ORMs
3. SOW import functionality is an active feature - keep related files
4. Use the antihall validator to verify code references exist
5. Archive directory (`../FF_React_Archive/`) contains old/temporary files if needed for reference
6. **All new features**: Implement in Next.js app (current production)
7. **Authentication**: Use Clerk patterns exclusively (Firebase Auth removed)
8. **API Routes**: Use Next.js App Router API routes (Express server retired)
# CLAUDE.md - AI Assistant Context Guide

## Project Overview
**FibreFlow React** - A modern React application for fiber network project management, migrated from Angular.

### 🚧 Active Migration
**Currently migrating to Next.js with Clerk Authentication**
- Next.js implementation in progress (see `nextjs-migration/` directory)
- Clerk authentication replacing Firebase Auth
- Gradual migration strategy while maintaining current React/Vite app

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

### Current Stack (Production)
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Testing**: Vitest, Playwright
- **Authentication**: Firebase Auth (being replaced)

### Migration Target Stack
- **Framework**: Next.js 14+ (App Router)
- **Authentication**: Clerk (replacing Firebase Auth)
- **Database**: Neon PostgreSQL with Drizzle ORM (unchanged)
- **Deployment**: Vercel (optimized for Next.js)

## Important Notes for AI Assistants

### Migration Context
- **Two codebases exist**: Current React/Vite app (production) and Next.js migration (in progress)
- **Clerk integration**: New auth features should use Clerk, not Firebase
- **Incremental migration**: Features are being moved gradually to Next.js
- **Check before implementing**: Verify if feature exists in Next.js migration before adding to React app

### Development Guidelines
1. Always check existing code patterns before implementing new features
2. The database layer uses Drizzle ORM - don't use raw SQL or other ORMs
3. SOW import functionality is an active feature - keep related files
4. Use the antihall validator to verify code references exist
5. Archive directory (`../FF_React_Archive/`) contains old/temporary files if needed for reference
6. **For new features**: Consider implementing in Next.js migration instead of React app
7. **For auth-related work**: Use Clerk patterns, not Firebase
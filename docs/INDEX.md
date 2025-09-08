# FibreFlow Documentation Index

## Quick Navigation
- [Getting Started](#getting-started)
- [Architecture Documentation](#architecture-documentation)
- [Data Layer Documentation](#data-layer-documentation)
- [Feature Module Documentation](#feature-module-documentation)
- [UI Component Documentation](#ui-component-documentation)
- [Utilities & Testing Documentation](#utilities--testing-documentation)
- [Migration Guides](#migration-guides)
- [Additional Resources](#additional-resources)

---

## Getting Started

### Project Overview
- **CLAUDE.md** - AI assistant context guide and project overview
- **MIGRATION_STATUS.md** - Next.js + Clerk migration progress tracking
- **CODEBASE_MAP.md** - Documentation strategy and organization
- **PROGRESS.md** - Documentation completion tracker

### Key Context ✅
- **Current Stack**: Next.js 14+ App Router, React 18, TypeScript, TailwindCSS, Clerk Auth
- **Previous Stack**: React/Vite (archived for reference)
- **Database**: Real data from Neon PostgreSQL (NO mock data)
- **Authentication**: Clerk (fully integrated, Firebase Auth retired)

---

## Architecture Documentation

### [Section 1.1: Entry Points & Configuration](./architecture/01-entry-points.md)
**Size**: ~35K tokens  
**Coverage**: Application bootstrap, configuration, environment setup
- Entry point analysis (index.html → main.tsx → App.tsx)
- Build configuration (Next.js, TypeScript, TailwindCSS)
- Environment management and deployment
- Development server setup

### [Section 1.2: Routing & Navigation](./architecture/02-routing.md)
**Size**: ~28K tokens  
**Coverage**: Route structure, navigation patterns, layouts
- 100+ routes mapped across 11 feature domains
- React Router v6 implementation
- Navigation architecture and components
- Protected routes and role-based access

---

## Data Layer Documentation

### [Section 2.1: Database & Models](./data/01-database-models.md)
**Size**: ~45K tokens  
**Coverage**: Complete database schema and ORM setup
- 32+ tables across 5 domains
- Drizzle ORM implementation
- Schema relationships and constraints
- Migration patterns

### [Section 2.2: API Layer](./data/02-api-layer.md)
**Size**: ~38K tokens  
**Coverage**: API architecture and service layer
- 47 API endpoints documented
- Next.js API routes (single architecture; legacy Express dev server deprecated)
- Service layer patterns
- Error handling and validation

### [Section 2.3: State Management](./data/03-state-management.md)
**Size**: ~32K tokens  
**Coverage**: Client-side state architecture
- React Query for server state
- Context API patterns (migrating to Zustand)
- Local state management
- Cache strategies

---

## Feature Module Documentation

### [Section 3.1: Authentication & Users](./features/01-authentication.md)
**Size**: ~28K tokens  
**Coverage**: Auth system and user management
- Current JWT implementation
- Role-based access control (RBAC)
- User profiles and permissions
- Migration to Clerk Auth

### [Section 3.2: Projects Module](./features/02-projects.md)
**Size**: ~35K tokens  
**Coverage**: Core project management features
- Project creation and lifecycle
- Task management and workflows
- Resource allocation
- Budget tracking

### [Section 3.3: Procurement Module](./features/03-procurement.md)
**Size**: ~32K tokens  
**Coverage**: Purchase and vendor management
- Purchase orders and requisitions
- Vendor management
- Approval workflows
- Financial tracking

### [Section 3.4: SOW Import](./features/04-sow-import.md)
**Size**: ~30K tokens  
**Coverage**: Statement of Work import system
- CSV/Excel import pipeline
- Data validation and transformation
- Bulk operations
- Error handling

### [Section 3.5: Analytics & Reporting](./features/05-analytics.md)
**Size**: ~28K tokens  
**Coverage**: Analytics and visualization
- Dashboard components
- Recharts implementation
- Real-time metrics
- Report generation

---

## UI Component Documentation

### [Section 4.1: Core Components](./ui/01-components.md)
**Size**: ~40K tokens  
**Coverage**: Reusable component library
- 148+ components documented
- TypeScript interfaces
- Component composition patterns
- Accessibility features

### [Section 4.2: Styling & Theme](./ui/02-styling.md)
**Size**: ~25K tokens  
**Coverage**: Design system and styling
- TailwindCSS configuration
- 5-theme system with CSS variables
- Responsive design patterns
- Animation utilities

---

## Utilities & Testing Documentation

### [Section 5.1: Utilities & Helpers](./utilities/01-helpers.md)
**Size**: ~35K tokens  
**Coverage**: Utility functions and services
- 94+ utility files documented
- Data processing utilities
- Storage services with encryption
- Security and logging systems

### [Section 5.2: Testing Infrastructure](./utilities/02-testing.md)
**Size**: ~30K tokens  
**Coverage**: Testing setup and patterns
- Vitest unit testing configuration
- Playwright E2E testing
- Testing utilities and patterns
- Coverage requirements (90% threshold)

---

## Migration Guides

### ✅ Next.js Migration Complete!
- **Status**: Fully Complete ✅
- **Key Files**: 
  - MIGRATION_STATUS.md - Migration completion summary
  - docs/data/02-api-layer.md - API architecture (current Next.js)
  - docs/features/01-authentication.md - Clerk integration

### ✅ Completed Migration Points
1. **Routing**: React Router → Next.js App Router ✅
2. **Authentication**: JWT/bcrypt → Clerk ✅
3. **API**: Express → Next.js Route Handlers ✅
4. **Deployment**: Various → Vercel ✅

---

## Additional Resources

### Development Tools
- **Scripts**: package.json commands for dev, build, test
- **Configuration**: next.config.mjs, tsconfig.json, tailwind.config.js
- **Database**: Drizzle schema in src/db/schema/

### Code Organization
```
src/
├── components/     # Reusable UI components
├── features/       # Feature modules
├── services/       # API and business logic
├── db/            # Database schema and queries
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript definitions
└── test/          # Testing utilities
```

### Important Notes
1. **Real Data Only**: Application uses REAL data from Neon database
2. **No Mock Data**: All features connect to actual PostgreSQL
3. **Production Ready**: Clerk authentication fully integrated
4. **Migration Complete**: Next.js is now the production application ✅

---

## Documentation Statistics

- **Total Sections**: 15 (100% complete)
- **Total Documentation**: ~475K tokens
- **Files Analyzed**: ~150 source files
- **Lines Documented**: ~25,000 lines
- **Last Updated**: 2025-09-03

## Quick Start Commands

```bash
# Development (Next.js)
npm run dev          # Start Next.js dev server with Clerk
npm run build        # Build Next.js for production
npm start            # Start Next.js production server

# Testing
npm test            # Run Vitest tests
npm run test:e2e    # Run Playwright E2E tests
npm run coverage    # Generate coverage report

# Database
npm run db:push     # Push schema to database
npm run db:studio   # Open Drizzle Studio

# Legacy Reference
# Previous React/Vite commands archived with codebase
```

## Contact & Support

For questions about this documentation or the codebase:
- Review CLAUDE.md for AI context
- Check MIGRATION_STATUS.md for current state
- Reference specific section documentation for deep dives


---

### Architecture Consolidation
- See [Phase 2: Architecture Consolidation](./architecture/phase-2-architecture-consolidation.md) for details on build system cleanup, database single source of truth, ORM strategy, migration flow, Neon pooling strategy, and the Health API route.

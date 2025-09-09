# FibreFlow Documentation Index

## 📁 Documentation Structure
```
docs/
├── Core Documentation (this directory)
├── standards/        - Coding standards and conventions
├── architecture/     - System architecture and design
├── data/            - Database and API documentation
├── features/        - Feature-specific documentation
├── ui/              - UI components and styling
├── utilities/       - Helper functions and utilities
├── testing/         - Testing strategies and guides
├── guides/          - Development and onboarding guides
└── archive/         - Historical documentation
```

## Quick Navigation
- [Current Tasks & Issues](#current-tasks--issues)
- [Development Guides](#development-guides)
- [Standards & Conventions](#standards--conventions)
- [Architecture Documentation](#architecture-documentation)
- [Data Layer Documentation](#data-layer-documentation)
- [Feature Documentation](#feature-documentation)
- [Testing Documentation](#testing-documentation)

---

## Current Tasks & Issues

### Active Work
- **[PROGRESS.md](./PROGRESS.md)** - Overall progress tracking

### Archived
- **[tasks.md](./archive/tasks.md)** - Task list (archived)
- **[tasks-feedback.md](./archive/tasks-feedback.md)** - Task guidance (archived)
- **[REMAINING-ISSUES.md](./archive/REMAINING-ISSUES.md)** - Issues tracker (archived)

### Project Context
- **[RULES.md](./RULES.md)** - Project rules and guidelines
- **[DOCS_REVIEW_SUMMARY.md](./DOCS_REVIEW_SUMMARY.md)** - Documentation status

---

## Development Guides

### Getting Started
- **[LOCAL_DEVELOPMENT.md](./guides/LOCAL_DEVELOPMENT.md)** - Local setup guide
- **[ENHANCED_ONBOARDING_GUIDE.md](./guides/ENHANCED_ONBOARDING_GUIDE.md)** - New developer onboarding
- **[neon-api-migration-guide.md](./guides/neon-api-migration-guide.md)** - Neon API migration

### Logging & Monitoring
- **[LOGGING_BEST_PRACTICES.md](./guides/logging/LOGGING_BEST_PRACTICES.md)** - Logging strategy and standards
- **[LOGGING_IMPLEMENTATION_EXAMPLE.md](./guides/logging/LOGGING_IMPLEMENTATION_EXAMPLE.md)** - Implementation examples
- **[LOGGING_MIGRATION_GUIDE.md](./guides/logging/LOGGING_MIGRATION_GUIDE.md)** - API logging migration guide

### Key Context ✅
- **Framework**: Next.js 15.0 with App Router
- **Frontend**: React 18, TypeScript, TailwindCSS  
- **Authentication**: Clerk (complete integration)
- **Database**: Neon PostgreSQL (serverless client, direct SQL)
- **API**: Next.js API Routes (App Router)
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel (optimized SSR/ISR)

---

## Standards & Conventions

### Code Standards
- **[API_RESPONSE_STANDARD.md](./standards/API_RESPONSE_STANDARD.md)** - API response formats
- **[MODULE_FIELD_CONSISTENCY_STANDARD.md](./standards/MODULE_FIELD_CONSISTENCY_STANDARD.md)** - Module field standards
- **[UNIVERSAL_MODULE_STRUCTURE.md](./standards/UNIVERSAL_MODULE_STRUCTURE.md)** - Module organization
- **[FILE_SPLITTING_RULES.md](./standards/FILE_SPLITTING_RULES.md)** - File organization rules
- **[database-best-practices.md](./standards/database-best-practices.md)** - Database guidelines
- **[UI_UX_STANDARD.md](./standards/UI_UX_STANDARD.md)** - UI/UX standards

---

## Architecture Documentation

### System Architecture
- **[PROJECT_STRUCTURE.md](./architecture/PROJECT_STRUCTURE.md)** - Project structure overview
- **[02-routing.md](./architecture/02-routing.md)** - Routing and navigation patterns
- **[LAYOUT_ARCHITECTURE.md](./architecture/LAYOUT_ARCHITECTURE.md)** - Layout system architecture

---

## Data Layer Documentation

### Database & API
- **[01-database-models.md](./data/01-database-models.md)** - Database schema and models
- **[02-api-layer.md](./data/02-api-layer.md)** - API architecture and endpoints
- **[03-state-management.md](./data/03-state-management.md)** - State management patterns

---

## Feature Documentation

### Core Features
- **[01-authentication.md](./features/01-authentication.md)** - Authentication system (Clerk)
- **[02-projects.md](./features/02-projects.md)** - Project management features
- **[03-procurement.md](./features/03-procurement.md)** - Procurement module
- **[04-sow-import.md](./features/04-sow-import.md)** - SOW import functionality
- **[05-analytics.md](./features/05-analytics.md)** - Analytics and reporting

### Feature Specifications
- **[COMPREHENSIVE_FEATURE_DOCUMENTATION.md](./features/COMPREHENSIVE_FEATURE_DOCUMENTATION.md)** - Complete feature overview
- **[procurement_portal_prd_v_1.md](./features/procurement_portal_prd_v_1.md)** - Procurement PRD

---

## UI Documentation

### Components & Styling
- **[01-components.md](./ui/01-components.md)** - UI component library
- **[02-styling.md](./ui/02-styling.md)** - Styling and theming guide

---

## Utilities Documentation

### Helper Functions
- **[01-helpers.md](./utilities/01-helpers.md)** - Utility functions and services
- **[02-testing.md](./utilities/02-testing.md)** - Testing utilities

---

## Testing Documentation

### Testing Strategies
- **[COMPREHENSIVE_TESTING_STRATEGY.md](./testing/COMPREHENSIVE_TESTING_STRATEGY.md)** - Testing strategy overview
- **[TESTING_IMPLEMENTATION_GUIDE.md](./testing/TESTING_IMPLEMENTATION_GUIDE.md)** - Implementation guide
- **[TEST_COVERAGE_MATRIX.md](./testing/TEST_COVERAGE_MATRIX.md)** - Coverage requirements
- **[UI_UX_TESTING_CHECKLIST.md](./testing/UI_UX_TESTING_CHECKLIST.md)** - UI testing checklist

---

## Archive Documentation

The `archive/` directory contains historical documentation for reference:

### Archive Structure
- **reports/** - Completed analysis and performance reports
- **implementations/** - Completed feature implementations
- **migrations/** - Migration history and guides
- **legacy-vite/** - Legacy Vite configuration
- **migration-history/** - Detailed migration records
- **old-features/** - Deprecated feature documentation

### Notable Archived Documents
- Migration reports and validation
- Performance analysis reports
- Security audit reports
- Implementation summaries
- Legacy architecture documentation

---

## Additional Resources

### Development Tools
- **Scripts**: package.json commands for dev, build, test
- **Configuration**: next.config.mjs, tsconfig.json, tailwind.config.js
- **Database**: Neon PostgreSQL with direct SQL queries

### Code Organization
```
./
├── app/            # Next.js App Router pages & API routes
├── components/     # Reusable UI components
├── lib/           # Core libraries and utilities  
├── hooks/         # Custom React hooks
├── types/         # TypeScript definitions
├── styles/        # Global styles
├── public/        # Static assets
└── pages/         # Legacy pages (being migrated to app/)
```

### Quick Links
- [Neon Dashboard](https://console.neon.tech/)
- [Clerk Dashboard](https://dashboard.clerk.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)

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
- **Last Updated**: 2025-09-08

## Quick Start Commands

```bash
# Development (Next.js 15)
npm run dev          # Start Next.js dev server with Turbo & Clerk
npm run build        # Build Next.js for production
npm start            # Start Next.js production server

# Testing
npm test            # Run Vitest tests
npm run test:e2e    # Run Playwright E2E tests
npm run coverage    # Generate coverage report

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with initial data

# Legacy Reference
# Previous React/Vite commands archived with codebase
```

## Contact & Support

For questions about this documentation or the codebase:
- Review CLAUDE.md for AI context
- Check MIGRATION_STATUS.md for current state
- Reference specific section documentation for deep dives



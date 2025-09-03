# FibreFlow React - Codebase Mapping Strategy

## 🎯 Goal
Create comprehensive codebase documentation that fits within Claude's 200K token context window by processing the codebase in logical sections.

## 📊 Codebase Overview
- **Total Size**: 1,980 files, 280K lines of code
- **Token Estimate**: ~2.8-4.2M tokens
- **Claude Limit**: 200K tokens per conversation
- **Required Passes**: ~15-20 sections

## 🗺️ Section-by-Section Mapping Plan

### Phase 1: Core Architecture (Foundation)
**Section 1.1: Entry Points & Configuration**
- `src/index.tsx`, `src/App.tsx`
- `src/config/*` - App configuration
- `vite.config.ts`, `tsconfig.json`
- **Output**: `docs/architecture/01-entry-points.md`

**Section 1.2: Routing & Navigation**
- `src/app/*` - App structure
- `src/pages/*` - Page components
- Route definitions and navigation logic
- **Output**: `docs/architecture/02-routing.md`

### Phase 2: Data Layer
**Section 2.1: Database & Models**
- `src/lib/neon/*` - Database schemas
- `drizzle/*` - Migrations
- Type definitions
- **Output**: `docs/data/01-database-models.md`

**Section 2.2: API Layer**
- `api/*` - All API endpoints
- `src/services/api/*` - API client services
- **Output**: `docs/data/02-api-layer.md`

**Section 2.3: State Management**
- `src/contexts/*` - React contexts
- `src/hooks/*` - Custom hooks
- State management patterns
- **Output**: `docs/data/03-state-management.md`

### Phase 3: Feature Modules
**Section 3.1: Authentication & Users**
- Auth components and services
- User management
- **Output**: `docs/features/01-authentication.md`

**Section 3.2: Projects Module**
- Project management features
- **Output**: `docs/features/02-projects.md`

**Section 3.3: Procurement Module**
- RFQ, suppliers, materials
- **Output**: `docs/features/03-procurement.md`

**Section 3.4: SOW Import**
- Statement of Work import functionality
- **Output**: `docs/features/04-sow-import.md`

**Section 3.5: Analytics & Reporting**
- Dashboard, KPIs, reports
- **Output**: `docs/features/05-analytics.md`

### Phase 4: UI Components
**Section 4.1: Core Components**
- `src/components/*` - Reusable UI components
- Component patterns and conventions
- **Output**: `docs/ui/01-components.md`

**Section 4.2: Styling & Theme**
- `src/styles/*` - Global styles
- Tailwind configuration
- Theme system
- **Output**: `docs/ui/02-styling.md`

### Phase 5: Utilities & Testing
**Section 5.1: Utilities**
- `src/utils/*` - Helper functions
- `src/lib/*` - Libraries
- **Output**: `docs/utilities/01-helpers.md`

**Section 5.2: Testing**
- `src/tests/*` - Test suites
- Testing patterns
- **Output**: `docs/utilities/02-testing.md`

## 📝 Summary Document Structure

Each section summary should contain:

```markdown
# [Section Name]

## Overview
- Purpose and responsibility
- Key files and directories
- Dependencies on other sections

## Architecture
- Design patterns used
- Data flow
- Key abstractions

## Public API
- Exported functions/components
- Key interfaces/types
- Usage examples

## Integration Points
- How it connects to other sections
- Events emitted/consumed
- Database tables accessed

## Technical Debt & TODOs
- Known issues
- Improvement opportunities
- Missing features
```

## 🤖 Processing Instructions for Claude

### Step 1: Initial Setup
```bash
# Create documentation structure
mkdir -p docs/{architecture,data,features,ui,utilities}
```

### Step 2: Process Each Section
For each section, Claude should:
1. **Read** all files in the section (~150-200K tokens)
2. **Analyze** patterns, dependencies, and functionality
3. **Generate** comprehensive markdown summary
4. **Save** to appropriate docs file

### Step 3: Create Master Index
After all sections are processed:
```markdown
# docs/INDEX.md
- Link to all section summaries
- Cross-reference matrix
- Dependency graph
- Quick navigation guide
```

### Step 4: Update CLAUDE.md
Add section summaries and navigation hints for future AI sessions.

## 🚀 Execution Plan

### Automated Approach
```typescript
// scripts/generate-codebase-docs.ts
async function generateDocsForSection(section: Section) {
  // 1. Collect all files in section
  // 2. Generate AST summaries
  // 3. Extract exports and interfaces
  // 4. Create markdown documentation
  // 5. Save to docs folder
}
```

### Manual Approach (Using Claude)
1. Start new conversation for each section
2. Provide section files + this mapping plan
3. Request comprehensive summary
4. Save output to docs folder
5. Build up complete picture over multiple sessions

## 📊 Progress Tracking

Create `docs/PROGRESS.md`:
```markdown
- [ ] Section 1.1: Entry Points
- [ ] Section 1.2: Routing
- [ ] Section 2.1: Database
... (all sections)

Last Updated: [date]
Completed: 0/15
```

## 🎯 Success Metrics

- Each section summary ≤ 10K tokens
- All public APIs documented
- Dependency graph complete
- New developers can understand any module in < 5 minutes
- Claude can answer questions using section summaries instead of reading all code

## 💡 Tips for Processing

1. **Start with core sections** (entry points, routing, database)
2. **Process related sections together** (e.g., all feature modules)
3. **Update cross-references** after each section
4. **Test summaries** by asking Claude questions using only the docs

---

This strategy will give you a complete, navigable map of your codebase that fits within Claude's context limits!
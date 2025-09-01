# Multi-Agent Database Migration Tasks

## Setup Instructions
1. Open 3-4 terminal windows
2. In each terminal, run Claude Code
3. Copy and paste the specific agent task below
4. Each agent works independently on their module
5. Coordinate completion through this document

---

## AGENT 1: Procurement Module
```
I need to fix all direct database connections in the procurement module.

Current Issues:
- StockService.ts uses direct Neon connections
- BOQApiService.ts has direct SQL queries  
- RFQ analytics bypasses API layer
- Import operations save directly to database

Tasks:
1. Search for all direct DB connections:
   grep -r "createNeonClient\|sql\`\|neon(" src/services/procurement/ --include="*.ts"

2. Create API endpoints in /api/procurement/:
   - /api/procurement/stock/index.js (GET, POST)
   - /api/procurement/stock/[id].js (GET, PUT, DELETE)
   - /api/procurement/stock/movements.js
   - /api/procurement/purchase-orders/index.js
   - /api/procurement/rfq/index.js
   - /api/procurement/rfq/analytics.js
   - /api/procurement/boq/index.js

3. Create src/services/api/procurementApi.ts with:
   - Stock operations (CRUD + movements)
   - Purchase order operations
   - RFQ operations
   - BOQ operations

4. Update services to use API:
   - Update StockService.ts
   - Update BOQApiService.ts
   - Update RFQ services
   - Update import services

5. Test all procurement pages:
   - /app/procurement/stock
   - /app/procurement/purchase-orders
   - /app/procurement/rfq
   - /app/procurement/boq

Success Criteria: No "database connection string" errors on any procurement page
```

---

## AGENT 2: Contractors Module
```
I need to fix all direct database connections in the contractors module.

Current Issues:
- contractorNeonService.ts connects directly to Neon
- Onboarding database service uses direct SQL
- RAG scoring updates bypass API

Tasks:
1. Search for all direct DB connections:
   grep -r "createNeonClient\|sql\`\|neon(" src/services/contractor/ --include="*.ts"

2. Create API endpoints in /api/contractors/:
   - /api/contractors/index.js (GET all, POST new)
   - /api/contractors/[id].js (GET, PUT, DELETE)
   - /api/contractors/onboarding/index.js
   - /api/contractors/onboarding/documents.js
   - /api/contractors/rag/scores.js
   - /api/contractors/search.js

3. Create src/services/api/contractorsApi.ts with:
   - Contractor CRUD operations
   - Onboarding workflow operations
   - Document management
   - RAG score operations
   - Search functionality

4. Update services to use API:
   - Update contractorNeonService.ts
   - Update OnboardingDatabaseService.ts
   - Update RAG scoring services
   - Update search services

5. Test all contractor pages:
   - /app/contractors
   - /app/contractors/new
   - /app/contractors/[id]
   - /app/contractors/onboarding

Success Criteria: No database errors, all contractor operations work through API
```

---

## AGENT 3: Analytics & Dashboard Module
```
I need to fix all direct database connections in analytics and dashboard services.

Current Issues:
- dashboardStatsService.ts uses direct Neon queries
- Project analytics has embedded SQL
- KPI calculations bypass API
- Staff analytics uses direct database

Tasks:
1. Search for all direct DB connections:
   grep -r "createNeonClient\|sql\`\|neon(" src/services/dashboard/ src/services/staff/neon/ --include="*.ts"

2. Create API endpoints in /api/analytics/:
   - /api/analytics/dashboard/stats.js
   - /api/analytics/projects/summary.js
   - /api/analytics/projects/trends.js
   - /api/analytics/kpis/index.js
   - /api/analytics/staff/statistics.js
   - /api/analytics/staff/trends.js

3. Create src/services/api/analyticsApi.ts with:
   - Dashboard statistics
   - Project analytics
   - KPI calculations
   - Staff analytics
   - Trend analysis

4. Update services to use API:
   - Update dashboardStatsService.ts
   - Update project analytics services
   - Update staff/neon/statistics.ts
   - Update team analytics services

5. Test all analytics pages:
   - /app/dashboard
   - /app/analytics
   - /app/kpi-dashboard
   - /app/reports

Success Criteria: All dashboards load without database errors
```

---

## AGENT 4: Remaining Modules Audit
```
I need to audit and fix any remaining direct database connections.

Tasks:
1. Comprehensive search for remaining direct connections:
   grep -r "createNeonClient\|sql\`\|neon(" src/ --include="*.ts" --include="*.tsx" | grep -v "api/" | grep -v "lib/neon"

2. Document any remaining modules with issues

3. Create a priority list of remaining fixes

4. Fix critical issues found

5. Update the migration documentation with findings

Success Criteria: Complete audit report of all remaining database connection issues
```

---

## Coordination Points
1. All agents should follow the SOW module pattern
2. Use consistent API response format: `{ success: boolean, data?: any, error?: string }`
3. Include CORS headers in all API endpoints
4. Test thoroughly before marking complete
5. Update this document with completion status

## Completion Checklist
- [ ] Agent 1: Procurement module complete
- [ ] Agent 2: Contractors module complete  
- [ ] Agent 3: Analytics module complete
- [ ] Agent 4: Audit complete
- [ ] All pages tested and working
- [ ] Documentation updated
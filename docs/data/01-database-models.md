# Section 2.1: Database & Models

## Overview

The FibreFlow React application uses a modern, scalable database architecture built on **Neon PostgreSQL** with **Drizzle ORM** for type-safe database operations. The system employs a domain-driven design approach with well-organized schemas split across functional domains.

### Key Technologies:
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM v0.44.4
- **Migration Tool**: Drizzle Kit v0.31.4
- **Connection Library**: @neondatabase/serverless v1.0.1

### Key Directories and Files:
- `src/lib/neon/` - Core database connection and schema definitions
- `drizzle/` - Migration files and schema snapshots
- `src/lib/neon/schema/` - Domain-specific schema definitions
- `drizzle.config.ts` - Drizzle configuration

### Schema Organization Strategy:
The application follows a **modular domain-driven approach** where schemas are organized by business domains rather than technical concerns, improving maintainability and reducing coupling.

## Database Configuration

### Connection Setup (Neon PostgreSQL)

The application uses **Neon Serverless PostgreSQL** for scalable, serverless database operations:

```typescript
// Connection pool with lazy initialization
export function getNeonConnection(): ReturnType<typeof neon> {
  if (!simpleConnection) {
    const databaseUrl = getDatabaseUrl();
    simpleConnection = neon(databaseUrl);
  }
  return simpleConnection;
}
```

### Drizzle ORM Configuration

```typescript
// drizzle.config.ts
export default {
  schema: [
    './src/lib/neon/schema/*.schema.ts',
    './src/lib/neon/schema/procurement/*.schema.ts',
    './src/lib/neon/schema/procurement/rfq/*.schema.ts',
    './src/lib/neon/schema/analytics/*.schema.ts'
  ],
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: connectionString },
  verbose: true,
  strict: true,
}
```

### Environment Variables

```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NODE_ENV=development  # Optional
```

## Data Models

The application defines **32+ main tables** across 5 domains:

### Core Domain (8 tables)

1. **`users`** - User authentication and profile management
   - Primary key: `uuid` (auto-generated)
   - Key fields: `email`, `role`, `permissions`, `isActive`
   - Indexes: email, role

2. **`clients`** - Client/customer management
   - Key fields: `companyName`, `contactPerson`, `status`, `contractValue`
   - Relationships: One-to-many with projects
   - Indexes: companyName, status, clientType

3. **`projects`** - Project management and tracking
   - Key fields: `projectCode`, `projectName`, `status`, `budget`
   - Relationships: References clients, staff (PM, team lead)
   - JSON fields: `milestones`, `deliverables`, `risks`
   - Indexes: projectCode, clientId, status

4. **`staff`** - Employee and staff management
   - Key fields: `employeeId`, `firstName`, `lastName`, `position`
   - Self-referencing: `reportsTo` (hierarchy)
   - JSON fields: `skills`, `certifications`
   - Indexes: employeeId, email, department

5. **`sow`** - Statement of Work management
   - Key fields: `sowNumber`, `title`, `status`, `budget`
   - JSON fields: `scope`, `deliverables`, `timeline`

6. **`poles`** - Infrastructure pole management
   - Geospatial: `latitude`, `longitude`
   - JSON fields: `images`, `inspectionData`

7. **`meetings`** - Meeting and collaboration
   - JSON fields: `attendees`, `agenda`, `actionItems`

8. **`tasks`** - Task and work item tracking
   - JSON fields: `dependencies`, `subtasks`, `comments`

### Analytics Domain (8 tables)

- `projectAnalytics` - Project performance metrics
- `kpiMetrics` - Key performance indicators
- `financialTransactions` - Financial data tracking
- `materialUsage` - Material consumption analytics
- `staffPerformance` - Employee performance metrics
- `reportCache` - Report caching for performance
- `auditLog` - System audit trail
- `clientAnalytics` - Client-specific analytics

### Contractor Domain (5 tables)

1. **`contractors`** - Contractor company management
   - Financial fields: `annualTurnover`, `creditRating`
   - Compliance fields: `complianceStatus`, business details

2. **`contractorTeams`** - Team management
3. **`teamMembers`** - Individual team member tracking
4. **`projectAssignments`** - Project-contractor assignments
5. **`contractorDocuments`** - Document management

### Procurement Domain (14 tables)

#### BOQ (Bill of Quantities):
- `boqs` - Bill of quantities management
- `boqItems` - Individual BOQ line items
- `boqExceptions` - Exception handling

#### RFQ (Request for Quote):
- `rfqs` - Request for quote management
- `rfqItems` - Individual RFQ line items
- `supplierInvitations` - Supplier invitation tracking
- `quotes` - Quote submissions from suppliers
- `quoteItems` - Individual quote line items
- `quoteDocuments` - Quote-related documents

#### Stock Management:
- `stockPositions` - Current stock levels
- `stockMovements` - Stock movement history
- `stockMovementItems` - Individual movement items
- `cableDrums` - Cable drum inventory
- `drumUsageHistory` - Drum usage tracking

### Optional Domain (8 tables)

- `drops` - Network drop management
- `fiberStringing` - Fiber optic cable installation
- `homeInstallations` - Customer premise installations
- `actionItems` - Action item tracking
- `dailyProgress` - Daily work progress
- `reports` - System reports
- `oneMap` - Mapping integration data
- `nokiaEquipment` - Nokia-specific equipment

## Schema Organization

### Modular Structure
```
src/lib/neon/schema/
├── index.ts                 # Main export index
├── core.schema.ts          # Essential business tables
├── contractor.schema.ts    # Contractor management
├── optional.schema.ts      # Optional/specialized features
├── shared.schema.ts        # Common types and utilities
├── analytics/              # Analytics domain modules
│   ├── kpi.schema.ts
│   ├── metrics.schema.ts
│   └── reports.schema.ts
└── procurement/            # Procurement domain modules
    ├── boq.schema.ts
    ├── stock.schema.ts
    └── rfq/
        ├── request.schema.ts
        └── quote.schema.ts
```

### Naming Conventions
- **Table names**: Plural, lowercase with underscores
- **Field names**: camelCase for TypeScript, snake_case in database
- **Primary keys**: Always `uuid` with auto-generation
- **Foreign keys**: `{entity}Id` pattern
- **Timestamps**: `createdAt`, `updatedAt`, `deletedAt`

## Migrations

### Migration Strategy
```bash
npm run db:generate  # Generate new migrations
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema changes (dev)
npm run db:studio    # Visual database management
```

### Current Migration Status
- Initial schema: `0000_happy_leopardon.sql` (73,762 lines)
- RFQ fixes: `0001_fix_rfq_schema.sql` (9,237 lines)
- Generated types: `schema.ts` (58,596 lines)
- Relations: `relations.ts` (4,817 lines)

## Database Utilities

### Helper Functions
```typescript
export const neonUtils = {
  async ping(): Promise<{success: boolean}>,
  async getInfo(): Promise<any>,
  async getTableStats(): Promise<any>,
  async rawQuery(query: string): Promise<any>
};
```

### Query Builders
Domain-specific query builders in service layers provide reusable, type-safe queries.

### Type Generators
Drizzle provides automatic type generation:
```typescript
export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;
```

## Integration Points

### API Layer Connection
- **Service Layer Pattern**: Domain-specific database services
- **Type-safe operations**: Using Drizzle ORM
- **Centralized error handling**: Consistent error management

### Type Safety Across Layers
- **Database to Service**: Compile-time type safety via Drizzle
- **Service to API**: TypeScript interfaces
- **API to Frontend**: Shared type definitions

### Transaction Handling
```typescript
await neonDb.transaction(async (tx) => {
  await tx.insert(projects).values(projectData);
  await tx.insert(sow).values(sowData);
});
```

## Performance Considerations

### Indexing Strategy
- All foreign keys are indexed
- Frequently queried fields (status, email, etc.)
- Composite indexes for common query patterns
- Unique constraints where appropriate

### Query Optimization
- Lazy connection initialization
- Tagged template literals for parameterized queries
- Selective field retrieval
- Join optimization with proper relationships

### Connection Pooling
- Automatic retry logic with exponential backoff
- Browser detection to prevent client-side connections
- Environment-based configuration
- Connection health monitoring

## Technical Debt & TODOs

### Schema Improvements Needed
1. Missing foreign key relationship declarations
2. Enhanced validation rules at database level
3. Consistent soft delete pattern implementation
4. Ensure all tables have proper audit fields

### Missing Indexes or Constraints
1. Need analysis for composite indexes based on query patterns
2. Add validation constraints for enum-like fields
3. Review business rules for additional unique constraints
4. Consider partial indexes for status-based queries

### Migration Issues
1. Need strategy for handling breaking changes
2. Tools for complex data transformations
3. Implement safe rollback procedures
4. Ensure dev/staging/prod schema consistency

### Performance Optimization Opportunities
1. Implement query performance monitoring
2. Consider connection pooling for high-load scenarios
3. Implement query result caching for read-heavy operations
4. Optimize bulk insert/update operations

The database architecture demonstrates mature design patterns with strong type safety, good performance characteristics, and clear separation of concerns. The modular schema organization positions the application well for future growth and maintenance.
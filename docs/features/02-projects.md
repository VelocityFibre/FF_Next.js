# Section 3.2: Projects Module

## Overview

The Projects module is the **core business entity** of FibreFlow, managing fiber optic network deployment projects from inception through completion. It integrates with virtually every other module in the system.

### Module Scope
- **Project Lifecycle**: Planning → Active → Completed → Closed
- **Resource Management**: Staff allocation, contractor assignments
- **Financial Tracking**: Budget, costs, profitability
- **Progress Monitoring**: Milestones, deliverables, KPIs
- **Document Management**: Project documents and attachments

### Key Features
- Comprehensive project CRUD operations
- Real-time progress tracking
- Multi-level project hierarchy
- Integration with SOW, procurement, and analytics
- Role-based project access

## Database Schema

### Projects Table (`src/lib/neon/schema/core.schema.ts`)

```typescript
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectCode: varchar('project_code', { length: 50 }).notNull().unique(),
  projectName: varchar('project_name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('planning'),
  
  // Relationships
  clientId: uuid('client_id').references(() => clients.id),
  projectManager: uuid('project_manager').references(() => staff.id),
  teamLead: uuid('team_lead').references(() => staff.id),
  
  // Financial
  budget: decimal('budget', { precision: 15, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 15, scale: 2 }),
  profitMargin: decimal('profit_margin', { precision: 5, scale: 2 }),
  
  // Dates
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  actualStartDate: timestamp('actual_start_date'),
  actualEndDate: timestamp('actual_end_date'),
  
  // JSON fields for complex data
  milestones: json('milestones'),
  deliverables: json('deliverables'),
  risks: json('risks'),
  documents: json('documents'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});
```

### Related Tables
- **`sow`**: Statement of Work linked to projects
- **`poles`**: Infrastructure elements per project
- **`tasks`**: Project tasks and activities
- **`projectAnalytics`**: Performance metrics

## API Endpoints

### Core Project APIs (`api/projects/`)

```javascript
// GET /api/projects - List all projects
// Real data from Neon database
export async function getProjects(filters) {
  return await sql`
    SELECT 
      p.*,
      c.company_name as client_name,
      pm.first_name || ' ' || pm.last_name as project_manager_name
    FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN staff pm ON p.project_manager = pm.id
    WHERE p.status = ${filters.status || 'active'}
    ORDER BY p.created_at DESC
  `;
}

// POST /api/projects - Create new project
// Creates real project in database
export async function createProject(data) {
  const [project] = await sql`
    INSERT INTO projects (
      project_code, project_name, client_id, 
      status, budget, start_date
    ) VALUES (
      ${data.projectCode}, ${data.projectName}, ${data.clientId},
      ${data.status}, ${data.budget}, ${data.startDate}
    )
    RETURNING *
  `;
  return project;
}

// GET /api/projects/:id - Get project details
// PUT /api/projects/:id - Update project
// DELETE /api/projects/:id - Delete project (soft delete)
```

## React Components

### Main Components

#### Projects List Page (`src/pages/projects/Projects.tsx`)
```typescript
function ProjectsPage() {
  const { data: projects, isLoading } = useProjects(); // Real data
  const [filter, setFilter] = useState({ status: 'active' });
  
  return (
    <PageContainer>
      <ProjectFilters onFilterChange={setFilter} />
      <ProjectsTable 
        projects={projects} // Real projects from database
        onEdit={(id) => navigate(`/app/projects/${id}/edit`)}
        onDelete={handleDelete}
      />
    </PageContainer>
  );
}
```

#### Project Card (`src/pages/projects/ProjectCard.tsx`)
- Displays project summary with real metrics
- Shows actual progress from database
- Links to detailed project view

#### Projects Summary Cards (`src/pages/projects/ProjectsSummaryCards.tsx`)
- KPI cards showing real statistics
- Total projects, active projects, budget utilization
- All data from actual database queries

### Project Forms

#### Create Project Wizard
- Multi-step form for project creation
- Real-time validation
- Creates actual project in database
- Integrates with client and staff selection

#### Edit Project Form
- Updates real project data
- Maintains audit trail
- Validates business rules

## Service Layer

### Project Service (`src/services/project/`)

```typescript
export class ProjectService {
  // Fetches real data from API/Database
  async getProjects(filters?: ProjectFilters) {
    const response = await fetch('/api/projects?' + new URLSearchParams(filters));
    return response.json(); // Real projects
  }
  
  async createProject(data: NewProject) {
    // Creates real project in Neon database
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async updateProject(id: string, updates: Partial<Project>) {
    // Updates real project
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  }
}
```

## Custom Hooks

### useProjects Hook (`src/hooks/useProjects.ts`)

```typescript
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: (data) => {
      // Invalidate real data cache
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
  });
}
```

## Project Features

### Project Tracking

#### Unified Project Tracker (`/app/projects/:projectId/tracker`)
- Real-time progress from database
- Milestone tracking
- Resource allocation view
- Budget vs actual comparison

#### Pole Tracker (`/app/pole-tracker`)
- Track pole installation progress
- Geospatial visualization (when implemented)
- Real pole data from database

#### Fiber Stringing (`/app/fiber-stringing`)
- Cable installation tracking
- Route management
- Progress reporting

### Project Hierarchy

```typescript
// Project can have sub-projects
interface ProjectHierarchy {
  id: string;
  projectName: string;
  children?: ProjectHierarchy[];
  
  // Real metrics from database
  progress: number;
  budget: number;
  actualCost: number;
}
```

### Project Status Workflow

```typescript
enum ProjectStatus {
  PLANNING = 'planning',
  APPROVED = 'approved',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

// Status transitions (business rules)
const validTransitions = {
  planning: ['approved', 'cancelled'],
  approved: ['active', 'on_hold', 'cancelled'],
  active: ['on_hold', 'completed'],
  on_hold: ['active', 'cancelled'],
  completed: ['closed'],
  closed: [], // Terminal state
};
```

## Integration Points

### Client Integration
- Projects belong to clients
- Client contract value affects project budget
- Client contacts linked to project communications

### Staff Integration
- Project manager assignment
- Team lead assignment
- Resource allocation tracking

### SOW Integration
- Projects linked to Statement of Work
- SOW defines project scope and deliverables
- Budget derived from SOW

### Procurement Integration
- Project-specific procurement
- Budget allocation for materials
- RFQ linked to projects

### Analytics Integration
- Real-time project analytics
- KPI tracking per project
- Financial performance metrics

## Project Calculations

### Budget Utilization
```typescript
function calculateBudgetUtilization(project: Project) {
  if (!project.budget) return 0;
  return (project.actualCost / project.budget) * 100;
}
```

### Project Progress
```typescript
function calculateProgress(project: Project) {
  const completedMilestones = project.milestones?.filter(m => m.completed) || [];
  const totalMilestones = project.milestones?.length || 1;
  return (completedMilestones.length / totalMilestones) * 100;
}
```

### Profitability
```typescript
function calculateProfit(project: Project) {
  return project.budget - project.actualCost;
}

function calculateProfitMargin(project: Project) {
  if (!project.budget) return 0;
  return ((project.budget - project.actualCost) / project.budget) * 100;
}
```

## Real Data Examples

### Sample Project Query Result
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "projectCode": "PROJ-2024-001",
  "projectName": "City Center Fiber Deployment",
  "clientId": "client-uuid",
  "clientName": "Metro Telecom",
  "status": "active",
  "budget": 500000.00,
  "actualCost": 287500.00,
  "progress": 57.5,
  "projectManager": "John Smith",
  "startDate": "2024-01-15",
  "endDate": "2024-06-30"
}
```

### Create Project Request
```json
{
  "projectCode": "PROJ-2024-002",
  "projectName": "Suburban Network Expansion",
  "clientId": "client-uuid",
  "budget": 750000,
  "startDate": "2024-02-01",
  "endDate": "2024-08-31",
  "projectManager": "staff-uuid"
}
```

## Performance Considerations

### Query Optimization
- Indexed on: `projectCode`, `status`, `clientId`, `projectManager`
- Paginated queries for large datasets
- Selective field retrieval for list views

### Caching Strategy
- 5-minute cache for project lists
- 1-minute cache for project details
- Immediate invalidation on mutations

## Next.js Migration Impact

### Server Components (Future)
```typescript
// app/projects/page.tsx
export default async function ProjectsPage() {
  // Direct database query in server component
  const projects = await db.query.projects.findMany({
    with: {
      client: true,
      projectManager: true,
    },
  });
  
  return <ProjectList projects={projects} />;
}
```

### API Routes (Future)
```typescript
// app/api/projects/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  const projects = await db.query.projects.findMany({
    where: status ? eq(projects.status, status) : undefined,
  });
  
  return NextResponse.json(projects);
}
```

## Best Practices

### Do's
- ✅ Always use real data from database
- ✅ Validate project codes for uniqueness
- ✅ Maintain audit trail for changes
- ✅ Check budget constraints before updates

### Don'ts
- ❌ Don't hard-delete projects (use soft delete)
- ❌ Don't bypass status workflow rules
- ❌ Don't allow budget exceeding without approval
- ❌ Don't create projects without client assignment

## Technical Debt

### Current Issues
1. Geospatial features not fully implemented
2. Document management needs enhancement
3. Project templates not implemented
4. Gantt chart visualization missing

### Future Enhancements
1. Project templates for quick creation
2. Advanced resource planning
3. Risk management dashboard
4. Integration with external PM tools
5. Mobile app for field updates

## Summary

The Projects module is the central hub of FibreFlow, managing real fiber deployment projects with comprehensive tracking, financial management, and integration across all system modules. All data is real from the Neon database, ensuring accurate project status and metrics at all times.
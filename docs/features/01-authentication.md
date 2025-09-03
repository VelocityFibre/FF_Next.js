# Section 3.1: Authentication & Users (Development Mode)

## Overview

The FibreFlow application currently operates in **development mode** with simplified authentication to enable fast development while using **real data from Neon database**. The system is designed to easily switch between simplified auth (current) and production auth (Clerk) when ready.

### Current Development Setup
- **Simplified Authentication**: Automatic login with super admin privileges
- **Real Database Data**: Connected to Neon PostgreSQL (no mock data)
- **No User Management**: Single dev user for authentication only
- **No Login Required**: Bypass authentication for rapid testing
- **Full Permissions**: All features accessible without restrictions

### Key Principle
**Use real data everywhere** - This ensures APIs, database connections, and data flows are actually working correctly.

## Development Mode Authentication

### Simplified Auth with Real Data

```typescript
// src/contexts/AuthContext.tsx (Development Mode)
const devUser = {
  uid: 'dev-user-001',
  email: 'dev@fibreflow.com',
  displayName: 'Development User',
  role: 'SUPER_ADMIN',
  permissions: ['*'], // All permissions granted
  isActive: true,
};

// IMPORTANT: All data comes from real Neon database
// Only the authentication is simplified, not the data
```

### How It Works

1. **Automatic Login**: Skip login screen, but connect to real database
2. **Real API Calls**: All APIs hit actual Neon database
3. **Real Data Operations**: CRUD operations affect real database
4. **Database Verification**: You can verify changes in Drizzle Studio

### Benefits for Development

- ✅ **Real Data Confidence**: Know that database/APIs are working
- ✅ **No Mock Confusion**: What you see is what's in the database
- ✅ **Fast Testing**: No login friction, real data feedback
- ✅ **Database Debugging**: Can inspect actual database state

## Database Connection (Real)

### Neon Connection Active

```typescript
// src/lib/neon/connection.ts
const sql = neon(process.env.DATABASE_URL); // Real Neon connection

// All queries hit real database
export async function getProjects() {
  return await neonDb.query.projects.findMany(); // Real data
}
```

### Verify Database Connection

```bash
# Check database connection
npm run db:studio  # Opens Drizzle Studio to see real data

# Test database health
curl http://localhost:3001/api/health  # Should return real DB status
```

## API Layer (Real Data)

### Current API Handlers

```javascript
// api/projects/index.js
export default async function handler(req, res) {
  // Simplified auth (no login required)
  // But REAL database queries
  
  const sql = neon(process.env.DATABASE_URL); // Real connection
  
  switch (req.method) {
    case 'GET':
      // Returns REAL projects from Neon database
      const projects = await sql`SELECT * FROM projects`;
      return res.json(projects);
    
    case 'POST':
      // Creates REAL project in database
      const [newProject] = await sql`
        INSERT INTO projects (name, status) 
        VALUES (${req.body.name}, ${req.body.status})
        RETURNING *
      `;
      return res.json(newProject);
  }
}
```

### Service Layer (Real Data)

```typescript
// src/services/api/projectApi.ts
export class ProjectApiService {
  async getProjects() {
    // Fetches from real API endpoint
    const response = await fetch('/api/projects');
    return response.json(); // Real data from Neon
  }
  
  async createProject(data: NewProject) {
    // Creates real project in database
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json(); // Real created project
  }
}
```

## React Query (Real Data)

```typescript
// src/hooks/useProjects.ts
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // Fetches REAL projects from database via API
      const response = await fetch('/api/projects');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// In component
function ProjectList() {
  const { data: projects } = useProjects(); // Real projects from Neon
  
  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>
          {project.name} {/* Real project name from database */}
        </div>
      ))}
    </div>
  );
}
```

## Development Workflow

### Current Workflow with Real Data

1. **Start app** → Automatically logged in (auth simplified)
2. **View data** → See real data from Neon database
3. **Create/Update/Delete** → Real database operations
4. **Verify changes** → Check in Drizzle Studio or database

### Database Tools

```bash
# View real data in database
npm run db:studio

# Run migrations (affects real database)
npm run db:migrate

# Check what's actually in database
npm run db:query "SELECT * FROM projects"
```

## Verifying Real Data

### Quick Checks

1. **Create a project** in the app
2. **Open Drizzle Studio**: `npm run db:studio`
3. **See the real project** in the database
4. **Refresh app** - project persists (it's real!)

### API Testing

```bash
# Get real projects
curl http://localhost:3001/api/projects

# Create real project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "status": "active"}'

# Verify in database
npm run db:studio  # Should see "Test Project"
```

## No Mock Data Policy

### What's Real
- ✅ **Database**: All data from Neon PostgreSQL
- ✅ **API Responses**: Real data from database
- ✅ **CRUD Operations**: Real creates, updates, deletes
- ✅ **Relationships**: Real foreign keys and joins
- ✅ **Calculations**: Real aggregations and analytics

### What's Simplified (Auth Only)
- 🔧 **Login**: Automatic (no login screen)
- 🔧 **User**: Single dev user (not from database)
- 🔧 **Permissions**: All granted (not checked)
- 🔧 **Sessions**: Not managed (always valid)

## Environment Configuration

```bash
# .env.local
DATABASE_URL=postgresql://... # Real Neon connection
NEXT_PUBLIC_API_URL=http://localhost:3001 # Real API

# Development mode (auth simplified, data real)
NODE_ENV=development
NEXT_PUBLIC_DEV_MODE=true # Simplifies auth only
```

## Common Development Tasks

### Seed Real Data

```bash
# Add test data to real database
npm run db:seed

# Or manually via SQL
npm run db:query "INSERT INTO projects (name, status) VALUES ('Dev Project', 'active')"
```

### Clear Real Data

```bash
# Be careful - this affects real database!
npm run db:query "TRUNCATE TABLE projects CASCADE"
```

### Inspect Real Data

```bash
# Multiple ways to verify real data
npm run db:studio          # Visual interface
npm run db:query "SELECT COUNT(*) FROM projects"  # Direct query
curl http://localhost:3001/api/projects  # Via API
```

## Troubleshooting Real Data

### Database Not Connecting?

```bash
# Check connection
curl http://localhost:3001/api/health

# Response should show:
{
  "database": "connected",
  "timestamp": "2024-01-15T..."  # Real timestamp from DB
}
```

### Data Not Showing?

1. **Check database directly**: `npm run db:studio`
2. **Check API response**: Open Network tab in browser
3. **Check console errors**: Real database errors will appear

### Changes Not Persisting?

- Verify transaction completed
- Check for database constraints
- Look for error messages (real DB will throw real errors)

## Best Practices

### Do's
- ✅ Use real database for all data
- ✅ Verify changes in Drizzle Studio
- ✅ Test with real CRUD operations
- ✅ Monitor real API responses

### Don'ts
- ❌ Don't use mock data (confusing)
- ❌ Don't bypass database (use real queries)
- ❌ Don't ignore database errors
- ❌ Don't assume data exists (check database)

## Migration to Production

When ready for production auth:

1. **Keep real data connection** (no change needed)
2. **Enable Clerk authentication** (replace simplified auth)
3. **Add user management** (connected to real users table)
4. **Enable permission checks** (using real roles from database)

## Summary

The authentication is simplified for development speed, but **all data is real from the Neon database**. This approach ensures you're always working with actual data flows, can verify database operations are working, and eliminates confusion about whether features are actually connected to the database. The simplified auth removes login friction while maintaining confidence in your data layer.
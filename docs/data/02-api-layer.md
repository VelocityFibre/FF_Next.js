# Section 2.2: API Layer

## Overview

The FibreFlow application is **actively migrating** from a React/Express architecture to Next.js with Clerk authentication. This creates a dual API architecture during the transition period.

### Current State vs Target State

| Aspect | Current (React/Express) | Target (Next.js) |
|--------|-------------------------|------------------|
| **API Runtime** | Express server on port 3001 | Next.js API Routes (serverless) |
| **Deployment** | Vercel Functions (adapted Express) | Native Next.js on Vercel |
| **Authentication** | Mock/Firebase (being removed) | Clerk (integrated) |
| **File Structure** | `/api/*.js` (Vercel functions) | `/app/api/*/route.ts` (App Router) |
| **Database** | Direct Neon connections | Same (Neon + Drizzle) |
| **CORS** | Required (separate origins) | Not needed (same origin) |

### Migration Status
- ✅ Next.js project initialized (`nextjs-migration/`)
- ✅ Clerk authentication configured
- 🚧 API routes being migrated
- 🚧 Frontend components being ported
- ⏳ Express server still required for production

## Next.js API Architecture (Target)

### Next.js App Router API Structure

```
nextjs-migration/
├── app/
│   ├── api/                    # API routes (Next.js 14+)
│   │   ├── auth/               # Clerk webhooks
│   │   │   └── route.ts
│   │   ├── projects/
│   │   │   ├── route.ts        # GET /api/projects, POST /api/projects
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET/PUT/DELETE /api/projects/:id
│   │   ├── clients/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   └── trpc/               # Future: tRPC for type-safe APIs
│   │       └── [trpc]/
│   │           └── route.ts
│   ├── layout.tsx              # Root layout with providers
│   └── middleware.ts           # Clerk auth middleware
```

### Next.js API Route Pattern

**New Pattern (Next.js App Router):**
```typescript
// app/api/projects/route.ts
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { neonDb } from '@/lib/neon/db';

// GET /api/projects
export async function GET(request: Request) {
  const { userId, sessionClaims } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const projects = await neonDb.query.projects.findMany({
      limit,
      offset: (page - 1) * limit,
      with: {
        client: true,
        projectManager: true,
      },
    });

    return NextResponse.json({
      data: projects,
      meta: {
        page,
        limit,
        total: await getProjectCount(),
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects
export async function POST(request: Request) {
  const { userId, sessionClaims } = auth();
  
  if (!hasPermission(sessionClaims, 'projects.create')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  const body = await request.json();
  
  // Validate and create project
  const project = await neonDb.insert(projects).values({
    ...body,
    createdBy: userId,
  }).returning();

  return NextResponse.json(project[0]);
}
```

### Clerk Authentication Integration

**Middleware Configuration (`middleware.ts`):**
```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/api/webhooks/clerk',
  ],
  ignoredRoutes: [
    '/api/health',
    '/_next/static/(.*)',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**Protected API Route:**
```typescript
// app/api/admin/users/route.ts
import { auth, currentUser } from '@clerk/nextjs';

export async function GET() {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check custom claims for admin role
  if (user.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Proceed with admin operation
  const users = await neonDb.query.users.findMany();
  return NextResponse.json(users);
}
```

## Current Express/Vercel Functions (Being Migrated)

### Current Structure (Still in Use)

The existing 47 API endpoints follow the Vercel Functions pattern but will be migrated to Next.js:

```javascript
// Current: api/projects/index.js (Vercel Function)
export default async function handler(req, res) {
  // CORS headers (needed for separate origins)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Mock auth (being replaced by Clerk)
  const user = getMockUser();
  
  // Handle request...
}
```

**Will become:**
```typescript
// Future: app/api/projects/route.ts (Next.js)
export async function GET() {
  const { userId } = auth(); // Clerk auth
  // No CORS needed
  // Handle request...
}
```

## API Migration Strategy

### Phase 1: Parallel Operation (Current)
```
User Request
    ↓
[Next.js App] ←→ [Clerk Auth]
    ↓
[API Router]
    ├→ New endpoints → [Next.js API Routes]
    └→ Legacy endpoints → [Express/Vercel Functions]
              ↓
         [Neon Database]
```

### Phase 2: Gradual Migration
1. **High-priority endpoints first**: Authentication, user management
2. **CRUD operations**: Projects, clients, staff
3. **Complex workflows**: Procurement, analytics
4. **Background jobs**: Reports, data processing

### Phase 3: Complete Migration
```
User Request
    ↓
[Next.js App] ←→ [Clerk Auth]
    ↓
[Next.js API Routes]
    ↓
[Neon Database]
```

## Service Layer Evolution

### Current Service Pattern
```typescript
// src/services/api/projectApi.ts
export class ProjectApiService {
  private baseUrl = process.env.VITE_API_URL || 'http://localhost:3001';
  
  async getProjects() {
    const response = await fetch(`${this.baseUrl}/api/projects`);
    return response.json();
  }
}
```

### Next.js Service Pattern
```typescript
// nextjs-migration/lib/api/projects.ts
import { auth } from '@clerk/nextjs';

export async function getProjects() {
  // Direct database access in server components
  const { userId } = auth();
  
  return await neonDb.query.projects.findMany({
    where: eq(projects.userId, userId),
  });
}

// For client components, use fetch
export async function getProjectsClient() {
  const response = await fetch('/api/projects');
  return response.json();
}
```

## Server Components vs API Routes

### Server Components (Preferred in Next.js)
```typescript
// app/projects/page.tsx
import { auth } from '@clerk/nextjs';
import { neonDb } from '@/lib/neon/db';

export default async function ProjectsPage() {
  const { userId } = auth();
  
  // Direct database access - no API call needed
  const projects = await neonDb.query.projects.findMany({
    where: eq(projects.userId, userId),
  });
  
  return <ProjectList projects={projects} />;
}
```

### API Routes (For Client Components/External Access)
```typescript
// app/api/projects/route.ts
export async function GET() {
  // Used by:
  // 1. Client components that need dynamic data
  // 2. External API consumers
  // 3. Webhook integrations
}
```

## Authentication Migration

### Current (Mock/Firebase)
```javascript
// Being removed
const user = {
  id: 'mock-user-id',
  role: 'SUPER_ADMIN',
  permissions: ['*']
};
```

### Target (Clerk)
```typescript
// Clerk user with metadata
const user = await currentUser();
const role = user?.publicMetadata?.role as UserRole;
const permissions = user?.privateMetadata?.permissions as Permission[];

// Role-based access control
if (!hasPermission(permissions, 'projects.write')) {
  return new Response('Forbidden', { status: 403 });
}
```

## Performance Optimizations in Next.js

### Request Memoization
```typescript
import { unstable_cache } from 'next/cache';

const getProjects = unstable_cache(
  async (userId: string) => {
    return await neonDb.query.projects.findMany({
      where: eq(projects.userId, userId),
    });
  },
  ['projects'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['projects'],
  }
);
```

### Edge Runtime (Where Applicable)
```typescript
// app/api/health/route.ts
export const runtime = 'edge'; // Faster cold starts

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
```

### Streaming Responses
```typescript
// app/api/reports/large/route.ts
export async function GET() {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // Stream large datasets
  processLargeDataset(writer);
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
    },
  });
}
```

## Error Handling in Next.js

### Global Error Boundary
```typescript
// app/api/error.tsx
'use client';

export default function ApiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### API Error Responses
```typescript
// Consistent error format
export function apiError(message: string, status: number = 500) {
  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
```

## Type Safety with tRPC (Future)

### Planned tRPC Integration
```typescript
// server/routers/projects.ts
export const projectsRouter = router({
  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.projects.findMany({
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });
    }),
    
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(projects).values(input).returning();
    }),
});

// Client usage with full type safety
const { data } = trpc.projects.list.useQuery({ page: 1 });
```

## Migration Timeline & Impact

### Immediate Benefits (Already Realized)
- ✅ Clerk authentication ready
- ✅ Better DX with Next.js tooling
- ✅ Improved TypeScript support

### Short-term Benefits (During Migration)
- 🚧 Faster page loads with SSR/SSG
- 🚧 Reduced client-server latency
- 🚧 Better SEO capabilities

### Long-term Benefits (Post-Migration)
- ⏳ Simplified deployment (single app)
- ⏳ Lower infrastructure costs
- ⏳ Better performance with RSC
- ⏳ Type-safe API with tRPC

## Technical Debt & Considerations

### Current Challenges
1. **Dual maintenance**: Supporting both Express and Next.js during migration
2. **State management**: Adapting client-side state for server components
3. **Testing**: Need new testing strategies for Next.js
4. **Caching**: Different caching strategies between architectures

### Migration Risks
1. **Data consistency**: Ensure both APIs use same database schema
2. **Authentication sync**: Gradual move from mock to Clerk
3. **Feature parity**: Ensuring all features work in new architecture
4. **Performance regression**: Monitor performance during migration

### Best Practices for Migration
1. **Feature flags**: Toggle between old/new implementations
2. **Incremental adoption**: Migrate one module at a time
3. **Parallel testing**: Run both systems in parallel initially
4. **Rollback plan**: Ability to revert if issues arise

The API layer is undergoing a significant transformation that will ultimately result in a more performant, type-safe, and maintainable architecture with Next.js and Clerk.
# Database Connection Best Practices

## Overview
This guide establishes best practices for database connections in the FF_React_Neon application to ensure security, maintainability, and proper separation of concerns.

## Core Principles

### 1. Never Connect Directly from Browser
- **❌ WRONG**: Importing database clients in frontend code
- **✅ CORRECT**: Use API endpoints for all database operations

### 2. API-First Architecture
All database operations must go through API endpoints:
```
Browser → API Service → API Endpoint → Database
```

## Implementation Guidelines

### Frontend Services (src/services/)

#### ❌ What NOT to Do
```typescript
// NEVER do this in frontend code
import { neon } from '@neondatabase/serverless';
import { sql } from '@/lib/neon';
import { createNeonClient } from '@/lib/neon-sql';

const result = await sql`SELECT * FROM users`;
```

#### ✅ What to Do Instead
```typescript
// Use API services
import { userApi } from '@/services/api/userApi';

const users = await userApi.getAll();
```

### Creating New Features

When adding new database-backed features:

1. **Create API Endpoints** (`/api/[feature]/`)
   ```javascript
   // api/users/index.js
   import { neon } from '@neondatabase/serverless';
   const sql = neon(process.env.DATABASE_URL);

   export default async function handler(req, res) {
     // API endpoint can use direct database connections
     const users = await sql`SELECT * FROM users`;
     res.json({ success: true, data: users });
   }
   ```

2. **Create Frontend API Service** (`src/services/api/`)
   ```typescript
   // src/services/api/userApi.ts
   export const userApi = {
     async getAll() {
       const response = await fetch('/api/users');
       const result = await response.json();
       return result.data;
     }
   };
   ```

3. **Use in Components/Hooks**
   ```typescript
   // src/hooks/useUsers.ts
   import { userApi } from '@/services/api/userApi';
   
   export function useUsers() {
     return useQuery({
       queryKey: ['users'],
       queryFn: userApi.getAll
     });
   }
   ```

## File Structure

### Allowed Database Access
These locations CAN use direct database connections:
- `/api/**/*.js` - API route handlers
- `/lib/neon.ts` - Database configuration
- Server-side scripts
- Migration files

### Forbidden Database Access
These locations MUST NOT use direct database connections:
- `/src/**/*.ts` - All frontend code
- `/src/**/*.tsx` - All React components
- `/src/services/**` - All service files
- `/src/hooks/**` - All React hooks

## Security Considerations

1. **Environment Variables**
   - Database URLs must use `DATABASE_URL` (no VITE_ prefix)
   - Never expose database credentials to frontend

2. **API Security**
   - Always validate input in API endpoints
   - Use proper authentication/authorization
   - Implement rate limiting for public endpoints

3. **Error Handling**
   - Never expose database errors to frontend
   - Log errors server-side
   - Return generic error messages to clients

## Testing

### Integration Test
Run the integration test to ensure compliance:
```bash
npm test no-direct-db-connections
```

This test will:
- Scan all frontend code for direct database imports
- Verify API services exist
- Check that API endpoints are properly configured

## Common Patterns

### API Endpoint Pattern
```javascript
// api/[resource]/index.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        const data = await sql`SELECT * FROM table`;
        res.json({ success: true, data });
        break;
      // ... other methods
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
```

### Frontend API Service Pattern
```typescript
// src/services/api/resourceApi.ts
const API_BASE = import.meta.env.DEV ? 'http://localhost:5173/api' : '/api';

export const resourceApi = {
  async getAll(): Promise<Resource[]> {
    const response = await fetch(`${API_BASE}/resources`);
    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }
    const result = await response.json();
    return result.data || [];
  },

  async create(data: Partial<Resource>): Promise<Resource> {
    const response = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create resource');
    }
    const result = await response.json();
    return result.data;
  },
};
```

## Migration Checklist

When migrating existing code:

- [ ] Identify all files using direct database connections
- [ ] Create API endpoints for each operation
- [ ] Create frontend API service
- [ ] Update service files to use API
- [ ] Update components/hooks to use new service
- [ ] Test all functionality
- [ ] Remove database imports from frontend
- [ ] Run integration test to verify

## Troubleshooting

### Common Errors

1. **"No database connection string was provided"**
   - Cause: Frontend code trying to connect to database
   - Fix: Use API endpoints instead

2. **"Cannot find module '@neondatabase/serverless'"**
   - Cause: Database package imported in frontend
   - Fix: Move logic to API endpoint

3. **"process is not defined"**
   - Cause: Trying to access process.env in browser
   - Fix: Environment variables only in API routes

## Resources

- [Database Migration Plan](./database-connection-migration-plan.md)
- [API Documentation](./api-documentation.md)
- [Vercel API Routes](https://vercel.com/docs/functions)
- [Neon Database Docs](https://neon.tech/docs)
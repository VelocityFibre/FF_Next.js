# Next.js API Route Mapping

This document provides a comprehensive mapping of API endpoints from the old backend API to the new Next.js API routes. All Next.js API routes proxy requests to the backend server while adding authentication and request/response logging.

## Base Configuration

### Environment Variables
```bash
# Backend API server URL
BACKEND_API_URL=http://localhost:3001

# Next.js API base URL (frontend)
NEXT_PUBLIC_API_URL=/api
```

### Authentication
All API routes use Clerk authentication. Each request includes:
- `X-User-Id`: Current user ID from Clerk
- `X-Request-Id`: Unique request identifier for tracing

## API Route Mappings

### Database Operations

| Old Endpoint | New Next.js Route | Method | Description |
|-------------|-------------------|---------|-------------|
| `/api/query` | `/api/database/query` | POST | Execute database queries |
| `/api/health` | `/api/database/health` | GET | Database health check |
| `/api/health` | `/api/database/info` | GET | Database version info |

### Statement of Work (SOW)

| Old Endpoint | New Next.js Route | Method | Description |
|-------------|-------------------|---------|-------------|
| `/api/sow?projectId={id}` | `/api/sow/project/{projectId}` | GET | Get all SOW data for project |
| `/api/sow/summary?projectId={id}` | `/api/sow/project/{projectId}/summary` | GET | Get SOW summary stats |
| `/api/sow/poles?projectId={id}&includeDropCount=true` | `/api/sow/project/{projectId}/poles-with-drops` | GET | Get poles with drop counts |
| `/api/sow/health` | `/api/sow/tables/check` | GET | Check SOW tables exist |
| `/api/sow/import` | `/api/sow/project/{projectId}/import` | POST | Import SOW data |
| `/api/sow/import-status?importId={id}` | `/api/sow/import/{importId}/status` | GET | Get import status |

### Projects

| Old Endpoint | New Next.js Route | Method | Description |
|-------------|-------------------|---------|-------------|
| `/api/projects` | `/api/projects` | GET | Get all projects |
| `/api/projects` | `/api/projects` | POST | Create new project |
| `/api/projects/{id}` | `/api/projects/{id}` | GET | Get project by ID |
| `/api/projects/{id}` | `/api/projects/{id}` | PUT | Update project |
| `/api/projects/{id}` | `/api/projects/{id}` | DELETE | Delete project |
| `/api/projects/search?q={query}` | `/api/projects/search?q={query}` | GET | Search projects |
| `/api/analytics/projects/summary` | `/api/projects/stats` | GET | Get project statistics |

### Clients

| Old Endpoint | New Next.js Route | Method | Description |
|-------------|-------------------|---------|-------------|
| `/api/clients` | `/api/clients` | GET | Get all clients |
| `/api/clients` | `/api/clients` | POST | Create new client |
| `/api/clients/{id}` | `/api/clients/{id}` | GET | Get client by ID |
| `/api/clients/{id}` | `/api/clients/{id}` | PUT | Update client |
| `/api/clients/{id}` | `/api/clients/{id}` | DELETE | Delete client |

## Request/Response Format

### Standard Response Format
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
  requestId?: string;
}
```

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  path: string;
  requestId?: string;
}
```

## Authentication Headers

All authenticated requests include these headers:
```typescript
{
  'Content-Type': 'application/json',
  'X-User-Id': string,      // Clerk user ID
  'X-Request-Id': string,   // Unique request ID
}
```

## Service Layer Updates

### API Configuration
- **Base Service Class**: `nextjs-migration/src/services/base/BaseService.ts`
- **API Client**: `nextjs-migration/src/services/api/config.ts`
- **Timeout**: 30 seconds
- **Retry Logic**: Built into fetch with timeout handling

### Updated Services

1. **NeonServiceAPI** (`nextjs-migration/src/services/neonServiceAPI.ts`)
   - Uses new API client with proper error handling
   - Updated endpoints to use Next.js routes
   - Improved TypeScript interfaces

2. **ProjectService** (`nextjs-migration/src/services/projects/projectService.ts`)
   - Complete CRUD operations
   - Search and filtering capabilities
   - Statistics and team management

3. **ClientService** (`nextjs-migration/src/services/clients/clientService.ts`)
   - Full client management
   - Validation endpoints
   - Project and invoice relationships

## Error Handling

### API Route Error Handling
- Authentication errors (401)
- Validation errors (400)
- Backend proxy errors (502/503)
- Internal server errors (500)

### Service Layer Error Handling
- Network timeout handling
- Retry logic for failed requests
- Consistent error message formatting
- Proper TypeScript error types

## Logging

All API routes include:
- Request/response timing
- User context logging
- Error stack traces
- Request ID tracing

### Log Format
```
[API] {METHOD} {PATH} - {STATUS} in {TIME}ms
```

## Migration Notes

### Breaking Changes
1. **Authentication**: Firebase Auth → Clerk Auth
2. **Base URLs**: Direct API calls → Next.js API routes
3. **Error Format**: Backend errors → Standardized Next.js format
4. **Headers**: Firebase tokens → Clerk user IDs

### Backward Compatibility
- All existing API interfaces maintained
- Service method signatures unchanged
- Response formats standardized but compatible

## Testing

### API Route Testing
```bash
# Test database health
curl -H "Authorization: Bearer {clerk-token}" \
  http://localhost:3000/api/database/health

# Test project creation
curl -X POST \
  -H "Authorization: Bearer {clerk-token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "code": "TEST"}' \
  http://localhost:3000/api/projects
```

### Service Testing
```typescript
import { projectService } from '@/services/projects/projectService';

// Test service methods
const projects = await projectService.getAllProjects();
const project = await projectService.createProject({
  name: 'Test Project',
  code: 'TEST',
});
```

## Performance Considerations

1. **Connection Pooling**: Backend handles database connections
2. **Caching**: API responses can be cached at Next.js level
3. **Rate Limiting**: Implement at API route level if needed
4. **Monitoring**: Built-in request/response timing

## Security

1. **Authentication**: Required for all routes except health checks
2. **Authorization**: User context passed to backend
3. **CORS**: Configured for frontend domains
4. **Input Validation**: Performed at API route level
5. **Error Sanitization**: Prevents information leakage

## Next Steps

1. **Add remaining API routes** for analytics, procurement, etc.
2. **Implement caching strategy** for frequently accessed data
3. **Add rate limiting** for API protection
4. **Set up monitoring** and alerting
5. **Create API documentation** using tools like Swagger/OpenAPI
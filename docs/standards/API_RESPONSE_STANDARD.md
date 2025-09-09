# API Response Standardization Guide

## Overview
This document outlines the standardized API response format and the migration process for updating existing API routes to use the new `apiResponse` helper.

## Response Helper Location
- **File**: `/src/lib/apiResponse.ts`
- **Import**: `import { apiResponse, ErrorCode } from '../src/lib/apiResponse';`

## Standard Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "meta": {
    "timestamp": "2025-09-04T12:00:00Z",
    "requestId": "optional-request-id"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  },
  "meta": {
    "timestamp": "2025-09-04T12:00:00Z"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  },
  "meta": {
    "timestamp": "2025-09-04T12:00:00Z"
  }
}
```

## Common Response Methods

### Success Responses
```typescript
// 200 OK - General success
apiResponse.success(res, data, message?, statusCode?, meta?)

// 201 Created - Resource created
apiResponse.created(res, data, message?, meta?)

// 204 No Content
apiResponse.noContent(res)

// Paginated data
apiResponse.paginated(res, data, { page, pageSize, total }, message?, meta?)
```

### Error Responses
```typescript
// 400 Bad Request - Validation errors
apiResponse.validationError(res, { field: 'error message' })

// 401 Unauthorized
apiResponse.unauthorized(res, message?)

// 403 Forbidden
apiResponse.forbidden(res, message?)

// 404 Not Found
apiResponse.notFound(res, resourceName, identifier?)

// 405 Method Not Allowed
apiResponse.methodNotAllowed(res, method, allowedMethods)

// 500 Internal Server Error
apiResponse.internalError(res, error, message?)

// Database errors
apiResponse.databaseError(res, error, message?)
```

## Migration Examples

### Before (Old Pattern)
```typescript
// Success response
res.status(200).json({ success: true, data: projects });

// Error response
res.status(404).json({ 
  success: false, 
  data: null, 
  message: 'Project not found' 
});

// Authentication check
if (!userId) {
  return res.status(401).json({ 
    success: false, 
    data: null, 
    message: 'Unauthorized' 
  });
}
```

### After (New Pattern)
```typescript
// Success response
apiResponse.success(res, projects);

// Error response
apiResponse.notFound(res, 'Project', projectId);

// Authentication check
if (!userId) {
  return apiResponse.unauthorized(res);
}
```

## Error Codes

The following standard error codes are available in the `ErrorCode` enum:

### Client Errors (4xx)
- `BAD_REQUEST` - 400
- `UNAUTHORIZED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `METHOD_NOT_ALLOWED` - 405
- `CONFLICT` - 409
- `VALIDATION_ERROR` - 422
- `RATE_LIMIT` - 429
- `PAYLOAD_TOO_LARGE` - 413

### Server Errors (5xx)
- `INTERNAL_ERROR` - 500
- `DATABASE_ERROR` - 500
- `SERVICE_UNAVAILABLE` - 503
- `GATEWAY_TIMEOUT` - 504

### Business Logic Errors
- `BUSINESS_RULE_VIOLATION` - 422
- `INSUFFICIENT_PERMISSIONS` - 403
- `RESOURCE_LOCKED` - 423
- `DEPENDENCY_ERROR` - 424

## CORS Handling

```typescript
// Set CORS headers
apiResponse.setCorsHeaders(res);

// Handle OPTIONS request
if (req.method === 'OPTIONS') {
  return apiResponse.handleOptions(res);
}
```

## Migration Checklist

When migrating an API route:

1. ✅ Import the apiResponse helper
2. ✅ Replace CORS header setup with `apiResponse.setCorsHeaders()`
3. ✅ Replace OPTIONS handling with `apiResponse.handleOptions()`
4. ✅ Update authentication checks to use `apiResponse.unauthorized()`
5. ✅ Replace success responses with appropriate helper methods
6. ✅ Replace error responses with appropriate error methods
7. ✅ Update try/catch blocks to use `apiResponse.internalError()` or `apiResponse.databaseError()`
8. ✅ Add validation error handling where appropriate
9. ✅ Use paginated responses for list endpoints where applicable
10. ✅ Test the migrated endpoint thoroughly

## Already Migrated Routes

The following routes have been migrated to use the new response standard:

- ✅ `/api/projects/index.ts` - Full CRUD operations with consistent responses
- ✅ `/api/field/tasks/index.ts` - Paginated responses and error handling

## Routes Pending Migration

- ⏳ `/api/procurement/rfq/index.ts`
- ⏳ `/api/procurement/boq/index.ts`
- ⏳ `/api/procurement/stock/index.ts`
- ⏳ `/api/projects/[id].ts`
- ⏳ `/api/projects/search.ts`
- ⏳ `/api/projects/stats.ts`
- ⏳ `/api/poles/index.ts`
- ⏳ `/api/database/query.ts`
- ⏳ `/api/database/info.ts`
- ⏳ `/api/database/health.ts`
- ⏳ `/api/health/db.ts`
- ⏳ And many more...

## Testing Guidelines

After migrating a route, test the following scenarios:

1. **Success Cases**
   - Verify correct status codes (200, 201, 204)
   - Check response structure matches the standard format
   - Validate data is returned correctly

2. **Error Cases**
   - Test validation errors return 422 with field-specific errors
   - Verify authentication errors return 401
   - Check not found errors return 404 with appropriate message
   - Test method not allowed returns 405 with Allow header

3. **Edge Cases**
   - Empty result sets should return success with empty array
   - Null/undefined values should be handled gracefully
   - Large payloads should respect size limits

## Benefits of Standardization

1. **Consistency**: All APIs follow the same response format
2. **Error Handling**: Centralized error handling with proper status codes
3. **Debugging**: Consistent error codes and messages make debugging easier
4. **Client Integration**: Frontend can handle responses uniformly
5. **Documentation**: Predictable response structure simplifies API documentation
6. **Monitoring**: Standard error codes enable better monitoring and alerting
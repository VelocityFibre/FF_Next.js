# Logging Implementation Examples

## ✅ What's Been Implemented

### 1. **Automatic API Request/Response Logging**
- `middleware.ts` - Logs all API requests automatically
- `lib/api-error-handler.ts` - Enhanced with request/response logging
- Tracks: method, path, duration, status codes

### 2. **Business Operation Logging**
- Added to `/api/projects/index.ts` as an example
- Logs CREATE, UPDATE, DELETE operations with context

### 3. **Database Query Logging Helper**
- Created `lib/db-logger.ts` with utilities

## 📝 How to Use the New Logging

### Example 1: Wrap Your API Routes
```typescript
// Before
export default async function handler(req, res) {
  // your code
}

// After - with automatic logging!
import { withErrorHandler } from '@/lib/api-error-handler';

export default withErrorHandler(async (req, res) => {
  // your code - now logs requests, responses, and errors automatically
});
```

### Example 2: Log Business Operations
```typescript
import { logCreate, logUpdate, logDelete } from '@/lib/db-logger';

// After creating a record
const newUser = await createUser(data);
logCreate('user', newUser.id, { 
  email: newUser.email,
  role: newUser.role 
});

// After updating
logUpdate('user', userId, { 
  updated_fields: ['email', 'name'] 
});

// After deleting
logDelete('user', userId);
```

### Example 3: Use Logged SQL for Slow Query Detection
```typescript
import { createLoggedSql } from '@/lib/db-logger';

// Instead of this:
const sql = neon(process.env.DATABASE_URL!);

// Use this for automatic query logging:
const sql = createLoggedSql(process.env.DATABASE_URL!);

// Now all queries are automatically logged
// Slow queries (>1 second) generate warnings
const users = await sql`SELECT * FROM users WHERE active = true`;
// If this takes >1s, you'll see: "WARN: Slow query detected: 1234ms"
```

### Example 4: Authentication Events
```typescript
import { logAuth } from '@/lib/db-logger';

// In your auth handlers
logAuth('login', userId, { method: 'email' });
logAuth('logout', userId);
logAuth('signup', userId, { plan: 'free' });
logAuth('failed', undefined, { email: attemptedEmail, reason: 'invalid_password' });
```

## 🎯 Quick Implementation Checklist

### Immediate (Already Done ✅)
- [x] Middleware for automatic API logging
- [x] Enhanced error handler with logging
- [x] Business operation helpers
- [x] Database query logger

### To Do Next
- [ ] Replace `neon()` with `createLoggedSql()` in API routes for query logging
- [ ] Add `withErrorHandler` wrapper to remaining API routes
- [ ] Add auth event logging to Clerk webhooks
- [ ] Set LOG_LEVEL=debug in development for full visibility

## 📊 Viewing Your Logs

### Development
```bash
# See all logs with pretty printing
npm run dev

# Filter logs by level
npm run dev 2>&1 | grep "INFO"
npm run dev 2>&1 | grep "WARN"
npm run dev 2>&1 | grep "ERROR"

# Watch specific operations
npm run dev 2>&1 | grep "CREATE"
npm run dev 2>&1 | grep "Slow query"
```

### Production (Vercel)
1. Go to Vercel Dashboard
2. Select your project
3. Click "Functions" tab
4. Click "Logs"
5. Use filters to find specific events

## 🔍 What You'll See

### Request Log
```json
{
  "level": "info",
  "msg": "API Request: GET /api/projects",
  "type": "request",
  "method": "GET",
  "url": "/api/projects",
  "userId": "user_123"
}
```

### Response Log
```json
{
  "level": "info",
  "msg": "API Response: GET /api/projects - 200 (45ms)",
  "type": "response",
  "statusCode": 200,
  "duration": "45ms"
}
```

### Business Operation Log
```json
{
  "level": "info",
  "msg": "Created project with ID: proj_456",
  "operation": "CREATE",
  "entity": "project",
  "id": "proj_456",
  "details": {
    "project_name": "New Website",
    "client_id": "client_789"
  }
}
```

### Slow Query Warning
```json
{
  "level": "warn",
  "msg": "Slow query detected: 1523ms",
  "query": "SELECT * FROM large_table WHERE...",
  "duration": "1523ms",
  "rowCount": 5000,
  "slow": true
}
```

## 💡 Tips

1. **Set LOG_LEVEL wisely**:
   - Development: `LOG_LEVEL=debug`
   - Staging: `LOG_LEVEL=info`
   - Production: `LOG_LEVEL=warn`

2. **Use structured data**: Always pass objects with context, not just strings

3. **Don't log sensitive data**: The redaction is automatic, but be careful

4. **Monitor slow queries**: They're your performance bottlenecks

5. **Set up alerts**: In production, alert on `level: error` and `slow: true`
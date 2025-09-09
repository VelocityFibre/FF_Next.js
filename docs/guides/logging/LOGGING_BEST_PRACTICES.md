# Logging Best Practices & Implementation Guide

## 🎯 Logging Strategy for Next.js 15

### Current Setup
- **Logger**: Pino (fast, structured JSON logging)
- **Location**: `/lib/logger.ts`
- **Features**: Auto-redaction, environment-based config, pretty printing in dev

## 📊 What to Log

### 1. **API Requests/Responses** (HIGH PRIORITY)
```typescript
// Already implemented in lib/api-error-handler.ts
// Logs: method, url, duration, status code
```

### 2. **Database Operations**
```typescript
// Add to your database queries
const result = await sql`SELECT * FROM users`;
dbLogger.debug({ 
  query: 'SELECT * FROM users',
  rowCount: result.length,
  duration: executionTime 
}, 'Database query executed');
```

### 3. **Authentication Events**
```typescript
// Log successful logins
authLogger.info({ userId, email }, 'User logged in');

// Log failed attempts
authLogger.warn({ email, reason }, 'Login failed');
```

### 4. **Business Logic Events**
```typescript
// Important business operations
logger.info({ 
  orderId, 
  amount, 
  userId 
}, 'Order created');
```

### 5. **Performance Metrics**
```typescript
// Slow operations
if (duration > 1000) {
  perfLogger.warn({ 
    operation, 
    duration 
  }, 'Slow operation detected');
}
```

## 🚀 Implementation Steps

### Step 1: Enable Middleware (Already Done)
The `middleware.ts` file now logs all API requests automatically.

### Step 2: Use the API Error Handler
Replace direct API handlers with the wrapped version:

```typescript
// Before
export default async function handler(req, res) {
  // your code
}

// After
import { withErrorHandler } from '@/lib/api-error-handler';

export default withErrorHandler(async (req, res) => {
  // your code - now with automatic logging!
});
```

### Step 3: Add Logger to Services
```typescript
import { logger } from '@/lib/logger';

export class UserService {
  async createUser(data) {
    logger.info({ userId: data.id }, 'Creating user');
    // ... implementation
    logger.info({ userId: result.id }, 'User created successfully');
  }
}
```

## 📝 Log Levels Guide

| Level | When to Use | Example |
|-------|------------|---------|
| `fatal` | App is crashing | Database connection lost |
| `error` | Operation failed, needs attention | API endpoint threw exception |
| `warn` | Something unexpected but recovered | Slow query, retry succeeded |
| `info` | Normal operations | User logged in, order created |
| `debug` | Development details | SQL queries, function inputs |
| `trace` | Very detailed debugging | Step-by-step execution |

## 🔧 Environment Configuration

```env
# .env.local
LOG_LEVEL=info          # Production
LOG_LEVEL=debug         # Development
LOG_LEVEL=silent        # Testing
```

## 📊 Viewing Logs

### Development
- Colorized output in terminal
- Pretty printed with timestamps

### Production (Vercel)
- View in Vercel Dashboard → Functions → Logs
- Filter by level, search JSON fields
- Set up alerts for errors

### Local Production Testing
```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start | pino-pretty
```

## ⚠️ Security Considerations

### Already Handled Automatically:
- Passwords, tokens, API keys are redacted
- Credit card numbers are hidden
- Session IDs are masked

### Additional Care Needed:
- Don't log personal information (PII)
- Avoid logging full request bodies with sensitive data
- Use `debug` level for detailed data (not shown in production)

## 🎯 Quick Wins to Implement Now

1. **Wrap all API routes** with `withErrorHandler`
2. **Add success logging** to critical business operations
3. **Monitor slow database queries**
4. **Track authentication events**
5. **Log external API calls**

## 📈 Benefits You'll Get

1. **Debugging**: Find issues faster with detailed logs
2. **Monitoring**: Know when things go wrong in production
3. **Analytics**: Understand usage patterns
4. **Security**: Track suspicious activities
5. **Performance**: Identify bottlenecks

## 🔍 Searching Logs

### In Development
```bash
# See all errors
npm run dev 2>&1 | grep ERROR

# Watch specific API
npm run dev 2>&1 | grep "/api/projects"
```

### In Production (JSON logs)
```bash
# Parse JSON logs
cat logs.json | jq '.level == "error"'

# Find slow requests
cat logs.json | jq 'select(.duration > 1000)'
```

## 🚨 Alert Examples

Set up alerts in your monitoring service for:
- `level: "error"` → Send to Slack
- `duration > 5000` → Performance alert
- `statusCode >= 500` → Critical error
- Multiple failed login attempts → Security alert
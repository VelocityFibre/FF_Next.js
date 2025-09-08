# Structured Logging Implementation Guide

## Overview
We've implemented structured logging using **Pino** for better observability, security, and debugging capabilities.

## Features
- **Structured JSON logging** for production
- **Pretty printing** for development
- **Automatic redaction** of sensitive data
- **Log levels** controlled via `LOG_LEVEL` environment variable
- **Module-specific loggers** for better context
- **Request/response logging** for APIs
- **Progress tracking** for scripts

## Environment Configuration

Set the log level in your `.env` file:

```env
# Options: fatal, error, warn, info, debug, trace, silent
LOG_LEVEL=info  # Default is 'info'
NODE_ENV=production  # or 'development'
```

## Usage Examples

### 1. API Route Handler (Next.js)

```typescript
// pages/api/projects.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiLogger } from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  
  try {
    // Log incoming request
    apiLogger.info({
      method: req.method,
      path: req.url,
      query: req.query
    }, 'Processing API request');
    
    // Your API logic here
    const result = await processRequest(req);
    
    // Log successful response
    apiLogger.info({
      method: req.method,
      path: req.url,
      responseTime: Date.now() - startTime
    }, 'Request completed successfully');
    
    return res.status(200).json(result);
  } catch (error) {
    // Log errors with context
    apiLogger.error({
      error,
      method: req.method,
      path: req.url,
      responseTime: Date.now() - startTime
    }, 'API request failed');
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 2. Database Operations

```typescript
import { dbLogger } from '@/lib/logger';
import { sql } from '@/lib/db';

async function getProjects(filters?: any) {
  try {
    dbLogger.debug({ filters }, 'Fetching projects from database');
    
    const projects = await sql`SELECT * FROM projects WHERE active = true`;
    
    dbLogger.info({ count: projects.length }, 'Projects fetched successfully');
    return projects;
  } catch (error) {
    dbLogger.error({ error, filters }, 'Failed to fetch projects');
    throw error;
  }
}
```

### 3. Script Execution

```typescript
#!/usr/bin/env node
import { createScriptRunner } from '@/lib/script-logger';

const runner = createScriptRunner('seed-demo-data');

runner.run(async () => {
  runner.log('Starting database seeding...');
  
  // Track progress for bulk operations
  const progress = runner.startProgress(1000, 'Seeding records');
  
  for (let i = 0; i < 1000; i++) {
    try {
      await seedRecord(i);
      progress.update(i + 1, `Record ${i + 1}`);
    } catch (error) {
      runner.error(`Failed to seed record ${i}`, error);
    }
  }
  
  progress.complete();
  runner.success('Database seeding completed');
});
```

### 4. Authentication Logging

```typescript
import { authLogger } from '@/lib/logger';

export async function login(email: string, password: string) {
  try {
    authLogger.info({ email }, 'Login attempt');
    
    const user = await authenticate(email, password);
    
    authLogger.info({ 
      userId: user.id, 
      email: user.email 
    }, 'Login successful');
    
    return user;
  } catch (error) {
    authLogger.warn({ 
      email,
      error: error.message 
    }, 'Login failed');
    
    throw error;
  }
}
```

### 5. SOW Import Operations

```typescript
import { sowLogger } from '@/lib/logger';

export async function importSOW(projectId: string, file: File) {
  const importId = generateImportId();
  
  sowLogger.info({
    importId,
    projectId,
    fileName: file.name,
    fileSize: file.size
  }, 'Starting SOW import');
  
  try {
    const result = await processSOWFile(file);
    
    sowLogger.info({
      importId,
      projectId,
      recordsProcessed: result.count,
      duration: result.duration
    }, 'SOW import completed');
    
    return result;
  } catch (error) {
    sowLogger.error({
      importId,
      projectId,
      error
    }, 'SOW import failed');
    
    throw error;
  }
}
```

## Automatic Redaction

The logger automatically redacts sensitive fields:

```typescript
// This will automatically redact sensitive data
apiLogger.info({
  user: {
    email: 'user@example.com',
    password: 'secret123',  // Will be logged as '[REDACTED]'
    apiKey: 'sk_live_xyz'   // Will be logged as '[REDACTED]'
  }
}, 'User data');
```

## Module-Specific Loggers

Use the appropriate logger for context:

```typescript
import { 
  apiLogger,        // For API routes
  dbLogger,         // For database operations
  authLogger,       // For authentication
  sowLogger,        // For SOW operations
  analyticsLogger,  // For analytics
  procurementLogger,// For procurement
  fieldOpsLogger,   // For field operations
  migrationLogger,  // For migrations
  scriptLogger      // For scripts
} from '@/lib/logger';
```

## Migration from console.log

Replace existing console statements:

```typescript
// Before
console.log('Processing request:', requestData);
console.error('Error:', error);
console.warn('Warning:', message);

// After
import { logger } from '@/lib/logger';

logger.info({ requestData }, 'Processing request');
logger.error({ error }, 'Error occurred');
logger.warn({ message }, 'Warning');
```

## Log Output Examples

### Development Mode (Pretty Printed)
```
[10:23:45.123] INFO (api): Processing API request
    method: "GET"
    path: "/api/projects"
    query: {
      status: "active"
    }
```

### Production Mode (JSON)
```json
{"level":"info","time":"2024-01-15T10:23:45.123Z","module":"api","method":"GET","path":"/api/projects","query":{"status":"active"},"msg":"Processing API request"}
```

## Best Practices

1. **Use appropriate log levels**:
   - `fatal`: Application is unusable
   - `error`: Error events but application continues
   - `warn`: Potentially harmful situations
   - `info`: Informational messages (default)
   - `debug`: Debug-level messages
   - `trace`: Most detailed information

2. **Include context in logs**:
   ```typescript
   logger.info({
     userId: user.id,
     action: 'upload',
     fileSize: file.size
   }, 'File uploaded');
   ```

3. **Don't log sensitive data directly**:
   ```typescript
   // Bad
   logger.info(`User ${email} logged in with password ${password}`);
   
   // Good
   logger.info({ email }, 'User logged in');
   ```

4. **Use child loggers for context**:
   ```typescript
   const requestLogger = apiLogger.child({ requestId: generateId() });
   requestLogger.info('Starting request processing');
   ```

## Monitoring and Analysis

Logs can be easily parsed and analyzed:

```bash
# Filter by level
cat app.log | jq 'select(.level == "error")'

# Filter by module
cat app.log | jq 'select(.module == "api")'

# Count errors by endpoint
cat app.log | jq 'select(.level == "error") | .path' | sort | uniq -c
```

## Performance Impact

Pino is one of the fastest logging libraries:
- Minimal overhead in production
- Async logging to prevent blocking
- Efficient serialization

## Next Steps

1. Set up log aggregation (e.g., Datadog, LogRocket, Sentry)
2. Create dashboards for monitoring
3. Set up alerts for error patterns
4. Implement correlation IDs for request tracing
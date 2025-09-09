# API Logging Migration Guide

## 🎯 Overview
This guide shows you how to add comprehensive logging to your API routes. There are two main improvements:
1. **withErrorHandler** - Automatic request/response/error logging
2. **createLoggedSql** - Database query performance tracking

## 📊 Current Status

### Routes Already Updated ✅
- `/api/clients/index.ts` - Has withErrorHandler
- `/api/projects/index.ts` - Has business operation logging

### Routes That Need Updates ⚠️
Most API routes still need the withErrorHandler wrapper and logged SQL.

## 🔧 How to Update Each Route

### Step 1: Add withErrorHandler Wrapper

**Before:**
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Your code here
}
```

**After:**
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from '@/lib/api-error-handler';
import { createLoggedSql } from '@/lib/db-logger';

const sql = createLoggedSql(process.env.DATABASE_URL!);

export default withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Your code here (unchanged)
})
```

### Step 2: Add Business Operation Logging

For CREATE, UPDATE, DELETE operations, add logging:

```typescript
import { logCreate, logUpdate, logDelete } from '@/lib/db-logger';

// After successful create
logCreate('entity_name', newRecord.id, { 
  key_field: newRecord.field 
});

// After successful update
logUpdate('entity_name', recordId, { 
  updated_fields: Object.keys(updateData) 
});

// After successful delete
logDelete('entity_name', recordId);
```

## 📝 Priority Routes to Update

### High Priority (Core Business Logic)
1. **`/api/projects.ts`** - Main projects endpoint
2. **`/api/staff/index.ts`** - Staff management
3. **`/api/sow/index.ts`** - SOW operations
4. **`/api/procurement/rfq/index.ts`** - RFQ management
5. **`/api/procurement/boq/index.ts`** - BOQ management

### Medium Priority (Analytics & Reporting)
6. **`/api/analytics/dashboard/stats.ts`**
7. **`/api/analytics/dashboard/summary.ts`**
8. **`/api/analytics/dashboard/trends.ts`**
9. **`/api/field/tasks/index.ts`** - Field operations
10. **`/api/field/technicians/index.ts`**

### Low Priority (Admin & Utilities)
11. **`/api/database/health.ts`** - Health checks
12. **`/api/admin/init-db.ts`** - Admin operations

## 🚀 Quick Update Script

For each file, make these changes:

### 1. Update Imports
```typescript
// Add these imports
import { withErrorHandler } from '@/lib/api-error-handler';
import { createLoggedSql } from '@/lib/db-logger';
import { logCreate, logUpdate, logDelete } from '@/lib/db-logger';

// Change this:
const sql = neon(process.env.DATABASE_URL!);

// To this:
const sql = createLoggedSql(process.env.DATABASE_URL!);
```

### 2. Wrap the Handler
```typescript
// Change this:
export default async function handler(req, res) {
  // code
}

// To this:
export default withErrorHandler(async (req, res) => {
  // same code
})
```

### 3. Remove Manual CORS Headers
The withErrorHandler adds CORS headers automatically, so remove:
```typescript
// DELETE THESE LINES:
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
// etc...

if (req.method === 'OPTIONS') {
  res.status(200).end();
  return;
}
```

## ✅ Example: Complete Migration

Here's a full before/after example:

**BEFORE (`/api/staff/index.ts`):**
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const staff = await sql`SELECT * FROM staff`;
      return res.status(200).json({ success: true, data: staff });
    }
    
    if (req.method === 'POST') {
      const newStaff = await sql`
        INSERT INTO staff (name, email, role) 
        VALUES (${req.body.name}, ${req.body.email}, ${req.body.role})
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: newStaff[0] });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

**AFTER (with full logging):**
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from '@/lib/api-error-handler';
import { createLoggedSql, logCreate } from '@/lib/db-logger';

const sql = createLoggedSql(process.env.DATABASE_URL!);

export default withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // No CORS headers needed - handled by withErrorHandler
  
  if (req.method === 'GET') {
    const staff = await sql`SELECT * FROM staff`;
    return res.status(200).json({ success: true, data: staff });
  }
  
  if (req.method === 'POST') {
    const newStaff = await sql`
      INSERT INTO staff (name, email, role) 
      VALUES (${req.body.name}, ${req.body.email}, ${req.body.role})
      RETURNING *
    `;
    
    // Log the business operation
    logCreate('staff', newStaff[0].id, {
      name: newStaff[0].name,
      email: newStaff[0].email,
      role: newStaff[0].role
    });
    
    return res.status(201).json({ success: true, data: newStaff[0] });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
})
```

## 🎯 Benefits You'll Get

1. **Automatic Request Logging**: Every API call is logged with method, path, duration
2. **Error Tracking**: All errors are logged with stack traces
3. **Slow Query Detection**: Database queries >1 second generate warnings
4. **Business Operation Audit**: Track who created/updated/deleted what
5. **Performance Metrics**: Response times tracked automatically
6. **Debugging**: Full context when things go wrong

## 📈 What You'll See in Logs

After implementing:
```
[INFO] API Request: GET /api/staff
[DEBUG] Database query executed (45ms) - 10 rows
[INFO] API Response: GET /api/staff - 200 (52ms)

[INFO] API Request: POST /api/staff
[DEBUG] Database query executed (23ms) - 1 rows
[INFO] Created staff with ID: 123
[INFO] API Response: POST /api/staff - 201 (28ms)

[WARN] Slow query detected: 1523ms
[ERROR] API Request failed: Database connection error
```

## 🚦 Quick Start

1. Start with high-priority routes (projects, staff, SOW)
2. Test each route after updating
3. Monitor logs with `npm run dev`
4. Set `LOG_LEVEL=debug` in `.env` to see query details

## ⚡ Pro Tips

- Update routes incrementally - don't do all at once
- Test error cases to ensure logging works
- Use business operation logs for audit trails
- Monitor slow queries to find performance issues
- Keep sensitive data out of log details
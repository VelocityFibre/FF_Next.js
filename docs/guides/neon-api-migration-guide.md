# Neon API Migration Quick Guide

## ❌ What NOT to do (causes errors in browser)

```typescript
// DON'T do this in frontend code:
import { sql } from '@/lib/neon';
import { createNeonClient } from '@/lib/neon-sql';

// This will fail with "No database connection string" error
const result = await sql`SELECT * FROM users`;
```

## ✅ What to do instead

### Step 1: Create API Endpoint
Create a file in `/api/module-name/endpoint.js`:

```javascript
import { sql } from '@/lib/neon';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // NOW you can use Neon here (server-side)
    const result = await sql`SELECT * FROM users`;
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### Step 2: Create Frontend API Service
Create a file in `src/services/api/moduleApi.ts`:

```typescript
export const moduleApi = {
  async getUsers() {
    const response = await fetch('/api/module-name/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  async createUser(userData: UserData) {
    const response = await fetch('/api/module-name/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  }
};
```

### Step 3: Use in Components/Hooks

```typescript
import { moduleApi } from '@/services/api/moduleApi';

// In a React component or hook
const { data, error } = await moduleApi.getUsers();
```

## Common Patterns

### GET Endpoint
```javascript
// /api/items/index.js
if (req.method === 'GET') {
  const { projectId } = req.query;
  const items = await sql`
    SELECT * FROM items 
    WHERE project_id = ${projectId}
  `;
  return res.status(200).json({ success: true, data: items });
}
```

### POST Endpoint
```javascript
// /api/items/index.js
if (req.method === 'POST') {
  const { name, description, projectId } = req.body;
  const result = await sql`
    INSERT INTO items (name, description, project_id)
    VALUES (${name}, ${description}, ${projectId})
    RETURNING *
  `;
  return res.status(201).json({ success: true, data: result[0] });
}
```

### Error Handling
```javascript
try {
  // Database operation
} catch (error) {
  console.error('Database error:', error);
  
  // Check for specific errors
  if (error.code === '23505') {
    return res.status(409).json({ 
      success: false, 
      error: 'Duplicate entry' 
    });
  }
  
  // Generic error
  return res.status(500).json({ 
    success: false, 
    error: 'Database operation failed' 
  });
}
```

## Testing Your Migration

1. **Check for errors**: Open browser console and look for "No database connection string" errors
2. **Test API endpoints**: Use Postman or browser to test `/api/your-endpoint`
3. **Verify data flow**: Ensure data loads correctly in your components
4. **Check error handling**: Test with invalid data or network disconnection

## Firebase vs Neon Usage

- **Use Neon for**: 
  - All structured data (projects, users, analytics)
  - Reporting and analytics
  - Complex queries and joins
  - Data that needs SQL capabilities

- **Keep Firebase for**:
  - Real-time updates (onSnapshot)
  - Authentication
  - File storage
  - Offline persistence with sync

## Need Help?
1. Check existing API endpoints in `/api/` directory
2. Look at successfully migrated modules (SOW, Projects, Staff)
3. Follow the patterns in this guide
4. Test thoroughly before deploying
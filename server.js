import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper to dynamically load API route handlers
async function loadApiRoute(filePath) {
  try {
    const module = await import(filePath);
    return module.default;
  } catch (error) {
    console.error(`Failed to load route: ${filePath}`, error);
    return null;
  }
}

// Handle all API routes
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    return next();
  }
  
  const apiPath = req.path.replace('/api/', '');
  
  // Map the path to file structure
  let filePath;
  const pathParts = apiPath.split('/').filter(Boolean);
  
  if (pathParts.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Check if it's a file or directory
  const basePath = join(__dirname, 'api', ...pathParts);
  
  if (fs.existsSync(`${basePath}.js`)) {
    filePath = `${basePath}.js`;
  } else if (fs.existsSync(join(basePath, 'index.js'))) {
    filePath = join(basePath, 'index.js');
  } else {
    return res.status(404).json({ error: 'API endpoint not found', path: apiPath });
  }
  
  // Load and execute the handler
  const handler = await loadApiRoute(filePath);
  if (handler) {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`Error in API handler: ${apiPath}`, error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  } else {
    res.status(500).json({ error: 'Failed to load API handler' });
  }
});

// Catch-all
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  - /api/clients');
  console.log('  - /api/analytics/dashboard/stats');
  console.log('  - /api/analytics/dashboard/trends');
  console.log('  - /api/analytics/dashboard/summary');
  console.log('  - /api/projects');
  console.log('  - /api/staff');
  console.log('  - /api/contractors');
  console.log('  - /api/sow');
});
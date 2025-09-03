import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper function to load and execute API route
async function executeApiRoute(routePath, req, res) {
  try {
    const modulePath = join(__dirname, routePath);
    const module = await import(modulePath);
    const handler = module.default;
    
    if (typeof handler === 'function') {
      await handler(req, res);
    } else {
      res.status(500).json({ error: 'Invalid API handler' });
    }
  } catch (error) {
    console.error(`Error executing ${routePath}:`, error);
    res.status(500).json({ error: error.message });
  }
}

// SOW Routes
app.all('/api/sow/poles', async (req, res) => {
  await executeApiRoute('./api/sow/poles.js', req, res);
});

app.all('/api/sow/drops', async (req, res) => {
  await executeApiRoute('./api/sow/drops.js', req, res);
});

app.all('/api/sow/fibre', async (req, res) => {
  await executeApiRoute('./api/sow/fibre.js', req, res);
});

app.all('/api/sow/init', async (req, res) => {
  await executeApiRoute('./api/sow/init.js', req, res);
});

app.all('/api/sow/import-status/:projectId', async (req, res) => {
  await executeApiRoute('./api/sow/import-status.js', req, res);
});

// Client Routes
app.all('/api/clients', async (req, res) => {
  await executeApiRoute('./api/clients.js', req, res);
});

// Project Routes
app.all('/api/projects', async (req, res) => {
  await executeApiRoute('./api/projects.js', req, res);
});

// Staff Routes
app.all('/api/staff', async (req, res) => {
  await executeApiRoute('./api/staff.js', req, res);
});

// Contractor Routes
app.all('/api/contractors', async (req, res) => {
  await executeApiRoute('./api/contractors.js', req, res);
});

// Analytics Routes
app.all('/api/analytics/dashboard/stats', async (req, res) => {
  await executeApiRoute('./api/analytics/dashboard/stats.js', req, res);
});

app.all('/api/analytics/dashboard/trends', async (req, res) => {
  await executeApiRoute('./api/analytics/dashboard/trends.js', req, res);
});

app.all('/api/analytics/dashboard/summary', async (req, res) => {
  await executeApiRoute('./api/analytics/dashboard/summary.js', req, res);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  - /api/sow/poles');
  console.log('  - /api/sow/drops');
  console.log('  - /api/sow/fibre');
  console.log('  - /api/clients');
  console.log('  - /api/projects');
  console.log('  - /api/staff');
  console.log('  - /api/contractors');
  console.log('  - /api/analytics/dashboard/stats');
  console.log('  - /api/analytics/dashboard/trends');
  console.log('  - /api/analytics/dashboard/summary');
  console.log('\nServer is ready to handle requests...');
});
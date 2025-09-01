import { sql } from '../../lib/neon.js';
import { glob } from 'glob';
import fs from 'fs';

// Cache for health check results
let healthCache = null;
let cacheExpiry = 0;
const CACHE_DURATION = 30000; // 30 seconds

async function checkDatabaseHealth() {
  try {
    const result = await sql`SELECT 1 as healthy, NOW() as timestamp`;
    return {
      connected: true,
      timestamp: result[0].timestamp,
      latency: null // Could measure query time
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      timestamp: new Date()
    };
  }
}

async function checkAPIEndpoints() {
  const endpoints = [
    { name: 'SOW', path: '/api/sow/health' },
    { name: 'Projects', path: '/api/projects/health' },
    { name: 'Staff', path: '/api/staff/health' },
    { name: 'Clients', path: '/api/clients/health' },
    { name: 'Procurement', path: '/api/procurement/health' },
    { name: 'Contractors', path: '/api/contractors/health' },
    { name: 'Analytics', path: '/api/analytics/health' }
  ];

  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        // In production, this would make actual HTTP requests
        // For now, we'll check if the API file exists
        const apiPath = endpoint.path.replace('/api/', './api/').replace('/health', '/index.js');
        const exists = fs.existsSync(apiPath);
        
        return {
          ...endpoint,
          status: exists ? 'available' : 'not_implemented',
          responseTime: 0
        };
      } catch (error) {
        return {
          ...endpoint,
          status: 'error',
          error: error.message
        };
      }
    })
  );

  return results;
}

async function checkDirectDatabaseUsage() {
  try {
    const srcFiles = await glob('src/**/*.{ts,tsx}', {
      ignore: [
        'src/lib/**',
        'src/api/**',
        '**/node_modules/**',
        'src/tests/**'
      ]
    });

    const violations = [];
    const dbPatterns = [
      /import\s*{\s*sql\s*}\s*from\s*['"]@\/lib\/neon['"]/,
      /createNeonClient/,
      /neon\(/
    ];

    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of dbPatterns) {
        if (pattern.test(content)) {
          violations.push(file);
          break;
        }
      }
    }

    return {
      totalFiles: srcFiles.length,
      violationsCount: violations.length,
      violations: violations.slice(0, 10), // Return first 10 violations
      status: violations.length === 0 ? 'clean' : 'violations_found'
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

async function getMigrationProgress() {
  const modules = [
    { name: 'SOW', status: 'completed', completedAt: '2025-01-09T12:00:00Z' },
    { name: 'Projects', status: 'completed', completedAt: '2025-01-09T13:00:00Z' },
    { name: 'Staff', status: 'completed', completedAt: '2025-01-09T14:00:00Z' },
    { name: 'Clients', status: 'completed', completedAt: '2025-01-09T15:00:00Z' },
    { name: 'Procurement', status: 'in_progress', agent: 'Agent 1' },
    { name: 'Contractors', status: 'in_progress', agent: 'Agent 2' },
    { name: 'Analytics', status: 'in_progress', agent: 'Agent 3' },
    { name: 'Workflow', status: 'pending' },
    { name: 'RAG System', status: 'pending' },
    { name: 'Stock Management', status: 'pending' }
  ];

  const completed = modules.filter(m => m.status === 'completed').length;
  const inProgress = modules.filter(m => m.status === 'in_progress').length;
  const pending = modules.filter(m => m.status === 'pending').length;

  return {
    modules,
    summary: {
      total: modules.length,
      completed,
      inProgress,
      pending,
      percentComplete: Math.round((completed / modules.length) * 100)
    }
  };
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check cache
  if (healthCache && Date.now() < cacheExpiry) {
    return res.status(200).json(healthCache);
  }

  try {
    const [database, endpoints, directDbUsage, migrationProgress] = await Promise.all([
      checkDatabaseHealth(),
      checkAPIEndpoints(),
      checkDirectDatabaseUsage(),
      getMigrationProgress()
    ]);

    const overallHealth = {
      status: database.connected && directDbUsage.violationsCount === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database,
        endpoints,
        codeQuality: {
          directDatabaseUsage: directDbUsage
        },
        migration: migrationProgress
      },
      recommendations: []
    };

    // Add recommendations based on health status
    if (!database.connected) {
      overallHealth.recommendations.push('Database connection is down - check connection string and server status');
    }

    if (directDbUsage.violationsCount > 0) {
      overallHealth.recommendations.push(`Found ${directDbUsage.violationsCount} files with direct database access - run migration`);
    }

    const notImplemented = endpoints.filter(e => e.status === 'not_implemented');
    if (notImplemented.length > 0) {
      overallHealth.recommendations.push(`${notImplemented.length} API endpoints not yet implemented`);
    }

    // Cache the result
    healthCache = overallHealth;
    cacheExpiry = Date.now() + CACHE_DURATION;

    return res.status(200).json(overallHealth);
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to perform health check',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
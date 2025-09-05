import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Database Health Check API Route
 * Checks the database connection status
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Proxy to backend API server
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false,
        error: `Backend health check failed: ${response.status}` 
      });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed' 
    });
  }
}
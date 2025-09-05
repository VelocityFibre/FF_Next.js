import type { NextApiRequest, NextApiResponse } from 'next';
// import { getAuth } from '@clerk/nextjs/server';
import { getAuth } from '../../../../../lib/auth-mock';

/**
 * SOW Project Summary API Route
 * GET /api/sow/project/[projectId]/summary - Get SOW summary statistics for a project
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authentication from Clerk
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Proxy to backend API server
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/sow/summary?projectId=${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ 
        success: false,
        error: error || `Failed to fetch SOW summary: ${response.status}` 
      });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error('SOW summary error:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch SOW summary' 
    });
  }
}
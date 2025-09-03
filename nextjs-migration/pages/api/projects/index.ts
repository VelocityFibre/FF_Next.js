import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

/**
 * Projects API Route
 * GET /api/projects - Get all projects or filtered projects
 * POST /api/projects - Create a new project
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get authentication from Clerk
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';

    switch (req.method) {
      case 'GET': {
        // Build query string from request parameters
        const queryString = new URLSearchParams(req.query as any).toString();
        const url = queryString 
          ? `${backendUrl}/api/projects?${queryString}`
          : `${backendUrl}/api/projects`;

        const response = await fetch(url, {
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
            error: error || `Failed to fetch projects: ${response.status}` 
          });
        }

        const result = await response.json();
        return res.status(200).json(result);
      }

      case 'POST': {
        const response = await fetch(`${backendUrl}/api/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId,
          },
          body: JSON.stringify({
            ...req.body,
            createdBy: userId,
            updatedBy: userId,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          return res.status(response.status).json({ 
            success: false,
            error: error || `Failed to create project: ${response.status}` 
          });
        }

        const result = await response.json();
        return res.status(201).json(result);
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
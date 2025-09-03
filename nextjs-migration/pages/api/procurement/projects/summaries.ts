import type { NextApiRequest, NextApiResponse } from 'next';
import type { ProjectSummary } from '../../../../src/types/procurement/portal.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Replace with actual database query
    const mockProjectSummaries: ProjectSummary[] = [
      {
        projectId: 'PROJ-001',
        projectName: 'Johannesburg Metro Fibre',
        projectCode: 'JHB-001',
        boqValue: 850000,
        activeRFQs: 5,
        pendingPOs: 3,
        stockAlerts: 2,
        status: 'active'
      },
      {
        projectId: 'PROJ-002',
        projectName: 'Cape Town Expansion',
        projectCode: 'CPT-002',
        boqValue: 650000,
        activeRFQs: 3,
        pendingPOs: 2,
        stockAlerts: 0,
        status: 'active'
      },
      {
        projectId: 'PROJ-003',
        projectName: 'Durban Coastal Network',
        projectCode: 'DBN-003',
        boqValue: 450000,
        activeRFQs: 2,
        pendingPOs: 1,
        stockAlerts: 1,
        status: 'active'
      }
    ];

    res.status(200).json(mockProjectSummaries);
  } catch (error) {
    console.error('Error fetching project summaries:', error);
    res.status(500).json({ error: 'Failed to fetch project summaries' });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import type { AggregateProjectMetrics } from '../../../../src/types/procurement/portal.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Replace with actual database query
    const mockAggregateMetrics: AggregateProjectMetrics = {
      totalProjects: 12,
      totalBOQValue: 2450000,
      totalActiveRFQs: 18,
      totalPurchaseOrders: 42,
      totalStockItems: 1250,
      totalSuppliers: 28,
      averageCostSavings: 12.5,
      averageCycleDays: 14.5,
      averageSupplierOTIF: 92,
      monthlyProcurementVolume: {
        currency: 'ZAR',
        value: 425000
      }
    };

    res.status(200).json(mockAggregateMetrics);
  } catch (error) {
    console.error('Error fetching aggregate metrics:', error);
    res.status(500).json({ error: 'Failed to fetch aggregate metrics' });
  }
}
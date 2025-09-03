import type { NextApiRequest, NextApiResponse } from 'next';
import type { RFQ } from '../../../../src/types/procurement/rfq.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;

  if (req.method === 'GET') {
    try {
      // TODO: Replace with actual database query
      const mockRFQs: RFQ[] = [
        {
          id: 'RFQ-001',
          rfqNumber: 'RFQ-2024-001',
          projectId: projectId as string || 'PROJ-001',
          title: 'Fiber Optic Cable Supply',
          description: 'Request for quotation for 12-core fiber optic cable supply',
          status: 'open',
          createdDate: new Date('2024-01-15').toISOString(),
          dueDate: new Date('2024-02-15').toISOString(),
          items: [
            {
              id: 'ITEM-001',
              description: 'Fiber Optic Cable - 12 Core',
              quantity: 5000,
              unit: 'meters',
              specifications: 'Single mode, outdoor rated'
            }
          ],
          suppliers: ['FiberTech SA', 'OptiCable Ltd', 'NetworkSupplies'],
          quotesReceived: 2,
          totalValue: 225000,
          createdBy: 'John Doe',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'RFQ-002',
          rfqNumber: 'RFQ-2024-002',
          projectId: projectId as string || 'PROJ-001',
          title: 'Conduit Installation Services',
          description: 'Request for quotation for conduit installation services',
          status: 'evaluating',
          createdDate: new Date('2024-01-20').toISOString(),
          dueDate: new Date('2024-02-20').toISOString(),
          items: [
            {
              id: 'ITEM-002',
              description: 'Conduit Installation',
              quantity: 3000,
              unit: 'meters',
              specifications: '50mm conduit with installation'
            }
          ],
          suppliers: ['TechCrew', 'InstallPro', 'FieldServices'],
          quotesReceived: 3,
          totalValue: 175000,
          createdBy: 'Jane Smith',
          updatedAt: new Date().toISOString()
        }
      ];

      res.status(200).json({ 
        rfqs: mockRFQs,
        total: mockRFQs.length 
      });
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      res.status(500).json({ error: 'Failed to fetch RFQs' });
    }
  } else if (req.method === 'POST') {
    try {
      const newRFQ = req.body;
      // TODO: Validate and save to database
      
      res.status(201).json({ 
        message: 'RFQ created successfully',
        rfq: { ...newRFQ, id: `RFQ-${Date.now()}` }
      });
    } catch (error) {
      console.error('Error creating RFQ:', error);
      res.status(500).json({ error: 'Failed to create RFQ' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
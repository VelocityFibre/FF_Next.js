import type { NextApiRequest, NextApiResponse } from 'next';
import type { BOQItem } from '../../../../src/types/procurement/boq.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;

  if (req.method === 'GET') {
    try {
      // TODO: Replace with actual database query
      const mockBOQItems: BOQItem[] = [
        {
          id: 'BOQ-001',
          projectId: projectId as string || 'PROJ-001',
          itemCode: 'FIB-001',
          description: 'Fiber Optic Cable - 12 Core',
          unit: 'meters',
          quantity: 5000,
          unitPrice: 45,
          totalPrice: 225000,
          category: 'Materials',
          supplier: 'FiberTech SA',
          status: 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'BOQ-002',
          projectId: projectId as string || 'PROJ-001',
          itemCode: 'CON-001',
          description: 'Conduit Pipe - 50mm',
          unit: 'meters',
          quantity: 3000,
          unitPrice: 25,
          totalPrice: 75000,
          category: 'Materials',
          supplier: 'PipeCo',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'BOQ-003',
          projectId: projectId as string || 'PROJ-001',
          itemCode: 'LAB-001',
          description: 'Installation Labor',
          unit: 'hours',
          quantity: 500,
          unitPrice: 250,
          totalPrice: 125000,
          category: 'Labor',
          supplier: 'TechCrew',
          status: 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      res.status(200).json({ 
        items: mockBOQItems,
        total: mockBOQItems.length 
      });
    } catch (error) {
      console.error('Error fetching BOQ items:', error);
      res.status(500).json({ error: 'Failed to fetch BOQ items' });
    }
  } else if (req.method === 'POST') {
    try {
      const newItem = req.body;
      // TODO: Validate and save to database
      
      res.status(201).json({ 
        message: 'BOQ item created successfully',
        item: { ...newItem, id: `BOQ-${Date.now()}` }
      });
    } catch (error) {
      console.error('Error creating BOQ item:', error);
      res.status(500).json({ error: 'Failed to create BOQ item' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import type { StockItem } from '../../../../src/types/procurement/stock.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;

  if (req.method === 'GET') {
    try {
      // TODO: Replace with actual database query
      const mockStockItems: StockItem[] = [
        {
          id: 'STK-001',
          itemCode: 'FIB-001',
          name: 'Fiber Optic Cable - 12 Core',
          description: 'Single mode, outdoor rated fiber optic cable',
          category: 'Cables',
          projectId: projectId as string || 'PROJ-001',
          warehouse: 'Main Warehouse',
          location: 'A-12-3',
          quantity: 2500,
          unit: 'meters',
          minQuantity: 500,
          maxQuantity: 5000,
          unitCost: 45,
          totalValue: 112500,
          supplier: 'FiberTech SA',
          lastRestocked: new Date('2024-01-10').toISOString(),
          status: 'in_stock',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'STK-002',
          itemCode: 'CON-001',
          name: 'Conduit Pipe - 50mm',
          description: 'PVC conduit pipe for underground installation',
          category: 'Conduits',
          projectId: projectId as string || 'PROJ-001',
          warehouse: 'Main Warehouse',
          location: 'B-05-2',
          quantity: 1200,
          unit: 'meters',
          minQuantity: 300,
          maxQuantity: 3000,
          unitCost: 25,
          totalValue: 30000,
          supplier: 'PipeCo',
          lastRestocked: new Date('2024-01-12').toISOString(),
          status: 'in_stock',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'STK-003',
          itemCode: 'CONN-001',
          name: 'Fiber Connectors - SC/APC',
          description: 'Single mode fiber connectors',
          category: 'Connectors',
          projectId: projectId as string || 'PROJ-001',
          warehouse: 'Main Warehouse',
          location: 'C-02-1',
          quantity: 50,
          unit: 'pieces',
          minQuantity: 100,
          maxQuantity: 500,
          unitCost: 15,
          totalValue: 750,
          supplier: 'ConnectorPro',
          lastRestocked: new Date('2024-01-08').toISOString(),
          status: 'low_stock',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      res.status(200).json({ 
        items: mockStockItems,
        total: mockStockItems.length,
        lowStock: mockStockItems.filter(i => i.status === 'low_stock').length,
        outOfStock: mockStockItems.filter(i => i.status === 'out_of_stock').length
      });
    } catch (error) {
      console.error('Error fetching stock items:', error);
      res.status(500).json({ error: 'Failed to fetch stock items' });
    }
  } else if (req.method === 'POST') {
    try {
      const newItem = req.body;
      // TODO: Validate and save to database
      
      res.status(201).json({ 
        message: 'Stock item added successfully',
        item: { ...newItem, id: `STK-${Date.now()}` }
      });
    } catch (error) {
      console.error('Error adding stock item:', error);
      res.status(500).json({ error: 'Failed to add stock item' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import type { StockItem } from '../../../../src/types/procurement/stock.types';
import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;

  if (req.method === 'GET') {
    try {
      // Query real data from database
      let stockData;
      let movements = [];
      
      if (projectId && projectId !== 'all') {
        // Get stock positions for specific project
        stockData = await sql`
          SELECT * FROM stock_positions 
          WHERE project_id = ${projectId}
          ORDER BY updated_at DESC
        `;
        
        // Get recent movements
        movements = await sql`
          SELECT * FROM stock_movements 
          WHERE project_id = ${projectId}
          ORDER BY movement_date DESC
          LIMIT 10
        `;
      } else {
        // Get all stock positions with aggregations
        stockData = await sql`
          SELECT * FROM stock_positions 
          WHERE is_active = true
          ORDER BY updated_at DESC
          LIMIT 200
        `;
          
        // Get recent movements across all projects
        movements = await sql`
          SELECT * FROM stock_movements
          ORDER BY movement_date DESC
          LIMIT 20
        `;
      }
      
      // Transform data to match expected format
      const transformedItems: StockItem[] = stockData.map(stock => ({
        id: stock.id,
        itemCode: stock.item_code,
        name: stock.item_name,
        description: stock.description || '',
        category: stock.category || 'General',
        projectId: stock.project_id,
        warehouse: stock.warehouse_location || 'Main Warehouse',
        location: stock.bin_location || '',
        quantity: Number(stock.available_quantity || 0),
        unit: stock.uom,
        minQuantity: Number(stock.reorder_level || 0),
        maxQuantity: Number(stock.max_stock_level || 0),
        unitCost: Number(stock.average_unit_cost || 0),
        totalValue: Number(stock.total_value || 0),
        supplier: '', // Will need to join with suppliers table if available
        lastRestocked: stock.last_movement_date || new Date().toISOString(),
        status: stock.stock_status as 'in_stock' | 'low_stock' | 'out_of_stock' || 'in_stock',
        createdAt: stock.created_at || new Date().toISOString(),
        updatedAt: stock.updated_at || new Date().toISOString(),
      }));
      
      // Calculate stock statistics
      const lowStockItems = transformedItems.filter(item => 
        item.status === 'low' || item.status === 'critical' || 
        (item.minQuantity > 0 && item.quantity <= item.minQuantity)
      );
      
      const outOfStockItems = transformedItems.filter(item => 
        item.quantity === 0 || item.status === 'out_of_stock'
      );
      
      // Add movement statistics
      const movementStats = {
        recentMovements: movements.length,
        lastMovementDate: movements[0]?.movement_date || null,
        totalMovements: movements.length,
      };

      res.status(200).json({ 
        items: transformedItems,
        total: transformedItems.length,
        lowStock: lowStockItems.length,
        outOfStock: outOfStockItems.length,
        movements: movements.slice(0, 10),
        stats: {
          totalValue: transformedItems.reduce((sum, item) => sum + item.totalValue, 0),
          categories: [...new Set(transformedItems.map(item => item.category))],
          ...movementStats,
        }
      });
    } catch (error) {
      console.error('Error fetching stock items:', error);
      res.status(500).json({ error: 'Failed to fetch stock items' });
    }
  } else if (req.method === 'POST') {
    try {
      const newItem = req.body;
      
      // Insert new stock position into database
      const insertedStocks = await sql`
        INSERT INTO stock_positions (
          project_id, item_code, item_name, description, category, uom,
          available_quantity, on_hand_quantity, warehouse_location, bin_location,
          reorder_level, max_stock_level, average_unit_cost, total_value, stock_status, is_active
        )
        VALUES (
          ${newItem.projectId || projectId},
          ${newItem.itemCode || ''},
          ${newItem.name},
          ${newItem.description || ''},
          ${newItem.category || 'General'},
          ${newItem.unit},
          ${newItem.quantity || 0},
          ${newItem.quantity || 0},
          ${newItem.warehouse || 'Main Warehouse'},
          ${newItem.location || ''},
          ${newItem.minQuantity || 0},
          ${newItem.maxQuantity || 0},
          ${newItem.unitCost || 0},
          ${newItem.totalValue || 0},
          ${newItem.status || 'in_stock'},
          true
        )
        RETURNING *
      `;
      
      res.status(201).json({ 
        message: 'Stock item added successfully',
        item: insertedStocks[0]
      });
    } catch (error) {
      console.error('Error adding stock item:', error);
      res.status(500).json({ error: 'Failed to add stock item' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
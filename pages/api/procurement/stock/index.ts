import type { NextApiRequest, NextApiResponse } from 'next';
import type { StockItem } from '../../../../src/types/procurement/stock.types';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { stockPositions, stockMovements, stockMovementItems } from '../../../../src/lib/neon/schema/procurement/stock.schema';
import { eq, and, desc, sql, lt, or } from 'drizzle-orm';

// Initialize database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require';
const neonClient = neon(connectionString);
const db = drizzle(neonClient as any);

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
        stockData = await db
          .select()
          .from(stockPositions)
          .where(eq(stockPositions.projectId, projectId as string))
          .orderBy(desc(stockPositions.updatedAt));
        
        // Get recent movements
        movements = await db
          .select()
          .from(stockMovements)
          .where(eq(stockMovements.projectId, projectId as string))
          .orderBy(desc(stockMovements.movementDate))
          .limit(10);
      } else {
        // Get all stock positions with aggregations
        stockData = await db
          .select()
          .from(stockPositions)
          .where(eq(stockPositions.isActive, true))
          .orderBy(desc(stockPositions.updatedAt))
          .limit(200);
          
        // Get recent movements across all projects
        movements = await db
          .select()
          .from(stockMovements)
          .orderBy(desc(stockMovements.movementDate))
          .limit(20);
      }
      
      // Transform data to match expected format
      const transformedItems: StockItem[] = stockData.map(stock => ({
        id: stock.id,
        itemCode: stock.itemCode,
        name: stock.itemName,
        description: stock.description || '',
        category: stock.category || 'General',
        projectId: stock.projectId,
        warehouse: stock.warehouseLocation || 'Main Warehouse',
        location: stock.binLocation || '',
        quantity: Number(stock.availableQuantity || 0),
        unit: stock.uom,
        minQuantity: Number(stock.reorderLevel || 0),
        maxQuantity: Number(stock.maxStockLevel || 0),
        unitCost: Number(stock.averageUnitCost || 0),
        totalValue: Number(stock.totalValue || 0),
        supplier: '', // Will need to join with suppliers table if available
        lastRestocked: stock.lastMovementDate?.toISOString() || new Date().toISOString(),
        status: stock.stockStatus as 'in_stock' | 'low_stock' | 'out_of_stock' || 'in_stock',
        createdAt: stock.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: stock.updatedAt?.toISOString() || new Date().toISOString(),
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
        lastMovementDate: movements[0]?.movementDate?.toISOString() || null,
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
      const [insertedStock] = await db
        .insert(stockPositions)
        .values({
          ...newItem,
          projectId: newItem.projectId || projectId,
          availableQuantity: newItem.quantity?.toString() || '0',
          onHandQuantity: newItem.quantity?.toString() || '0',
        })
        .returning();
      
      res.status(201).json({ 
        message: 'Stock item added successfully',
        item: insertedStock
      });
    } catch (error) {
      console.error('Error adding stock item:', error);
      res.status(500).json({ error: 'Failed to add stock item' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
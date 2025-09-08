import type { NextApiRequest, NextApiResponse } from 'next';
import type { BOQItem } from '../../../../src/types/procurement/boq.types';
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
      let boqData;
      let items;
      
      if (projectId && projectId !== 'all') {
        // Get BOQ data for specific project
        boqData = await sql`
          SELECT * FROM boqs 
          WHERE project_id = ${projectId}
          ORDER BY created_at DESC
        `;
        
        // Get BOQ items if we have BOQs
        if (boqData.length > 0) {
          items = await sql`
            SELECT * FROM boq_items 
            WHERE project_id = ${projectId}
            ORDER BY line_number
          `;
        } else {
          items = [];
        }
      } else {
        // Get all BOQs with their items count
        const boqWithCount = await sql`
          SELECT 
            b.*,
            COUNT(bi.id)::int as items_count
          FROM boqs b
          LEFT JOIN boq_items bi ON b.id = bi.boq_id
          GROUP BY b.id
          ORDER BY b.created_at DESC
          LIMIT 100
        `;
        
        boqData = boqWithCount;
        
        // Get items for all BOQs
        if (boqData.length > 0) {
          const boqIds = boqData.map(b => b.id);
          items = await sql`
            SELECT * FROM boq_items
            WHERE boq_id = ANY(${boqIds})
            ORDER BY line_number
            LIMIT 500
          `;
        } else {
          items = [];
        }
      }
      
      // Transform data to match expected format
      const transformedItems: BOQItem[] = items.map(item => ({
        id: item.id,
        projectId: item.project_id,
        itemCode: item.item_code || '',
        description: item.description,
        unit: item.uom,
        quantity: Number(item.quantity),
        unitPrice: item.unit_price ? Number(item.unit_price) : 0,
        totalPrice: item.total_price ? Number(item.total_price) : 0,
        category: item.category || 'Materials',
        supplier: item.catalog_item_name || '',
        status: item.procurement_status || 'pending',
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
      }));
      
      // Add aggregated stats
      const stats = {
        totalValue: transformedItems.reduce((sum, item) => sum + item.totalPrice, 0),
        totalItems: transformedItems.length,
        boqCount: boqData.length,
        categories: [...new Set(transformedItems.map(item => item.category))],
      };

      res.status(200).json({ 
        items: transformedItems,
        total: transformedItems.length,
        boqs: boqData,
        stats
      });
    } catch (error) {
      console.error('Error fetching BOQ items:', error);
      res.status(500).json({ error: 'Failed to fetch BOQ items' });
    }
  } else if (req.method === 'POST') {
    try {
      const newItem = req.body;
      
      // Insert new BOQ item into database
      const insertedItems = await sql`
        INSERT INTO boq_items (
          boq_id, project_id, item_code, description, uom, quantity, 
          unit_price, total_price, category, catalog_item_name, procurement_status
        )
        VALUES (
          ${newItem.boqId || null}, 
          ${newItem.projectId || projectId},
          ${newItem.itemCode || ''}, 
          ${newItem.description}, 
          ${newItem.unit || newItem.uom}, 
          ${newItem.quantity}, 
          ${newItem.unitPrice || 0}, 
          ${newItem.totalPrice || 0}, 
          ${newItem.category || 'Materials'}, 
          ${newItem.supplier || ''}, 
          ${newItem.status || 'pending'}
        )
        RETURNING *
      `;
      
      res.status(201).json({ 
        message: 'BOQ item created successfully',
        item: insertedItems[0]
      });
    } catch (error) {
      console.error('Error creating BOQ item:', error);
      res.status(500).json({ error: 'Failed to create BOQ item' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
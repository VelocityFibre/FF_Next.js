import type { NextApiRequest, NextApiResponse } from 'next';
import type { BOQItem } from '../../../../src/types/procurement/boq.types';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { boqs, boqItems } from '../../../../src/lib/neon/schema/procurement/boq.schema';
import { eq, and, desc, sql } from 'drizzle-orm';

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
      let boqData;
      let items;
      
      if (projectId && projectId !== 'all') {
        // Get BOQ data for specific project
        boqData = await db
          .select()
          .from(boqs)
          .where(eq(boqs.projectId, projectId as string))
          .orderBy(desc(boqs.createdAt));
        
        // Get BOQ items if we have BOQs
        if (boqData.length > 0) {
          items = await db
            .select()
            .from(boqItems)
            .where(eq(boqItems.projectId, projectId as string))
            .orderBy(boqItems.lineNumber);
        } else {
          items = [];
        }
      } else {
        // Get all BOQs with their items count
        const boqWithCount = await db
          .select({
            boq: boqs,
            itemsCount: sql<number>`COUNT(${boqItems.id})::int`,
          })
          .from(boqs)
          .leftJoin(boqItems, eq(boqs.id, boqItems.boqId))
          .groupBy(boqs.id)
          .orderBy(desc(boqs.createdAt))
          .limit(100);
        
        boqData = boqWithCount.map(row => row.boq);
        
        // Get items for all BOQs
        if (boqData.length > 0) {
          const boqIds = boqData.map(b => b.id);
          items = await db
            .select()
            .from(boqItems)
            .where(sql`${boqItems.boqId} = ANY(${boqIds})`)
            .orderBy(boqItems.lineNumber)
            .limit(500);
        } else {
          items = [];
        }
      }
      
      // Transform data to match expected format
      const transformedItems: BOQItem[] = items.map(item => ({
        id: item.id,
        projectId: item.projectId,
        itemCode: item.itemCode || '',
        description: item.description,
        unit: item.uom,
        quantity: Number(item.quantity),
        unitPrice: item.unitPrice ? Number(item.unitPrice) : 0,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : 0,
        category: item.category || 'Materials',
        supplier: item.catalogItemName || '',
        status: item.procurementStatus || 'pending',
        createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: item.updatedAt?.toISOString() || new Date().toISOString(),
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
      const [insertedItem] = await db
        .insert(boqItems)
        .values({
          ...newItem,
          boqId: newItem.boqId || null,
          projectId: newItem.projectId || projectId,
        })
        .returning();
      
      res.status(201).json({ 
        message: 'BOQ item created successfully',
        item: insertedItem
      });
    } catch (error) {
      console.error('Error creating BOQ item:', error);
      res.status(500).json({ error: 'Failed to create BOQ item' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
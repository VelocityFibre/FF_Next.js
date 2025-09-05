import type { NextApiRequest, NextApiResponse } from 'next';
import type { RFQ } from '../../../../src/types/procurement/rfq.types';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { rfqs, rfqItems, quotes } from '../../../../src/lib/neon/schema/procurement/rfq';
import { eq, and, desc, sql, count } from 'drizzle-orm';

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
      let rfqData;
      let itemsData;
      
      if (projectId && projectId !== 'all') {
        // Get RFQs for specific project
        rfqData = await db
          .select()
          .from(rfqs)
          .where(eq(rfqs.projectId, projectId as string))
          .orderBy(desc(rfqs.createdAt));
        
        // Get RFQ items
        if (rfqData.length > 0) {
          const rfqIds = rfqData.map(r => r.id);
          itemsData = await db
            .select()
            .from(rfqItems)
            .where(sql`${rfqItems.rfqId} = ANY(${rfqIds})`)
            .orderBy(rfqItems.lineNumber);
        } else {
          itemsData = [];
        }
      } else {
        // Get all RFQs with quotes count
        const rfqWithStats = await db
          .select({
            rfq: rfqs,
            quotesCount: sql<number>`(SELECT COUNT(*) FROM quotes WHERE quotes.rfq_id = ${rfqs.id})::int`,
          })
          .from(rfqs)
          .orderBy(desc(rfqs.createdAt))
          .limit(100);
        
        rfqData = rfqWithStats.map(row => ({
          ...row.rfq,
          quotesReceived: row.quotesCount
        }));
        
        // Get items for recent RFQs
        if (rfqData.length > 0) {
          const rfqIds = rfqData.slice(0, 20).map(r => r.id);
          itemsData = await db
            .select()
            .from(rfqItems)
            .where(sql`${rfqItems.rfqId} = ANY(${rfqIds})`)
            .orderBy(rfqItems.lineNumber)
            .limit(200);
        } else {
          itemsData = [];
        }
      }
      
      // Group items by RFQ
      const itemsByRfq = itemsData.reduce((acc, item) => {
        if (!acc[item.rfqId]) acc[item.rfqId] = [];
        acc[item.rfqId].push(item);
        return acc;
      }, {} as Record<string, typeof itemsData>);
      
      // Transform data to match expected format
      const transformedRFQs: RFQ[] = rfqData.map(rfq => ({
        id: rfq.id,
        rfqNumber: rfq.rfqNumber,
        projectId: rfq.projectId,
        title: rfq.title,
        description: rfq.description || '',
        status: rfq.status as 'draft' | 'open' | 'evaluating' | 'awarded' | 'cancelled',
        createdDate: rfq.createdAt?.toISOString() || new Date().toISOString(),
        dueDate: rfq.responseDeadline?.toISOString() || new Date().toISOString(),
        items: (itemsByRfq[rfq.id] || []).map(item => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.uom,
          specifications: typeof item.specifications === 'string' 
            ? item.specifications 
            : JSON.stringify(item.specifications || '')
        })),
        suppliers: Array.isArray(rfq.invitedSuppliers) 
          ? rfq.invitedSuppliers 
          : (rfq.invitedSuppliers ? [rfq.invitedSuppliers] : []),
        quotesReceived: (rfq as any).quotesReceived || 0,
        totalValue: rfq.totalBudgetEstimate ? Number(rfq.totalBudgetEstimate) : 0,
        createdBy: rfq.createdBy || 'System',
        updatedAt: rfq.updatedAt?.toISOString() || new Date().toISOString()
      }));
      
      // Add aggregated stats
      const stats = {
        totalRFQs: transformedRFQs.length,
        openRFQs: transformedRFQs.filter(r => r.status === 'open').length,
        totalValue: transformedRFQs.reduce((sum, rfq) => sum + rfq.totalValue, 0),
        avgQuotesPerRFQ: transformedRFQs.length > 0 
          ? transformedRFQs.reduce((sum, rfq) => sum + rfq.quotesReceived, 0) / transformedRFQs.length 
          : 0,
      };

      res.status(200).json({ 
        rfqs: transformedRFQs,
        total: transformedRFQs.length,
        stats 
      });
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      res.status(500).json({ error: 'Failed to fetch RFQs' });
    }
  } else if (req.method === 'POST') {
    try {
      const newRFQ = req.body;
      
      // Generate RFQ number if not provided
      const rfqNumber = newRFQ.rfqNumber || `RFQ-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      // Insert new RFQ into database
      const [insertedRFQ] = await db
        .insert(rfqs)
        .values({
          ...newRFQ,
          rfqNumber,
          projectId: newRFQ.projectId || projectId,
          responseDeadline: new Date(newRFQ.responseDeadline || Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .returning();
      
      res.status(201).json({ 
        message: 'RFQ created successfully',
        rfq: insertedRFQ
      });
    } catch (error) {
      console.error('Error creating RFQ:', error);
      res.status(500).json({ error: 'Failed to create RFQ' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
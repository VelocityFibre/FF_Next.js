import { NextApiRequest, NextApiResponse } from 'next';
// // import { getAuth } from '@clerk/nextjs/server';
import { getAuth } from '../../lib/auth-mock';
import { db, sowImports, projects, NewSOWImport, safeQuery } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

// Type definitions for SOW import data
interface SOWData {
  type: 'poles' | 'drops' | 'fibre';
  projectId: number;
  fileName: string;
  data: Array<Record<string, any>>;
}

interface ProcessedSOWResult {
  success: boolean;
  processedCount: number;
  totalCount: number;
  errors?: string[];
}

// Main API handler for SOW imports
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For testing: use mock user ID
  // TODO: Re-enable Clerk authentication
  const userId = 'test-user-123';
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, userId);
    case 'POST':
      return handlePost(req, res, userId);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

// GET /api/sow - Get SOW import history
async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { projectId, limit = 20 } = req.query;
  
  try {
    const conditions = projectId ? eq(sowImports.projectId, Number(projectId)) : undefined;
    
    const result = await safeQuery(
      async () => await db.select()
        .from(sowImports)
        .where(conditions)
        .orderBy(desc(sowImports.importedAt))
        .limit(Number(limit)),
      'Failed to fetch SOW imports'
    );
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    return res.status(200).json(result.data || []);
  } catch (error) {
    console.error('Error in GET /api/sow:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/sow - Import SOW data
async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { type, projectId, fileName, data }: SOWData = req.body;
    
    // Validate input
    if (!type || !['poles', 'drops', 'fibre'].includes(type)) {
      return res.status(400).json({ error: 'Invalid SOW type. Must be poles, drops, or fibre' });
    }
    
    if (!projectId || !Number.isInteger(projectId)) {
      return res.status(400).json({ error: 'Valid project ID is required' });
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'Data array is required and cannot be empty' });
    }
    
    // Verify project exists
    const projectResult = await safeQuery(
      async () => await db.select().from(projects).where(eq(projects.id, projectId)).limit(1),
      'Failed to verify project'
    );
    
    if (projectResult.error || !projectResult.data?.[0]) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Process SOW data
    const processedResult = await processSOWData(type, data);
    
    // Create SOW import record
    const importData: NewSOWImport = {
      projectId,
      fileName: fileName || `${type}_import_${Date.now()}`,
      importType: type,
      status: processedResult.success ? 'completed' : 'failed',
      data: data as any, // Store original data as JSONB
      processedRecords: processedResult.processedCount,
      totalRecords: processedResult.totalCount,
      errors: processedResult.errors ? { errors: processedResult.errors } : null,
      importedAt: new Date(),
      importedBy: userId,
    };
    
    const result = await safeQuery(
      async () => await db.insert(sowImports).values(importData).returning(),
      'Failed to save SOW import'
    );
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    // Update project with SOW data reference
    if (processedResult.success) {
      await safeQuery(
        async () => await db.update(projects)
          .set({
            sowData: { 
              ...((projectResult.data![0] as any).sowData || {}),
              [type]: {
                importId: result.data![0].id,
                recordCount: processedResult.processedCount,
                lastImported: new Date(),
              }
            },
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId)),
        'Failed to update project SOW data'
      );
    }
    
    return res.status(201).json({
      message: `SOW ${type} data imported successfully`,
      import: result.data![0],
      processed: processedResult.processedCount,
      total: processedResult.totalCount,
      errors: processedResult.errors,
    });
  } catch (error) {
    console.error('Error in POST /api/sow:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/sow/status - Get import status
async function handleGetStatus(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Import ID is required' });
  }
  
  try {
    const result = await safeQuery(
      async () => await db.select()
        .from(sowImports)
        .where(eq(sowImports.id, Number(id)))
        .limit(1),
      'Failed to fetch import status'
    );
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    if (!result.data?.[0]) {
      return res.status(404).json({ error: 'Import not found' });
    }
    
    return res.status(200).json(result.data[0]);
  } catch (error) {
    console.error('Error in GET /api/sow/status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Process and validate SOW data based on type
async function processSOWData(type: string, data: Array<Record<string, any>>): Promise<ProcessedSOWResult> {
  const errors: string[] = [];
  let processedCount = 0;
  const totalCount = data.length;
  
  // Define required fields for each SOW type
  const requiredFields: Record<string, string[]> = {
    poles: ['poleId', 'latitude', 'longitude', 'status'],
    drops: ['dropId', 'address', 'status', 'poleId'],
    fibre: ['fibreId', 'fromPole', 'toPole', 'length', 'status'],
  };
  
  const required = requiredFields[type] || [];
  
  // Validate and process each record
  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    const recordErrors: string[] = [];
    
    // Check required fields
    for (const field of required) {
      if (!record[field]) {
        recordErrors.push(`Row ${i + 1}: Missing required field '${field}'`);
      }
    }
    
    // Type-specific validation
    if (type === 'poles') {
      if (record.latitude && (isNaN(record.latitude) || Math.abs(record.latitude) > 90)) {
        recordErrors.push(`Row ${i + 1}: Invalid latitude value`);
      }
      if (record.longitude && (isNaN(record.longitude) || Math.abs(record.longitude) > 180)) {
        recordErrors.push(`Row ${i + 1}: Invalid longitude value`);
      }
    } else if (type === 'fibre') {
      if (record.length && (isNaN(record.length) || record.length < 0)) {
        recordErrors.push(`Row ${i + 1}: Invalid fibre length`);
      }
    }
    
    if (recordErrors.length === 0) {
      processedCount++;
    } else {
      errors.push(...recordErrors);
    }
  }
  
  return {
    success: errors.length === 0,
    processedCount,
    totalCount,
    errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit errors to first 10
  };
}
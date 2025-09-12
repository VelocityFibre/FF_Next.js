import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '../../../lib/auth-mock';
import { neon } from '@neondatabase/serverless';
import * as XLSX from 'xlsx';
import { processPoles, processDrops, processFibre } from '../../../src/services/sow/processor/dataProcessors';

const getSql = () => neon(process.env.DATABASE_URL!);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { projectId, dataType, fileData } = req.body;

    if (!projectId || !dataType || !fileData) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: projectId, dataType, or fileData' 
      });
    }

    // Parse Excel data from base64
    const buffer = Buffer.from(fileData, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No valid data found in file' 
      });
    }

    const sql = getSql();
    let processedData: any[] = [];
    let tableName = '';

    // Process data based on type
    switch (dataType) {
      case 'poles':
        processedData = processPoles(rawData);
        tableName = 'sow_poles';
        break;
      case 'drops':
        processedData = processDrops(rawData);
        tableName = 'sow_drops';
        break;
      case 'fibre':
        processedData = processFibre(rawData);
        tableName = 'sow_fibre';
        break;
      default:
        return res.status(400).json({ 
          success: false,
          error: `Invalid data type: ${dataType}` 
        });
    }

    if (processedData.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No valid data found after processing. Please check the file format.' 
      });
    }

    // Insert data into database
    console.log(`Inserting ${processedData.length} ${dataType} records for project ${projectId}`);

    // Clear existing data for this project
    await sql`DELETE FROM ${sql(tableName)} WHERE project_id = ${projectId}`;

    // Batch insert new data
    const values = processedData.map((item: any) => ({
      ...item,
      project_id: projectId,
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      
      if (dataType === 'poles') {
        await sql`
          INSERT INTO sow_poles ${sql(batch)}
        `;
      } else if (dataType === 'drops') {
        await sql`
          INSERT INTO sow_drops ${sql(batch)}
        `;
      } else if (dataType === 'fibre') {
        await sql`
          INSERT INTO sow_fibre ${sql(batch)}
        `;
      }
      
      inserted += batch.length;
    }

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${inserted} ${dataType} records`,
      count: inserted,
      dataType,
      projectId
    });

  } catch (error) {
    console.error('SOW import error:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import SOW data' 
    });
  }
}
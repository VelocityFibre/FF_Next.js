import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get KPI targets
      const targets = await sql`
        SELECT 
          id,
          kpi_id,
          kpi_name,
          target_value,
          min_value,
          max_value,
          unit,
          category,
          period,
          created_at,
          updated_at
        FROM kpi_targets
        WHERE active = true
        ORDER BY category, kpi_name
      `.catch(() => []);

      // If no targets exist in database, return default targets
      const defaultTargets = [
        {
          id: '1',
          kpi_id: 'completion-rate',
          kpi_name: 'Project Completion Rate',
          target_value: 90,
          min_value: 80,
          max_value: 100,
          unit: '%',
          category: 'performance',
          period: 'monthly'
        },
        {
          id: '2',
          kpi_id: 'budget-utilization',
          kpi_name: 'Budget Utilization',
          target_value: 95,
          min_value: 85,
          max_value: 100,
          unit: '%',
          category: 'financial',
          period: 'monthly'
        },
        {
          id: '3',
          kpi_id: 'on-time-delivery',
          kpi_name: 'On-Time Delivery',
          target_value: 95,
          min_value: 85,
          max_value: 100,
          unit: '%',
          category: 'performance',
          period: 'monthly'
        },
        {
          id: '4',
          kpi_id: 'staff-productivity',
          kpi_name: 'Staff Productivity',
          target_value: 85,
          min_value: 75,
          max_value: 100,
          unit: '%',
          category: 'productivity',
          period: 'monthly'
        },
        {
          id: '5',
          kpi_id: 'quality-score',
          kpi_name: 'Quality Score',
          target_value: 90,
          min_value: 80,
          max_value: 100,
          unit: '%',
          category: 'quality',
          period: 'monthly'
        },
        {
          id: '6',
          kpi_id: 'safety-score',
          kpi_name: 'Safety Score',
          target_value: 100,
          min_value: 95,
          max_value: 100,
          unit: '%',
          category: 'safety',
          period: 'monthly'
        },
        {
          id: '7',
          kpi_id: 'client-satisfaction',
          kpi_name: 'Client Satisfaction',
          target_value: 4.5,
          min_value: 4.0,
          max_value: 5.0,
          unit: 'rating',
          category: 'quality',
          period: 'quarterly'
        },
        {
          id: '8',
          kpi_id: 'resource-efficiency',
          kpi_name: 'Resource Efficiency',
          target_value: 90,
          min_value: 80,
          max_value: 100,
          unit: '%',
          category: 'efficiency',
          period: 'monthly'
        }
      ];

      const finalTargets = targets.length > 0 ? targets : defaultTargets;

      return res.status(200).json({
        success: true,
        data: finalTargets,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      const { targets } = req.body;
      
      if (!targets || !Array.isArray(targets) || targets.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Targets array is required' 
        });
      }

      // First, create the targets table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS kpi_targets (
          id SERIAL PRIMARY KEY,
          kpi_id VARCHAR(100) UNIQUE NOT NULL,
          kpi_name VARCHAR(255) NOT NULL,
          target_value DECIMAL(10,2) NOT NULL,
          min_value DECIMAL(10,2),
          max_value DECIMAL(10,2),
          unit VARCHAR(50),
          category VARCHAR(100),
          period VARCHAR(50),
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `.catch(() => {});

      const savedTargets = [];
      const errors = [];

      for (const target of targets) {
        try {
          // Upsert each target
          const result = await sql`
            INSERT INTO kpi_targets (
              kpi_id, kpi_name, target_value, min_value, max_value, 
              unit, category, period
            )
            VALUES (
              ${target.kpiId}, ${target.kpiName}, ${target.targetValue},
              ${target.minValue}, ${target.maxValue}, ${target.unit},
              ${target.category}, ${target.period || 'monthly'}
            )
            ON CONFLICT (kpi_id) DO UPDATE SET
              kpi_name = EXCLUDED.kpi_name,
              target_value = EXCLUDED.target_value,
              min_value = EXCLUDED.min_value,
              max_value = EXCLUDED.max_value,
              unit = EXCLUDED.unit,
              category = EXCLUDED.category,
              period = EXCLUDED.period,
              updated_at = CURRENT_TIMESTAMP
            RETURNING *
          `;
          
          savedTargets.push(result[0]);
        } catch (error) {
          errors.push({
            kpiId: target.kpiId,
            error: error.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: savedTargets,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('KPI targets error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
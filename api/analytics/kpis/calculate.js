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
    if (req.method === 'POST') {
      const { kpiIds, parameters = {} } = req.body;
      
      if (!kpiIds || !Array.isArray(kpiIds) || kpiIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'KPI IDs array is required' 
        });
      }

      const { 
        startDate, 
        endDate, 
        projectId, 
        clientId, 
        departmentId,
        includeInactive = false 
      } = parameters;

      const calculatedKPIs = [];

      // Calculate each requested KPI
      for (const kpiId of kpiIds) {
        let kpiData = null;

        switch (kpiId) {
          case 'project-velocity':
            const velocityResult = await sql`
              SELECT 
                COUNT(CASE WHEN status IN ('COMPLETED', 'completed') THEN 1 END) as completed,
                EXTRACT(MONTH FROM AGE(COALESCE(${endDate}, CURRENT_DATE), COALESCE(${startDate}, CURRENT_DATE - INTERVAL '30 days'))) + 1 as months
              FROM projects
              WHERE created_at BETWEEN COALESCE(${startDate}, CURRENT_DATE - INTERVAL '30 days') AND COALESCE(${endDate}, CURRENT_DATE)
              ${projectId ? sql`AND id = ${projectId}` : sql``}
              ${clientId ? sql`AND client_id = ${clientId}` : sql``}
            `;
            const vel = velocityResult[0];
            const velocity = vel.months > 0 ? (parseInt(vel.completed) / parseFloat(vel.months)) : 0;
            
            kpiData = {
              id: 'project-velocity',
              name: 'Project Completion Velocity',
              value: Math.round(velocity * 10) / 10,
              unit: 'projects/month',
              category: 'performance'
            };
            break;

          case 'resource-efficiency':
            const efficiencyResult = await sql`
              SELECT 
                AVG(CASE 
                  WHEN budget > 0 AND actual_cost > 0 
                  THEN (budget / actual_cost) * 100 
                  ELSE NULL 
                END) as efficiency,
                COUNT(*) as project_count
              FROM projects
              WHERE actual_cost > 0
              ${projectId ? sql`AND id = ${projectId}` : sql``}
              ${startDate ? sql`AND created_at >= ${startDate}` : sql``}
              ${endDate ? sql`AND created_at <= ${endDate}` : sql``}
            `;
            
            kpiData = {
              id: 'resource-efficiency',
              name: 'Resource Efficiency',
              value: Math.round((parseFloat(efficiencyResult[0].efficiency) || 0) * 10) / 10,
              unit: '%',
              category: 'efficiency',
              metadata: {
                projectCount: parseInt(efficiencyResult[0].project_count) || 0
              }
            };
            break;

          case 'client-satisfaction':
            // Simulated client satisfaction based on project success
            const satisfactionResult = await sql`
              SELECT 
                c.id,
                c.name,
                COUNT(p.id) as total_projects,
                COUNT(CASE WHEN p.status IN ('COMPLETED', 'completed') AND p.updated_at <= p.end_date THEN 1 END) as on_time_projects,
                AVG(p.progress) as avg_progress
              FROM clients c
              LEFT JOIN projects p ON c.id = p.client_id
              WHERE p.status NOT IN ('archived', 'cancelled', 'deleted')
              ${clientId ? sql`AND c.id = ${clientId}` : sql``}
              GROUP BY c.id, c.name
            `;
            
            const avgSatisfaction = satisfactionResult.reduce((sum, client) => {
              const onTimeRate = client.total_projects > 0 
                ? (parseInt(client.on_time_projects) / parseInt(client.total_projects)) * 100
                : 0;
              return sum + (onTimeRate * 0.6 + (parseFloat(client.avg_progress) || 0) * 0.4);
            }, 0) / Math.max(1, satisfactionResult.length);
            
            kpiData = {
              id: 'client-satisfaction',
              name: 'Client Satisfaction Score',
              value: Math.round(avgSatisfaction * 10) / 10,
              unit: '%',
              category: 'quality'
            };
            break;

          case 'cost-performance-index':
            const cpiResult = await sql`
              SELECT 
                SUM(budget) as total_budget,
                SUM(actual_cost) as total_cost,
                COUNT(*) as project_count
              FROM projects
              WHERE budget > 0 AND actual_cost > 0
              ${projectId ? sql`AND id = ${projectId}` : sql``}
              ${startDate ? sql`AND created_at >= ${startDate}` : sql``}
              ${endDate ? sql`AND created_at <= ${endDate}` : sql``}
            `;
            
            const cpi = cpiResult[0];
            const costIndex = parseFloat(cpi.total_cost) > 0 
              ? (parseFloat(cpi.total_budget) / parseFloat(cpi.total_cost))
              : 1;
            
            kpiData = {
              id: 'cost-performance-index',
              name: 'Cost Performance Index (CPI)',
              value: Math.round(costIndex * 100) / 100,
              unit: 'ratio',
              category: 'financial',
              interpretation: costIndex >= 1 ? 'Under budget' : 'Over budget'
            };
            break;

          case 'schedule-performance-index':
            const spiResult = await sql`
              SELECT 
                COUNT(*) as total,
                COUNT(CASE 
                  WHEN progress >= (
                    EXTRACT(DAY FROM (CURRENT_DATE - start_date))::float / 
                    NULLIF(EXTRACT(DAY FROM (end_date - start_date)), 0) * 100
                  ) THEN 1 
                END) as on_schedule
              FROM projects
              WHERE status IN ('ACTIVE', 'active', 'IN_PROGRESS', 'in_progress')
              AND start_date IS NOT NULL AND end_date IS NOT NULL
              ${projectId ? sql`AND id = ${projectId}` : sql``}
            `;
            
            const spi = spiResult[0];
            const scheduleIndex = parseInt(spi.total) > 0 
              ? (parseInt(spi.on_schedule) / parseInt(spi.total))
              : 0;
            
            kpiData = {
              id: 'schedule-performance-index',
              name: 'Schedule Performance Index (SPI)',
              value: Math.round(scheduleIndex * 100) / 100,
              unit: 'ratio',
              category: 'performance',
              interpretation: scheduleIndex >= 0.9 ? 'On schedule' : 'Behind schedule'
            };
            break;

          case 'team-utilization':
            const utilizationResult = await sql`
              SELECT 
                COUNT(DISTINCT staff_id) as total_staff,
                AVG(hours_worked) as avg_hours,
                SUM(hours_worked) as total_hours,
                AVG(productivity) as avg_productivity
              FROM staff_performance
              WHERE period_start >= COALESCE(${startDate}, CURRENT_DATE - INTERVAL '30 days')
              AND period_start <= COALESCE(${endDate}, CURRENT_DATE)
            `;
            
            const util = utilizationResult[0];
            const utilization = (parseFloat(util.avg_hours) / 160) * 100; // Assuming 160 hours/month
            
            kpiData = {
              id: 'team-utilization',
              name: 'Team Utilization Rate',
              value: Math.round(Math.min(100, utilization) * 10) / 10,
              unit: '%',
              category: 'productivity',
              metadata: {
                totalStaff: parseInt(util.total_staff) || 0,
                avgHours: parseFloat(util.avg_hours) || 0
              }
            };
            break;

          default:
            kpiData = {
              id: kpiId,
              name: kpiId,
              value: 0,
              unit: 'unknown',
              category: 'custom',
              error: 'KPI calculation not implemented'
            };
        }

        if (kpiData) {
          calculatedKPIs.push(kpiData);
        }
      }

      return res.status(200).json({
        success: true,
        data: calculatedKPIs,
        parameters,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('KPI calculation error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
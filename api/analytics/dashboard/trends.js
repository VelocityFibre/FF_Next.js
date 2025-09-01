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
      const { startDate, endDate, groupBy = 'month' } = req.query;
      
      // Default to last 12 months if no dates provided
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getFullYear(), end.getMonth() - 11, 1);

      let dateFormat;
      switch (groupBy) {
        case 'day':
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          dateFormat = 'YYYY-"W"IW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
        case 'quarter':
          dateFormat = 'YYYY-"Q"Q';
          break;
        case 'year':
          dateFormat = 'YYYY';
          break;
        default:
          dateFormat = 'YYYY-MM';
      }

      // Get project trends
      const projectTrends = await sql`
        SELECT 
          TO_CHAR(created_at, ${dateFormat}) as period,
          COUNT(*) as new_projects,
          COUNT(CASE WHEN status IN ('COMPLETED', 'completed') THEN 1 END) as completed_projects,
          AVG(progress) as avg_progress,
          SUM(budget) as total_budget
        FROM projects
        WHERE created_at BETWEEN ${start.toISOString()} AND ${end.toISOString()}
        AND status NOT IN ('archived', 'cancelled', 'deleted')
        GROUP BY TO_CHAR(created_at, ${dateFormat})
        ORDER BY period
      `;

      // Get revenue trends
      const revenueTrends = await sql`
        SELECT 
          TO_CHAR(created_at, ${dateFormat}) as period,
          SUM(total_value) as revenue,
          SUM(paid_amount) as collected,
          COUNT(*) as sow_count
        FROM sow
        WHERE created_at BETWEEN ${start.toISOString()} AND ${end.toISOString()}
        AND status IN ('approved', 'paid')
        GROUP BY TO_CHAR(created_at, ${dateFormat})
        ORDER BY period
      `.catch(() => []);

      // Get staff performance trends
      const staffTrends = await sql`
        SELECT 
          TO_CHAR(period_start, ${dateFormat}) as period,
          AVG(productivity) as avg_productivity,
          AVG(quality_score) as avg_quality,
          SUM(hours_worked) as total_hours,
          COUNT(DISTINCT staff_id) as active_staff
        FROM staff_performance
        WHERE period_start BETWEEN ${start.toISOString()} AND ${end.toISOString()}
        GROUP BY TO_CHAR(period_start, ${dateFormat})
        ORDER BY period
      `.catch(() => []);

      // Get KPI trends
      const kpiTrends = await sql`
        SELECT 
          TO_CHAR(recorded_date, ${dateFormat}) as period,
          metric_type,
          AVG(metric_value) as avg_value
        FROM kpi_metrics
        WHERE recorded_date BETWEEN ${start.toISOString()} AND ${end.toISOString()}
        AND metric_type IN ('efficiency', 'quality', 'safety', 'productivity')
        GROUP BY TO_CHAR(recorded_date, ${dateFormat}), metric_type
        ORDER BY period, metric_type
      `.catch(() => []);

      // Calculate trend directions
      const calculateTrend = (data, key) => {
        if (data.length < 2) return 'stable';
        const lastValue = parseFloat(data[data.length - 1][key]) || 0;
        const prevValue = parseFloat(data[data.length - 2][key]) || 0;
        if (lastValue > prevValue * 1.05) return 'up';
        if (lastValue < prevValue * 0.95) return 'down';
        return 'stable';
      };

      // Format KPI trends by type
      const kpiByType = {};
      kpiTrends.forEach(kpi => {
        if (!kpiByType[kpi.metric_type]) {
          kpiByType[kpi.metric_type] = [];
        }
        kpiByType[kpi.metric_type].push({
          period: kpi.period,
          value: parseFloat(kpi.avg_value) || 0
        });
      });

      return res.status(200).json({
        success: true,
        data: {
          period: { start: start.toISOString(), end: end.toISOString() },
          groupBy,
          projects: {
            data: projectTrends.map(p => ({
              period: p.period,
              newProjects: parseInt(p.new_projects) || 0,
              completedProjects: parseInt(p.completed_projects) || 0,
              avgProgress: parseFloat(p.avg_progress) || 0,
              totalBudget: parseFloat(p.total_budget) || 0
            })),
            trends: {
              newProjects: calculateTrend(projectTrends, 'new_projects'),
              completedProjects: calculateTrend(projectTrends, 'completed_projects'),
              avgProgress: calculateTrend(projectTrends, 'avg_progress')
            }
          },
          revenue: {
            data: revenueTrends.map(r => ({
              period: r.period,
              revenue: parseFloat(r.revenue) || 0,
              collected: parseFloat(r.collected) || 0,
              sowCount: parseInt(r.sow_count) || 0
            })),
            trends: {
              revenue: calculateTrend(revenueTrends, 'revenue'),
              collected: calculateTrend(revenueTrends, 'collected')
            }
          },
          staff: {
            data: staffTrends.map(s => ({
              period: s.period,
              avgProductivity: parseFloat(s.avg_productivity) || 0,
              avgQuality: parseFloat(s.avg_quality) || 0,
              totalHours: parseFloat(s.total_hours) || 0,
              activeStaff: parseInt(s.active_staff) || 0
            })),
            trends: {
              productivity: calculateTrend(staffTrends, 'avg_productivity'),
              quality: calculateTrend(staffTrends, 'avg_quality')
            }
          },
          kpis: kpiByType,
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Dashboard trends error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
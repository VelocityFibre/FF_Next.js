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
      const { staffId, period = 'monthly' } = req.query;

      // Get staff performance data
      if (staffId) {
        // Individual staff performance
        const performanceData = await sql`
          SELECT 
            sp.*,
            s.name as staff_name,
            s.role,
            s.department
          FROM staff_performance sp
          JOIN staff s ON sp.staff_id = s.id
          WHERE sp.staff_id = ${staffId}
          AND sp.period_type = ${period}
          ORDER BY sp.period_start DESC
          LIMIT 12
        `;

        // Calculate averages and trends
        const summary = await sql`
          SELECT 
            AVG(productivity) as avg_productivity,
            AVG(quality_score) as avg_quality,
            AVG(safety_score) as avg_safety,
            AVG(efficiency) as avg_efficiency,
            SUM(hours_worked) as total_hours,
            SUM(tasks_completed) as total_tasks,
            MIN(period_start) as first_period,
            MAX(period_start) as last_period
          FROM staff_performance
          WHERE staff_id = ${staffId}
          AND period_type = ${period}
        `;

        // Get recent trend (last 3 periods vs previous 3)
        const trendAnalysis = await sql`
          WITH recent_periods AS (
            SELECT * FROM staff_performance
            WHERE staff_id = ${staffId} AND period_type = ${period}
            ORDER BY period_start DESC
            LIMIT 3
          ),
          previous_periods AS (
            SELECT * FROM staff_performance
            WHERE staff_id = ${staffId} AND period_type = ${period}
            ORDER BY period_start DESC
            LIMIT 6 OFFSET 3
          )
          SELECT 
            (SELECT AVG(productivity) FROM recent_periods) as recent_productivity,
            (SELECT AVG(productivity) FROM previous_periods) as previous_productivity,
            (SELECT AVG(quality_score) FROM recent_periods) as recent_quality,
            (SELECT AVG(quality_score) FROM previous_periods) as previous_quality
        `;

        const staff = performanceData[0];
        const sum = summary[0];
        const trend = trendAnalysis[0];

        return res.status(200).json({
          success: true,
          data: {
            staffInfo: staff ? {
              id: staffId,
              name: staff.staff_name,
              role: staff.role,
              department: staff.department
            } : null,
            summary: {
              avgProductivity: parseFloat(sum.avg_productivity) || 0,
              avgQuality: parseFloat(sum.avg_quality) || 0,
              avgSafety: parseFloat(sum.avg_safety) || 0,
              avgEfficiency: parseFloat(sum.avg_efficiency) || 0,
              totalHours: parseFloat(sum.total_hours) || 0,
              totalTasks: parseInt(sum.total_tasks) || 0,
              periodsCovered: sum.first_period && sum.last_period ? {
                from: sum.first_period,
                to: sum.last_period
              } : null
            },
            trends: {
              productivity: {
                current: parseFloat(trend.recent_productivity) || 0,
                previous: parseFloat(trend.previous_productivity) || 0,
                change: trend.previous_productivity > 0 
                  ? ((parseFloat(trend.recent_productivity) - parseFloat(trend.previous_productivity)) / parseFloat(trend.previous_productivity)) * 100
                  : 0
              },
              quality: {
                current: parseFloat(trend.recent_quality) || 0,
                previous: parseFloat(trend.previous_quality) || 0,
                change: trend.previous_quality > 0 
                  ? ((parseFloat(trend.recent_quality) - parseFloat(trend.previous_quality)) / parseFloat(trend.previous_quality)) * 100
                  : 0
              }
            },
            history: performanceData.map(p => ({
              periodStart: p.period_start,
              periodEnd: p.period_end,
              productivity: parseFloat(p.productivity) || 0,
              qualityScore: parseFloat(p.quality_score) || 0,
              safetyScore: parseFloat(p.safety_score) || 0,
              efficiency: parseFloat(p.efficiency) || 0,
              hoursWorked: parseFloat(p.hours_worked) || 0,
              tasksCompleted: parseInt(p.tasks_completed) || 0,
              attendanceRate: parseFloat(p.attendance_rate) || 100
            })),
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // All staff performance summary
        const performanceSummary = await sql`
          SELECT 
            sp.staff_id,
            s.name as staff_name,
            s.role,
            s.department,
            AVG(sp.productivity) as avg_productivity,
            AVG(sp.quality_score) as avg_quality,
            AVG(sp.safety_score) as avg_safety,
            AVG(sp.efficiency) as avg_efficiency,
            SUM(sp.hours_worked) as total_hours,
            SUM(sp.tasks_completed) as total_tasks,
            COUNT(*) as periods_recorded
          FROM staff_performance sp
          JOIN staff s ON sp.staff_id = s.id
          WHERE sp.period_type = ${period}
          AND sp.period_start >= CURRENT_DATE - INTERVAL '6 months'
          AND s.status = 'active'
          GROUP BY sp.staff_id, s.name, s.role, s.department
          ORDER BY avg_productivity DESC
        `;

        // Get top performers by different metrics
        const topPerformers = await sql`
          WITH ranked_staff AS (
            SELECT 
              staff_id,
              AVG(productivity) as avg_productivity,
              AVG(quality_score) as avg_quality,
              AVG(safety_score) as avg_safety,
              AVG(efficiency) as avg_efficiency
            FROM staff_performance
            WHERE period_type = ${period}
            AND period_start >= CURRENT_DATE - INTERVAL '3 months'
            GROUP BY staff_id
          )
          SELECT 
            'productivity' as metric,
            s.id,
            s.name,
            s.role,
            rs.avg_productivity as score
          FROM ranked_staff rs
          JOIN staff s ON rs.staff_id = s.id
          WHERE s.status = 'active'
          ORDER BY rs.avg_productivity DESC
          LIMIT 5
          UNION ALL
          SELECT 
            'quality' as metric,
            s.id,
            s.name,
            s.role,
            rs.avg_quality as score
          FROM ranked_staff rs
          JOIN staff s ON rs.staff_id = s.id
          WHERE s.status = 'active'
          ORDER BY rs.avg_quality DESC
          LIMIT 5
        `;

        // Group top performers by metric
        const topPerformersByMetric = {};
        topPerformers.forEach(performer => {
          if (!topPerformersByMetric[performer.metric]) {
            topPerformersByMetric[performer.metric] = [];
          }
          topPerformersByMetric[performer.metric].push({
            id: performer.id,
            name: performer.name,
            role: performer.role,
            score: Math.round(parseFloat(performer.score) * 10) / 10
          });
        });

        return res.status(200).json({
          success: true,
          data: {
            summary: performanceSummary.map(s => ({
              staffId: s.staff_id,
              staffName: s.staff_name,
              role: s.role,
              department: s.department,
              avgProductivity: Math.round(parseFloat(s.avg_productivity) * 10) / 10,
              avgQuality: Math.round(parseFloat(s.avg_quality) * 10) / 10,
              avgSafety: Math.round(parseFloat(s.avg_safety) * 10) / 10,
              avgEfficiency: Math.round(parseFloat(s.avg_efficiency) * 10) / 10,
              totalHours: parseFloat(s.total_hours) || 0,
              totalTasks: parseInt(s.total_tasks) || 0,
              attendanceRate: 100, // Default
              periodsRecorded: parseInt(s.periods_recorded) || 0
            })),
            topPerformers: topPerformersByMetric,
            period,
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Staff performance error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
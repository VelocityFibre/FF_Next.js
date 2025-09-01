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
      const { department, months = 12 } = req.query;
      
      const dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - parseInt(months));

      // Get staff growth trends
      const growthTrends = await sql`
        SELECT 
          TO_CHAR(hire_date, 'YYYY-MM') as month,
          COUNT(*) as new_hires,
          SUM(COUNT(*)) OVER (ORDER BY TO_CHAR(hire_date, 'YYYY-MM')) as cumulative_staff
        FROM staff
        WHERE hire_date >= ${dateFrom.toISOString()}
        ${department ? sql`AND department = ${department}` : sql``}
        GROUP BY TO_CHAR(hire_date, 'YYYY-MM')
        ORDER BY month
      `;

      // Get performance trends over time
      const performanceTrends = await sql`
        SELECT 
          TO_CHAR(period_start, 'YYYY-MM') as month,
          AVG(productivity) as avg_productivity,
          AVG(quality_score) as avg_quality,
          AVG(safety_score) as avg_safety,
          AVG(efficiency) as avg_efficiency,
          SUM(hours_worked) as total_hours,
          SUM(tasks_completed) as total_tasks,
          COUNT(DISTINCT staff_id) as active_staff
        FROM staff_performance sp
        ${department ? sql`
          JOIN staff s ON sp.staff_id = s.id
          WHERE s.department = ${department}
          AND sp.period_start >= ${dateFrom.toISOString()}
        ` : sql`
          WHERE period_start >= ${dateFrom.toISOString()}
        `}
        GROUP BY TO_CHAR(period_start, 'YYYY-MM')
        ORDER BY month
      `;

      // Get department-wise trends
      const departmentTrends = await sql`
        SELECT 
          s.department,
          TO_CHAR(sp.period_start, 'YYYY-MM') as month,
          AVG(sp.productivity) as avg_productivity,
          AVG(sp.quality_score) as avg_quality,
          COUNT(DISTINCT sp.staff_id) as staff_count
        FROM staff_performance sp
        JOIN staff s ON sp.staff_id = s.id
        WHERE sp.period_start >= ${dateFrom.toISOString()}
        ${department ? sql`AND s.department = ${department}` : sql``}
        GROUP BY s.department, TO_CHAR(sp.period_start, 'YYYY-MM')
        ORDER BY s.department, month
      `;

      // Get turnover trends
      const turnoverTrends = await sql`
        WITH monthly_counts AS (
          SELECT 
            TO_CHAR(date_series, 'YYYY-MM') as month,
            COUNT(CASE WHEN s.status = 'active' AND s.hire_date <= date_series THEN 1 END) as active_count,
            COUNT(CASE WHEN s.status = 'inactive' AND s.updated_at::date = date_series::date THEN 1 END) as departures
          FROM generate_series(
            ${dateFrom.toISOString()}::date,
            CURRENT_DATE,
            '1 month'::interval
          ) as date_series
          LEFT JOIN staff s ON s.hire_date <= date_series
          ${department ? sql`WHERE s.department = ${department}` : sql``}
          GROUP BY TO_CHAR(date_series, 'YYYY-MM')
        )
        SELECT 
          month,
          active_count,
          departures,
          CASE 
            WHEN LAG(active_count) OVER (ORDER BY month) > 0 
            THEN (departures::float / LAG(active_count) OVER (ORDER BY month)) * 100
            ELSE 0 
          END as turnover_rate
        FROM monthly_counts
        ORDER BY month
      `;

      // Get skill distribution trends
      const skillTrends = await sql`
        SELECT 
          TO_CHAR(sp.period_start, 'YYYY-MM') as month,
          CASE 
            WHEN AVG(sp.productivity) >= 90 THEN 'Expert'
            WHEN AVG(sp.productivity) >= 75 THEN 'Proficient'
            WHEN AVG(sp.productivity) >= 60 THEN 'Competent'
            ELSE 'Developing'
          END as skill_level,
          COUNT(DISTINCT sp.staff_id) as staff_count
        FROM staff_performance sp
        JOIN staff s ON sp.staff_id = s.id
        WHERE sp.period_start >= ${dateFrom.toISOString()}
        ${department ? sql`AND s.department = ${department}` : sql``}
        GROUP BY TO_CHAR(sp.period_start, 'YYYY-MM'), 
                 CASE 
                   WHEN AVG(sp.productivity) >= 90 THEN 'Expert'
                   WHEN AVG(sp.productivity) >= 75 THEN 'Proficient'
                   WHEN AVG(sp.productivity) >= 60 THEN 'Competent'
                   ELSE 'Developing'
                 END
        ORDER BY month, skill_level
      `;

      // Format department trends by department
      const deptTrendsByDept = {};
      departmentTrends.forEach(trend => {
        if (!deptTrendsByDept[trend.department]) {
          deptTrendsByDept[trend.department] = [];
        }
        deptTrendsByDept[trend.department].push({
          month: trend.month,
          avgProductivity: parseFloat(trend.avg_productivity) || 0,
          avgQuality: parseFloat(trend.avg_quality) || 0,
          staffCount: parseInt(trend.staff_count) || 0
        });
      });

      // Format skill trends by month
      const skillTrendsByMonth = {};
      skillTrends.forEach(trend => {
        if (!skillTrendsByMonth[trend.month]) {
          skillTrendsByMonth[trend.month] = {
            Expert: 0,
            Proficient: 0,
            Competent: 0,
            Developing: 0
          };
        }
        skillTrendsByMonth[trend.month][trend.skill_level] = parseInt(trend.staff_count) || 0;
      });

      return res.status(200).json({
        success: true,
        data: {
          period: {
            months: parseInt(months),
            from: dateFrom.toISOString(),
            to: new Date().toISOString()
          },
          growth: growthTrends.map(g => ({
            month: g.month,
            newHires: parseInt(g.new_hires) || 0,
            cumulativeStaff: parseInt(g.cumulative_staff) || 0
          })),
          performance: performanceTrends.map(p => ({
            month: p.month,
            avgProductivity: Math.round(parseFloat(p.avg_productivity) * 10) / 10 || 0,
            avgQuality: Math.round(parseFloat(p.avg_quality) * 10) / 10 || 0,
            avgSafety: Math.round(parseFloat(p.avg_safety) * 10) / 10 || 0,
            avgEfficiency: Math.round(parseFloat(p.avg_efficiency) * 10) / 10 || 0,
            totalHours: parseFloat(p.total_hours) || 0,
            totalTasks: parseInt(p.total_tasks) || 0,
            activeStaff: parseInt(p.active_staff) || 0
          })),
          departmentTrends: deptTrendsByDept,
          turnover: turnoverTrends.map(t => ({
            month: t.month,
            activeCount: parseInt(t.active_count) || 0,
            departures: parseInt(t.departures) || 0,
            turnoverRate: Math.round(parseFloat(t.turnover_rate) * 10) / 10 || 0
          })),
          skillDistribution: Object.entries(skillTrendsByMonth).map(([month, skills]) => ({
            month,
            ...skills
          })),
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Staff trends error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
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
      const { filters = {} } = req.query;
      const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      const { department, role, status, startDate, endDate } = parsedFilters;

      // Get staff statistics
      let conditions = [`status != 'deleted'`];
      if (department) conditions.push(`department = '${department}'`);
      if (role) conditions.push(`role = '${role}'`);
      if (status) conditions.push(`status = '${status}'`);

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';

      // Get staff overview
      const staffOverview = await sql`
        SELECT 
          COUNT(*) as total_staff,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_staff,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_staff,
          COUNT(CASE WHEN status = 'on_leave' THEN 1 END) as on_leave_staff,
          COUNT(DISTINCT department) as departments,
          COUNT(DISTINCT role) as roles
        FROM staff
        ${sql.unsafe(whereClause)}
      `;

      // Get staff by department
      const departmentStats = await sql`
        SELECT 
          department,
          COUNT(*) as count,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
        FROM staff
        ${sql.unsafe(whereClause)}
        GROUP BY department
        ORDER BY count DESC
      `;

      // Get staff by role
      const roleStats = await sql`
        SELECT 
          role,
          COUNT(*) as count,
          AVG(CASE WHEN hire_date IS NOT NULL 
            THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) 
            ELSE 0 END) as avg_experience_years
        FROM staff
        ${sql.unsafe(whereClause)}
        GROUP BY role
        ORDER BY count DESC
      `;

      // Get performance statistics from staff_performance table
      const performanceConditions = [];
      if (startDate) performanceConditions.push(`period_start >= '${startDate}'`);
      if (endDate) performanceConditions.push(`period_start <= '${endDate}'`);
      
      const perfWhereClause = performanceConditions.length > 0 
        ? `WHERE ${performanceConditions.join(' AND ')}` 
        : '';

      const performanceStats = await sql`
        SELECT 
          AVG(productivity) as avg_productivity,
          AVG(quality_score) as avg_quality,
          AVG(safety_score) as avg_safety,
          AVG(efficiency) as avg_efficiency,
          SUM(hours_worked) as total_hours,
          SUM(tasks_completed) as total_tasks,
          COUNT(DISTINCT staff_id) as staff_with_metrics
        FROM staff_performance
        ${sql.unsafe(perfWhereClause)}
      `.catch(() => [{
        avg_productivity: 0,
        avg_quality: 0,
        avg_safety: 0,
        avg_efficiency: 0,
        total_hours: 0,
        total_tasks: 0,
        staff_with_metrics: 0
      }]);

      // Get experience distribution
      const experienceDistribution = await sql`
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) < 1 THEN '< 1 year'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) < 3 THEN '1-3 years'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) < 5 THEN '3-5 years'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) < 10 THEN '5-10 years'
            ELSE '10+ years'
          END as experience_range,
          COUNT(*) as count
        FROM staff
        WHERE hire_date IS NOT NULL
        ${sql.unsafe(whereClause.replace('WHERE', 'AND'))}
        GROUP BY experience_range
        ORDER BY 
          CASE experience_range
            WHEN '< 1 year' THEN 1
            WHEN '1-3 years' THEN 2
            WHEN '3-5 years' THEN 3
            WHEN '5-10 years' THEN 4
            ELSE 5
          END
      `;

      const overview = staffOverview[0];
      const performance = performanceStats[0];

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalStaff: parseInt(overview.total_staff) || 0,
            activeStaff: parseInt(overview.active_staff) || 0,
            inactiveStaff: parseInt(overview.inactive_staff) || 0,
            onLeaveStaff: parseInt(overview.on_leave_staff) || 0,
            departments: parseInt(overview.departments) || 0,
            roles: parseInt(overview.roles) || 0
          },
          departmentDistribution: departmentStats.map(d => ({
            department: d.department || 'Unknown',
            totalCount: parseInt(d.count) || 0,
            activeCount: parseInt(d.active_count) || 0,
            percentage: overview.total_staff > 0 
              ? Math.round((parseInt(d.count) / parseInt(overview.total_staff)) * 100 * 10) / 10
              : 0
          })),
          roleDistribution: roleStats.map(r => ({
            role: r.role || 'Unknown',
            count: parseInt(r.count) || 0,
            avgExperienceYears: Math.round(parseFloat(r.avg_experience_years) * 10) / 10,
            percentage: overview.total_staff > 0 
              ? Math.round((parseInt(r.count) / parseInt(overview.total_staff)) * 100 * 10) / 10
              : 0
          })),
          performance: {
            avgProductivity: Math.round((parseFloat(performance.avg_productivity) || 0) * 10) / 10,
            avgQuality: Math.round((parseFloat(performance.avg_quality) || 0) * 10) / 10,
            avgSafety: Math.round((parseFloat(performance.avg_safety) || 0) * 10) / 10,
            avgEfficiency: Math.round((parseFloat(performance.avg_efficiency) || 0) * 10) / 10,
            totalHours: parseFloat(performance.total_hours) || 0,
            totalTasks: parseInt(performance.total_tasks) || 0,
            staffWithMetrics: parseInt(performance.staff_with_metrics) || 0
          },
          experienceDistribution: experienceDistribution.map(e => ({
            range: e.experience_range,
            count: parseInt(e.count) || 0,
            percentage: overview.total_staff > 0 
              ? Math.round((parseInt(e.count) / parseInt(overview.total_staff)) * 100 * 10) / 10
              : 0
          })),
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Staff statistics error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
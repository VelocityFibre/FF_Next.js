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
      const { period = 'monthly', department, startDate, endDate } = req.query;
      
      // Default to last 3 months if no dates provided
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getFullYear(), end.getMonth() - 2, 1);

      // Calculate expected hours based on period
      const expectedHours = period === 'daily' ? 8 : 
                          period === 'weekly' ? 40 : 
                          period === 'monthly' ? 160 : 480; // quarterly

      // Get utilization data
      const utilizationData = await sql`
        SELECT 
          sp.staff_id,
          s.name as staff_name,
          s.role,
          s.department,
          sp.period_type,
          sp.period_start,
          sp.period_end,
          sp.hours_worked,
          sp.tasks_completed,
          sp.productivity,
          sp.overtime_hours,
          CASE 
            WHEN sp.hours_worked > 0 
            THEN (sp.hours_worked / ${expectedHours}) * 100
            ELSE 0 
          END as utilization_rate,
          CASE 
            WHEN sp.hours_worked > ${expectedHours * 1.2} THEN 'over-utilized'
            WHEN sp.hours_worked >= ${expectedHours * 0.8} THEN 'optimal'
            WHEN sp.hours_worked >= ${expectedHours * 0.5} THEN 'under-utilized'
            ELSE 'low-utilized'
          END as utilization_status
        FROM staff_performance sp
        JOIN staff s ON sp.staff_id = s.id
        WHERE sp.period_type = ${period}
        AND sp.period_start BETWEEN ${start.toISOString()} AND ${end.toISOString()}
        AND s.status = 'active'
        ${department ? sql`AND s.department = ${department}` : sql``}
        ORDER BY sp.period_start DESC, s.department, s.name
      `;

      // Calculate department-wise utilization
      const departmentUtilization = await sql`
        SELECT 
          s.department,
          COUNT(DISTINCT s.id) as staff_count,
          AVG(sp.hours_worked) as avg_hours,
          SUM(sp.hours_worked) as total_hours,
          SUM(sp.tasks_completed) as total_tasks,
          AVG(sp.productivity) as avg_productivity,
          SUM(sp.overtime_hours) as total_overtime,
          AVG(CASE 
            WHEN sp.hours_worked > 0 
            THEN (sp.hours_worked / ${expectedHours}) * 100
            ELSE 0 
          END) as avg_utilization_rate
        FROM staff_performance sp
        JOIN staff s ON sp.staff_id = s.id
        WHERE sp.period_type = ${period}
        AND sp.period_start BETWEEN ${start.toISOString()} AND ${end.toISOString()}
        AND s.status = 'active'
        ${department ? sql`AND s.department = ${department}` : sql``}
        GROUP BY s.department
        ORDER BY avg_utilization_rate DESC
      `;

      // Get utilization trends over time
      const utilizationTrends = await sql`
        SELECT 
          TO_CHAR(sp.period_start, 'YYYY-MM') as month,
          AVG(sp.hours_worked) as avg_hours,
          AVG(CASE 
            WHEN sp.hours_worked > 0 
            THEN (sp.hours_worked / ${expectedHours}) * 100
            ELSE 0 
          END) as avg_utilization_rate,
          COUNT(CASE WHEN sp.hours_worked > ${expectedHours * 1.2} THEN 1 END) as over_utilized_count,
          COUNT(CASE WHEN sp.hours_worked >= ${expectedHours * 0.8} THEN 1 END) as optimal_count,
          COUNT(CASE WHEN sp.hours_worked < ${expectedHours * 0.8} THEN 1 END) as under_utilized_count,
          COUNT(DISTINCT sp.staff_id) as total_staff
        FROM staff_performance sp
        JOIN staff s ON sp.staff_id = s.id
        WHERE sp.period_type = ${period}
        AND sp.period_start BETWEEN ${start.toISOString()} AND ${end.toISOString()}
        AND s.status = 'active'
        ${department ? sql`AND s.department = ${department}` : sql``}
        GROUP BY TO_CHAR(sp.period_start, 'YYYY-MM')
        ORDER BY month
      `;

      // Get capacity vs demand analysis
      const capacityAnalysis = await sql`
        WITH staff_capacity AS (
          SELECT 
            COUNT(DISTINCT s.id) as total_staff,
            COUNT(DISTINCT s.id) * ${expectedHours} as total_capacity_hours
          FROM staff s
          WHERE s.status = 'active'
          ${department ? sql`AND s.department = ${department}` : sql``}
        ),
        actual_utilization AS (
          SELECT 
            SUM(sp.hours_worked) as total_hours_worked,
            SUM(sp.tasks_completed) as total_tasks_completed,
            AVG(sp.productivity) as avg_productivity
          FROM staff_performance sp
          JOIN staff s ON sp.staff_id = s.id
          WHERE sp.period_type = ${period}
          AND sp.period_start BETWEEN ${start.toISOString()} AND ${end.toISOString()}
          AND s.status = 'active'
          ${department ? sql`AND s.department = ${department}` : sql``}
        )
        SELECT 
          sc.total_staff,
          sc.total_capacity_hours,
          au.total_hours_worked,
          au.total_tasks_completed,
          au.avg_productivity,
          CASE 
            WHEN sc.total_capacity_hours > 0 
            THEN (au.total_hours_worked / sc.total_capacity_hours) * 100
            ELSE 0 
          END as overall_utilization_rate
        FROM staff_capacity sc, actual_utilization au
      `;

      // Format individual utilization data
      const individualUtilization = utilizationData.map(u => ({
        staffId: u.staff_id,
        staffName: u.staff_name,
        role: u.role,
        department: u.department,
        periodStart: u.period_start,
        periodEnd: u.period_end,
        hoursWorked: parseFloat(u.hours_worked) || 0,
        tasksCompleted: parseInt(u.tasks_completed) || 0,
        productivity: parseFloat(u.productivity) || 0,
        overtimeHours: parseFloat(u.overtime_hours) || 0,
        utilizationRate: Math.round(parseFloat(u.utilization_rate) * 10) / 10,
        utilizationStatus: u.utilization_status,
        expectedHours
      }));

      // Group by utilization status
      const utilizationDistribution = {
        'over-utilized': 0,
        'optimal': 0,
        'under-utilized': 0,
        'low-utilized': 0
      };
      
      utilizationData.forEach(u => {
        utilizationDistribution[u.utilization_status]++;
      });

      const capacity = capacityAnalysis[0];

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            period,
            dateRange: { start: start.toISOString(), end: end.toISOString() },
            totalStaff: parseInt(capacity.total_staff) || 0,
            totalCapacityHours: parseFloat(capacity.total_capacity_hours) || 0,
            totalHoursWorked: parseFloat(capacity.total_hours_worked) || 0,
            totalTasksCompleted: parseInt(capacity.total_tasks_completed) || 0,
            avgProductivity: Math.round(parseFloat(capacity.avg_productivity) * 10) / 10 || 0,
            overallUtilizationRate: Math.round(parseFloat(capacity.overall_utilization_rate) * 10) / 10 || 0,
            expectedHoursPerPeriod: expectedHours
          },
          distribution: utilizationDistribution,
          departmentUtilization: departmentUtilization.map(d => ({
            department: d.department,
            staffCount: parseInt(d.staff_count) || 0,
            avgHours: Math.round(parseFloat(d.avg_hours) * 10) / 10 || 0,
            totalHours: parseFloat(d.total_hours) || 0,
            totalTasks: parseInt(d.total_tasks) || 0,
            avgProductivity: Math.round(parseFloat(d.avg_productivity) * 10) / 10 || 0,
            totalOvertime: parseFloat(d.total_overtime) || 0,
            avgUtilizationRate: Math.round(parseFloat(d.avg_utilization_rate) * 10) / 10 || 0
          })),
          trends: utilizationTrends.map(t => ({
            month: t.month,
            avgHours: Math.round(parseFloat(t.avg_hours) * 10) / 10 || 0,
            avgUtilizationRate: Math.round(parseFloat(t.avg_utilization_rate) * 10) / 10 || 0,
            distribution: {
              overUtilized: parseInt(t.over_utilized_count) || 0,
              optimal: parseInt(t.optimal_count) || 0,
              underUtilized: parseInt(t.under_utilized_count) || 0
            },
            totalStaff: parseInt(t.total_staff) || 0
          })),
          individuals: individualUtilization.slice(0, 50), // Limit to 50 for performance
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Staff utilization error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
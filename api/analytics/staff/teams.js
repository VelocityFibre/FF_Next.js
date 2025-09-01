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
      const { teamId, department } = req.query;

      // Get team analytics
      // Teams are defined by department in this system
      const teamConditions = [];
      if (teamId) teamConditions.push(sql`s.department = ${teamId}`);
      else if (department) teamConditions.push(sql`s.department = ${department}`);

      const whereClause = teamConditions.length > 0 
        ? sql`WHERE ${sql.join(teamConditions, sql` AND `)} AND s.status = 'active'`
        : sql`WHERE s.status = 'active'`;

      // Get team composition and performance
      const teamAnalytics = await sql`
        SELECT 
          s.department as team_id,
          s.department as team_name,
          COUNT(DISTINCT s.id) as team_size,
          COUNT(DISTINCT s.role) as role_diversity,
          AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.hire_date))) as avg_experience_years,
          COUNT(CASE WHEN s.hire_date >= CURRENT_DATE - INTERVAL '6 months' THEN 1 END) as new_members,
          AVG(sp.productivity) as avg_productivity,
          AVG(sp.quality_score) as avg_quality,
          AVG(sp.safety_score) as avg_safety,
          AVG(sp.efficiency) as avg_efficiency,
          SUM(sp.hours_worked) as total_hours,
          SUM(sp.tasks_completed) as total_tasks
        FROM staff s
        LEFT JOIN staff_performance sp ON s.id = sp.staff_id 
          AND sp.period_start >= CURRENT_DATE - INTERVAL '3 months'
        ${whereClause}
        GROUP BY s.department
        ORDER BY COUNT(DISTINCT s.id) DESC
      `;

      // Get team member details
      const teamMembers = await sql`
        SELECT 
          s.id,
          s.name,
          s.role,
          s.department,
          s.email,
          s.phone,
          s.hire_date,
          AVG(sp.productivity) as avg_productivity,
          AVG(sp.quality_score) as avg_quality,
          SUM(sp.hours_worked) as total_hours_recent,
          SUM(sp.tasks_completed) as total_tasks_recent
        FROM staff s
        LEFT JOIN staff_performance sp ON s.id = sp.staff_id 
          AND sp.period_start >= CURRENT_DATE - INTERVAL '1 month'
        ${whereClause}
        GROUP BY s.id, s.name, s.role, s.department, s.email, s.phone, s.hire_date
        ORDER BY s.department, s.name
      `;

      // Get team project involvement
      const teamProjects = await sql`
        SELECT 
          s.department as team_id,
          COUNT(DISTINCT p.id) as total_projects,
          COUNT(CASE WHEN p.status IN ('ACTIVE', 'active') THEN 1 END) as active_projects,
          COUNT(CASE WHEN p.status IN ('COMPLETED', 'completed') THEN 1 END) as completed_projects,
          AVG(p.progress) as avg_project_progress
        FROM staff s
        JOIN project_staff ps ON s.id = ps.staff_id
        JOIN projects p ON ps.project_id = p.id
        ${whereClause}
        GROUP BY s.department
      `.catch(() => []);

      // Get team collaboration metrics
      const collaborationMetrics = await sql`
        WITH team_pairs AS (
          SELECT 
            s1.department as team1,
            s2.department as team2,
            COUNT(DISTINCT p.id) as shared_projects
          FROM project_staff ps1
          JOIN project_staff ps2 ON ps1.project_id = ps2.project_id AND ps1.staff_id != ps2.staff_id
          JOIN staff s1 ON ps1.staff_id = s1.id
          JOIN staff s2 ON ps2.staff_id = s2.id
          JOIN projects p ON ps1.project_id = p.id
          WHERE s1.department != s2.department
          ${department ? sql`AND (s1.department = ${department} OR s2.department = ${department})` : sql``}
          GROUP BY s1.department, s2.department
        )
        SELECT * FROM team_pairs
        ORDER BY shared_projects DESC
        LIMIT 10
      `.catch(() => []);

      // Format team data
      const teams = teamAnalytics.map(team => {
        const projectData = teamProjects.find(p => p.team_id === team.team_id) || {};
        const members = teamMembers.filter(m => m.department === team.team_id);

        return {
          teamId: team.team_id,
          teamName: team.team_name,
          size: parseInt(team.team_size) || 0,
          composition: {
            totalMembers: parseInt(team.team_size) || 0,
            roleDiversity: parseInt(team.role_diversity) || 0,
            avgExperienceYears: Math.round(parseFloat(team.avg_experience_years) * 10) / 10 || 0,
            newMembers: parseInt(team.new_members) || 0
          },
          performance: {
            avgProductivity: Math.round(parseFloat(team.avg_productivity) * 10) / 10 || 0,
            avgQuality: Math.round(parseFloat(team.avg_quality) * 10) / 10 || 0,
            avgSafety: Math.round(parseFloat(team.avg_safety) * 10) / 10 || 0,
            avgEfficiency: Math.round(parseFloat(team.avg_efficiency) * 10) / 10 || 0,
            totalHours: parseFloat(team.total_hours) || 0,
            totalTasks: parseInt(team.total_tasks) || 0
          },
          projects: {
            total: parseInt(projectData.total_projects) || 0,
            active: parseInt(projectData.active_projects) || 0,
            completed: parseInt(projectData.completed_projects) || 0,
            avgProgress: Math.round(parseFloat(projectData.avg_project_progress) * 10) / 10 || 0
          },
          members: members.map(m => ({
            id: m.id,
            name: m.name,
            role: m.role,
            email: m.email,
            phone: m.phone,
            experienceYears: m.hire_date 
              ? Math.round(((new Date() - new Date(m.hire_date)) / (365.25 * 24 * 60 * 60 * 1000)) * 10) / 10
              : 0,
            performance: {
              productivity: Math.round(parseFloat(m.avg_productivity) * 10) / 10 || 0,
              quality: Math.round(parseFloat(m.avg_quality) * 10) / 10 || 0,
              recentHours: parseFloat(m.total_hours_recent) || 0,
              recentTasks: parseInt(m.total_tasks_recent) || 0
            }
          }))
        };
      });

      // Format collaboration data
      const collaboration = collaborationMetrics.map(c => ({
        team1: c.team1,
        team2: c.team2,
        sharedProjects: parseInt(c.shared_projects) || 0
      }));

      return res.status(200).json({
        success: true,
        data: {
          teams: teamId || department ? teams : teams.slice(0, 10), // Limit to top 10 teams if no filter
          collaboration,
          summary: {
            totalTeams: teamAnalytics.length,
            avgTeamSize: Math.round(
              teamAnalytics.reduce((sum, t) => sum + parseInt(t.team_size), 0) / Math.max(1, teamAnalytics.length)
            ),
            avgProductivity: Math.round(
              teamAnalytics.reduce((sum, t) => sum + parseFloat(t.avg_productivity || 0), 0) / Math.max(1, teamAnalytics.length) * 10
            ) / 10
          },
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Team analytics error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
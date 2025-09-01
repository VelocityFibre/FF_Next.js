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
      const { projectIds, metrics = ['budget', 'progress', 'timeline', 'performance'] } = req.body;
      
      if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Project IDs array is required' 
        });
      }

      // Get project details for comparison
      const projects = await sql`
        SELECT 
          p.id,
          p.name,
          p.status,
          p.start_date,
          p.end_date,
          p.budget,
          p.actual_cost,
          p.progress,
          c.name as client_name,
          EXTRACT(DAY FROM (COALESCE(p.end_date, CURRENT_DATE) - p.start_date)) as duration_days,
          CASE 
            WHEN p.end_date < CURRENT_DATE AND p.status NOT IN ('COMPLETED', 'completed') 
            THEN EXTRACT(DAY FROM (CURRENT_DATE - p.end_date))
            ELSE 0 
          END as days_overdue
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.id = ANY(${projectIds}::uuid[])
      `;

      const response = {
        success: true,
        data: {
          projects: [],
          metrics: {},
          timestamp: new Date().toISOString()
        }
      };

      // Process each project
      for (const project of projects) {
        const projectData = {
          id: project.id,
          name: project.name,
          clientName: project.client_name || 'No Client',
          status: project.status,
          startDate: project.start_date,
          endDate: project.end_date,
          metrics: {}
        };

        // Budget metrics
        if (metrics.includes('budget')) {
          projectData.metrics.budget = {
            allocated: parseFloat(project.budget) || 0,
            spent: parseFloat(project.actual_cost) || 0,
            utilization: project.budget > 0 
              ? Math.round(((parseFloat(project.actual_cost) || 0) / parseFloat(project.budget)) * 100 * 10) / 10
              : 0,
            remaining: Math.max(0, (parseFloat(project.budget) || 0) - (parseFloat(project.actual_cost) || 0))
          };
        }

        // Progress metrics
        if (metrics.includes('progress')) {
          const expectedProgress = project.duration_days > 0 && project.start_date
            ? Math.min(100, (new Date() - new Date(project.start_date)) / (project.duration_days * 24 * 60 * 60 * 1000) * 100)
            : 0;

          projectData.metrics.progress = {
            current: parseFloat(project.progress) || 0,
            expected: Math.round(expectedProgress),
            variance: Math.round((parseFloat(project.progress) || 0) - expectedProgress),
            status: (parseFloat(project.progress) || 0) >= expectedProgress ? 'on-track' : 'behind'
          };
        }

        // Timeline metrics
        if (metrics.includes('timeline')) {
          projectData.metrics.timeline = {
            duration: parseInt(project.duration_days) || 0,
            daysOverdue: parseInt(project.days_overdue) || 0,
            status: project.days_overdue > 0 ? 'overdue' : 
                   project.status === 'COMPLETED' || project.status === 'completed' ? 'completed' : 
                   'active',
            completionDate: project.status === 'COMPLETED' || project.status === 'completed' 
              ? project.end_date 
              : null
          };
        }

        // Performance score
        if (metrics.includes('performance')) {
          const budgetScore = project.budget > 0 
            ? Math.max(0, 100 - Math.abs(((parseFloat(project.actual_cost) || 0) / parseFloat(project.budget)) - 1) * 100))
            : 50;
          
          const progressScore = parseFloat(project.progress) || 0;
          
          const timelineScore = project.days_overdue > 0 
            ? Math.max(0, 100 - (project.days_overdue * 2))
            : 100;

          projectData.metrics.performance = {
            budgetScore: Math.round(budgetScore),
            progressScore: Math.round(progressScore),
            timelineScore: Math.round(timelineScore),
            overallScore: Math.round((budgetScore + progressScore + timelineScore) / 3)
          };
        }

        response.data.projects.push(projectData);
      }

      // Calculate aggregated metrics across all projects
      if (projects.length > 0) {
        response.data.aggregated = {
          avgProgress: Math.round(projects.reduce((sum, p) => sum + (parseFloat(p.progress) || 0), 0) / projects.length),
          totalBudget: projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
          totalSpent: projects.reduce((sum, p) => sum + (parseFloat(p.actual_cost) || 0), 0),
          overdueCount: projects.filter(p => parseInt(p.days_overdue) > 0).length,
          completedCount: projects.filter(p => p.status === 'COMPLETED' || p.status === 'completed').length
        };
      }

      return res.status(200).json(response);
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Project comparison error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}